import { ethers } from 'ethers';
import {
  InsufficientBalanceError,
  MissingWalletError,
  PriorDustingError,
  TransferMethodNotSupportedError,
} from '../errors';
import { getWallet } from '../account';
import type { NetworkConfig } from '../network_config/network_config';
import { erc20 } from '../contract';
import ERC20 from '../contracts/erc20Data.json';

import { gsnLightClient } from '../gsnClient/gsnClient';
import {
  getClaimTx,
  getExecuteMetatransactionTx,
  getPermitTx,
} from '../gsnClient/gsnTxHelpers';
import { hasMethod } from '../gsnClient/utils';

import type { PrefixedHexString } from '../gsnClient/utils';

async function transfer(
  destinationAddress: string,
  amount: number,
  network: NetworkConfig,
  tokenAddress?: PrefixedHexString
): Promise<string> {

  const account = await getWallet();

  tokenAddress = tokenAddress || network.contracts.rlyERC20;

  if (!account) {
    throw MissingWalletError;
  }

  const sourceBalance = await getBalance(network, tokenAddress);

  const sourceFinalBalance = sourceBalance - amount;

  if (sourceFinalBalance < 0) {
    throw InsufficientBalanceError;
  }
  const gsnClient = new gsnLightClient(account, network);
  await gsnClient.init();


  const provider = new ethers.providers.JsonRpcProvider(network.gsn.rpcUrl);

  let transferTx;

  const executeMetaTransactionSupported = await hasMethod(
    tokenAddress,
    'executeMetaTransaction',
    provider,
    ERC20.abi
  );
  const permitSupported = await hasMethod(
    tokenAddress,
    'permit',
    provider,
    ERC20.abi
  );

  if (executeMetaTransactionSupported) {
    transferTx = await getExecuteMetatransactionTx(
      account,
      destinationAddress,
      amount,
      network,
      tokenAddress,
      provider
    );
  } else if (permitSupported) {
    transferTx = await getPermitTx(
      account,
      destinationAddress,
      amount,
      network,
      tokenAddress,
      provider
    );
  } else {
    throw TransferMethodNotSupportedError;
  }

  return gsnClient.relayTransaction(transferTx);

}

async function getBalance(
  network: NetworkConfig,
  tokenAddress?: PrefixedHexString
) {
  const account = await getWallet();

  //if token address use it otherwise default to RLY
  tokenAddress = tokenAddress || network.contracts.rlyERC20;
  if (!account) {
    throw MissingWalletError;
  }

  const provider = new ethers.providers.JsonRpcProvider(network.gsn.rpcUrl);

  const token = erc20(provider, tokenAddress);

  const bal = await token.balanceOf(account.address);
  return Number(ethers.utils.formatEther(bal));
}

async function registerAccount(network: NetworkConfig): Promise<string> {

  const account = await getWallet();
  if (!account) {
    throw MissingWalletError;
  }

  const existingBalance = await getBalance(network);

  if (existingBalance && existingBalance > 0) {
    throw PriorDustingError;
  }

  const gsnClient = new gsnLightClient(account, network);
  await gsnClient.init();

  const provider = new ethers.providers.JsonRpcProvider(network.gsn.rpcUrl);

  const claimTx = await getClaimTx(account, network, provider);

  return gsnClient.relayTransaction(claimTx);

}

export function getEvmNetwork(network: NetworkConfig) {
  return {
    transfer: function (
      destinationAddress: string,
      amount: number,
      tokenAddress?: PrefixedHexString
    ) {
      return transfer(destinationAddress, amount, network, tokenAddress);
    },
    getBalance: function (tokenAddress?: PrefixedHexString) {
      return getBalance(network, tokenAddress);

    },
    registerAccount: function () {
      return registerAccount(network);
    },
  };
}

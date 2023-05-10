import { ethers } from 'ethers';
import {
  InsufficientBalanceError,
  MissingWalletError,
  PriorDustingError,
} from '../errors';
import { getWallet } from '../account';
import type { NetworkConfig } from '../network_config/network_config';
import { erc20 } from '../contract';
import { gsnLightClient } from '../gsnClient/gsnClient';
import {
  getClaimTx,
  getExecuteMetatransactionTx,
} from '../gsnClient/gsnTxHelpers';
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

  const transferTx = await getExecuteMetatransactionTx(
    account,
    destinationAddress,
    ethers.utils.parseEther(amount.toString()),
    network,
    tokenAddress
  );

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

  const claimTx = await getClaimTx(account, network);

  return gsnClient.relayTransaction(claimTx);
}

export function getEvmNetwork(network: NetworkConfig) {
  return {
    transfer: function (destinationAddress: string, amount: number) {
      return transfer(destinationAddress, amount, network);
    },
    getBalance: function () {
      return getBalance(network);
    },
    registerAccount: function () {
      return registerAccount(network);
    },
  };
}

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
import { relayTransaction } from '../gsnClient/gsnClient';
import {
  getClaimTx,
  getExecuteMetatransactionTx,
  getPermitTx,
  hasExecuteMetaTransaction,
  hasPermit,
} from '../gsnClient/gsnTxHelpers';
import type {
  PrefixedHexString,
  GsnTransactionDetails,
} from '../gsnClient/utils';

import { MetaTxMethod } from '../gsnClient/utils';

async function transfer(
  destinationAddress: string,
  amount: number,
  network: NetworkConfig,
  tokenAddress?: PrefixedHexString,
  metaTxMethod?: MetaTxMethod
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

  const provider = new ethers.providers.JsonRpcProvider(network.gsn.rpcUrl);

  let transferTx;

  if (
    metaTxMethod &&
    (metaTxMethod === MetaTxMethod.Permit ||
      metaTxMethod === MetaTxMethod.ExecuteMetaTransaction)
  ) {
    if (metaTxMethod === MetaTxMethod.Permit) {
      transferTx = await getPermitTx(
        account,
        destinationAddress,
        amount,
        network,
        tokenAddress,
        provider
      );
    } else {
      transferTx = await getExecuteMetatransactionTx(
        account,
        destinationAddress,
        amount,
        network,
        tokenAddress,
        provider
      );
    }
  } else {
    const executeMetaTransactionSupported = await hasExecuteMetaTransaction(
      account,
      destinationAddress,
      amount,
      network,
      tokenAddress,
      provider
    );

    const permitSupported = await hasPermit(
      account,
      amount,
      network,
      tokenAddress,
      provider
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
  }
  return relay(transferTx, network);
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

  const provider = new ethers.providers.JsonRpcProvider(network.gsn.rpcUrl);

  const claimTx = await getClaimTx(account, network, provider);

  return relay(claimTx, network);
}

export async function relay(
  tx: GsnTransactionDetails,
  network: NetworkConfig
): Promise<string> {
  const account = await getWallet();
  if (!account) {
    throw MissingWalletError;
  }

  return relayTransaction(account, network, tx);
}

export function getEvmNetwork(network: NetworkConfig) {
  return {
    transfer: function (
      destinationAddress: string,
      amount: number,
      tokenAddress?: PrefixedHexString,
      metaTxMethod?: MetaTxMethod
    ) {
      return transfer(
        destinationAddress,
        amount,
        network,
        tokenAddress,
        metaTxMethod
      );
    },
    getBalance: function (tokenAddress?: PrefixedHexString) {
      return getBalance(network, tokenAddress);
    },
    registerAccount: function () {
      return registerAccount(network);
    },
    relay: function (tx: GsnTransactionDetails) {
      return relay(tx, network);
    },
  };
}

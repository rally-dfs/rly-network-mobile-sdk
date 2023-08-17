import { ethers, Wallet } from 'ethers';
import {
  InsufficientBalanceError,
  PriorDustingError,
  TransferMethodNotSupportedError,
} from '../errors';
import type { NetworkConfig } from '../network_config/network_config';
import { erc20 } from '../contracts/erc20';
import { relayTransaction } from '../gsnClient/gsnClient';
import { getClaimTx } from '../gsnClient/gsnTxHelpers';
import { getPermitTx, hasPermit } from '../gsnClient/EIP712/PermitTransaction';
import {
  getExecuteMetatransactionTx,
  hasExecuteMetaTransaction,
} from '../gsnClient/EIP712/MetaTransaction';

import type {
  PrefixedHexString,
  GsnTransactionDetails,
} from '../gsnClient/utils';

import { MetaTxMethod } from '../gsnClient/utils';

async function transfer(
  wallet: Wallet,
  destinationAddress: string,
  amount: number,
  network: NetworkConfig,
  tokenAddress?: PrefixedHexString,
  metaTxMethod?: MetaTxMethod
): Promise<string> {
  tokenAddress = tokenAddress || network.contracts.rlyERC20;

  const sourceBalance = await getBalance(wallet, network, tokenAddress);

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
        wallet,
        destinationAddress,
        amount,
        network,
        tokenAddress,
        provider
      );
    } else {
      transferTx = await getExecuteMetatransactionTx(
        wallet,
        destinationAddress,
        amount,
        network,
        tokenAddress,
        provider
      );
    }
  } else {
    const executeMetaTransactionSupported = await hasExecuteMetaTransaction(
      wallet,
      destinationAddress,
      amount,
      network,
      tokenAddress,
      provider
    );

    const permitSupported = await hasPermit(
      wallet,
      amount,
      network,
      tokenAddress,
      provider
    );

    if (executeMetaTransactionSupported) {
      transferTx = await getExecuteMetatransactionTx(
        wallet,
        destinationAddress,
        amount,
        network,
        tokenAddress,
        provider
      );
    } else if (permitSupported) {
      transferTx = await getPermitTx(
        wallet,
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
  return relay(wallet, transferTx, network);
}

async function getBalance(
  wallet: Wallet,
  network: NetworkConfig,
  tokenAddress?: PrefixedHexString
) {
  //if token address use it otherwise default to RLY
  tokenAddress = tokenAddress || network.contracts.rlyERC20;

  const provider = new ethers.providers.JsonRpcProvider(network.gsn.rpcUrl);

  const token = erc20(provider, tokenAddress);
  const decimals = await token.decimals();
  const bal = await token.balanceOf(wallet.address);
  return Number(ethers.utils.formatUnits(bal.toString(), decimals));
}

async function claimRly(
  wallet: Wallet,
  network: NetworkConfig
): Promise<string> {
  const existingBalance = await getBalance(wallet, network);

  if (existingBalance && existingBalance > 0) {
    throw PriorDustingError;
  }

  const provider = new ethers.providers.JsonRpcProvider(network.gsn.rpcUrl);

  const claimTx = await getClaimTx(wallet, network, provider);

  return relay(wallet, claimTx, network);
}

// This method is deprecated. Update to 'claimRly' instead.
// Will be removed in future library versions.
async function registerAccount(
  wallet: Wallet,
  network: NetworkConfig
): Promise<string> {
  console.error("This method is deprecated. Update to 'claimRly' instead.");

  return claimRly(wallet, network);
}

export async function relay(
  wallet: Wallet,
  tx: GsnTransactionDetails,
  network: NetworkConfig
): Promise<string> {
  return relayTransaction(wallet, network, tx);
}

export function getEvmNetwork(network: NetworkConfig) {
  return {
    transfer: function (
      wallet: Wallet,
      destinationAddress: string,
      amount: number,
      tokenAddress?: PrefixedHexString,
      metaTxMethod?: MetaTxMethod
    ) {
      return transfer(
        wallet,
        destinationAddress,
        amount,
        network,
        tokenAddress,
        metaTxMethod
      );
    },
    getBalance: function (wallet: Wallet, tokenAddress?: PrefixedHexString) {
      return getBalance(wallet, network, tokenAddress);
    },
    claimRly: function (wallet: Wallet) {
      return claimRly(wallet, network);
    },
    // This method is deprecated. Update to 'claimRly' instead.
    // Will be removed in future library versions.
    registerAccount: function (wallet: Wallet) {
      return registerAccount(wallet, network);
    },
    relay: function (wallet: Wallet, tx: GsnTransactionDetails) {
      return relay(wallet, tx, network);
    },
    setApiKey: function (apiKey: string) {
      network.relayerApiKey = apiKey;
    },
  };
}

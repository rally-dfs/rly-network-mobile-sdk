import { BigNumber, ethers } from 'ethers';
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
import { getProvider } from '../provider';
import type { TokenConfig } from 'src/transactions/supported_tokens';

async function transfer(
  destinationAddress: string,
  amount: number,
  network: NetworkConfig,
  tokenAddress?: PrefixedHexString,
  metaTxMethod?: MetaTxMethod,
  tokenConfig?: TokenConfig
): Promise<string> {
  const provider = getProvider(network);

  const account = await getWallet();
  if (!account) {
    throw MissingWalletError;
  }

  tokenAddress = tokenAddress || network.contracts.rlyERC20;

  const token = erc20(provider, tokenAddress);
  const decimals = await token.decimals();

  const amountBigNum = ethers.utils.parseUnits(amount.toString(), decimals);

  return await transferExact(
    destinationAddress,
    amountBigNum.toString(),
    network,
    tokenAddress,
    metaTxMethod,
    tokenConfig
  );
}

async function transferExact(
  destinationAddress: string,
  amount: string,
  network: NetworkConfig,
  tokenAddress?: PrefixedHexString,
  metaTxMethod?: MetaTxMethod,
  tokenConfig?: TokenConfig
): Promise<string> {
  const provider = getProvider(network);
  const account = await getWallet();
  tokenAddress = tokenAddress || network.contracts.rlyERC20;

  if (!account) {
    throw MissingWalletError;
  }

  const sourceBalance = await getExactBalance(network, tokenAddress);

  const sourceBigNum = BigNumber.from(sourceBalance);
  const amountBigNum = BigNumber.from(amount);

  const sourceFinalBalance = sourceBigNum.sub(amountBigNum);

  if (sourceFinalBalance.lt(0)) {
    throw InsufficientBalanceError;
  }

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
        amountBigNum,
        network,
        tokenAddress,
        provider,
        tokenConfig?.eip712Domain
      );
    } else {
      transferTx = await getExecuteMetatransactionTx(
        account,
        destinationAddress,
        amountBigNum,
        network,
        tokenAddress,
        provider
      );
    }
  } else {
    const executeMetaTransactionSupported = await hasExecuteMetaTransaction(
      account,
      destinationAddress,
      amountBigNum,
      network,
      tokenAddress,
      provider
    );

    const permitSupported = await hasPermit(
      account,
      amountBigNum,
      network,
      tokenAddress,
      provider
    );

    if (executeMetaTransactionSupported) {
      transferTx = await getExecuteMetatransactionTx(
        account,
        destinationAddress,
        amountBigNum,
        network,
        tokenAddress,
        provider
      );
    } else if (permitSupported) {
      transferTx = await getPermitTx(
        account,
        destinationAddress,
        amountBigNum,
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

// This method is deprecated. Update to 'getDisplayBalance'
// or 'getExactBalance' instead.
// Will be removed in future library versions.
async function getBalance(
  network: NetworkConfig,
  tokenAddress?: PrefixedHexString
) {
  console.error(
    "This method is deprecated. Update to 'getDisplayBalance' or 'getExactBalance' instead."
  );

  return getDisplayBalance(network, tokenAddress);
}

async function getDisplayBalance(
  network: NetworkConfig,
  tokenAddress?: PrefixedHexString
) {
  tokenAddress = tokenAddress || network.contracts.rlyERC20;

  const provider = getProvider(network);
  const token = erc20(provider, tokenAddress);

  const decimals = await token.decimals();

  const exactBalance = await getExactBalance(network, tokenAddress);
  return Number(ethers.utils.formatUnits(exactBalance, decimals));
}

async function getExactBalance(
  network: NetworkConfig,
  tokenAddress?: PrefixedHexString
): Promise<string> {
  const account = await getWallet();

  //if token address use it otherwise default to RLY
  tokenAddress = tokenAddress || network.contracts.rlyERC20;
  if (!account) {
    throw MissingWalletError;
  }

  const provider = getProvider(network);

  const token = erc20(provider, tokenAddress);
  const bal = await token.balanceOf(account.address);

  return bal.toString();
}

async function claimRly(network: NetworkConfig): Promise<string> {
  const account = await getWallet();
  if (!account) {
    throw MissingWalletError;
  }

  const existingBalance = await getDisplayBalance(network);

  if (existingBalance && existingBalance > 0) {
    throw PriorDustingError;
  }

  const provider = getProvider(network);

  const claimTx = await getClaimTx(account, network, provider);

  return relay(claimTx, network);
}

// This method is deprecated. Update to 'claimRly' instead.
// Will be removed in future library versions.
async function registerAccount(network: NetworkConfig): Promise<string> {
  console.error("This method is deprecated. Update to 'claimRly' instead.");

  return claimRly(network);
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
    networkConfig: network,
    transfer: function (
      destinationAddress: string,
      amount: number,
      tokenAddress?: PrefixedHexString,
      metaTxMethod?: MetaTxMethod,
      tokenConfig?: TokenConfig
    ) {
      return transfer(
        destinationAddress,
        amount,
        network,
        tokenAddress,
        metaTxMethod,
        tokenConfig
      );
    },
    transferExact: function (
      destinationAddress: string,
      amount: string,
      tokenAddress?: PrefixedHexString,
      metaTxMethod?: MetaTxMethod,
      tokenConfig?: TokenConfig
    ) {
      return transferExact(
        destinationAddress,
        amount,
        network,
        tokenAddress,
        metaTxMethod,
        tokenConfig
      );
    },
    getBalance: function (tokenAddress?: PrefixedHexString) {
      return getBalance(network, tokenAddress);
    },
    getDisplayBalance: function (tokenAddress?: PrefixedHexString) {
      return getDisplayBalance(network, tokenAddress);
    },
    getExactBalance: function (tokenAddress?: PrefixedHexString) {
      return getExactBalance(network, tokenAddress);
    },
    claimRly: function () {
      return claimRly(network);
    },
    // This method is deprecated. Update to 'claimRly' instead.
    // Will be removed in future library versions.
    registerAccount: function () {
      return registerAccount(network);
    },
    relay: function (tx: GsnTransactionDetails) {
      return relay(tx, network);
    },
    setApiKey: function (apiKey: string) {
      network.relayerApiKey = apiKey;
    },
  };
}

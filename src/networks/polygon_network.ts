import { ethers } from 'ethers';
import {
  InsufficientBalanceError,
  MissingWalletError,
  PriorDustingError,
} from '../errors';
import { getWallet } from '../account';
import type { Network } from '../network';
import { PolygonNetworkConfig } from '../network_config/network_config';
import { posRLYTestERC20 } from '../contract';
import { gsnLightClient } from '../gsnClient/gsnClient';
import {
  getClaimTx,
  getExecuteMetatransactionTx,
} from '../gsnClient/gsnTxHelpers';

async function transfer(
  destinationAddress: string,
  amount: number
): Promise<void> {
  const account = await getWallet();
  if (!account) {
    throw MissingWalletError;
  }

  const sourceBalance = await getBalance();

  const sourceFinalBalance = sourceBalance - amount;

  if (sourceFinalBalance < 0) {
    throw InsufficientBalanceError;
  }
  const gsnClient = new gsnLightClient(account, PolygonNetworkConfig);
  await gsnClient.init();

  const transferTx = await getExecuteMetatransactionTx(
    account,
    destinationAddress,
    ethers.utils.parseEther(amount.toString()),
    PolygonNetworkConfig
  );

  await gsnClient.relayTransaction(transferTx);
}

async function getBalance() {
  const account = await getWallet();
  if (!account) {
    throw MissingWalletError;
  }

  const provider = new ethers.providers.JsonRpcProvider(
    PolygonNetworkConfig.gsn.rpcUrl
  );

  const token = posRLYTestERC20(PolygonNetworkConfig, provider);

  const bal = await token.balanceOf(account.address);
  return Number(ethers.utils.formatEther(bal));
}

async function registerAccount(): Promise<void> {
  const account = await getWallet();
  if (!account) {
    throw MissingWalletError;
  }

  const existingBalance = await getBalance();

  if (existingBalance && existingBalance > 0) {
    throw PriorDustingError;
  }

  const gsnClient = new gsnLightClient(account, PolygonNetworkConfig);
  await gsnClient.init();

  const claimTx = await getClaimTx(account, PolygonNetworkConfig);

  await gsnClient.relayTransaction(claimTx);
}

export const RlyPolygonNetwork: Network = {
  transfer: transfer,
  getBalance: getBalance,
  registerAccount: registerAccount,
};

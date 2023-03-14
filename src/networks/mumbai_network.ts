import { ethers } from 'ethers';
import {
  InsufficientBalanceError,
  MissingWalletError,
  PriorDustingError,
} from '../errors';
import { getWallet } from '../account';
import type { Network } from '../network';
import { MumbaiNetworkConfig } from '../network_config/network_config';
import { tokenFaucet } from '../contracts/tokenFaucet';
import { gsnLightClient } from '../gsnClient/gsnClient';
import { getClaimTx, getTransferTx } from '../gsnClient/gsnTxHelpers';

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
  const gsnClient = new gsnLightClient(account, MumbaiNetworkConfig);
  await gsnClient.init();

  const transferTx = await getTransferTx(
    account,
    destinationAddress,
    ethers.utils.parseEther(amount.toString()),
    MumbaiNetworkConfig
  );

  await gsnClient.relayTransaction(transferTx);
}

/*
//if we need to get native token balance for anything

async function getnativeTokenBalance() {
  const account = await getWallet();
  if (!account) {
    throw MissingWallet;
  }
  const provider = await getGSNProvider(localNetworkConfig, account);
  return await provider.getBalance(account.publicKey);
}
*/

async function getBalance() {
  const account = await getWallet();
  if (!account) {
    throw MissingWalletError;
  }

  const provider = new ethers.providers.JsonRpcProvider(
    MumbaiNetworkConfig.gsn.rpcUrl
  );
  const token = tokenFaucet(MumbaiNetworkConfig, provider);
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

  const gsnClient = new gsnLightClient(account, MumbaiNetworkConfig);
  await gsnClient.init();

  const claimTx = await getClaimTx(account, MumbaiNetworkConfig);

  await gsnClient.relayTransaction(claimTx);
}

export const RlyMumbaiNetwork: Network = {
  transfer: transfer,
  getBalance: getBalance,
  registerAccount: registerAccount,
};

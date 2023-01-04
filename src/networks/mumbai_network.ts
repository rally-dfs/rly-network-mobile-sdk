import { ethers } from 'ethers';
import { MissingWallet } from '../errors';
import { getWallet } from '../account';
import type { Network } from '../network';
import { mumbaiNetworkConfig } from '../network_config/network_config';
import { tokenFaucet } from '../contracts/tokenFaucet';
import { gsnLightClient } from '../gsnClient/gsnClient';
import { getClaimTx, getTransferTx } from '../gsnClient/gsnTxHelpers';

async function transfer(destinationAddress: string, amount: number) {
  const account = await getWallet();
  if (!account) {
    throw MissingWallet;
  }

  const sourceBalance = await getBalance();

  const sourceFinalBalance = sourceBalance - amount;

  if (sourceFinalBalance < 0) {
    throw 'Unable to transfer, insufficient balance';
  }
  const gsnClient = new gsnLightClient(account, mumbaiNetworkConfig);
  await gsnClient.init();

  const transferTx = await getTransferTx(
    account,
    destinationAddress,
    ethers.utils.parseEther(amount.toString()),
    mumbaiNetworkConfig
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
    throw MissingWallet;
  }

  const provider = new ethers.providers.JsonRpcProvider(
    mumbaiNetworkConfig.gsn.rpcUrl
  );
  const token = tokenFaucet(mumbaiNetworkConfig, provider);
  const bal = await token.balanceOf(account.address);
  return Number(ethers.utils.formatEther(bal));
}

async function registerAccount() {
  const account = await getWallet();
  if (!account) {
    throw MissingWallet;
  }

  const existingBalance = await getBalance();

  if (existingBalance && existingBalance > 0) {
    throw 'Account already dusted, will not dust again';
  }

  const gsnClient = new gsnLightClient(account, mumbaiNetworkConfig);
  await gsnClient.init();

  const claimTx = await getClaimTx(account, mumbaiNetworkConfig);

  await gsnClient.relayTransaction(claimTx);
}

export const RlyMumbaiNetwork: Network = {
  transfer: transfer,
  getBalance: getBalance,
  registerAccount: registerAccount,
};

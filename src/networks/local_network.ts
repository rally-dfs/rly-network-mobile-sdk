import { ethers } from 'ethers';
import { MissingWallet } from '../errors';
import { getWallet } from '../account';
import type { Network } from '../network';
import { localNetworkConfig } from '../network_config/network_config_local';
import { tokenFaucet } from '../contracts/tokenFaucet';
import { gsnLightClient } from '../gsnClient/gsnClient';
import { rlyEnv } from '../gsnClient/utils';
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
  const gsnClient = new gsnLightClient(account, rlyEnv.local);
  await gsnClient.init();

  const transferTx = await getTransferTx(account, destinationAddress, amount);

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
    localNetworkConfig.gsn.rpcUrl
  );
  const token = tokenFaucet(localNetworkConfig, provider);
  const bal = await token.balanceOf(account.address);
  return bal.toNumber();
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

  const gsnClient = new gsnLightClient(account, rlyEnv.local);
  await gsnClient.init();

  const claimTx = await getClaimTx(account);

  await gsnClient.relayTransaction(claimTx);
}

export const RlyLocalNetwork: Network = {
  transfer: transfer,
  getBalance: getBalance,
  registerAccount: registerAccount,
};

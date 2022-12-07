import { MissingWallet } from '../errors';
import { getWallet } from '../account';
import type { Network } from '../network';
import { getGSNProvider } from '../gsn_client';
import { localNetworkConfig } from '../network_config/network_config_local';
import { tokenFaucet } from '../contract';

const balances: Record<string, number> = {};

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

  const provider = await getGSNProvider(localNetworkConfig, account);
  const token = tokenFaucet(localNetworkConfig, provider);
  await token.transfer(destinationAddress, amount);
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

  const provider = await getGSNProvider(localNetworkConfig, account);
  const token = tokenFaucet(localNetworkConfig, provider);
  return await token.balanceOf(account.publicKey);
}

async function registerAccount() {
  const account = await getWallet();
  if (!account) {
    throw MissingWallet;
  }
  const existingBalance = balances[account.publicKey];

  if (existingBalance && existingBalance > 0) {
    throw 'Account already dusted, will not dust again';
  }

  const provider = await getGSNProvider(localNetworkConfig, account);
  const faucet = tokenFaucet(localNetworkConfig, provider);
  //dust account
  await faucet.claim();
}

export const RlyLocalNetwork: Network = {
  transfer: transfer,
  getBalance: getBalance,
  registerAccount: registerAccount,
};

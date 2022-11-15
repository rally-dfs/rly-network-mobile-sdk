import { MissingWallet } from '../errors';
import { getWallet } from '../account';
import type { Network } from '../network';

const balances: Record<string, number> = {};

async function transfer(destinationAddress: string, amount: number) {
  const wallet = await getWallet();
  if (!wallet) {
    throw MissingWallet;
  }
  const sourceBalance = balances[wallet.publicKey] || 0;

  const sourceFinalBalance = sourceBalance - amount;

  if (sourceFinalBalance < 0) {
    throw 'Unable to transfer, insufficient balance';
  }

  const receiverInitialBalance = balances[destinationAddress] || 0;
  const receiverFinalBalance = receiverInitialBalance + amount;

  balances[wallet.publicKey] = sourceFinalBalance;
  balances[destinationAddress] = receiverFinalBalance;
}

async function getBalance() {
  const wallet = await getWallet();
  if (!wallet) {
    throw MissingWallet;
  }
  return balances[wallet.publicKey] || 0;
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

  balances[account.publicKey] = 10;
}

export const RlyDummyNetwork: Network = {
  transfer: transfer,
  getBalance: getBalance,
  registerAccount: registerAccount,
};

import {
  InsufficientBalanceError,
  MissingWalletError,
  PriorDustingError,
} from '../errors';
import { getWallet } from '../account';
import type { Network } from '../network';

const balances: Record<string, number> = {};

export let dummyApiKey: string | undefined;

async function transfer(destinationAddress: string, amount: number) {
  const wallet = await getWallet();
  if (!wallet) {
    throw MissingWalletError;
  }
  const sourceBalance = balances[wallet.publicKey] || 0;

  const sourceFinalBalance = sourceBalance - amount;

  if (sourceFinalBalance < 0) {
    throw InsufficientBalanceError;
  }

  const receiverInitialBalance = balances[destinationAddress] || 0;
  const receiverFinalBalance = receiverInitialBalance + amount;

  balances[wallet.publicKey] = sourceFinalBalance;
  balances[destinationAddress] = receiverFinalBalance;
  return `success_${amount}_${destinationAddress}`;
}

async function getBalance() {
  const wallet = await getWallet();
  if (!wallet) {
    throw MissingWalletError;
  }
  return balances[wallet.publicKey] || 0;
}

// This method is deprecated. Update to 'claimRly' instead.
// Will be removed in future library versions.
async function registerAccount() {
  console.error("This method is deprecated. Update to 'claimRly' instead.");
  return claimRly();
}

async function claimRly() {
  const account = await getWallet();
  if (!account) {
    throw MissingWalletError;
  }
  const existingBalance = balances[account.publicKey];

  if (existingBalance && existingBalance > 0) {
    throw PriorDustingError;
  }

  balances[account.publicKey] = 10;
  return `success_${10}_${account.publicKey}`;
}

function setApiKey(apiKeyParam: string) {
  dummyApiKey = apiKeyParam;
}

export const RlyDummyNetwork: Network = {
  transfer: transfer,
  getBalance: getBalance,
  claimRly: claimRly,
  registerAccount: registerAccount,
  setApiKey: setApiKey,
};

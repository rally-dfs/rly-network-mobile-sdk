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
  return transferExact(destinationAddress, amount.toString());
}

async function transferExact(destinationAddress: string, amount: string) {
  const wallet = await getWallet();
  if (!wallet) {
    throw MissingWalletError;
  }
  const sourceBalance = balances[wallet.publicKey] || 0;
  const intAmount = parseInt(amount, 10);

  const sourceFinalBalance = sourceBalance - intAmount;

  if (sourceFinalBalance < 0) {
    throw InsufficientBalanceError;
  }

  const receiverInitialBalance = balances[destinationAddress] || 0;
  const receiverFinalBalance = receiverInitialBalance + intAmount;

  balances[wallet.publicKey] = sourceFinalBalance;
  balances[destinationAddress] = receiverFinalBalance;
  return `success_${amount}_${destinationAddress}`;
}

async function getBalance() {
  return getDisplayBalance();
}

async function getDisplayBalance() {
  const wallet = await getWallet();
  if (!wallet) {
    throw MissingWalletError;
  }
  return balances[wallet.publicKey] || 0;
}

async function getExactBalance() {
  return (await getDisplayBalance()).toString();
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
  transferExact: transferExact,
  getBalance: getBalance,
  getDisplayBalance: getDisplayBalance,
  getExactBalance: getExactBalance,
  claimRly: claimRly,
  registerAccount: registerAccount,
  setApiKey: setApiKey,
};

import type { Wallet } from 'ethers';
import { InsufficientBalanceError, PriorDustingError } from '../errors';
import type { CoreNetwork } from '../network';

const balances: Record<string, number> = {};

export let dummyApiKey: string | undefined;

async function transfer(
  wallet: Wallet,
  destinationAddress: string,
  amount: number
) {
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

async function getBalance(wallet: Wallet) {
  return balances[wallet.publicKey] || 0;
}

// This method is deprecated. Update to 'claimRly' instead.
// Will be removed in future library versions.
async function registerAccount(wallet: Wallet) {
  console.error("This method is deprecated. Update to 'claimRly' instead.");
  return claimRly(wallet);
}

async function claimRly(wallet: Wallet) {
  const existingBalance = balances[wallet.publicKey];

  if (existingBalance && existingBalance > 0) {
    throw PriorDustingError;
  }

  balances[wallet.publicKey] = 10;
  return `success_${10}_${wallet.publicKey}`;
}

function setApiKey(apiKeyParam: string) {
  dummyApiKey = apiKeyParam;
}

export const RlyCoreDummyNetwork: CoreNetwork = {
  transfer: transfer,
  getBalance: getBalance,
  claimRly: claimRly,
  registerAccount: registerAccount,
  setApiKey: setApiKey,
};

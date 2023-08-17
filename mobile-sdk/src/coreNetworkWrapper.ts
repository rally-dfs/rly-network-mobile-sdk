import type {
  PrefixedHexString,
  GsnTransactionDetails,
  MetaTxMethod,
} from '@rly-network/gasless-transaction-sdk';

import {
  RlyCoreMumbaiNetwork,
  RlyCoreLocalNetwork,
  RlyCorePolygonNetwork,
  RlyCoreDummyNetwork,
  CoreNetwork,
} from '@rly-network/gasless-transaction-sdk';

import { getWallet } from './account';
import { MissingWalletError } from './errors';

export interface Network {
  getBalance: (tokenAddress?: PrefixedHexString) => Promise<number>;
  transfer: (
    destinationAddress: string,
    amount: number,
    tokenAddress?: PrefixedHexString,
    metaTxMethod?: MetaTxMethod
  ) => Promise<string>;
  claimRly: () => Promise<string>;
  //Deprecated please use claimRly instead
  registerAccount: () => Promise<string>;
  relay?: (tx: GsnTransactionDetails) => Promise<string>;
  setApiKey: (apiKey: string) => void;
}

export function getMobileNetworkFromCoreNetwork(coreNetwork: CoreNetwork) {
  return {
    transfer: async function (
      destinationAddress: string,
      amount: number,
      tokenAddress?: PrefixedHexString,
      metaTxMethod?: MetaTxMethod
    ) {
      const wallet = await getWallet();
      if (!wallet) {
        throw MissingWalletError;
      }
      return coreNetwork.transfer(
        wallet,
        destinationAddress,
        amount,
        tokenAddress,
        metaTxMethod
      );
    },
    getBalance: async function (tokenAddress?: PrefixedHexString) {
      const wallet = await getWallet();
      if (!wallet) {
        throw MissingWalletError;
      }
      return coreNetwork.getBalance(wallet, tokenAddress);
    },
    claimRly: async function () {
      const wallet = await getWallet();
      if (!wallet) {
        throw MissingWalletError;
      }
      return coreNetwork.claimRly(wallet);
    },
    // This method is deprecated. Update to 'claimRly' instead.
    // Will be removed in future library versions.
    registerAccount: function () {
      return this.claimRly();
    },
    relay: coreNetwork.relay
      ? async function (tx: GsnTransactionDetails) {
          const wallet = await getWallet();
          if (!wallet) {
            throw MissingWalletError;
          }
          return coreNetwork.relay!(wallet, tx);
        }
      : undefined,
    setApiKey: function (apiKey: string) {
      return coreNetwork.setApiKey(apiKey);
    },
  };
}

export const RlyMumbaiNetwork: Network =
  getMobileNetworkFromCoreNetwork(RlyCoreMumbaiNetwork);
export const RlyLocalNetwork: Network =
  getMobileNetworkFromCoreNetwork(RlyCoreLocalNetwork);
export const RlyPolygonNetwork: Network = getMobileNetworkFromCoreNetwork(
  RlyCorePolygonNetwork
);

export const RlyDummyNetwork: Network =
  getMobileNetworkFromCoreNetwork(RlyCoreDummyNetwork);

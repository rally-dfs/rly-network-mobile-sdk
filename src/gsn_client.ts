import '@ethersproject/shims';
import type { NetworkConfig } from './network_config/network_config';
import { RelayProvider } from '@opengsn/provider';
import { Wallet, providers, Signer } from 'ethers';
import { HttpProvider } from 'web3-providers-http';

export const getGSNProvider = async (
  config: NetworkConfig,
  account: Wallet
): Promise<Signer> => {
  const { rpcUrl, gsn } = config;
  const httpProvider = new HttpProvider(rpcUrl);

  let gsnProvider = RelayProvider.newProvider({
    provider: httpProvider,
    config: gsn,
  });

  await gsnProvider.init();

  //add user account to gsn provider
  gsnProvider.addAccount(account.privateKey);

  //wrap gsnProvider in ethersprovider for contract interactions
  //@ts-ignore
  return new providers.Web3Provider(gsnProvider);
};

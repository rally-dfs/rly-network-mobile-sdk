import '@ethersproject/shims';
import type { NetworkConfig } from './network_config/network_config';
import Web3 from 'web3';
import { RelayProvider } from '@opengsn/provider';
import { Wallet, providers, Signer } from 'ethers';

export const getGSNProvider = async (
  config: NetworkConfig,
  account: Wallet
): Promise<Signer> => {
  const { rpcUrl, gsn } = config;

  const web3provider = new Web3.providers.HttpProvider(rpcUrl);

  let gsnProvider = RelayProvider.newProvider({
    provider: web3provider,
    config: gsn,
  });

  await gsnProvider.init();

  //add user account to gsn provider
  gsnProvider.addAccount(account.privateKey);

  //wrap gsnProvider in ethersprovider for contract interactions
  //@ts-ignore
  return new providers.Web3Provider(gsnProvider);
};

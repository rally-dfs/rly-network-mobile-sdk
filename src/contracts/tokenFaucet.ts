import type { NetworkConfig } from '../network_config/network_config';
import { Contract, Signer } from 'ethers';
import type { Provider } from '@ethersproject/abstract-provider';
import * as TokenFaucet from './tokenFaucetData.json';

export const tokenFaucet = (
  config: NetworkConfig,
  signer: Signer | Provider
): Contract => {
  return new Contract(config.contracts.tokenFaucet, TokenFaucet.abi, signer);
};

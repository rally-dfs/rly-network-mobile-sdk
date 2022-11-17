import '@ethersproject/shims';
import type { NetworkConfig } from '../network_config/network_config';
import { Contract, Signer } from 'ethers';
import * as TokenFaucet from './tokenFaucet.json';

export const tokenFaucet = (
  config: NetworkConfig,
  signer: Signer
): Contract => {
  return new Contract(config.contracts.tokenFaucet, TokenFaucet.abi, signer);
};

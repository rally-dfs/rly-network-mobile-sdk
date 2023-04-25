import type { NetworkConfig } from '../network_config/network_config';
import { Contract, Signer } from 'ethers';
import type { Provider } from '@ethersproject/abstract-provider';
import * as PosRLYTestERC20 from './posRLYTestERC20Data.json';

export const posRLYTestERC20 = (
  config: NetworkConfig,
  signer: Signer | Provider
): Contract => {
  return new Contract(config.contracts.rlyERC20, PosRLYTestERC20.abi, signer);
};

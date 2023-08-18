import { Contract, Signer } from 'ethers';
import type { Provider } from '@ethersproject/abstract-provider';
import ERC20 from './erc20Data.json';

export const erc20 = (
  signer: Signer | Provider,
  contractAddress: string
): Contract => {
  return new Contract(contractAddress, ERC20.abi, signer);
};

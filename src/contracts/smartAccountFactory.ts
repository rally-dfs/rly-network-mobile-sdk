import { Contract, Signer } from 'ethers';
import type { Provider } from '@ethersproject/abstract-provider';
import SmartAccountFactory from './smartAccountFactoryData.json';

export const smartAccountFactory = (
  signer: Signer | Provider,
  contractAddress: string
): Contract => {
  return new Contract(contractAddress, SmartAccountFactory.abi, signer);
};

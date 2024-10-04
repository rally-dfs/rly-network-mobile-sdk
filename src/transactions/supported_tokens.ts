import type { EIP712Domain } from '../gsnClient/EIP712/typedSigning';
import { MetaTxMethod } from '../gsnClient/utils';

export interface TokenConfig {
  address: string;
  metaTxnMethod: MetaTxMethod;
  eip712Domain?: EIP712Domain;
}

export const BaseUSDC: TokenConfig = {
  address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
  metaTxnMethod: MetaTxMethod.Permit,
  eip712Domain: {
    version: '2',
  },
};

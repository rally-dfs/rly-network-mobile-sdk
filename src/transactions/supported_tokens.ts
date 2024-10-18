import type { EIP712Domain } from '../gsnClient/EIP712/typedSigning';
import { MetaTxMethod } from '../gsnClient/utils';

/*
 * TokenConfig is a configuration object that is used to define the properties of a token.
 * address: The address of the token contract.
 * metaTxnMethod: The method of meta transaction that the token supports. See MetaTxMethod for more information.
 * This is most likely going to be MetaTxMethod.Permit.
 * eip712Domain: The EIP712 domain object for the token. This is only required if the token uses non default values for EIP712 signature generation.
 */
export interface TokenConfig {
  address: string;
  metaTxnMethod: MetaTxMethod;
  eip712Domain?: EIP712Domain;
}

/*
 * Pre built configuration for USDC on Base Mainnet
 */
export const BaseUSDC: TokenConfig = {
  address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
  metaTxnMethod: MetaTxMethod.Permit,
  eip712Domain: {
    version: '2',
  },
};

/*
 * Pre built configuration for USDC on Sepolia Base.
 * To get access to USDC on Sepolia Base, you can use the faucet at https://faucet.circle.com/
 */
export const BaseSepoliaUSDC: TokenConfig = {
  address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  metaTxnMethod: MetaTxMethod.Permit,
  eip712Domain: {
    version: '2',
  },
};

/*
 * Pre built configuration for RLY on Sepolia Base.
 * This is the token this SDK tests with by default.
 */
export const BaseSepoliaRLY: TokenConfig = {
  address: '0x846D8a5fb8a003b431b67115f809a9B9FFFe5012',
  metaTxnMethod: MetaTxMethod.Permit,
  eip712Domain: {
    version: '1',
  },
};

/*
 * This is a custom version of RLY configured to support
 * the executeMetaTransaction style of meta transactions.
 * Should only be used for specific testing purposes. If you aren't sure
 * whether you need MetaTxMethod.ExecuteMetaTransaction, you probably don't.
 */
export const BaseSepoliaExecMetaRLY: TokenConfig = {
  address: '0x16723e9bb894EfC09449994eC5bCF5b41EE0D9b2',
  metaTxnMethod: MetaTxMethod.ExecuteMetaTransaction,
};

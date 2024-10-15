import type { Address } from '../utils';

const GsnDomainSeparatorType = {
  prefix: 'string name,string version',
  version: '3',
};

function getDomainSeparator(name: string, verifier: Address, chainId: number) {
  return {
    name,
    version: GsnDomainSeparatorType.version,
    chainId: chainId,
    verifyingContract: verifier,
  };
}

export interface MessageTypeProperty {
  name: string;
  type: string;
}

export const EIP712DomainType: MessageTypeProperty[] = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
];

export const EIP712DomainTypeWithoutVersion: MessageTypeProperty[] = [
  { name: 'name', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
];

const RelayDataType = [
  { name: 'maxFeePerGas', type: 'uint256' },
  { name: 'maxPriorityFeePerGas', type: 'uint256' },
  { name: 'transactionCalldataGasUsed', type: 'uint256' },
  { name: 'relayWorker', type: 'address' },
  { name: 'paymaster', type: 'address' },
  { name: 'forwarder', type: 'address' },
  { name: 'paymasterData', type: 'bytes' },
  { name: 'clientId', type: 'uint256' },
];

const ForwardRequestType = [
  { name: 'from', type: 'address' },
  { name: 'to', type: 'address' },
  { name: 'value', type: 'uint256' },
  { name: 'gas', type: 'uint256' },
  { name: 'nonce', type: 'uint256' },
  { name: 'data', type: 'bytes' },
  { name: 'validUntilTime', type: 'uint256' },
];

const RelayRequestType = [
  ...ForwardRequestType,
  { name: 'relayData', type: 'RelayData' },
];

export interface MessageTypes {
  EIP712Domain: MessageTypeProperty[];

  [additionalProperties: string]: MessageTypeProperty[];
}

interface GsnPrimaryType {
  RelayRequest: MessageTypeProperty[];
  RelayData: MessageTypeProperty[];
}

export interface EIP712Domain {
  name?: string;
  version?: string;
  chainId?: number;
  verifyingContract?: string;
  salt?: string;
}

export class TypedGsnRequestData {
  readonly types: GsnPrimaryType;
  readonly domain: EIP712Domain;
  readonly primaryType: string;
  readonly message: any;

  constructor(
    name: string,
    chainId: number,
    verifier: Address,
    relayRequest: any
  ) {
    this.types = {
      RelayRequest: RelayRequestType,
      RelayData: RelayDataType,
    };
    this.domain = getDomainSeparator(name, verifier, chainId);
    this.primaryType = 'RelayRequest';
    // in the signature, all "request" fields are flattened out at the top structure.
    // other params are inside "relayData" sub-type
    this.message = {
      ...relayRequest.request,
      relayData: relayRequest.relayData,
    };
  }
}

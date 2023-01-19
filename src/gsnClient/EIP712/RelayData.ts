import type { PrefixedHexString, Address, IntString } from '../utils';

export interface RelayData {
  maxFeePerGas: IntString;
  maxPriorityFeePerGas: IntString;
  transactionCalldataGasUsed: IntString;
  relayWorker: Address;
  paymaster: Address;
  paymasterData: PrefixedHexString;
  clientId: IntString;
  forwarder: Address;
}

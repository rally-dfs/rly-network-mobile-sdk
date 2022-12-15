import type { PrefixedHexString, Address, IntString } from '../utils';

export interface ForwardRequest {
  from: Address;
  to: Address;
  value: IntString;
  gas: IntString;
  nonce: IntString;
  data: PrefixedHexString;
  validUntilTime: IntString;
}

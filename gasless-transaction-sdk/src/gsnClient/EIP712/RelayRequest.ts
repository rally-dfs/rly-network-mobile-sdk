import type { ForwardRequest } from './ForwardRequest';
import type { RelayData } from './RelayData';

export interface RelayRequest {
  request: ForwardRequest;
  relayData: RelayData;
}

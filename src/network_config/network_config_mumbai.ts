import type { NetworkConfig } from './network_config';

export const mumbaiNetworkConfig: NetworkConfig = {
  contracts: {
    tokenFaucet: '0xD934Ac8fB32336C5a2b51dF6a97432C4De0594F3',
  },
  gsn: {
    paymasterAddress: '0x327BBd6BAc3236BCAcDE0D0f4FCD08b3eDfFbc06',
    forwarderAddress: '0x7A95fA73250dc53556d264522150A940d4C50238',
    relayHubAddress: '0x3a1Df71d11774F25B9d8a35DF4aF1918bff41681',
    relayWorkerAddress: '0xde4e7af613700fcf4452d043d57ee31fb2579fdd',
    relayUrl: 'https://mumbai.v3.opengsn.org/v3',
    rpcUrl: 'https://rpc.ankr.com/polygon_mumbai',
    chainId: '80001',
    maxAcceptanceBudget: '285252',
    domainSeparatorName: 'GSN Relayed Transaction',
    gtxDataNonZero: 16,
    gtxDataZero: 4,
    requestValidSeconds: 172800,
    maxPaymasterDataLength: 0,
    maxApprovalDataLength: 0,
    maxRelayNonceGap: 3,
  },
};

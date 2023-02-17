import type { NetworkConfig } from './network_config';

export const MumbaiNetworkConfig: NetworkConfig = {
  contracts: {
    tokenFaucet: '0x946B1A4eA6457b285254Facb54B896Ab0fAE3a7C',
  },
  gsn: {
    paymasterAddress: '0x086c11bd5A61ac480b326916656a33c474d1E4d8',
    forwarderAddress: '0xB2b5841DBeF766d4b521221732F9B618fCf34A87',
    relayHubAddress: '0x3232f21A6E08312654270c78A773f00dd61d60f5',
    relayWorkerAddress: '0x7b556ef275185122257090bd59f74fe4c3c3ca96',
    relayUrl: 'https://mumbai.3-0-0-beta-3.opengsn.org/v3',
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

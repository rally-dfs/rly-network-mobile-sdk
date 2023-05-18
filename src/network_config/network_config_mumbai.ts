import type { NetworkConfig } from './network_config';

export const MumbaiNetworkConfig: NetworkConfig = {
  contracts: {
    rlyERC20: '0x1C7312Cb60b40cF586e796FEdD60Cf243286c9E9',
    tokenFaucet: '0xe7C3BD692C77Ec0C0bde523455B9D142c49720fF',
  },
  gsn: {
    paymasterAddress: '0x298b3CA442474e2cf73874171986F90F0ACF07e2',
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
    maxPaymasterDataLength: 300,
    maxApprovalDataLength: 0,
    maxRelayNonceGap: 3,
  },
};

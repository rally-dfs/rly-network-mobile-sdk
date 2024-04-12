import type { NetworkConfig } from './network_config';

export const AmoyNetworkConfig: NetworkConfig = {
  contracts: {
    rlyERC20: '0x846d8a5fb8a003b431b67115f809a9b9fffe5012',
    tokenFaucet: '0xb8c8274f775474f4f2549edcc4db45cbad936fac',
  },
  gsn: {
    paymasterAddress: '0xb570b57b821670707fF4E38Ea53fcb67192278F8',
    forwarderAddress: '0x0ae8FC9867CB4a124d7114B8bd15C4c78C4D40E5',
    relayHubAddress: '0xe213A20A9E6CBAfd8456f9669D8a0b9e41Cb2751',
    relayWorkerAddress: '0xb9950b71ec94cbb274aeb1be98e697678077a17f',
    relayUrl: 'https://api.rallyprotocol.com',
    rpcUrl: 'https://api.rallyprotocol.com/rpc',
    chainId: '80002',
    maxAcceptanceBudget: '285252',
    domainSeparatorName: 'GSN Relayed Transaction',
    gtxDataNonZero: 16,
    gtxDataZero: 4,
    requestValidSeconds: 172800,
    maxPaymasterDataLength: 300,
    maxApprovalDataLength: 300,
    maxRelayNonceGap: 3,
  },
};

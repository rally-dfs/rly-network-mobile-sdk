import type { NetworkConfig } from './network_config';

export const BaseNetworkConfig: NetworkConfig = {
  contracts: {
    //TODO: there are no contracts for base mainnet. Client needs update to handle this case gracefully.
    rlyERC20: '0x000',
    tokenFaucet: '0x000',
  },
  gsn: {
    paymasterAddress: '0x01B83B33F0DD8be68627a9BE68E9e7E3c209a6b1',
    forwarderAddress: '0x524266345fB331cb624E27D2Cf5B61E769527FCC',
    relayHubAddress: '0x54623092d2dB00D706e0Ad4ADaCc024F9cB9E915',
    relayWorkerAddress: '0x7c5b7cf606ab2b56ead90b583bad47c5fd2c3417',
    relayUrl: 'https://api.rallyprotocol.com',
    rpcUrl: 'https://api.rallyprotocol.com/rpc',
    chainId: '8453',
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

import type { NetworkConfig } from './network_config';

export const BaseSepoliaNetworkConfig: NetworkConfig = {
  contracts: {
    rlyERC20: '0x16723e9bb894EfC09449994eC5bCF5b41EE0D9b2',
    tokenFaucet: '0xCeCFB48a9e7C0765Ed1319ee1Bc0F719a30641Ce',
  },
  gsn: {
    paymasterAddress: '0x9bf59A7924cBa2475A03AD77e92fcf1Eaddb2Cc2',
    forwarderAddress: '0xabf9Fa3b2b2d9bDd77f4271A0d5A309AA465BCBa',
    relayHubAddress: '0xb570b57b821670707fF4E38Ea53fcb67192278F8',
    relayWorkerAddress: '0xdb1d6c7b07c857cc22a4ef10ac7b1dd06dd7501f',
    relayUrl: 'https://api.rallyprotocol.com',
    rpcUrl: 'https://api.rallyprotocol.com/rpc',
    chainId: '84532',
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

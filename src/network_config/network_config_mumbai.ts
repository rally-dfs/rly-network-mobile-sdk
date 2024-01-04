import type { NetworkConfig } from './network_config';

export const MumbaiNetworkConfig: NetworkConfig = {
  contracts: {
    rlyERC20: '0x1C7312Cb60b40cF586e796FEdD60Cf243286c9E9',
    tokenFaucet: '0xe7C3BD692C77Ec0C0bde523455B9D142c49720fF',
  },
  gsn: {
    paymasterAddress: '0x8b3a505413Ca3B0A17F077e507aF8E3b3ad4Ce4d',
    forwarderAddress: '0xB2b5841DBeF766d4b521221732F9B618fCf34A87',
    relayHubAddress: '0x3232f21A6E08312654270c78A773f00dd61d60f5',
    relayWorkerAddress: '0xb9950b71ec94cbb274aeb1be98e697678077a17f',
    relayUrl: 'https://api.rallyprotocol.com',
    rpcUrl:
      'https://polygon-mumbai.g.alchemy.com/v2/FX6YeEKwTC-BDX6kh7WkSoCdyB-WlgCd',
    chainId: '80001',
    maxAcceptanceBudget: '285252',
    domainSeparatorName: 'GSN Relayed Transaction',
    gtxDataNonZero: 16,
    gtxDataZero: 4,
    requestValidSeconds: 172800,
    maxPaymasterDataLength: 300,
    maxApprovalDataLength: 300,
    maxRelayNonceGap: 3,
  },
  aa: {
    bundlerRpcUrl:
      'https://polygon-mumbai.g.alchemy.com/v2/FX6YeEKwTC-BDX6kh7WkSoCdyB-WlgCd',
    entrypointAddress: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
    smartAccountFactoryAddress: '0xabafacaa87cce0814a9dd52ce35e2d50ad22a35e',
    lightAccountImplAddress: '0x5467b1947F47d0646704EB801E075e72aeAe8113',
    lightAccountFactoryAddress: '0x00000055C0b4fA41dde26A74435ff03692292FBD',
    kernalImplAddress: '0xf048AD83CB2dfd6037A43902a2A5Be04e53cd2Eb',
    kernalFactoryAddress: '0x5de4839a76cf55d0c90e2061ef4386d962E15ae3',
    kernalECDSAValidatorAddress: '0xd9AB5096a832b9ce79914329DAEE236f8Eea0390',
    candideFactoryAddress: '0xb73Eb505Abc30d0e7e15B73A492863235B3F4309',
    candideImplAddress: '0x3A0a17Bcc84576b099373ab3Eed9702b07D30402',
    safeMultiSendAddress: '0x38869bf66a61cF6bDB996A6aE40D5853Fd43B526',
    paymaster: '0x69b4DC57Ec430eFBd5139FEAe80A01E9d366Eaa8',
  },
};

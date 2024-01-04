import type { NetworkConfig } from './network_config';

export const PolygonNetworkConfig: NetworkConfig = {
  contracts: {
    rlyERC20: '0x76b8D57e5ac6afAc5D415a054453d1DD2c3C0094',
    tokenFaucet: '0x78a0794Bb3BB06238ed5f8D926419bD8fc9546d8',
  },
  gsn: {
    paymasterAddress: '0x29CAa31142D17545C310437825aA4C53FbE621C3',
    forwarderAddress: '0xB2b5841DBeF766d4b521221732F9B618fCf34A87',
    relayHubAddress: '0xfCEE9036EDc85cD5c12A9De6b267c4672Eb4bA1B',
    relayWorkerAddress: '0x579de7c56cd9a07330504a7c734023a9f703778a',
    relayUrl: 'https://api.rallyprotocol.com',
    rpcUrl:
      'https://polygon-mainnet.g.alchemy.com/v2/-dYNjZXvre3GC9kYtwDzzX4N8tcgomU4',
    chainId: '137',
    maxAcceptanceBudget: '285252',
    domainSeparatorName: 'GSN Relayed Transaction',
    gtxDataNonZero: 16,
    gtxDataZero: 4,
    requestValidSeconds: 172800,
    maxPaymasterDataLength: 300,
    maxApprovalDataLength: 0,
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

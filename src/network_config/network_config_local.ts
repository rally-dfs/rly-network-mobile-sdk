import type { NetworkConfig } from './network_config';

export const LocalNetworkConfig: NetworkConfig = {
  contracts: {
    tokenFaucet: '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c',
    rlyERC20: '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c',
  },
  gsn: {
    paymasterAddress: '0x7a2088a1bFc9d81c55368AE168C2C02570cB814F',
    forwarderAddress: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    relayHubAddress: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
    relayWorkerAddress: '0x84ef35506635109ce61544193e8f87b0a1a1b4fd',
    relayUrl: 'http://localhost:8090',
    rpcUrl: 'http://127.0.0.1:8545',
    chainId: '1337',
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
    bundlerRpcUrl: 'http://localhost:3000/rpc',
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
  },
};

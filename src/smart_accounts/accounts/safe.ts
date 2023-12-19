import { Contract, ethers, Wallet } from 'ethers';
import type { SmartAccountManager } from '../../smart_account';
import type { PrefixedHexString } from '../..//gsnClient/utils';
import { sendUserOperation, confirmUserOperation } from '../common/common';
import type { NetworkConfig } from '../../network_config/network_config';
import CandideFactory from '../../contracts/smartAccounts/candideFactoryData.json';
import Candide from '../../contracts/smartAccounts/candideData.json';

const getAddress = async (
  account: PrefixedHexString,
  network: NetworkConfig
): Promise<PrefixedHexString> => {
  const provider = new ethers.providers.JsonRpcProvider(network.gsn.rpcUrl);

  const factory = new Contract(
    network.aa.candideFactoryAddress,
    CandideFactory.abi,
    provider
  );

  const candide = new Contract(
    network.aa.candideImplAddress,
    Candide.abi,
    provider
  );

  const initializer = await candide.interface.encodeFunctionData(
    'setupWithEntrypoint',
    [
      [account],
      1,
      ethers.constants.AddressZero,
      '0x',
      ethers.constants.AddressZero,
      ethers.constants.AddressZero,
      0,
      ethers.constants.AddressZero,
      network.aa.entrypointAddress,
    ]
  );

  const deploymentCode = ethers.utils.solidityPack(
    ['bytes', 'uint256'],
    [await factory.proxyCreationCode(), network.aa.candideImplAddress]
  );
  const salt = ethers.utils.solidityKeccak256(
    ['bytes32', 'uint256'],
    [ethers.utils.solidityKeccak256(['bytes'], [initializer]), 0]
  );
  return ethers.utils.getCreate2Address(
    factory.address,
    salt,
    ethers.utils.keccak256(deploymentCode)
  ) as PrefixedHexString;
};

const getAccount = async (
  address: PrefixedHexString,
  network: NetworkConfig
): Promise<Contract> => {
  const provider = new ethers.providers.JsonRpcProvider(network.gsn.rpcUrl);

  return new Contract(address, Candide.abi, provider);
};

const getInitCode = async (
  owner: PrefixedHexString,
  network: NetworkConfig
): Promise<PrefixedHexString> => {
  const provider = new ethers.providers.JsonRpcProvider(network.gsn.rpcUrl);

  const factory = new Contract(
    network.aa.candideFactoryAddress,
    CandideFactory.abi,
    provider
  );

  const candide = new Contract(
    network.aa.candideImplAddress,
    Candide.abi,
    provider
  );

  const initializer = await candide.interface.encodeFunctionData(
    'setupWithEntrypoint',
    [
      [owner],
      1,
      ethers.constants.AddressZero,
      '0x',
      ethers.constants.AddressZero,
      ethers.constants.AddressZero,
      0,
      ethers.constants.AddressZero,
      network.aa.entrypointAddress,
    ]
  );

  return ethers.utils.hexConcat([
    network.aa.candideFactoryAddress,
    factory.interface.encodeFunctionData('createProxyWithNonce', [
      network.aa.candideImplAddress,
      initializer,
      0,
    ]),
  ]) as PrefixedHexString;
};

const getDummySignature = async (): Promise<PrefixedHexString> => {
  return '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c';
};

const signUserOperation = async (
  owner: Wallet,
  userOpHash: PrefixedHexString
): Promise<PrefixedHexString> => {
  const sig = (await owner.signMessage(
    ethers.utils.arrayify(userOpHash)
  )) as PrefixedHexString;
  return sig;
};

const getExecuteCall = async (
  to: PrefixedHexString,
  value: string,
  callData: PrefixedHexString,
  network: NetworkConfig
): Promise<PrefixedHexString> => {
  const provider = new ethers.providers.JsonRpcProvider(network.gsn.rpcUrl);

  const scwImpl = new Contract(
    network.aa.candideImplAddress,
    Candide.abi,
    provider
  );

  return (await scwImpl.interface.encodeFunctionData(
    'execTransactionFromEntrypoint',
    [
      to,
      ethers.utils.parseEther(value),
      callData,
      0,
      ethers.constants.AddressZero,
      ethers.constants.AddressZero,
      0,
    ]
  )) as PrefixedHexString;
};

export const SafeAccountManager: SmartAccountManager = {
  getAddress: getAddress,
  getAccount: getAccount,
  getInitCode: getInitCode,
  getDummySignature: getDummySignature,
  getExecuteCall: getExecuteCall,
  signUserOperation: signUserOperation,
  sendUserOperation: sendUserOperation,
  confirmUserOperation: confirmUserOperation,
};

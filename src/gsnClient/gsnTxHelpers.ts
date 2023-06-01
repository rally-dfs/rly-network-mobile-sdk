import { ethers, BigNumber, Wallet } from 'ethers';
import { Buffer } from 'buffer';
import { TypedGsnRequestData } from './EIP712/typedSigning';
import type { RelayRequest } from './EIP712/RelayRequest';
import type {
  PrefixedHexString,
  GsnTransactionDetails,
  Address,
  AccountKeypair,
} from './utils';
import type {
  GSNConfig,
  NetworkConfig,
} from '../network_config/network_config';
import { tokenFaucet, erc20 } from '../contract';
import { getTypedMetatransaction } from './EIP712/MetaTransaction';
import { getTypedPermitTransaction } from './EIP712/PermitTransaction';

import ERC20 from '../contracts/erc20Data.json';
import relayHubAbi from './ABI/IRelayHub.json';
import forwarderAbi from './ABI/IForwarder.json';
import { NativeCodeWrapper } from '../../src/native_code_wrapper';
import type { AxiosResponse } from 'axios';
import { RelayError } from '../errors';

const calculateCalldataBytesZeroNonzero = (
  calldata: PrefixedHexString
): { calldataZeroBytes: number; calldataNonzeroBytes: number } => {
  const calldataBuf = Buffer.from(calldata.replace('0x', ''), 'hex');
  let calldataZeroBytes = 0;
  let calldataNonzeroBytes = 0;
  calldataBuf.forEach((ch) => {
    ch === 0 ? calldataZeroBytes++ : calldataNonzeroBytes++;
  });
  return { calldataZeroBytes, calldataNonzeroBytes };
};

const calculateCalldataCost = (
  msgData: PrefixedHexString,
  gtxDataNonZero: number,
  gtxDataZero: number
): number => {
  const { calldataZeroBytes, calldataNonzeroBytes } =
    calculateCalldataBytesZeroNonzero(msgData);
  return (
    calldataZeroBytes * gtxDataZero + calldataNonzeroBytes * gtxDataNonZero
  );
};

export const estimateGasWithoutCallData = (
  transaction: GsnTransactionDetails,
  gtxDataNonZero: number,
  gtxDataZero: number
) => {
  const originalGas = transaction.gas;
  const callDataCost = calculateCalldataCost(
    transaction.data,
    gtxDataNonZero,
    gtxDataZero
  );
  const adjustedgas = BigNumber.from(originalGas).sub(callDataCost);
  return adjustedgas.toHexString();
};

export const estimateCalldataCostForRequest = async (
  relayRequestOriginal: RelayRequest,
  config: GSNConfig
): Promise<PrefixedHexString> => {
  // protecting the original object from temporary modifications done here
  const relayRequest = Object.assign({}, relayRequestOriginal, {
    relayData: Object.assign({}, relayRequestOriginal.relayData),
  });

  relayRequest.relayData.transactionCalldataGasUsed = '0xffffffffff';
  relayRequest.relayData.paymasterData =
    '0x' + 'ff'.repeat(config.maxPaymasterDataLength);
  const maxAcceptanceBudget = '0xffffffffff';
  const signature = '0x' + 'ff'.repeat(65);
  const approvalData = '0x' + 'ff'.repeat(config.maxApprovalDataLength);

  const relayHub = new ethers.Contract(config.relayHubAddress, relayHubAbi);

  const tx = await relayHub.populateTransaction.relayCall?.(
    config.domainSeparatorName,
    maxAcceptanceBudget,
    relayRequest,
    signature,
    approvalData
  );

  if (!tx?.data) {
    throw 'tx data undefined';
  }

  return BigNumber.from(
    calculateCalldataCost(tx.data, config.gtxDataNonZero, config.gtxDataZero)
  ).toHexString();
};

export const getSenderNonce = async (
  sender: Address,
  forwarderAddress: Address,
  provider: ethers.providers.JsonRpcProvider
): Promise<string> => {
  const forwarder = new ethers.Contract(
    forwarderAddress,
    forwarderAbi,
    provider
  );
  const nonce = await forwarder.getNonce(sender);
  return nonce.toString();
};

export const signRequest = async (
  relayRequest: RelayRequest,
  domainSeparatorName: string,
  chainId: string,
  account: AccountKeypair
) => {
  const cloneRequest = { ...relayRequest };

  const signedGsnData = new TypedGsnRequestData(
    domainSeparatorName,
    Number(chainId),
    relayRequest.relayData.forwarder,
    cloneRequest
  );

  const wallet = new ethers.Wallet(account.privateKey);

  const types = {
    RelayData: [...signedGsnData.types.RelayData],
    RelayRequest: [...signedGsnData.types.RelayRequest],
  };

  const signature = await wallet._signTypedData(
    signedGsnData.domain,
    types,
    signedGsnData.message
  );

  return signature;
};

export const getRelayRequestID = (
  relayRequest: any,
  signature: PrefixedHexString = '0x'
): PrefixedHexString => {
  const types = ['address', 'uint256', 'bytes'];
  const parameters = [
    relayRequest.request.from,
    relayRequest.request.nonce,
    signature,
  ];

  const hash = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(types, parameters)
  );
  const rawRelayRequestId = hash.replace(/^0x/, '').padStart(64, '0');

  const prefixSize = 8;
  const prefixedRelayRequestId = rawRelayRequestId.replace(
    new RegExp(`^.{${prefixSize}}`),
    '0'.repeat(prefixSize)
  );
  return `0x${prefixedRelayRequestId}`;
};

export const getClaimTx = async (
  account: AccountKeypair,
  config: NetworkConfig,
  provider: ethers.providers.JsonRpcProvider
) => {
  const faucet = tokenFaucet(config, provider);

  const tx = await faucet.populateTransaction.claim?.({
    from: account.address,
  });

  const gas = await faucet.estimateGas.claim?.({ from: account.address });

  const { maxFeePerGas, maxPriorityFeePerGas } = await provider.getFeeData();

  if (!tx) {
    throw 'tx not populated';
  }

  const gsnTx = {
    from: account.address,
    data: tx.data,
    value: '0',
    to: tx.to,
    gas: gas?._hex,
    maxFeePerGas: maxFeePerGas?._hex,
    maxPriorityFeePerGas: maxPriorityFeePerGas?._hex,
  } as GsnTransactionDetails;

  return gsnTx;
};

export const getMetatransactionEIP712Signature = async (
  account: Wallet,
  contractName: string,
  contractAddress: PrefixedHexString,
  functionSignature: string,
  config: NetworkConfig,
  nonce: number
) => {
  // name and chainId to be used in EIP712

  const chainId = config.gsn.chainId;

  // typed data for signing
  const eip712Data = getTypedMetatransaction({
    name: contractName,
    version: '1',
    salt: ethers.utils.hexZeroPad(ethers.utils.hexlify(Number(chainId)), 32),
    verifyingContract: contractAddress,
    nonce,
    from: account.address,
    functionSignature,
  });

  //signature for metatransaction
  const signature = await account._signTypedData(
    eip712Data.domain,
    eip712Data.types,
    eip712Data.message
  );

  //get r,s,v from signature

  return ethers.utils.splitSignature(signature);
};

export const getExecuteMetatransactionTx = async (
  account: Wallet,
  destinationAddress: Address,
  amount: number,
  config: NetworkConfig,
  contractAddress: string,
  provider: ethers.providers.JsonRpcProvider
) => {
  const token = erc20(provider, contractAddress);

  const name = await token.name();
  const nonce = await token.getNonce(account.address);
  const decimals = await token.decimals();
  const decimalAmount = ethers.utils.parseUnits(amount.toString(), decimals);

  // get function signature
  const data = await token.interface.encodeFunctionData('transfer', [
    destinationAddress,
    decimalAmount,
  ]);

  const { r, s, v } = await getMetatransactionEIP712Signature(
    account,
    name,
    token.address,
    data,
    config,
    nonce.toNumber()
  );

  const tx = await token.populateTransaction.executeMetaTransaction?.(
    account.address,
    data,
    r,
    s,
    v,
    { from: account.address }
  );

  const gas = await token.estimateGas.executeMetaTransaction?.(
    account.address,
    data,
    r,
    s,
    v,
    {
      from: account.address,
    }
  );

  const { maxFeePerGas, maxPriorityFeePerGas } = await provider.getFeeData();

  if (!tx) {
    throw 'tx not populated';
  }

  const gsnTx = {
    from: account.address,
    data: tx.data,
    value: '0',
    to: tx.to,
    gas: gas?._hex,
    maxFeePerGas: maxFeePerGas?._hex,
    maxPriorityFeePerGas: maxPriorityFeePerGas?._hex,
  } as GsnTransactionDetails;

  return gsnTx;
};

export const getPermitEIP712Signature = async (
  account: Wallet,
  contractName: string,
  contractAddress: PrefixedHexString,
  config: NetworkConfig,
  nonce: number,
  amount: BigNumber,
  deadline: number

) => {
  // chainId to be used in EIP712

  const chainId = config.gsn.chainId;


  // typed data for signing
  const eip712Data = getTypedPermitTransaction({
    name: contractName,
    version: `1`,
    chainId: Number(chainId),
    verifyingContract: contractAddress,
    owner: account.address,
    spender: config.gsn.paymasterAddress,
    value: amount.toString(),
    nonce: nonce,
    deadline,
  });

  //signature for metatransaction
  const signature = await account._signTypedData(
    eip712Data.domain,
    eip712Data.types,
    eip712Data.message
  );

  //get r,s,v from signature

  return ethers.utils.splitSignature(signature);
};

export const getPermitTx = async (
  account: Wallet,
  destinationAddress: Address,
  amount: number,
  config: NetworkConfig,
  contractAddress: PrefixedHexString,
  provider: ethers.providers.JsonRpcProvider
) => {
  const token = erc20(provider, contractAddress);
  const name = await token.name();
  const nonce = await token.nonces(account.address);
  const decimals = await token.decimals();
  const decimalAmount = ethers.utils.parseUnits(amount.toString(), decimals);

  const deadline = await getPermitDeadline(provider);

  const { r, s, v } = await getPermitEIP712Signature(
    account,
    name,
    token.address,
    config,
    nonce.toNumber(),
    decimalAmount,
    deadline
  );

  const tx = await token.populateTransaction.permit?.(
    account.address,
    config.gsn.paymasterAddress,
    decimalAmount,
    deadline,
    v,
    r,
    s,
    { from: account.address }
  );

  const gas = await token.estimateGas.permit?.(
    account.address,
    config.gsn.paymasterAddress,
    decimalAmount,
    deadline,
    v,
    r,
    s,
    { from: account.address }
  );

  const fromTx = await token.populateTransaction.transferFrom?.(
    account.address,
    destinationAddress,
    decimalAmount
  );

  const paymasterData =
    '0x' + token.address.replace(/^0x/, '') + fromTx?.data?.replace(/^0x/, '');

  const { maxFeePerGas, maxPriorityFeePerGas } = await provider.getFeeData();

  const gsnTx = {
    from: account.address,
    data: tx?.data,
    value: '0',
    to: tx?.to,
    gas: gas?._hex,
    maxFeePerGas: maxFeePerGas?._hex,
    maxPriorityFeePerGas: maxPriorityFeePerGas?._hex,
    paymasterData,
  } as GsnTransactionDetails;

  return gsnTx;
};

export const getClientId = async (): Promise<string> => {
  //get bundleId string from application convert it to integer for use in GSN
  //get bundle id from native module
  const bundleId = await NativeCodeWrapper.getBundleId();
  //convert bundle to hex
  const hexValue = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(bundleId));
  //convert hex to int
  return BigNumber.from(hexValue).toString();
};

// get timestamp that will always be included in next 3 blocks
export const getPermitDeadline = async (
  provider: ethers.providers.JsonRpcProvider
): Promise<number> => {
  const { timestamp } = await provider.getBlock('latest');
  return timestamp + 45;
};

export const handleGsnResponse = async (
  res: AxiosResponse<any, any>,
  provider: ethers.providers.JsonRpcProvider
) => {
  if (res.data['error'] !== undefined) {
    throw {
      message: RelayError,
      details: res.data['error'],
    };
  } else {
    const txHash = ethers.utils.keccak256(res.data.signedTx);
    await provider.waitForTransaction(txHash);
    return txHash;
  }
};

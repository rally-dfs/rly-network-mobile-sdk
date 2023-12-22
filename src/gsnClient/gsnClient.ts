import type { GsnTransactionDetails, AccountKeypair, Wallet } from './utils';

import type { RelayRequest } from './EIP712/RelayRequest';
import { handleGsnResponse } from './gsnTxHelpers';

import axios from 'axios';

import type { NetworkConfig } from 'src/network_config/network_config';

import {
  estimateGasWithoutCallData,
  estimateCalldataCostForRequest,
  getSenderNonce,
  signRequest,
  getRelayRequestID,
  //getClientId,
} from './gsnTxHelpers';

import { ethers, providers } from 'ethers';

interface GsnServerConfigPayload {
  relayWorkerAddress: string;
  relayManagerAddress: string;
  relayHubAddress: string;
  ownerAddress: string;
  minMaxPriorityFeePerGas: string;
  maxMaxFeePerGas: string;
  minMaxFeePerGas: string;
  maxAcceptanceBudget: string;
  chainId: string;
  networkId: string;
  ready: boolean;
  version: string;
}

const authHeader = (config: NetworkConfig) => {
  return {
    Authorization: `Bearer ${config.relayerApiKey || ''}`,
  };
};

const updateConfig = async (
  config: NetworkConfig,
  transaction: GsnTransactionDetails
) => {
  const response = await axios.get(`${config.gsn.relayUrl}/getaddr`, {
    headers: authHeader(config),
  });
  const serverConfigUpdate = response.data as GsnServerConfigPayload;

  config.gsn.relayWorkerAddress = serverConfigUpdate.relayWorkerAddress;

  setGasFeesForTransaction(transaction, serverConfigUpdate);

  return { config, transaction };
};

const setGasFeesForTransaction = (
  transaction: GsnTransactionDetails,
  serverConfigUpdate: GsnServerConfigPayload
) => {
  const serverSuggestedMinPriorityFeePerGas = parseInt(
    serverConfigUpdate.minMaxPriorityFeePerGas,
    10
  );

  const paddedMaxPriority = Math.round(
    serverSuggestedMinPriorityFeePerGas * 1.4
  );
  transaction.maxPriorityFeePerGas = paddedMaxPriority.toString();

  //Special handling for mumbai because of quirk with gas estimate returned by GSN for mumbai
  if (serverConfigUpdate.chainId === '80001') {
    transaction.maxFeePerGas = paddedMaxPriority.toString();
  } else {
    transaction.maxFeePerGas = serverConfigUpdate.maxMaxFeePerGas;
  }
};

const buildRelayRequest = async (
  transaction: GsnTransactionDetails,
  config: NetworkConfig,
  account: AccountKeypair,
  web3Provider: providers.JsonRpcProvider
) => {
  //remove call data cost from gas estimate as tx will be called from contract
  transaction.gas = estimateGasWithoutCallData(
    transaction,
    config.gsn.gtxDataNonZero,
    config.gsn.gtxDataZero
  );

  const secondsNow = Math.round(Date.now() / 1000);
  const validUntilTime = (
    secondsNow + config.gsn.requestValidSeconds
  ).toString();

  const senderNonce = await getSenderNonce(
    account.address,
    config.gsn.forwarderAddress,
    web3Provider
  );

  const relayRequest: RelayRequest = {
    request: {
      from: transaction.from,
      to: transaction.to,
      value: transaction.value || '0',
      gas: parseInt(transaction.gas, 16).toString(),
      nonce: senderNonce,
      data: transaction.data,
      validUntilTime,
    },
    relayData: {
      maxFeePerGas: transaction.maxFeePerGas,
      maxPriorityFeePerGas: transaction.maxPriorityFeePerGas,
      transactionCalldataGasUsed: '',
      relayWorker: config.gsn.relayWorkerAddress,
      paymaster: config.gsn.paymasterAddress,
      forwarder: config.gsn.forwarderAddress,
      paymasterData: transaction.paymasterData?.toString() || '0x',
      clientId: '1',
    },
  };

  const transactionCalldataGasUsed = await estimateCalldataCostForRequest(
    relayRequest,
    config.gsn
  );

  relayRequest.relayData.transactionCalldataGasUsed = parseInt(
    transactionCalldataGasUsed,
    16
  ).toString();

  return relayRequest;
};

const buildRelayHttpRequest = async (
  relayRequest: RelayRequest,
  config: NetworkConfig,
  account: AccountKeypair,
  web3Provider: providers.JsonRpcProvider
) => {
  const signature = await signRequest(
    relayRequest,
    config.gsn.domainSeparatorName,
    config.gsn.chainId,
    account
  );

  const approvalData = '0x';

  const wallet = new ethers.VoidSigner(
    relayRequest.relayData.relayWorker,
    web3Provider
  );
  const relayLastKnownNonce = await wallet.getTransactionCount();
  const relayMaxNonce = relayLastKnownNonce + config.gsn.maxRelayNonceGap;

  const metadata = {
    maxAcceptanceBudget: config.gsn.maxAcceptanceBudget,
    relayHubAddress: config.gsn.relayHubAddress,
    signature,
    approvalData,
    relayMaxNonce,
    relayLastKnownNonce,
    domainSeparatorName: config.gsn.domainSeparatorName,
    relayRequestId: '',
  };
  const httpRequest = {
    relayRequest,
    metadata,
  };

  return httpRequest;
};

export const relayTransaction = async (
  account: Wallet,
  config: NetworkConfig,
  transaction: GsnTransactionDetails
) => {
  const web3Provider = new ethers.providers.JsonRpcProvider(config.gsn.rpcUrl);
  const updatedConfig = await updateConfig(config, transaction);
  const relayRequest = await buildRelayRequest(
    updatedConfig.transaction,
    updatedConfig.config,
    account,
    web3Provider
  );
  const httpRequest = await buildRelayHttpRequest(
    relayRequest,
    updatedConfig.config,
    account,
    web3Provider
  );

  const relayRequestId = getRelayRequestID(
    httpRequest.relayRequest,
    httpRequest.metadata.signature
  );

  //update request metadata with relayrequestid

  httpRequest.metadata.relayRequestId = relayRequestId;

  const res = await axios.post(`${config.gsn.relayUrl}/relay`, httpRequest, {
    headers: authHeader(config),
  });
  return handleGsnResponse(res, web3Provider);
};

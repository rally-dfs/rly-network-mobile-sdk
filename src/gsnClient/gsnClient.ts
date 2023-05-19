import type { GsnTransactionDetails, AccountKeypair } from './utils';

import type { RelayRequest } from './EIP712/RelayRequest';
import { handleGsnResponse } from './gsnTxHelpers';

import axios from 'axios';

import type {
  GSNConfig,
  NetworkConfig,
} from 'src/network_config/network_config';

import {
  estimateGasWithoutCallData,
  estimateCalldataCostForRequest,
  getSenderNonce,
  signRequest,
  getRelayRequestID,
  //getClientId,
} from './gsnTxHelpers';

import { ethers, providers } from 'ethers';

export class gsnLightClient {
  private readonly account: AccountKeypair;
  config: GSNConfig;
  web3Provider: providers.JsonRpcProvider;
  minMaxPriorityFee: string;
  maxMaxFeePerGas: string;

  constructor(account: AccountKeypair, config: NetworkConfig) {
    this.account = account;
    this.config = config.gsn;
    this.minMaxPriorityFee = '0';
    this.maxMaxFeePerGas = '0';
    this.web3Provider = new ethers.providers.JsonRpcProvider(
      this.config.rpcUrl
    );
  }

  init = async () => {
    await this._updateConfig();
  };

  relayTransaction = async (transaction: GsnTransactionDetails) => {
    const relayRequest = await this._buildRelayRequest(transaction);
    const httpRequest = await this._buildRelayHttpRequest(
      relayRequest,
      this.config
    );

    /*const relayRequestId = getRelayRequestID(
      httpRequest.relayRequest,
      httpRequest.metadata.signature
    );

    //update request metadata with relayrequestid

    httpRequest.metadata.relayRequestId = relayRequestId;*/

    //this is where we relay the transaction

    const res = await axios.post(`${this.config.relayUrl}/relay`, httpRequest);
    return handleGsnResponse(res, this.web3Provider);
  };

  _updateConfig = async () => {
    const { data } = await axios.get(`${this.config.relayUrl}/getaddr`);
    //get current relay worker address from relay server config
    this.config.relayWorkerAddress = data.relayWorkerAddress;

    //get accepted fees from server
    this.minMaxPriorityFee = data.minMaxPriorityFeePerGas;
    // if chainId is 285252, use minMaxPriorityFeePerGas, otherwise use minMaxFeePerGas as minMaxFeePerGas on mumbai server set to 16 tx will fail
    this.maxMaxFeePerGas =
      this.config.chainId === '80001'
        ? data.minMaxPriorityFeePerGas
        : data.maxMaxFeePerGas.toString();
    return;
  };

  _buildRelayRequest = async (
    transaction: GsnTransactionDetails
  ): Promise<RelayRequest> => {
    //remove call data cost from gas estimate as tx will be called from contract
    transaction.gas = estimateGasWithoutCallData(
      transaction,
      this.config.gtxDataNonZero,
      this.config.gtxDataZero
    );

    const secondsNow = Math.round(Date.now() / 1000);
    const validUntilTime = (
      secondsNow + this.config.requestValidSeconds
    ).toString();

    const senderNonce = await getSenderNonce(
      this.account.address,
      this.config.forwarderAddress,
      this.web3Provider
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
        maxFeePerGas: this.maxMaxFeePerGas,
        maxPriorityFeePerGas: this.minMaxPriorityFee,
        transactionCalldataGasUsed: '',
        relayWorker: this.config.relayWorkerAddress,
        paymaster: this.config.paymasterAddress,
        forwarder: this.config.forwarderAddress,
        paymasterData: transaction.paymasterData?.toString() || '0x',
        clientId: '1',
      },
    };

    const transactionCalldataGasUsed = await estimateCalldataCostForRequest(
      relayRequest,
      this.config
    );

    relayRequest.relayData.transactionCalldataGasUsed = parseInt(
      transactionCalldataGasUsed,
      16
    ).toString();

    return relayRequest;
  };

  _buildRelayHttpRequest = async (
    relayRequest: RelayRequest,
    config: GSNConfig
  ) => {
    const signature = await signRequest(
      relayRequest,
      config.domainSeparatorName,
      config.chainId,
      this.account
    );

    //TODO: when should this be used?
    const approvalData = '0x';

    const wallet = new ethers.VoidSigner(
      relayRequest.relayData.relayWorker,
      this.web3Provider
    );
    const relayLastKnownNonce = await wallet.getTransactionCount();
    const relayMaxNonce = relayLastKnownNonce + config.maxRelayNonceGap;

    const metadata = {
      maxAcceptanceBudget: config.maxAcceptanceBudget,
      relayHubAddress: config.relayHubAddress,
      signature,
      approvalData,
      relayMaxNonce,
      relayLastKnownNonce,
      domainSeparatorName: config.domainSeparatorName,
      //relayRequestId: '',
    };
    const httpRequest = {
      relayRequest,
      metadata,
    };

    return httpRequest;
  };
}

export const getGSNProvider = () => {};

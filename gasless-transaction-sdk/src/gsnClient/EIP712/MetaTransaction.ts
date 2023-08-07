import { ethers, Wallet } from 'ethers';
import type {
  PrefixedHexString,
  GsnTransactionDetails,
  Address,
} from '../utils';
import { erc20 } from '../../contracts/erc20';
import type { NetworkConfig } from '../../network_config/network_config';
import { getSenderContractNonce } from '../gsnTxHelpers';

export interface MetaTransaction {
  name?: string;
  version?: string;
  salt?: string;
  verifyingContract?: string;
  nonce: number;
  from: string;
  functionSignature: string;
}

export const getTypedMetatransaction = ({
  name,
  version,
  salt,
  verifyingContract,
  nonce,
  from,
  functionSignature,
}: MetaTransaction) => {
  return {
    types: {
      MetaTransaction: [
        {
          name: 'nonce',
          type: 'uint256',
        },
        {
          name: 'from',
          type: 'address',
        },
        {
          name: 'functionSignature',
          type: 'bytes',
        },
      ],
    },
    domain: {
      name,
      version,
      verifyingContract,
      salt,
    },
    primaryType: 'MetaTransaction',
    message: {
      nonce,
      from,
      functionSignature,
    },
  };
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

export const hasExecuteMetaTransaction = async (
  account: Wallet,
  destinationAddress: Address,
  amount: number,
  config: NetworkConfig,
  contractAddress: Address,
  provider: ethers.providers.JsonRpcProvider
): Promise<boolean> => {
  try {
    const token = erc20(provider, contractAddress);
    const [name, nonce, decimals] = await Promise.all([
      token.name(),
      getSenderContractNonce(token, account.address),
      token.decimals(),
    ]);
    const decimalAmount = ethers.utils.parseUnits(amount.toString(), decimals);
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
    await token.estimateGas.executeMetaTransaction?.(
      account.address,
      data,
      r,
      s,
      v,
      {
        from: account.address,
      }
    );
    return true;
  } catch {
    return false;
  }
};

export const getExecuteMetatransactionTx = async (
  account: Wallet,
  destinationAddress: Address,
  amount: number,
  config: NetworkConfig,
  contractAddress: string,
  provider: ethers.providers.JsonRpcProvider
): Promise<GsnTransactionDetails> => {
  const token = erc20(provider, contractAddress);
  const [name, nonce, decimals] = await Promise.all([
    token.name(),
    getSenderContractNonce(token, account.address),
    token.decimals(),
  ]);
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

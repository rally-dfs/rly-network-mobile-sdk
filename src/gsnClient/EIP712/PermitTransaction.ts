import { ethers, Wallet, BigNumber } from 'ethers';
import type {
  PrefixedHexString,
  GsnTransactionDetails,
  Address,
} from '../utils';
import { erc20 } from '../../contract';
import type { NetworkConfig } from '../../network_config/network_config';

export interface Permit {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
  owner: string;
  spender: string;
  value: number | string;
  nonce: number | string;
  deadline: number | string;
  salt: string;
}

export const getTypedPermitTransaction = ({
  name,
  version,
  chainId,
  verifyingContract,
  owner,
  spender,
  value,
  nonce,
  deadline,
  salt,
}: Permit) => {
  return {
    types: {
      Permit: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
    },
    primaryType: 'Permit',
    domain: {
      name,
      version,
      chainId,
      verifyingContract,
      ...(salt != ethers.constants.HashZero && { salt }),
    },
    message: {
      owner,
      spender,
      value,
      nonce,
      deadline,
    },
  };
};

export const getPermitEIP712Signature = async (
  account: Wallet,
  contractName: string,
  contractAddress: PrefixedHexString,
  config: NetworkConfig,
  nonce: number,
  amount: BigNumber,
  deadline: number,
  salt: string
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
    salt,
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

export const hasPermit = async (
  account: Wallet,
  amount: number,
  config: NetworkConfig,
  contractAddress: Address,
  provider: ethers.providers.JsonRpcProvider
): Promise<boolean> => {
  try {
    const token = erc20(provider, contractAddress);

    const [name, nonce, decimals, deadline, eip712Domain] = await Promise.all([
      token.name(),
      token.nonces(account.address),
      token.decimals(),
      await getPermitDeadline(provider),
      await token.eip712Domain(),
    ]);

    const { salt } = eip712Domain;

    const decimalAmount = ethers.utils.parseUnits(amount.toString(), decimals);

    const { r, s, v } = await getPermitEIP712Signature(
      account,
      name,
      token.address,
      config,
      nonce.toNumber(),
      decimalAmount,
      deadline,
      salt
    );
    await token.estimateGas.permit?.(
      account.address,
      config.gsn.paymasterAddress,
      decimalAmount,
      deadline,
      v,
      r,
      s,
      { from: account.address }
    );

    return true;
  } catch {
    return false;
  }
};

export const getPermitTx = async (
  account: Wallet,
  destinationAddress: Address,
  amount: number,
  config: NetworkConfig,
  contractAddress: PrefixedHexString,
  provider: ethers.providers.JsonRpcProvider
): Promise<GsnTransactionDetails> => {
  const token = erc20(provider, contractAddress);

  const [name, nonce, decimals, deadline, eip712Domain] = await Promise.all([
    token.name(),
    token.nonces(account.address),
    token.decimals(),
    await getPermitDeadline(provider),
    await token.eip712Domain(),
  ]);

  const { salt } = eip712Domain;

  const decimalAmount = ethers.utils.parseUnits(amount.toString(), decimals);

  const { r, s, v } = await getPermitEIP712Signature(
    account,
    name,
    token.address,
    config,
    nonce.toNumber(),
    decimalAmount,
    deadline,
    salt
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

// get timestamp that will always be included in next 3 blocks
export const getPermitDeadline = async (
  provider: ethers.providers.JsonRpcProvider
): Promise<number> => {
  const { timestamp } = await provider.getBlock('latest');
  return timestamp + 45;
};

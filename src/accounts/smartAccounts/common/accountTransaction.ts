import { ethers, BigNumber } from 'ethers';
import type { NetworkConfig } from '../../../network';
import type { PrefixedHexString } from '../../../gsnClient/utils';
import { erc20, tokenFaucet } from '../../../contract';

export const getBalance = async (
  address: PrefixedHexString,
  network: NetworkConfig
) => {
  const provider = new ethers.providers.JsonRpcProvider(network.gsn.rpcUrl);
  return provider.getBalance(address);
};

export const getErc20BalanceDisplay = async (
  address: PrefixedHexString,
  network: NetworkConfig,
  tokenAddress?: PrefixedHexString
) => {
  const provider = new ethers.providers.JsonRpcProvider(network.gsn.rpcUrl);

  tokenAddress = tokenAddress || network.contracts.rlyERC20;

  const token = erc20(provider, tokenAddress);
  const bal = await token.balanceOf(address);
  const decimals = await token.decimals();

  return Number(ethers.utils.formatUnits(bal, decimals));
};

export const getErc20BalanceExact = async (
  address: PrefixedHexString,
  network: NetworkConfig,
  tokenAddress?: PrefixedHexString
): Promise<string> => {
  const provider = new ethers.providers.JsonRpcProvider(network.gsn.rpcUrl);

  tokenAddress = tokenAddress || network.contracts.rlyERC20;

  const token = erc20(provider, tokenAddress);
  const bal = await token.balanceOf(address);

  return bal.toString();
};

export const getTransferTx = async (
  to: PrefixedHexString,
  amount: BigNumber,
  network: NetworkConfig,
  tokenAddress: PrefixedHexString
): Promise<string> => {
  const provider = new ethers.providers.JsonRpcProvider(network.gsn.rpcUrl);

  const token = erc20(provider, tokenAddress);
  return token.interface.encodeFunctionData('transfer', [to, amount]);
};

export const getClaimRlyTx = async (
  network: NetworkConfig
): Promise<string> => {
  const provider = new ethers.providers.JsonRpcProvider(network.gsn.rpcUrl);
  const faucet = tokenFaucet(network, provider);
  return faucet.interface.encodeFunctionData('claim');
};

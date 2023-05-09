import { ethers } from 'ethers';

export type PrefixedHexString = string;
export type Address = string;
export type IntString = string;

export enum rlyEnv {
  local = 'local',
}

export interface AccountKeypair {
  privateKey: PrefixedHexString;
  address: Address;
}

export interface GsnTransactionDetails {
  // users address
  readonly from: Address;
  // tx data
  readonly data: PrefixedHexString;
  //contract address
  readonly to: Address;

  //ether value
  readonly value?: IntString;
  //optional gas
  gas?: PrefixedHexString;

  //should be hex
  maxFeePerGas: PrefixedHexString;
  //should be hex
  maxPriorityFeePerGas: PrefixedHexString;
  //paymaster contract address
  paymasterData?: PrefixedHexString;

  //Value used to identify applications in RelayRequests.
  readonly clientId?: IntString;

  // Optional parameters for RelayProvider only:
  /**
   * Set to 'false' to create a direct transaction
   */
  readonly useGSN?: boolean;
}

export const hasMethod = async (
  contractAddress: string,
  method: string,
  provider: ethers.providers.Provider,
  abi: any[]
): Promise<boolean> => {
  const bytecode = await provider.getCode(contractAddress);
  const methodId = new ethers.utils.Interface(abi).getSighash(method);
  return bytecode.indexOf(methodId.replace('0x', '')) !== -1;
};

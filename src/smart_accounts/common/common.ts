import type { PrefixedHexString } from 'src/gsnClient/utils';

export type UserOperation = {
  sender: PrefixedHexString;
  nonce: bigint;
  initCode: PrefixedHexString;
  callData: PrefixedHexString;
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  paymasterAndData: PrefixedHexString;
  signature: PrefixedHexString;
};

export const sendUserOperation = async (userOp: UserOperation) => {
  // Implementation logic for sendUserOperation
  // ...
  return userOp;
};

export const confirmUserOperation = async () => {
  // Implementation logic for confirmUserOperation
  // ...
  return 'confirmed';
};

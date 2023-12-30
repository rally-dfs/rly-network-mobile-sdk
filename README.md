The Rally Mobile SDK is a key component of the Rally Protocol that allows developers to retake control of the user experience by eliminating the reliance for end-users to complete complex blockchain operations through third party apps. By utilizing the SDK, developers gain access to the necessary tools that enable them to create familiar and native mobile UX while leveraging the benefits of blockchain technology.

# Documentation

For comprehensive documentation, see [docs.rallyprotocol.com](https://docs.rallyprotocol.com)

# Supported Blockchains

The Rally Mobile SDK currently supports Polygon. More blockchains coming soon.

# Quick Start

To see what it takes to get up and running, see our [Installation & Quick Start](https://app.gitbook.com/o/7BnqekYHGdQSsb1piJPa/s/tujiqdIcx5QimcR0MY1P/rally-mobile-sdk/installation-and-quick-start)

# Contributing

The best way to submit feedback and report bugs is to open a [GitHub issue](https://github.com/rally-dfs/rly-network-mobile-sdk/issues/new).

If you want to learn how you can contribute, reach out to us on [Discord](https://discord.gg/rlynetwork) or at [Partnerships@rallyprotocol.com](mailto:partnerships@rallyprotocol.com).

# Smart Account Wallets

The Rally Mobile SDK allows you to use 3 different types of smart account wallets (Kernel by Zero Dev, Light Account by Alchemy and a Gnosis Safe). Below is an example of calling `claim` on the faucet contract using a Light Account

```

import {
  EoaAccount,
  LightAccount,
  Mumbai
} from 'rly-mobile-sdk';

  const eoa = await EoaAccount.getWallet();

  if (!eoa) {
    throw new Error('account is undefined');
  }

  const faucet = new Contract(
    '0x78a0794Bb3BB06238ed5f8D926419bD8fc9546d8',
    TokenFaucet.abi,
    provider
  );

  //will check if account for user exists, if not create it
  //call claim on faucet contract

  const lightAccount = new LightAccount(account, Mumbai);

  const hash = await lightAccount.createAndSendUserOperation(
    faucet.address,
    '0',
    faucet.interface.encodeFunctionData('claim', []) as PrefixedHexString
  );

  await lightAccount.confirmUserOperation(hash, network);

```

## Smart Account Interface

Each smart account is a class that implements the below interface

```
interface ISmartAccount {
  getAccountAddress(): Promise<PrefixedHexString>;
  getAccount(): Promise<Contract>;
  createUserOperation(
    to: PrefixedHexString,
    value: string,
    callData: PrefixedHexString
  ): Promise<UserOperation>;
  createUserOperationBatch(
    to: PrefixedHexString[],
    value: string[],
    callData: PrefixedHexString[]
  ): Promise<UserOperation>;
  signUserOperation(userOp: UserOperation): Promise<UserOperation>;
  sendUserOperation(userOp: UserOperation): Promise<PrefixedHexString>;
  confirmUserOperation(
    userOpHash: PrefixedHexString
  ): Promise<Event | null | undefined>;
  getUserOperationReceipt(userOpHash: PrefixedHexString): Promise<any>;
  createAndSendUserOperation(
    to: PrefixedHexString,
    value: string,
    callData: PrefixedHexString
  ): Promise<PrefixedHexString>;
  createAndSendUserOperationBatch(
    to: PrefixedHexString[],
    value: string[],
    callData: PrefixedHexString[]
  ): Promise<PrefixedHexString>;
  getBalance(): Promise<any>;
  getErc20BalanceDisplay(tokenAddress?: PrefixedHexString): Promise<any>;
  getErc20BalanceExact(tokenAddress?: PrefixedHexString): Promise<any>;
  transferErc20(
    to: string,
    amount: number,
    tokenAddress?: PrefixedHexString
  ): Promise<PrefixedHexString>;
  claimRly(): Promise<PrefixedHexString>;
}
```

The Rally Mobile SDK exports 3 types of smart account wallets: `LightAccount`, `KernelAccount`, `SafeAccount`

## Usage

```
import {LightAccount, KernelAccount, SafeAccount} from `rly-mobile-sdk`;
```

### Accounts

#### getAccountAddress

This method returns the smart account address for the specified EOA account owner address on the specified network. In the example below the LightAccountManager returns the light account address for the specified EOA on the mumbai network.

```
import {
  EoaAccount,
  LightAccount,
  Mumbai
  } from `rly-mobile-sdk`;

const eoaAccount = EoaAccount.getWallet();
const lightAcount = new LightAccount(eoaAccount, Mumbai);
const accountAddress = lightAccount.getAccountAddress();

```

#### getAccount

This method returns smart account contract instance for the specified EOA account owner address on the specified network

```
import {
  LightAccount,
  EoaAccountManager,
  RlyMumbaiNetwork
  } from `rly-mobile-sdk`;

const eoaAccount = EoaAccount.getWallet();
const lightAcount = new LightAccount(eoaAccount, Mumbai);
const accountAddress = lightAccount.getAccount();
```

### User Operations

#### createAndSendUserOperation

This method will create, sign and send a single user operation. a to address, value and call data are required parameters.

```

import {
  LightAccount,
  EoaAccountManager,
  RlyMumbaiNetwork
  } from `rly-mobile-sdk`;

const eoaAccount = EoaAccount.getWallet();
const lightAcount = new LightAccount(eoaAccount, Mumbai);

 const faucet = new Contract(
    '0x78a0794Bb3BB06238ed5f8D926419bD8fc9546d8',
    TokenFaucet.abi,
    provider
  );

const userOp = lightAccount.createAndSendUserOperation(
    faucet.address,
    '0',
    faucet.interface.encodeFunctionData('claim', []) as PrefixedHexString
)
```

#### createAndSendUserOperationBatch

This method will create, sign and send a batch of user operations. an aarray of to addresses, an array of values and an array of call data are required parameters.

```

import {
LightAccount,
EoaAccountManager,
RlyMumbaiNetwork
} from `rly-mobile-sdk`;

const eoaAccount = EoaAccount.getWallet();
const lightAcount = new LightAccount(eoaAccount, Mumbai);

const randomAddress = '0x3433c5aDDAD6e5eb2897318CcFB4854f7820A232'

const faucet = new Contract(
'0x78a0794Bb3BB06238ed5f8D926419bD8fc9546d8',
TokenFaucet.abi,
provider
);

// create a batch user operation calling a smart contract and sending matic
const userOpBatch = lightAccount.createAndSendUserOperationBatch(
  [faucet.address, randomAddress],
  ['0', 1],
  [faucet.interface.encodeFunctionData('claim', []) as PrefixedHexString, '0x']
)

```

#### createUserOperation

This method will create and return a single user operation. a to address, value and call data are required parameters.

```

import {
LightAccount,
EoaAccountManager,
RlyMumbaiNetwork
} from `rly-mobile-sdk`;

const eoaAccount = EoaAccount.getWallet();
const lightAcount = new LightAccount(eoaAccount, Mumbai);

const faucet = new Contract(
  '0x78a0794Bb3BB06238ed5f8D926419bD8fc9546d8',
  TokenFaucet.abi,
  provider
);

const userOp = lightAccount.createUserOperation(
  faucet.address,
  '0',
  faucet.interface.encodeFunctionData('claim', []) as PrefixedHexString
)

```

#### createUserOperationBatch

This method will create and return a batch of user operations. an aarray of to addresses, an array of values and an array of call data are required parameters.

```

import {
LightAccount,
EoaAccountManager,
RlyMumbaiNetwork
} from `rly-mobile-sdk`;

const eoaAccount = EoaAccount.getWallet();
const lightAcount = new LightAccount(eoaAccount, Mumbai);

const randomAddress = '0x3433c5aDDAD6e5eb2897318CcFB4854f7820A232'

const faucet = new Contract(
  '0x78a0794Bb3BB06238ed5f8D926419bD8fc9546d8',
  TokenFaucet.abi,
  provider
);

// create a batch user operation calling a smart contract and sending matic
const userOpBatch = lightAccount.createUserOperationBatch(
  [faucet.address, randomAddress],
  ['0', 1],
  [faucet.interface.encodeFunctionData('claim', []) as PrefixedHexString, '0x']
)

```

#### signUserOperation

this method signs and returns a user operation

```

import {
LightAccount,
EoaAccountManager,
RlyMumbaiNetwork
} from `rly-mobile-sdk`;

const eoaAccount = EoaAccount.getWallet();
const lightAcount = new LightAccount(eoaAccount, Mumbai);

const faucet = new Contract(
  '0x78a0794Bb3BB06238ed5f8D926419bD8fc9546d8',
  TokenFaucet.abi,
  provider
);

const userOp = lightAccount.createUserOperation(
  faucet.address,
  '0',
  faucet.interface.encodeFunctionData('claim', []) as PrefixedHexString
  const signedUserOp = lightAccount.signUserOperation(userOp);
)

```

#### sendUserOperation

the method broadcasts a user operation

```

import {
LightAccount,
EoaAccountManager,
RlyMumbaiNetwork
} from `rly-mobile-sdk`;

const eoaAccount = EoaAccount.getWallet();
const lightAcount = new LightAccount(eoaAccount, Mumbai);

const faucet = new Contract(
  '0x78a0794Bb3BB06238ed5f8D926419bD8fc9546d8',
  TokenFaucet.abi,
  provider
);

const userOp = lightAccount.createUserOperation(
  faucet.address,
  '0',
  faucet.interface.encodeFunctionData('claim', []) as PrefixedHexString
)

const signedUserOp = lightAccount.signUserOperation(userOp);
const hash = lightAccount.sendUserOperation(signedUserOp);

```

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
  EoaAccountManager,
  LightAccountManager,
  RlyMumbaiNetwork
} from 'rly-mobile-sdk';

  const network = RlyMumbaiNetwork;
  const eoa = await EoaAccountManager.getAccount();

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

  const hash = await LightAccountManager.createAndSendUserOperation(
    eoa,
    faucet.address,
    '0',
    faucet.interface.encodeFunctionData('claim', []) as PrefixedHexString
    network
  );

  await confirmUserOperation(hash, network);

```

## Smart Account Manager Interface

```
export interface SmartAccountManager {
  getAccountAddress: (
    owner: PrefixedHexString,
    network: Network
  ) => Promise<PrefixedHexString>;
  getAccount(account: PrefixedHexString, network: Network): Promise<Contract>;
  createUserOperation: (
    owner: Wallet,
    to: PrefixedHexString,
    value: string,
    callData: PrefixedHexString,
    network: Network
  ) => Promise<UserOperation>;
  createUserOperationBatch: (
    owner: Wallet,
    to: PrefixedHexString[],
    value: string[],
    callData: PrefixedHexString[],
    network: Network
  ) => Promise<UserOperation>;
  signUserOperation: (
    owner: Wallet,
    op: UserOperation,
    network: Network
  ) => Promise<UserOperation>;
  sendUserOperation: (
    userOp: UserOperation,
    network: Network
  ) => Promise<PrefixedHexString>;
  createAndSendUserOperation: (
    owner: Wallet,
    to: PrefixedHexString,
    value: string,
    callData: PrefixedHexString,
    network: Network
  ) => Promise<PrefixedHexString>;
  createAndSendUserOperationBatch: (
    owner: Wallet,
    to: PrefixedHexString[],
    value: string[],
    callData: PrefixedHexString[],
    network: Network
  ) => Promise<PrefixedHexString>;
  confirmUserOperation: (
    userOpHash: PrefixedHexString,
    network: Network
  ) => Promise<Event | null | undefined>;
}
```

The Rally Mobile SDK exports 3 types of smart account wallets: `LightAccountManager`, `KernelAccountManager`, `SafeAccountManager`

## Usage

```
import {LightAccountManager} from `rly-mobile-sdk`;
```

### Accounts

#### getAccountAddress

This method returns the smart account address for the specified EOA account owner address on the specified network. In the example below the LightAccountManager returns the light account address for the specified EOA on the mumbai network.

```
import {
  LightAccountManager,
  EoaAccountManager,
  RlyMumbaiNetwork
  } from `rly-mobile-sdk`;

const eoaAccount = EoaAccountManager.getAccount();

const accountAddress = LightAccountManager.getAccountAddress(eoaAccount, RlyMumbaiNetwork);

```

#### getAccount

This method returns smart account contract instance for the specified EOA account owner address on the specified network

```
import {
  LightAccountManager,
  EoaAccountManager,
  RlyMumbaiNetwork
  } from `rly-mobile-sdk`;

const eoaAccount = EoaAccountManager.getAccount();

const accountAddress = LightAccountManager.getAccount(eoaAccount, RlyMumbaiNetwork);
```

### User Operations

#### createUserOperation

#### createUserOperationBatch

#### signUserOperation

#### sendUserOperation

#### createAndSendUserOperation

#### createAndSendUserOperationBatch

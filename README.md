# rly-network-mobile-sdk

An SDK to make working with token economies as easy as credit cards

## Installation

```sh
npm install rly-network-mobile-sdk
```

## Basic Usage

### Account

```js
import {
  createAccount,
  getAccount,
  getAccountPhrase,
} from 'rly-network-mobile-sdk';

// creates a new account for the user and returns public address
// accepts an override boolean that allows you to create new addres for user

const newAccount = await createAccount();

//return public address for user's account
const account = await getAccount();

//return mnemonic phrase used to generate user's account
//WARNING use with caution, the mnemonic phrase gives access to the user's account

const mnemonic = await getAccountPhrase();
```

### Network

```js
import { RlyMumbaiNetwork } from 'rly-network-mobile-sdk';

// sends 10 RLY to user's account, at which point they can transact
await RlyMumbaiNetwork.registerAccount();

// transfers 2 RLY from user's account to account = 0x
await RlyMumbaiNetwork.transfer('0x', 2);

// returns the user's current RLY balance
await RlyMumbaiNetwork.getBalance();
```

## Example

An example wallet application can be found in `/example`. This app allows a user to create a new account, register their account and transfer RLY to a specific address.

To run the example do the following from the top level of this repo.

**Make Sure you have all required React Native deps installed**

[react native start guide](https://reactnative.dev/docs/environment-setup)

**Install dependencies**

`yarn install`

`yarn bootstrap`

**Start Metro**

In one terminal start Metro, the react native JS bundler

`yarn example start`

**Run App**

In another terminal run build and run the ios app, this should open the app in the ios emulator

`yarn example ios`

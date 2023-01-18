# rly-network-mobile-sdk

## What is rly-network-mobile-sdk?
Rly-network-mobile-sdk is a set of libraries, tools, and smart contracts that streamlines blockchain integration for developers to enable frictionless user onboarding and simplify on-chain transactions. 

Rly-network-mobile-sdk currently offers the following services:  
* Self custodied accounts: Create on-chain user custodied accounts (wallets) on their mobile device 
* Dust wallets: Programmatically push RLY tokens directly to end user accounts   
* Gasless transactions: Enable gasless transactions so that your users do not have to pay for gas 


## Benefits of using the rly-network-mobile-sdk

#### Developer Benefits
* Streamlined blockchain integration; create user custodied accounts and fund them with RLY tokens in two lines of code
* Relayer, smart contracts, and web3 technology maintained by RLY Network so you can focus on your application
* Extensive knowledge of blockchain is not required to integrate 

#### User Benefits
* Engage with applications without going through the complex process of securing an on-chain account, sourcing funds, maintaining balances, signing transactions, and paying for gas fees
* Instantly initiate on-chain transactions with dusted tokens and gasless transactions
* Engage with applications without having to go through the step of creating an account 
* Engage with applications without having to provide personal identifiable information
* Agency over their self custodied wallet; export or move funds to another account 
* Engage with applications without being having to be blockchain literate

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

# NOTE: This repo is currently a work in progress, things may fail or work unexpectedly while testing

# rly-network-mobile-sdk
The mobile web3 SDK is a set of libraries, tools, and open source smart contracts that helps developers integrate their mobile applications with blockchain. The goal of the SDK is to provide  features and services that abstracts the requirement of blockchain experience and literacy away from end users so they can engage with applications uninterrupted. 
The SDK enables developers to provide users a familiar native mobile experience within their blockchain application.


[View our developer docs](https://app.gitbook.com/invite/7BnqekYHGdQSsb1piJPa/QcO9XxpAg6b9eBpJ8ZWA).

## Installation

```sh
npm install rly-network-mobile-sdk
```

This app makes use of 3rd party react native libraries that contain native code. In order to avoid conflicts if your app already uses these same libraries they are declared as peer dependencies. This means you'll need to add them as dependencies to your own project:

```sh
npm install --save react-native-get-random-values
npm install --save react-native-keychain
```


## Basic Usage

### Account

Account is the abstraction that manages creation and storage of blockchain keys on device. On it's own this does not require any connection to the outside world and is agnostic to the network you are testing against. Using this account to interact with blockchain or web services can be done using our `Network` abstraction described below.

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

Looking to develop UI or app specific features without needing end to end testing? We 2 other network implementations ideal for development provide a fake network that does not make any external network requests.

```js
// This network is entirely in memory, basically a mock. Makes no external requests and is ideal for quick UI iteration.
import { DummyNetwork as Network } from 'rly-network-mobile-sdk';

// This network makes requests to a locally running blockchain and gas station network.
// This is a great choice if you are confident running you own end to end local environment, or want to test with your own custom contracts.
import { LocalNetwork as Network } from 'rly-network-mobile-sdk';

```

## Full Example App

Want to see a working example of an app using the SDK? We provide a basic mobile app that can be found in `/example`. This app shows how to create & store a rly account, register the new account, and transfer RLY to a new address.

**Make Sure you have all required React Native deps installed**

[react native start guide](https://reactnative.dev/docs/environment-setup)

**Install dependencies**

To run the example do the following *from the top level of this repo*.

`yarn install`

`yarn bootstrap`

**Start Metro**

In one terminal start Metro, the react native JS bundler

`yarn example start`

**Run App**

In another terminal run build and run the ios app, this should open the app in the ios emulator

`yarn example ios`

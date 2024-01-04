import { utils, Wallet, Contract, ethers } from 'ethers';
import {
  LightAccount,
  KernalAccount,
  SafeAccount,
  EoaAccount,
  Mumbai,
} from '../index';
import type { KeyStorageConfig } from 'src/keyManager.types';
import type { PrefixedHexString } from 'src/gsnClient/utils';

import TokenFaucet from '../contracts/tokenFaucetData.json';
import { erc20 } from '../contracts/erc20';

const network = Mumbai;

// mock native code, just testing signing function
// address is 0x83DFd7530669780051BC6f3d50b4D10F7b199b95, pk is 0x8fb51942453d0a9f4e621aef252af00b5ab160b6efbfcbbc681fb82609d1da86)
const mockDefaultMnemonic =
  'slab exist there need shy fire lazy guard alcohol begin sketch rural';

let mockMnemonic: string | null = mockDefaultMnemonic;
let mockGetPrivateKeyFromMnemonic = (mnemonic: string) =>
  Promise.resolve(utils.arrayify(Wallet.fromMnemonic(mnemonic).privateKey));

jest.mock('react-native', () => {
  return {
    NativeModules: {
      RlyNetworkMobileSdk: {
        getMnemonic: () => Promise.resolve(mockMnemonic),
        generateMnemonic: () => Promise.resolve(mockDefaultMnemonic),
        saveMnemonic: (mnemonic: string, _options?: KeyStorageConfig) => {
          mockMnemonic = mnemonic;
          return Promise.resolve();
        },
        deleteMnemonic: () => {
          mockMnemonic = null;
          return Promise.resolve();
        },
        // make sure to not invoke mockGetPrivateKeyFromMnemonic directly here or jest complains about import errors
        getPrivateKeyFromMnemonic: (mnemonic: string) =>
          mockGetPrivateKeyFromMnemonic(mnemonic),
      },
    },
    Platform: {
      select: jest.fn(),
    },
  };
});

test('get light account address', async () => {
  const account = await EoaAccount.getWallet();

  if (!account) {
    throw new Error('wallet is undefined');
  }

  const lightAccount = new LightAccount(account, network);
  const scwAddress = await lightAccount.getAccountAddress();

  expect(scwAddress).toEqual('0x370C1B9eBdc6c5045073c505bE38F396E736989a');
});

test('get kernal account address', async () => {
  const account = await EoaAccount.getWallet();
  if (!account) {
    throw new Error('account is undefined');
  }
  const kernalAccount = new KernalAccount(account, network);
  const scwAddress = await kernalAccount.getAccountAddress();

  expect(scwAddress).toEqual('0xa67e71BA16dEF24C2B36841D9f2a1040a0aDdd30');
});

test('get safe account address', async () => {
  const account = await EoaAccount.getWallet();

  if (!account) {
    throw new Error('account is undefined');
  }

  const safeAccount = new SafeAccount(account, network);
  const scwAddress = await safeAccount.getAccountAddress();

  expect(scwAddress).toEqual('0x8668919571Df18B2105Ce48305372027c6762FFD');
});
test('create and send user op kernel account use paymaster', async () => {
  const account = await EoaAccount.getWallet();

  if (!account) {
    throw new Error('account is undefined');
  }
  const provider = new ethers.providers.JsonRpcProvider(
    network.config.gsn.rpcUrl
  );

  const newAccount = ethers.Wallet.createRandom();
  const kernelAccount = new KernalAccount(account, network);
  const kernelAccountAddress = await kernelAccount.getAccountAddress();

  console.log('kernal account address', kernelAccountAddress);

  const hash = await kernelAccount.createAndSendUserOperation(
    newAccount.address as PrefixedHexString,
    '0',
    '0x'
  );

  await kernelAccount.confirmUserOperation(hash);

  const receipt = await kernelAccount.getUserOperationReceipt(hash);
  const newAccountBalance = await provider.getBalance(newAccount.address);

  expect(receipt.status).toEqual('0x1');
  expect(newAccountBalance).toEqual(ethers.utils.parseEther('0'));
}, 80000);

/*test('create and send user op light account', async () => {
  const account = await EoaAccountManager.getWallet();
  const network = RlyMumbaiNetwork;
  const provider = new ethers.providers.JsonRpcProvider(
    network.config.gsn.rpcUrl
  );
  const funder = new ethers.Wallet(
    '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
    provider
  );

  if (!account) {
    throw new Error('account is undefined');
  }

  const scwAddress = await LightAccountManager.getAccountAddress(
    account.address as PrefixedHexString,
    network
  );

  await funder.sendTransaction({
    to: scwAddress,
    value: ethers.utils.parseEther('1.0'),
  });

  const newAccount = ethers.Wallet.createRandom();

  const hash = await LightAccountManager.createAndSendUserOperation(
    account,
    newAccount.address as PrefixedHexString,
    '1.0',
    '0x',
    network
  );

  await confirmUserOperation(hash, network);

  const { receipt } = await getUserOperationReceipt(hash, network);

  const newAccountBalance = await provider.getBalance(newAccount.address);

  expect(receipt.confirmations).toEqual('0x1');
  expect(newAccountBalance).toEqual(ethers.utils.parseEther('1.0'));
}, 10000);

test('create and send user op safe account', async () => {
  const account = await EoaAccountManager.getWallet();
  const network = RlyMumbaiNetwork;
  const provider = new ethers.providers.JsonRpcProvider(
    network.config.gsn.rpcUrl
  );
  const funder = new ethers.Wallet(
    '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
    provider
  );

  if (!account) {
    throw new Error('account is undefined');
  }

  const scwAddress = await SafeAccountManager.getAccountAddress(
    account.address as PrefixedHexString,
    network
  );

  await funder.sendTransaction({
    to: scwAddress,
    value: ethers.utils.parseEther('1.0'),
  });

  const newAccount = ethers.Wallet.createRandom();

  const hash = await SafeAccountManager.createAndSendUserOperation(
    account,
    newAccount.address as PrefixedHexString,
    '1',
    '0x',
    network
  );

  await confirmUserOperation(hash, network);

  const { receipt } = await getUserOperationReceipt(hash, network);
  const newAccountBalance = await provider.getBalance(newAccount.address);

  expect(receipt.confirmations).toEqual('0x1');
  expect(newAccountBalance).toEqual(ethers.utils.parseEther('1.0'));
}, 10000);*/

test('batch claim rly with light account', async () => {
  const account = await EoaAccount.getWallet();

  if (!account) {
    throw new Error('account is undefined');
  }
  const provider = new ethers.providers.JsonRpcProvider(
    network.config.gsn.rpcUrl
  );
  const faucet = new Contract(
    network.config.contracts.tokenFaucet,
    TokenFaucet.abi,
    provider
  );

  const rlyToken = erc20(provider, network.config.contracts.rlyERC20);

  if (!account) {
    throw new Error('account is undefined');
  }

  const lightAccount = new LightAccount(account, network);
  const scwAddress = await lightAccount.getAccountAddress();

  console.log('light account address', scwAddress);

  const preBalance = await rlyToken.balanceOf(scwAddress);
  const newAccount = ethers.Wallet.createRandom();

  const hash = await lightAccount.createAndSendUserOperationBatch(
    [
      faucet.address as PrefixedHexString,
      newAccount.address as PrefixedHexString,
    ],
    ['0', '0'],
    [
      faucet.interface.encodeFunctionData('claim', []) as PrefixedHexString,
      '0x',
    ]
  );

  await lightAccount.confirmUserOperation(hash);
  const receipt = await lightAccount.getUserOperationReceipt(hash);

  const postBalance = await rlyToken.balanceOf(scwAddress);
  const newAccountBalance = await provider.getBalance(newAccount.address);
  expect(receipt.status).toEqual('0x1');
  expect(postBalance.sub(preBalance)).toEqual(ethers.utils.parseEther('10'));
  expect(newAccountBalance).toEqual(ethers.utils.parseEther('0'));
}, 50000);

test('send  rly with light account', async () => {
  const account = await EoaAccount.getWallet();

  if (!account) {
    throw new Error('account is undefined');
  }

  if (!account) {
    throw new Error('account is undefined');
  }

  const lightAccount = new LightAccount(account, network);

  const newAccount = ethers.Wallet.createRandom();

  const hash = await lightAccount.transferErc20(
    newAccount.address as PrefixedHexString,
    1
  );

  await lightAccount.confirmUserOperation(hash);
  const receipt = await lightAccount.getUserOperationReceipt(hash);

  const postBalance = await lightAccount.getErc20BalanceDisplay();
  expect(receipt.status).toEqual('0x1');
  expect(postBalance).toEqual(9);
}, 50000);

import { utils, Wallet, Contract, ethers } from 'ethers';
import {
  LightAccount,
  KernalAccount,
  SafeAccount,
  EoaAccount,
  MumbaiNetworkConfig,
  Mumbai,
  RlyMumbaiNetwork,
} from '../index';
import {
  confirmUserOperation,
  getUserOperationReceipt,
} from '../accounts/smartAccounts/common/common';
import type { KeyStorageConfig } from 'src/keyManager.types';
import type { PrefixedHexString } from 'src/gsnClient/utils';

import TokenFaucet from '../contracts/tokenFaucetData.json';
import { erc20 } from '../contracts/erc20';

// mock native code, just testing signing function
// address is 0x88046468228953d17c7DAaE39cfEF9B4b082164D, pk is 0x8666ebf0f4d397955c55932642fb9dd97fb60a2df121a9d2a39f7f1930958ca3)
const mockDefaultMnemonic =
  'solar robot chat embrace trap hole wild february retreat fruit hollow one';

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
  const account = await EoaAccount.getExistingOrCreate();

  //const account = (await EoaAccountManager.getAccount()) as PrefixedHexString;

  if (!account.wallet) {
    throw new Error('wallet is undefined');
  }

  const lightAccount = new LightAccount(account.wallet, MumbaiNetworkConfig);

  const scwAddress = lightAccount.getAccountAddress();

  expect(scwAddress).toEqual('0xE16AD80b9Ed338cB40763fFe6399fb3fDE6f3743');
});

test('get kernal account address', async () => {
  const account = await EoaAccount.getExistingOrCreate();
  if (!account.wallet) {
    throw new Error('account is undefined');
  }
  const kernalAccount = new KernalAccount(account.wallet, MumbaiNetworkConfig);

  const scwAddress = await kernalAccount.getAccountAddress();
  expect(scwAddress).toEqual('0x94B8194107eF3441d8e7798A2fE426c0F4B8F94f');
});

test('get safe account address', async () => {
  const account = await EoaAccount.getExistingOrCreate();
  if (!account.wallet) {
    throw new Error('account is undefined');
  }

  const safeAccount = new SafeAccount(account.wallet, MumbaiNetworkConfig);
  const scwAddress = await safeAccount.getAccountAddress();
  expect(scwAddress).toEqual('0x7E9492f7a3035A77c3b1c92A71Ab167293268910');
});
test('create and send user op kernel account use paymaster', async () => {
  const account = await EoaAccount.getExistingOrCreate();
  if (!account.wallet) {
    throw new Error('account is undefined');
  }
  const provider = new ethers.providers.JsonRpcProvider(
    MumbaiNetworkConfig.gsn.rpcUrl
  );

  const newAccount = ethers.Wallet.createRandom();

  const kernelAccount = new KernalAccount(account.wallet, Mumbai);

  const hash = await kernelAccount.createAndSendUserOperation(
    newAccount.address as PrefixedHexString,
    '0',
    '0x'
  );

  await kernelAccount.confirmUserOperation(hash);

  const { receipt } = await getUserOperationReceipt(hash, MumbaiNetworkConfig);
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
  const account = await EoaAccountManager.getWallet();
  const network = RlyMumbaiNetwork;
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

  const scwAddress = await LightAccountManager.getAccountAddress(
    account.address as PrefixedHexString,
    network
  );

  const preBalance = await rlyToken.balanceOf(scwAddress);

  const newAccount = ethers.Wallet.createRandom();

  const hash = await LightAccountManager.createAndSendUserOperationBatch(
    account,
    [
      faucet.address as PrefixedHexString,
      newAccount.address as PrefixedHexString,
    ],
    ['0', '0'],
    [
      faucet.interface.encodeFunctionData('claim', []) as PrefixedHexString,
      '0x',
    ],
    network
  );

  await confirmUserOperation(hash, network);

  const { receipt } = await getUserOperationReceipt(hash, network);

  const postBalance = await rlyToken.balanceOf(scwAddress);
  const newAccountBalance = await provider.getBalance(newAccount.address);
  expect(receipt.status).toEqual('0x1');
  expect(postBalance.sub(preBalance)).toEqual(ethers.utils.parseEther('10'));
  expect(newAccountBalance).toEqual(ethers.utils.parseEther('1.0'));
}, 10000);

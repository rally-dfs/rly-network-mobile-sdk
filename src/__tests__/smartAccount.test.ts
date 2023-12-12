import { utils, Wallet, Contract, ethers } from 'ethers';
import {
  LightAccountManager,
  KernelAccountManager,
  SafeAccountManager,
  getAccount,
  getWallet,
} from '../index';
import {
  createUserOperation,
  sendUserOperation,
  confirmUserOperation,
  getUserOperationReceipt,
} from '../smart_accounts/common/common';
import { LocalNetworkConfig } from '../network_config/network_config_local';
import type { KeyStorageConfig } from 'src/keyManagerTypes';
import type { PrefixedHexString } from 'src/gsnClient/utils';
import LightAccount from '../contracts/smartAccounts/lightAccountData.json';

// mock native code, just testing signing function
// address is 0x88046468228953d17c7DAaE39cfEF9B4b082164D, pk is 0x8666ebf0f4d397955c55932642fb9dd97fb60a2df121a9d2a39f7f1930958ca3)
const mockDefaultMnemonic =
  'bronze adjust crane guard crater merry village wealth smoke exit woman cabbage';

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
  const account = (await getAccount()) as PrefixedHexString;

  if (!account) {
    throw new Error('account is undefined');
  }

  const scwAddress = await LightAccountManager.getAddress(
    account,
    LocalNetworkConfig
  );
  expect(scwAddress).toEqual('0x9e35D495035bDd07De85967f2B6743Cdb956883b');
});

test('get kernal account address', async () => {
  const account = (await getAccount()) as PrefixedHexString;

  if (!account) {
    throw new Error('account is undefined');
  }

  const scwAddress = await KernelAccountManager.getAddress(
    account,
    LocalNetworkConfig
  );
  expect(scwAddress).toEqual('0xC0E29868b5c42Fa78Bc2CB56583DCf405D830d09');
});

test('get safe account address', async () => {
  const account = (await getAccount()) as PrefixedHexString;

  if (!account) {
    throw new Error('account is undefined');
  }

  const scwAddress = await SafeAccountManager.getAddress(
    account,
    LocalNetworkConfig
  );
  expect(scwAddress).toEqual('0xD3f465da8672edF8F78BF23c86ef3fB89474576a');
});

test('create and send user op', async () => {
  const account = await getWallet();
  const network = LocalNetworkConfig;
  const provider = new ethers.providers.JsonRpcProvider(network.gsn.rpcUrl);
  const funder = new ethers.Wallet(
    '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
    provider
  );

  if (!account) {
    throw new Error('account is undefined');
  }

  const scwAddress = await LightAccountManager.getAddress(
    account.address as PrefixedHexString,
    LocalNetworkConfig
  );

  funder.sendTransaction({
    to: scwAddress,
    value: ethers.utils.parseEther('1'),
  });

  const newAccount = ethers.Wallet.createRandom();

  const scwImpl = new Contract(
    network.aa.lightAccountImplAddress,
    LightAccount.abi,
    provider
  );
  const data = (await scwImpl.interface.encodeFunctionData('execute', [
    newAccount.address,
    ethers.utils.parseEther('1.0'),
    '0x',
  ])) as PrefixedHexString;

  const op = await createUserOperation(
    LightAccountManager,
    account,
    network,
    data
  );

  const hash = await sendUserOperation(op, network);
  await confirmUserOperation(hash, network);

  const { receipt } = await getUserOperationReceipt(hash, network);
  expect(receipt.confirmations).toEqual('0x1');
}, 10000);
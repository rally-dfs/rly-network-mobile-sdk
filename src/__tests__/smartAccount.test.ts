import { utils, Wallet } from 'ethers';
import {
  LightAccountManager,
  KernelAccountManager,
  SafeAccountManager,
  getAccount,
} from '../index';
import { LocalNetworkConfig } from '../network_config/network_config_local';
import type { KeyStorageConfig } from 'src/keyManagerTypes';
import type { PrefixedHexString } from 'src/gsnClient/utils';

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

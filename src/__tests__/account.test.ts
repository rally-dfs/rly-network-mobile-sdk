import { utils, Wallet } from 'ethers';
import {
  createAccount,
  importExistingAccount,
  signMessage,
  getWallet,
  signTransaction,
  signHash,
} from '../accounts/eoaAccounts/account';
import type { KeyStorageConfig } from 'src/keyManager.types';

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

test('create account', async () => {
  await expect(createAccount({ overwrite: false })).rejects.toThrow(
    'Account already exists'
  );

  const address = await createAccount({ overwrite: true });
  expect(address).toEqual('0x88046468228953d17c7DAaE39cfEF9B4b082164D');
});

test('import existing account', async () => {
  const existingMnemonic =
    'huge remain palm vanish spike exotic amount scheme window crowd shift spoil';
  await expect(
    importExistingAccount(existingMnemonic, { overwrite: false })
  ).rejects.toThrow('Account already exists');

  const address = await importExistingAccount(existingMnemonic, {
    overwrite: true,
  });
  expect(address).toEqual('0x242F7fDaF2eF119CfdB7F9D0aa7BE1D1C7dA4587');

  // re-creating account should regenerate back to the default
  const recreatedAddress = await createAccount({ overwrite: true });
  expect(recreatedAddress).toEqual(
    '0x88046468228953d17c7DAaE39cfEF9B4b082164D'
  );
});

test('sign message', async () => {
  const message = 'test message';
  const wallet = await getWallet();
  const signature = await signMessage(message);
  const sender = utils.verifyMessage(message, signature);
  expect(wallet?.address).toEqual(sender);
});

test('sign transaction', async () => {
  const wallet = await getWallet();

  const testTx = {
    data: '0xa9059cbb00000000000000000000000079b0ac67501aa89328f1154c749dfdb014232b05000000000000000000000000000000000000000000000000000000000000000a',
    to: '0x946B1A4eA6457b285254Facb54B896Ab0fAE3a7C',
  };

  const signedTx = await signTransaction(testTx);
  const rawTx = utils.parseTransaction(signedTx);
  const { r, s, v } = rawTx;

  if (!r || !s || !v) throw new Error('r, s, or v is null');

  const signature = utils.joinSignature({ r, s, v });
  expect(signature).toBeTruthy();

  const raw = utils.serializeTransaction(testTx);
  const msgHash = utils.keccak256(raw);
  const msgBytes = utils.arrayify(msgHash);
  const sender = utils.recoverAddress(msgBytes, signature);
  expect(wallet?.address).toEqual(sender);
});

test('sign hash', async () => {
  const message = 'test message';
  const messsageBytes = utils.toUtf8Bytes(message);
  const hash = utils.keccak256(messsageBytes);
  const signature = await signHash(hash);
  const sender = utils.recoverAddress(hash, signature);
  const wallet = await getWallet();
  expect(wallet?.address).toEqual(sender);
});

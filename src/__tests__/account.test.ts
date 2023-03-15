import { utils, providers, Wallet } from 'ethers';
import { signMessage, getWallet, signTransaction, signHash } from '../account';
import { tokenFaucet } from '../contract';
import { MumbaiNetworkConfig } from '../network_config/network_config';

// mock native code, just testing signing function

jest.mock('react-native', () => {
  const mnemonic =
    'bronze adjust crane guard crater merry village wealth smoke exit woman cabbage';
  const pk =
    '0x8666ebf0f4d397955c55932642fb9dd97fb60a2df121a9d2a39f7f1930958ca3';

  return {
    NativeModules: {
      RlyNetworkMobileSdk: {
        getMnemonic: () => Promise.resolve(mnemonic),
        generateMnemonic: () => Promise.resolve(mnemonic),
        saveMnemonic: () => Promise.resolve(),
        deleteMnemonic: () => Promise.resolve(),
        getPrivateKeyFromMnemonic: () => Promise.resolve(pk),
      },
    },
    Platform: {
      select: jest.fn(),
    },
  };
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

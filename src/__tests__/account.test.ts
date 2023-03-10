import { utils, providers, Wallet } from 'ethers';
import { signMessage, getWallet, signTransaction } from '../account';
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

  const provider = new providers.JsonRpcProvider(
    MumbaiNetworkConfig.gsn.rpcUrl
  );
  const faucet = tokenFaucet(MumbaiNetworkConfig, provider);
  const destinationAddress = Wallet.createRandom().address;

  const tx = await faucet.populateTransaction.transfer?.(
    destinationAddress,
    10
  );
  const signedTx = await signTransaction(tx);
  const rawTx = utils.parseTransaction(signedTx);
  const { r, s, v } = rawTx;

  if (!r || !s || !v) throw new Error('r, s, or v is null');

  const signature = utils.joinSignature({ r, s, v });
  expect(signature).toBeTruthy();

  if (!tx) throw new Error('tx is null');

  const raw = utils.serializeTransaction(tx);
  const msgHash = utils.keccak256(raw);
  const msgBytes = utils.arrayify(msgHash);
  const sender = utils.recoverAddress(msgBytes, signature);
  expect(wallet?.address).toEqual(sender);
});

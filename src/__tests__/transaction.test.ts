import { Wallet } from 'ethers';
import { RlyMumbaiNetwork, RlyPolygonNetwork } from '../network';

let mockMnemonic: string;
let mockPk: string;

beforeAll(async () => {
  // need to create new mnemonic for each run so that claim can be called
  const wallet = Wallet.createRandom();
  mockMnemonic = wallet.mnemonic.phrase;
  mockPk = Wallet.fromMnemonic(mockMnemonic).privateKey;
});

jest.mock('react-native', () => {
  return {
    NativeModules: {
      RlyNetworkMobileSdk: {
        getMnemonic: () => Promise.resolve(mockMnemonic),
        generateMnemonic: () => Promise.resolve(mockMnemonic),
        saveMnemonic: () => Promise.resolve(),
        deleteMnemonic: () => Promise.resolve(),
        getPrivateKeyFromMnemonic: () => Promise.resolve(mockPk),
      },
    },
    Platform: {
      select: jest.fn(),
    },
  };
});

test('claim mumbai', async () => {
  const txHash = await RlyMumbaiNetwork.registerAccount();
  expect(txHash).toMatch(/^0x/);
});

test('claim local', async () => {
  const txHash = await RlyMumbaiNetwork.registerAccount();
  expect(txHash).toMatch(/^0x/);
});

import { Wallet } from 'ethers';
import { getWallet } from '../../account';
import { RlyMumbaiNetwork, RlyDummyNetwork } from '../../network';
import { testOnlyRunInCIFullSuite } from '../__utils__/test_utils';

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

testOnlyRunInCIFullSuite(
  'claim mumbai',
  async () => {
    const oldBal = await RlyMumbaiNetwork.getBalance();
    const txHash = await RlyMumbaiNetwork.registerAccount();
    const newBal = await RlyMumbaiNetwork.getBalance();
    expect(oldBal).toEqual(0);
    expect(txHash).toMatch(/^0x/);
    expect(newBal).toEqual(10);
  },
  30000
);

test('claim local', async () => {
  const account = await getWallet();
  const oldBal = await RlyDummyNetwork.getBalance();
  const txHash = await RlyDummyNetwork.registerAccount();
  const newBal = await RlyDummyNetwork.getBalance();
  expect(oldBal).toEqual(0);
  expect(txHash).toEqual(`success_${10}_${account?.publicKey}`);
  expect(newBal).toEqual(10);
});

import { Wallet } from 'ethers';
import { getWallet, permanentlyDeleteAccount } from '../../account';
import { RlyAmoyNetwork, RlyDummyNetwork } from '../../network';
import { testOnlyRunInCIFullSuite } from '../__utils__/test_utils';

let mockMnemonic: string;
let mockPk: string;

beforeEach(async () => {
  // need to create new mnemonic for each run so that claim can be called
  await permanentlyDeleteAccount();

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
  'claim mumbai legacy method name',
  async () => {
    RlyAmoyNetwork.setApiKey(process.env.RALLY_PROTOCOL_MUMBAI_TOKEN!);

    const oldBal = await RlyAmoyNetwork.getBalance();
    const txHash = await RlyAmoyNetwork.registerAccount();
    const newBal = await RlyAmoyNetwork.getBalance();
    expect(oldBal).toEqual(0);
    expect(txHash).toMatch(/^0x/);
    expect(newBal).toEqual(10);
  },
  30000
);

testOnlyRunInCIFullSuite(
  'claim mumbai',
  async () => {
    RlyAmoyNetwork.setApiKey(process.env.RALLY_PROTOCOL_MUMBAI_TOKEN!);

    const oldBal = await RlyAmoyNetwork.getDisplayBalance();
    const txHash = await RlyAmoyNetwork.claimRly();
    const newBal = await RlyAmoyNetwork.getDisplayBalance();

    expect(oldBal).toEqual(0);
    expect(txHash).toMatch(/^0x/);
    expect(newBal).toEqual(10);
  },
  30000
);

test('claim local', async () => {
  const account = await getWallet();
  const oldBal = await RlyDummyNetwork.getBalance();
  const txHash = await RlyDummyNetwork.claimRly();
  const newBal = await RlyDummyNetwork.getBalance();
  expect(oldBal).toEqual(0);
  expect(txHash).toEqual(`success_${10}_${account?.publicKey}`);
  expect(newBal).toEqual(10);
});

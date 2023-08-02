import { ethers, Contract } from 'ethers';
import { getWallet } from '../../account';
import { RlyPolygonNetwork } from '../../coreNetworkWrapper';
import { PolygonNetworkConfig } from '@rly-network/core-sdk';
import { ERC20 } from '@rly-network/core-sdk';
import { MetaTxMethod } from '@rly-network/core-sdk';
import { testSkipInCI } from '../__utils__/test_utils';

let ethersProvider: ethers.providers.JsonRpcProvider;
const tokenAddress = '0xd872b7fFca41a67eDA85b04A9185c6b270006b58';

beforeAll(async () => {
  ethersProvider = new ethers.providers.JsonRpcProvider(
    PolygonNetworkConfig.gsn.rpcUrl
  );
});

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

test('wallet', async () => {
  const address = '0x88046468228953d17c7DAaE39cfEF9B4b082164D';
  const wallet = await getWallet();
  expect(wallet?.address).toEqual(address);
});

// this can be marked with `testOnlyRunInCIFullSuite` instead if it's tweaked to be fully automated
testSkipInCI(
  'balance of polygon prod token should equal 10',
  async () => {
    const account = await getWallet();
    const signer = account?.connect(ethersProvider);
    const token = new Contract(tokenAddress, ERC20.abi, signer);
    const decimals = await token.decimals();

    if (!account) {
      throw 'account not found';
    }
    const bal = await token.balanceOf(account.address);
    expect(decimals).toEqual(9);
    expect(bal).toEqual(ethers.utils.parseUnits('98', decimals));
  },
  30000
);

// this can be marked with `testOnlyRunInCIFullSuite` instead if it's tweaked to be fully automated
testSkipInCI(
  'transfer polygon prod token behind proxy using permit on our gsn client and paymaster with method argument',
  async () => {
    const RlyNetwork = RlyPolygonNetwork;
    const account = await getWallet();
    const signer = account?.connect(ethersProvider);
    const token = new Contract(tokenAddress, ERC20.abi, signer);
    const decimals = await token.decimals();

    if (!account) {
      throw 'account not found';
    }
    const oldBal = await token.balanceOf(account.address);

    // ant address
    const to = '0xAcbb8BA053f7CC4F691b455A296D28dd5c867a99';
    const txHash = await RlyNetwork.transfer(
      to,
      1,
      tokenAddress,
      MetaTxMethod.Permit
    );

    const newBal = await token.balanceOf(account.address);
    expect(oldBal).toEqual(ethers.utils.parseUnits('98', decimals));
    expect(txHash).toMatch(/^0x/);
    expect(newBal).toEqual(ethers.utils.parseUnits('97', decimals));
  },
  30000
);

import { ethers, Wallet, Contract } from 'ethers';
import { getWallet } from '../../account';
import * as TokenFaucet from '../../contracts/tokenFaucetData.json';
import * as ERC20 from '../../contracts/erc20Data.json';
import { RlyLocalNetwork } from '../../network';
import { MetaTxMethod } from '../../gsnClient/utils';

let mockMnemonic: string;
let mockPk: string;
let ethersProvider: ethers.providers.JsonRpcProvider;
let defaultAccount: ethers.Signer;

const polygonTokenAddress = '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c';
const permitTokenAddress = '0xc6e7DF5E7b4f2A278906862b61205850344D4e7d';
const polygonFaucetAddress = '0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1';
const permitFaucetAddress = '0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f';

beforeAll(async () => {
  // need to create new mnemonic for each run so that claim can be called
  const wallet = Wallet.createRandom();
  mockMnemonic = wallet.mnemonic.phrase;
  mockPk = Wallet.fromMnemonic(mockMnemonic).privateKey;
  ethersProvider = new ethers.providers.JsonRpcProvider(
    'http://127.0.0.1:8545/'
  );

  defaultAccount = await ethersProvider.getSigner();
  defaultAccount.sendTransaction({
    to: wallet.address,
    value: ethers.utils.parseEther('1.0'),
  });
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

test('claim polygon token local', async () => {
  const account = await getWallet();
  const signer = account?.connect(ethersProvider);
  const faucet = new Contract(polygonFaucetAddress, TokenFaucet.abi, signer);
  const token = new Contract(polygonTokenAddress, ERC20.abi, signer);

  if (!account) {
    throw 'account not found';
  }
  const oldBal = await token.balanceOf(account.address);
  const res = await faucet.claim({ from: account.address });
  const newBal = await token.balanceOf(account.address);
  expect(oldBal.toNumber()).toEqual(0);
  expect(res.hash).toMatch(/^0x/);
  expect(newBal).toEqual(ethers.utils.parseEther('10'));
});

test('claim permit token local', async () => {
  const account = await getWallet();
  const signer = account?.connect(ethersProvider);
  const faucet = new Contract(permitFaucetAddress, TokenFaucet.abi, signer);
  const token = new Contract(permitTokenAddress, ERC20.abi, signer);

  if (!account) {
    throw 'account not found';
  }
  const oldBal = await token.balanceOf(account.address);
  const res = await faucet.claim({ from: account.address });
  const newBal = await token.balanceOf(account.address);
  expect(oldBal.toNumber()).toEqual(0);
  expect(res.hash).toMatch(/^0x/);
  expect(newBal).toEqual(ethers.utils.parseEther('10'));
});

test('transfer polygon token local using executeMetaTransaction on our gsn client and paymaster with method argument', async () => {
  const RlyNetwork = RlyLocalNetwork;
  const account = await getWallet();
  const signer = account?.connect(ethersProvider);
  const token = new Contract(polygonTokenAddress, ERC20.abi, signer);

  if (!account) {
    throw 'account not found';
  }
  const oldBal = await token.balanceOf(account.address);
  const to = await defaultAccount.getAddress();
  const txHash = await RlyNetwork.transfer(
    to,
    1,
    polygonTokenAddress,
    MetaTxMethod.ExecuteMetaTransaction
  );
  const newBal = await token.balanceOf(account.address);
  expect(oldBal).toEqual(ethers.utils.parseEther('10'));
  expect(txHash).toMatch(/^0x/);
  expect(newBal).toEqual(ethers.utils.parseEther('9'));
});

test('transfer polygon token local using executeMetaTransaction on our gsn client and paymaster', async () => {
  const RlyNetwork = RlyLocalNetwork;
  const account = await getWallet();
  const signer = account?.connect(ethersProvider);
  const token = new Contract(polygonTokenAddress, ERC20.abi, signer);

  if (!account) {
    throw 'account not found';
  }
  const oldBal = await token.balanceOf(account.address);
  const to = await defaultAccount.getAddress();
  const txHash = await RlyNetwork.transfer(to, 1, polygonTokenAddress);
  const newBal = await token.balanceOf(account.address);
  expect(oldBal).toEqual(ethers.utils.parseEther('9'));
  expect(txHash).toMatch(/^0x/);
  expect(newBal).toEqual(ethers.utils.parseEther('8'));
});

test('transfer permit token local using permit on our gsn client and paymaster using method arguement', async () => {
  const RlyNetwork = RlyLocalNetwork;
  const account = await getWallet();
  const signer = account?.connect(ethersProvider);
  const token = new Contract(permitTokenAddress, ERC20.abi, signer);

  if (!account) {
    throw 'account not found';
  }
  const oldBal = await token.balanceOf(account.address);
  const to = await defaultAccount.getAddress();
  const txHash = await RlyNetwork.transfer(
    to,
    1,
    permitTokenAddress,
    MetaTxMethod.Permit
  );
  const newBal = await token.balanceOf(account.address);
  expect(oldBal).toEqual(ethers.utils.parseEther('10'));
  expect(txHash).toMatch(/^0x/);
  expect(newBal).toEqual(ethers.utils.parseEther('9'));
});

test('transfer permit token local using permit on our gsn client and paymaster', async () => {
  const RlyNetwork = RlyLocalNetwork;
  const account = await getWallet();
  const signer = account?.connect(ethersProvider);
  const token = new Contract(permitTokenAddress, ERC20.abi, signer);

  if (!account) {
    throw 'account not found';
  }
  const oldBal = await token.balanceOf(account.address);
  const to = await defaultAccount.getAddress();
  const txHash = await RlyNetwork.transfer(to, 1, permitTokenAddress);
  const newBal = await token.balanceOf(account.address);
  expect(oldBal).toEqual(ethers.utils.parseEther('9'));
  expect(txHash).toMatch(/^0x/);
  expect(newBal).toEqual(ethers.utils.parseEther('8'));
});

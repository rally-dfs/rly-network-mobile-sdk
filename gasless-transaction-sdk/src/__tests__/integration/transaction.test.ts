import { Wallet } from 'ethers';
import { RlyCoreMumbaiNetwork, RlyCoreDummyNetwork } from '../../network';
import { testOnlyRunInCIFullSuite } from '../__utils__/test_utils';

testOnlyRunInCIFullSuite(
  'claim mumbai',
  async () => {
    RlyCoreMumbaiNetwork.setApiKey(process.env.RALLY_PROTOCOL_MUMBAI_TOKEN!);

    const wallet = Wallet.createRandom();
    const oldBal = await RlyCoreMumbaiNetwork.getBalance(wallet);
    const txHash = await RlyCoreMumbaiNetwork.claimRly(wallet);
    const newBal = await RlyCoreMumbaiNetwork.getBalance(wallet);

    expect(oldBal).toEqual(0);
    expect(txHash).toMatch(/^0x/);
    expect(newBal).toEqual(10);
  },
  30000
);

test('claim local', async () => {
  const wallet = Wallet.createRandom();
  const oldBal = await RlyCoreDummyNetwork.getBalance(wallet);
  const txHash = await RlyCoreDummyNetwork.claimRly(wallet);
  const newBal = await RlyCoreDummyNetwork.getBalance(wallet);
  expect(oldBal).toEqual(0);
  expect(txHash).toEqual(`success_${10}_${wallet?.publicKey}`);
  expect(newBal).toEqual(10);
});

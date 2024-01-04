import * as React from 'react';
import { useEffect, useState } from 'react';

import { LightAccount, EoaAccount, Mumbai } from '@rly-network/mobile-sdk';
import { AccountOverviewScreen } from './AccountOverviewScreen';
import { GenerateAccountScreen } from './GenerateAccountScreen';
import { LoadingScreen } from './LoadingScreen';

export default function App() {
  const [accountLoaded, setAccountLoaded] = useState(false);
  const [smartAccount, setSmartAccount] = useState<LightAccount | undefined>();
  const [smartAccountAddress, setSmartAccountAddress] = useState<
    string | undefined
  >();

  useEffect(() => {
    const readAccount = async () => {
      try {
        const eoaAct = await EoaAccount.getWallet();
        if (!eoaAct) {
          return;
        }
        const lightAccount = new LightAccount(eoaAct, Mumbai);
        const address = await lightAccount.getAccountAddress();
        console.log('user account', address);

        if (address) {
          setSmartAccount(lightAccount);
          setSmartAccountAddress(address);
        }
      } catch (error: any) {
        console.error('Error occurred while reading account', error.message);
      } finally {
        setAccountLoaded(true);
      }
    };

    if (!accountLoaded) {
      readAccount();
    }
  }, [accountLoaded]);

  const createSmartAccount = async () => {
    const eoaAct = await EoaAccount.createEoa();
    if (!eoaAct) {
      return;
    }
    const lightAccount = new LightAccount(eoaAct, Mumbai);
    const address = await lightAccount.getAccountAddress();
    setSmartAccount(lightAccount);
    setSmartAccountAddress(address);
  };

  if (!accountLoaded) {
    return <LoadingScreen />;
  }

  if (!smartAccount) {
    return <GenerateAccountScreen generateSmartAccount={createSmartAccount} />;
  }

  return (
    <AccountOverviewScreen
      smartAccount={smartAccount}
      smartAccountAddress={smartAccountAddress}
    />
  );
}

import * as React from 'react';
import { useEffect, useState } from 'react';

import { createAccount, getAccount } from 'rly-network-mobile-sdk';
import { AccountOverviewScreen } from './AccountOverviewScreen';
import { GenerateAccountScreen } from './GenerateAccountScreen';
import { LoadingScreen } from './LoadingScreen';

export default function App() {
  const [accountLoaded, setAccountLoaded] = useState(false);
  const [rlyAccount, setRlyAccount] = useState<string | undefined>();

  useEffect(() => {
    const readAccount = async () => {
      const account = await getAccount();

      setAccountLoaded(true);

      if (account) {
        setRlyAccount(account);
      }
    };

    if (!accountLoaded) {
      readAccount();
    }
  }, [accountLoaded]);

  const createRlyAccount = async () => {
    console.log('Going to generate account');

    const rlyAct = await createAccount();
    setRlyAccount(rlyAct);
  };

  if (!accountLoaded) {
    return <LoadingScreen />;
  }

  if (!rlyAccount) {
    return <GenerateAccountScreen generateAccount={createRlyAccount} />;
  }

  return <AccountOverviewScreen rlyAccount={rlyAccount} />;
}

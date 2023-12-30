import * as React from 'react';
import { useEffect, useState } from 'react';

import {
  createAccount,
  getAccount,
  importExistingAccount,
} from '@rly-network/mobile-sdk';
import { AccountOverviewScreen } from './AccountOverviewScreen';
import { GenerateAccountScreen } from './GenerateAccountScreen';
import { LoadingScreen } from './LoadingScreen';

export default function App() {
  const [accountLoaded, setAccountLoaded] = useState(false);
  const [rlyAccount, setRlyAccount] = useState<string | undefined>();

  useEffect(() => {
    const readAccount = async () => {
      try {
        const account = await getAccount();

        console.log('user account', account);

        if (account) {
          setRlyAccount(account);
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

  const createRlyAccount = async () => {
    const rlyAct = await createAccount({ overwrite: true });
    setRlyAccount(rlyAct);
  };

  const importExistingRlyAccount = async (mnemonic: string) => {
    const rlyAct = await importExistingAccount(mnemonic);
    setRlyAccount(rlyAct);
  };

  if (!accountLoaded) {
    return <LoadingScreen />;
  }

  if (!rlyAccount) {
    return (
      <GenerateAccountScreen
        generateAccount={createRlyAccount}
        importExistingAccount={importExistingRlyAccount}
      />
    );
  }

  return <AccountOverviewScreen rlyAccount={rlyAccount} />;
}

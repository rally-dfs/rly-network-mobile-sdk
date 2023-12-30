import * as React from 'react';
import { useEffect, useState } from 'react';

import {
  LightAccountManager,
  createAccount,
  getAccount,
  importExistingAccount,
  RlyMumbaiNetwork,
} from '@rly-network/mobile-sdk';
import { AccountOverviewScreen } from './AccountOverviewScreen';
import { GenerateAccountScreen } from './GenerateAccountScreen';
import { LoadingScreen } from './LoadingScreen';
import type { PrefixedHexString } from 'src/gsnClient/utils';

export default function App() {
  const [accountLoaded, setAccountLoaded] = useState(false);
  const [rlyAccount, setRlyAccount] = useState<string | undefined>();
  const [smartAccount, setSmartAccount] = useState<string | undefined>();

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

  const createSmartAccount = async () => {
    const act = (await getAccount()) as PrefixedHexString;
    if (!act) {
      return;
    }
    const address = await LightAccountManager.getAccountAddress(
      act,
      RlyMumbaiNetwork
    );
    setSmartAccount(address);
  };

  const importExistingRlyAccount = async (mnemonic: string) => {
    const rlyAct = await importExistingAccount(mnemonic);
    setRlyAccount(rlyAct);
  };

  if (!accountLoaded) {
    return <LoadingScreen />;
  }

  if (!rlyAccount || !smartAccount) {
    return (
      <GenerateAccountScreen
        generateAccount={createRlyAccount}
        generateSmartAccount={createSmartAccount}
        importExistingAccount={importExistingRlyAccount}
      />
    );
  }

  return (
    <AccountOverviewScreen
      rlyAccount={rlyAccount}
      rlySmartAccount={smartAccount}
    />
  );
}

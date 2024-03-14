import type { NetworkConfig } from 'src/network_config/network_config';

import { providers } from 'ethers';
import type { ConnectionInfo } from 'ethers/lib/utils';

const authHeader = (config: NetworkConfig) => {
  return {
    Authorization: `Bearer ${config.relayerApiKey || ''}`,
  };
};

export const getProvider = (
  config: NetworkConfig,
) => {
  const connection: ConnectionInfo = {
    headers: { ...authHeader(config) },
    url: config.gsn.rpcUrl,
  };
  const provider = new providers.JsonRpcProvider(connection);

  return provider;
};

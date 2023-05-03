export interface Network {
  getBalance: () => Promise<number>;
  transfer: (destinationAddress: string, amount: number) => Promise<void>;
  registerAccount: () => Promise<void>;
}

export * from './networks/dummy_network';
export * from './networks/local_network';
export * from './networks/mumbai_network';
export * from './networks/polygon_network';

declare global {
  var crypto: {
    getRandomValues: (buffer: Uint8Array) => void;
  };
}

const getRandomValues = (_buffer: Uint8Array) => {
  throw new Error(
    'The RNA SDK does not support the global.crypto.getRandomValues function and does all random number generation in native code. Proceed with caution'
  );
};

if (global.crypto && !global.crypto.getRandomValues) {
  global.crypto.getRandomValues = getRandomValues;
} else if (!global.crypto) {
  global.crypto = { getRandomValues };
}

export { getAccount, getAccountPhrase, createAccount } from './account';
export * from './network';

console.log(`Running tests in CI mode? ${process.env.CI}`);
console.log(
  `Running tests in full suite CI mode? ${process.env.CI_FULL_SUITE}`
);

// tests that shouldnt be run in CI, e.g. for tests that don't work without running a local network
export const testSkipInCI = process.env.CI ? test.skip : test;

// tests that can be run in CI but are costly so shouldn't be run on every build, e.g. they do on chain calls
export const testOnlyRunInCIFullSuite =
  process.env.CI && process.env.CI_FULL_SUITE ? test : test.skip;

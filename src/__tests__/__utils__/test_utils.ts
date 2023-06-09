console.log(`Running tests in CI mode? ${process.env.CI}`);

export const testSkipInCI = process.env.CI ? test.skip : test;

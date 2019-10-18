import { spawnSync } from 'child_process';
import mockConsole, { RestoreConsole } from 'jest-mock-console';
import * as nock from 'nock';
import { resolve } from 'path';

import { consoleMockCallJoin, nockEndpoint } from '../test/test-utils';
import { main } from './cli';
import { defaultRegions } from './regions';

describe('cli', () => {
  describe('test by import', () => {
    let restoreConsole: RestoreConsole;

    beforeAll(() => {
      jest.setTimeout(30000);
      defaultRegions.forEach(region => nockEndpoint({ region }));
    });

    afterAll(() => {
      jest.setTimeout(5000);
      nock.cleanAll();
    });

    beforeEach(() => {
      restoreConsole = mockConsole();
    });

    afterEach(() => {
      restoreConsole();
    });

    it('should print help', async () => {
      await main(['--help']);
      expect(consoleMockCallJoin()).toMatchSnapshot();
    });

    it('should return expected values with default options', async () => {
      await main();
      expect(consoleMockCallJoin()).toMatchSnapshot();
    });

    it('should return expected values with user options', async () => {
      await main([
        '-r',
        'us-east-1',
        '-l',
        '10',
        '-l',
        '11',
        '-d',
        'Linux/UNIX (Amazon VPC)',
        '-i',
        'c5.large',
        'c4.xlarge',
        '-p',
        '0.05',
      ]);
      expect(consoleMockCallJoin()).toMatchSnapshot();
    });

    it('should return expected values with wildcard product descriptions', async () => {
      await main(['-r', 'us-east-1', '-l', '10', '-d', 'linux']);
      await main(['-r', 'us-east-1', '-l', '10', '-d', 'windows']);
      expect(consoleMockCallJoin()).toMatchSnapshot();
    });

    it('should return expected values with instance family types and sizes', async () => {
      await main(['-f', 'c5', '-s', 'large']);
      expect(consoleMockCallJoin()).toMatchSnapshot();
    });

    it('should handle instance family option', async () => {
      await main(['--family', 'compute']);
      expect(consoleMockCallJoin()).toMatchSnapshot();
    });

    it('should handle invalid usage of instance family types and sizes option', async () => {
      let caughtError = false;

      try {
        await main(['-f', 'c5']);
      } catch (error) {
        caughtError = true;
      }
      expect(caughtError).toBeTruthy();
      expect(consoleMockCallJoin()).toMatchSnapshot();
    });

    it('should handle invalid usage of accessKeyId and secretAccessKey', async () => {
      let caughtError = false;
      try {
        await main(['--accessKeyId', 'rand']);
      } catch (error) {
        caughtError = true;
      }
      expect(caughtError).toBeTruthy();
      expect(consoleMockCallJoin()).toMatchSnapshot();
    });

    it('should handle invalid credentials error', async () => {
      let caughtError = false;
      try {
        await main(['--accessKeyId', 'rand', '--secretAccessKey', 'rand']);
      } catch (error) {
        caughtError = true;
      }
      expect(caughtError).toBeTruthy();
      expect(consoleMockCallJoin()).toMatchSnapshot();
    });
  });

  describe('test by spawnSync', () => {
    const cliJsPath = resolve(__dirname, '../dist/cli.js');
    it('should stdout help screen', () => {
      const s = spawnSync('node', [cliJsPath, '--help'], { encoding: 'utf-8' });
      expect(s.stdout).toMatchSnapshot();
    });
  });
});
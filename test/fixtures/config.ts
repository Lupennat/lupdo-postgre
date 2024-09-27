import { PostgresOptions } from '../../src';

const currentDB: string = process.env.DB as string;
const currentHost: string =
  (process.env.CI ?? '') != '' ? 'localhost' : currentDB;

export const drivers: {
  [key: string]: PostgresOptions;
} = {
  crdb231: {
    user: 'lupdo',
    host: currentHost,
    database: 'test_db',
    port: 26257,
  },
  crdb232: {
    user: 'lupdo',
    host: currentHost,
    database: 'test_db',
    port: 26257,
  },
  crdb241: {
    user: 'lupdo',
    host: currentHost,
    database: 'test_db',
    port: 26257,
  },
  crdb242: {
    user: 'lupdo',
    host: currentHost,
    database: 'test_db',
    port: 26257,
  },
  postgres12: {
    user: 'lupdo',
    password: 'lupdos3cRet',
    host: currentHost,
    database: 'test_db',
    port: 5432,
  },
  postgres13: {
    user: 'lupdo',
    password: 'lupdos3cRet',
    host: currentHost,
    database: 'test_db',
    port: 5432,
  },
  postgres14: {
    user: 'lupdo',
    password: 'lupdos3cRet',
    host: currentHost,
    database: 'test_db',
    port: 5432,
  },
  postgres15: {
    user: 'lupdo',
    password: 'lupdos3cRet',
    host: currentHost,
    database: 'test_db',
    port: 5432,
  },
  postgres16: {
    user: 'lupdo',
    password: 'lupdos3cRet',
    host: currentHost,
    database: 'test_db',
    port: 5432,
  },
};

export function supportPgSnapshot(): boolean {
  return !isCrdb() && Number(currentDB.replace('postgres', '')) >= 13;
}

export function supportTs(): boolean {
  return isCrdb() && Number(currentDB.replace('crdb', '')) >= 231;
}

export function isCrdb(): boolean {
  return currentDB.startsWith('crdb');
}

export function isDigitPrecision(): boolean {
  return !isCrdb() && Number(currentDB.replace('postgres', '')) <= 11;
}

export function isRealPrecision(): boolean {
  return isCrdb() && Number(currentDB.replace('crdb', '')) <= 221;
}

export function supportArrayTime(): boolean {
  return isCrdb() && Number(currentDB.replace('crdb', '')) >= 231;
}

export const pdoData: { driver: string; config: PostgresOptions } = {
  driver: currentDB.startsWith('postgres') ? 'pgsql' : 'crdb',
  config: drivers[currentDB],
};

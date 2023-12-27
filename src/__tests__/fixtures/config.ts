import { PostgresOptions } from '../../types';

export const drivers: {
    [key: string]: PostgresOptions;
} = {
    crdb221: {
        user: 'lupdo',
        host: 'localhost',
        database: 'test_db',
        port: 26258
    },
    crdb222: {
        user: 'lupdo',
        host: 'localhost',
        database: 'test_db',
        port: 26259
    },
    crdb231: {
        user: 'lupdo',
        host: 'localhost',
        database: 'test_db',
        port: 26260
    },
    postgres12: {
        user: 'lupdo',
        password: 'lupdos3cRet',
        host: 'localhost',
        database: 'test_db',
        port: 25432
    },
    postgres13: {
        user: 'lupdo',
        password: 'lupdos3cRet',
        host: 'localhost',
        database: 'test_db',
        port: 25433
    },
    postgres14: {
        user: 'lupdo',
        password: 'lupdos3cRet',
        host: 'localhost',
        database: 'test_db',
        port: 25434
    },
    postgres15: {
        user: 'lupdo',
        password: 'lupdos3cRet',
        host: 'localhost',
        database: 'test_db',
        port: 25435
    },
    postgres16: {
        user: 'lupdo',
        password: 'lupdos3cRet',
        host: 'localhost',
        database: 'test_db',
        port: 25436
    }
};

const currentDB: string = process.env.DB as string;

export function supportPgSnapshot(): boolean {
    return ['postgres13', 'postgres14', 'postgres15'].includes(currentDB);
}

export function supportTs(): boolean {
    return ['crdb231'].includes(currentDB);
}

export function isCrdb(): boolean {
    return ['crdb221', 'crdb222', 'crdb231'].includes(currentDB);
}

export function isDigitPrecision(): boolean {
    return ['postgres11'].includes(currentDB);
}

export function isRealPrecision(): boolean {
    return ['crdb221'].includes(currentDB);
}

export function supportArrayTime(): boolean {
    return ['crdb231'].includes(currentDB);
}

export const pdoData: { driver: string; config: PostgresOptions } = {
    driver: currentDB.startsWith('postgres') ? 'pgsql' : 'crdb',
    config: drivers[currentDB]
};

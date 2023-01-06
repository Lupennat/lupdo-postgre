import { PostgressOptions } from '../../types';

export const drivers: {
    [key: string]: PostgressOptions;
} = {
    postgres11: {
        user: 'lupdo',
        password: 'lupdos3cRet',
        host: 'localhost',
        database: 'test_db',
        port: 25431
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
    }
};

const currentDB: string = process.env.DB as string;

export function supportPgSnapshot(): boolean {
    return ['postgres13', 'postgres14', 'postgres15'].includes(currentDB);
}

export function isDigitPrecision(): boolean {
    return ['postgres11'].includes(currentDB);
}

export const pdoData: { driver: string; config: PostgressOptions } = {
    driver: 'pgsql',
    config: drivers[currentDB]
};

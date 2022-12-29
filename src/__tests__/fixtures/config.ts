import { PostgressOptions } from '../../types';

export const drivers: {
    [key: string]: PostgressOptions;
} = {
    postgres: {
        user: 'lupdo',
        password: 'lupdos3cRet',
        host: 'localhost',
        database: 'test_db',
        port: 25432
    }
};

const currentDB: string = process.env.DB as string;

export const pdoData: { driver: string; config: PostgressOptions } = {
    driver: 'pgsql',
    config: drivers[currentDB]
};

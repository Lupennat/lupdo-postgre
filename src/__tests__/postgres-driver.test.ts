import {
    ATTR_DEBUG,
    DEBUG_ENABLED,
    Pdo,
    PdoConnectionI,
    PdoError,
    PdoPreparedStatement,
    PdoStatement,
    PdoTransaction
} from 'lupdo';

import { Client } from 'pg';
import { createPostgresPdo } from '..';
import PostgresDriver from '../postgres-driver';
import { pdoData } from './fixtures/config';

describe('Postgres Driver', () => {
    const pdo = new Pdo(pdoData.driver, pdoData.config);

    afterAll(async () => {
        await pdo.disconnect();
    });

    afterEach(() => {
        Pdo.setLogger(() => {});
    });

    it('Works Driver Registration', () => {
        expect(Pdo.getAvailableDrivers()).toEqual(['pg', 'pgsql']);
    });

    it('Works Driver Notification', async () => {
        const fnTestChannel = jest.fn();
        const fnTestChannel2 = jest.fn();
        const fnTestChannel3 = jest.fn();

        expect(PostgresDriver.subscribe('test_channel', fnTestChannel)).toBe(true);
        expect(PostgresDriver.subscribe('test_channel', fnTestChannel)).toBe(false);
        expect(PostgresDriver.subscribe('test_channel2', fnTestChannel2)).toBe(true);
        expect(PostgresDriver.subscribe('test_channel2', fnTestChannel2)).toBe(false);

        expect(
            PostgresDriver.subscribe('test_channel', message => {
                expect(message.payload).toBe('test-executed!');
            })
        ).toBe(true);

        await pdo.query('LISTEN test_channel');
        await pdo.query(`NOTIFY test_channel, 'test-executed!'`);
        expect(fnTestChannel).toBeCalledTimes(1);
        expect(fnTestChannel2).toBeCalledTimes(0);
        expect(PostgresDriver.unsubscribe('test_channel', fnTestChannel)).toBe(true);
        expect(PostgresDriver.unsubscribe('test_channel2', fnTestChannel2)).toBe(true);
        expect(PostgresDriver.unsubscribe('test_channel', fnTestChannel3)).toBe(false);
    });

    it('Works BeginTransaction Return Transaction', async () => {
        const trx = await pdo.beginTransaction();
        expect(trx).toBeInstanceOf(PdoTransaction);
        await trx.rollback();
    });

    it('Works Exec Return Number', async () => {
        const res = await pdo.exec('SELECT 1');
        expect(typeof res === 'number').toBeTruthy();
        expect(res).toEqual(0);
        const trx = await pdo.beginTransaction();
        expect(await trx.exec("INSERT INTO users (name, gender) VALUES ('Claudio', 'All');")).toEqual(1);
        await trx.rollback();
    });

    it('Works Exec Fails', async () => {
        await expect(pdo.exec('SELECT ?')).rejects.toThrow(PdoError);
    });

    it('Works Query Return PdoStatement', async () => {
        const stmt = await pdo.query('SELECT 1');
        expect(stmt).toBeInstanceOf(PdoStatement);
    });

    it('Works Query Fails', async () => {
        await expect(pdo.query('SELECT ?')).rejects.toThrow(PdoError);
    });

    it('Works Prepare Return PdoPreparedStatement', async () => {
        const stmt = await pdo.prepare('SELECT 1');
        expect(stmt).toBeInstanceOf(PdoPreparedStatement);
        await stmt.execute();
        await stmt.close();
    });

    it('Works Wrong PreparedStatement Fails on Execute', async () => {
        const stmt = await pdo.prepare('SELECT $?');
        await expect(stmt.execute([1])).rejects.toThrow(PdoError);
        await stmt.close();
    });

    it('Works Execute Fails', async () => {
        const stmt = await pdo.prepare('SELECT ? as spaccati');
        await expect(stmt.execute([])).rejects.toThrow(PdoError);
        await stmt.close();
    });

    it('Works Get Raw Pool Connection', async () => {
        const raw = await pdo.getRawPoolConnection();
        expect(raw.connection).toBeInstanceOf(Client);
        await raw.release();
    });

    it('Works Get Raw Driver Connection', async () => {
        const conn = await pdo.getRawDriverConnection<Client>();
        const res = await conn.query('SELECT * FROM users WHERE id = 1');
        expect(res.rows[0]).toEqual({ id: '1', name: 'Edmund', gender: 'Multigender' });
        await conn.end();
    });

    it('Works Connection On Create', async () => {
        const pdo = new Pdo(
            pdoData.driver,
            pdoData.config,
            {
                created: async (uuid: string, connection: PdoConnectionI) => {
                    await connection.query("SET my.app_user = 'pdo_test';");
                }
            },
            {}
        );

        const stmt = await pdo.query(`SELECT current_setting('my.app_user');`);
        expect(stmt.fetchColumn<string>(0).get()).toBe('pdo_test');
        await pdo.disconnect();
    });

    it('Works Debug', async () => {
        console.log = jest.fn();
        console.trace = jest.fn();
        const pdo = new Pdo(pdoData.driver, pdoData.config, {}, { [ATTR_DEBUG]: DEBUG_ENABLED });
        await pdo.query('SELECT 1');
        expect(console.log).toHaveBeenCalled();
        await pdo.disconnect();
    });

    it('Works createPostgresPdo', async () => {
        const pdo = createPostgresPdo(pdoData.config);
        expect(pdo).toBeInstanceOf(Pdo);
        await pdo.disconnect();
    });
});

/* eslint-disable @typescript-eslint/no-var-requires */
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
        await expect(pdo.exec('SELECT $1')).rejects.toThrow(PdoError);
    });

    it('Works Query Return PdoStatement', async () => {
        const stmt = await pdo.query('SELECT 1');
        expect(stmt).toBeInstanceOf(PdoStatement);
    });

    it('Works Query Fails', async () => {
        await expect(pdo.query('SELECT $1')).rejects.toThrow(PdoError);
    });

    it('Works Prepare Return PdoPreparedStatement', async () => {
        const stmt = await pdo.prepare('SELECT 1');
        expect(stmt).toBeInstanceOf(PdoPreparedStatement);
        await stmt.execute();
        await stmt.close();
    });

    it('Works Wrong PreparedStatement Fails on Execute', async () => {
        const stmt = await pdo.prepare('SELECT $$1');
        await expect(stmt.execute([1])).rejects.toThrow(PdoError);
        await stmt.close();
    });

    it('Works Execute Fails', async () => {
        const stmt = await pdo.prepare('SELECT $1 as spaccati');
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
        expect(res.rows[0]).toEqual({ id: 1, name: 'Edmund', gender: 'Multigender' });
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
});

import { ATTR_CASE, ATTR_FETCH_DIRECTION, CASE_LOWER, CASE_NATURAL, FETCH_BACKWARD, Pdo } from 'lupdo';
import { pdoData } from './fixtures/config';

describe('Postgres Statement', () => {
    const pdo = new Pdo(pdoData.driver, pdoData.config);

    afterAll(async () => {
        await pdo.disconnect();
    });

    it('Works Statement Debug', async () => {
        const stmt = await pdo.query('SELECT * FROM users limit 5;');
        expect(stmt.debug()).toBe('SQL: SELECT * FROM users limit 5;\nPARAMS:[]');
    });

    it('Works Statement Get Attribute is Localized', async () => {
        const stmt = await pdo.query('SELECT * FROM users limit 5;');
        const stmtFetchMode = stmt.getAttribute(ATTR_CASE);
        expect(pdo.getAttribute(ATTR_CASE)).toBe(stmtFetchMode);
        pdo.setAttribute(ATTR_CASE, CASE_LOWER);
        expect(pdo.getAttribute(ATTR_CASE)).toBe(CASE_LOWER);
        expect(stmt.getAttribute(ATTR_CASE)).toBe(stmtFetchMode);
        pdo.setAttribute(ATTR_CASE, CASE_NATURAL);
    });

    it('Works Statement Set Attribute is Localized', async () => {
        const stmt = await pdo.query('SELECT * FROM users limit 5;');
        const pdoFetchMode = pdo.getAttribute(ATTR_CASE);
        expect(stmt.getAttribute(ATTR_CASE)).toBe(pdoFetchMode);
        const res = stmt.setAttribute(ATTR_CASE, CASE_LOWER);
        expect(res).toBeTruthy();
        expect(stmt.getAttribute(ATTR_CASE)).toBe(CASE_LOWER);
        expect(pdo.getAttribute(ATTR_CASE)).toBe(pdoFetchMode);
        expect(stmt.setAttribute('NOT_EXISTS', 1)).toBeFalsy();
        pdo.setAttribute(ATTR_CASE, CASE_NATURAL);
    });

    it('Works Statement Last Insert Id', async () => {
        const trx = await pdo.beginTransaction();

        let stmt = await trx.query('SELECT count(*) as total from users');
        const lastId = stmt.fetchColumn<number>(0).get() as number;

        stmt = await trx.query("INSERT INTO users (name, gender) VALUES ('Claudio', 'All') returning *;");
        expect(await stmt.lastInsertId()).toBeGreaterThan(lastId);
        expect(await stmt.lastInsertId()).toBe(await stmt.lastInsertId('test_db_users_id_seq'));
        expect(stmt.fetchColumn(0).get()).toBe(await stmt.lastInsertId());
        await trx.rollback();
        await pdo.exec('CREATE TABLE test (id serial, name VARCHAR(255) NOT NULL);');
        stmt = await pdo.query("INSERT INTO test (name) VALUES ('Test')");
        expect(await stmt.lastInsertId()).toBe(1);
        await pdo.exec('DROP TABLE test;');
    });

    it('Works Statement Last Insert Id Throw Error', async () => {
        const pdo = new Pdo(pdoData.driver, pdoData.config);
        const trx = await pdo.beginTransaction();
        const stmt = await trx.query('SELECT * FROM users limit 5;');
        await expect(stmt.lastInsertId()).rejects.toThrow('lastval is not yet defined in this session');
        await expect(stmt.lastInsertId('test_db_users_id_seq')).rejects.toThrow(
            'currval of sequence "test_db_users_id_seq" is not yet defined in this session, you can retrieve through the query "SELECT last_value FROM test_db_users_id_seq;"'
        );
        await trx.rollback();
        await pdo.disconnect();
    });

    it('Works Statement Row Count', async () => {
        const trx = await pdo.beginTransaction();
        let stmt = await trx.query('SELECT * FROM users limit 5;');
        expect(stmt.rowCount()).toBe(0);
        stmt = await trx.query("INSERT INTO users (name, gender) VALUES ('Claudio', 'All');");
        expect(stmt.rowCount()).toBe(1);
        await trx.rollback();
    });

    it('Works Column Count', async () => {
        const stmt = await pdo.query('SELECT * FROM users limit 5;');
        expect(stmt.columnCount()).toBe(3);
    });

    it('Works Get Column Meta', async () => {
        const stmt = await pdo.query('SELECT * FROM users limit 5;');
        expect(stmt.getColumnMeta(0)?.name).toBe('id');
        expect(stmt.getColumnMeta(1)?.name).toBe('name');
        expect(stmt.getColumnMeta(5)).toBeNull();
    });

    it('Works Reset Cursor', async () => {
        const stmt = await pdo.query('SELECT * FROM users limit 5;');
        const fetch = stmt.fetchArray();
        expect(fetch.get()).toEqual([1, 'Edmund', 'Multigender']);
        fetch.all();
        expect(fetch.get()).toBeUndefined();
        stmt.resetCursor();
        expect(fetch.get()).toEqual([1, 'Edmund', 'Multigender']);
        stmt.setAttribute(ATTR_FETCH_DIRECTION, FETCH_BACKWARD);
        stmt.resetCursor();
        expect(fetch.get()).toEqual([5, 'Sincere', 'Demi-girl']);
        fetch.all();
        expect(fetch.get()).toBeUndefined();
        stmt.resetCursor();
        expect(fetch.get()).toEqual([5, 'Sincere', 'Demi-girl']);
    });
});

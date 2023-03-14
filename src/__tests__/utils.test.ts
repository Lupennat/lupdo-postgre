import {
    getTypeParser,
    noParse,
    parseBigint,
    parseBoolean,
    parseString,
    setTypeParser,
    sqlQuestionMarkToNumericDollar,
    typeParsers
} from '../utils';

describe('Utils', () => {
    it('Works Sql Question Mark To Numeric Dollar', () => {
        expect(sqlQuestionMarkToNumericDollar('SELECT ?,?,?,?')).toBe('SELECT $1,$2,$3,$4');
        expect(sqlQuestionMarkToNumericDollar('SELECT "?,?,?,?"')).toBe('SELECT "?,?,?,?"');
        expect(sqlQuestionMarkToNumericDollar('SELECT ??')).toBe('SELECT ?');
        expect(sqlQuestionMarkToNumericDollar('SELECT "??"')).toBe('SELECT "??"');
        expect(sqlQuestionMarkToNumericDollar("SELECT '??'")).toBe("SELECT '??'");
        expect(
            sqlQuestionMarkToNumericDollar(`-- SELECT '??'
        select ?`)
        ).toBe('select $1');
        expect(sqlQuestionMarkToNumericDollar("/*SELECT '??' */ SELECT ?")).toBe('SELECT $1');
        expect(sqlQuestionMarkToNumericDollar(`select * where t = 'string ?? ? " ? " '' ? ? '`)).toBe(
            `select * where t = 'string ?? ? " ? " '' ? ? '`
        );
    });

    it('Works Parse Bigint', () => {
        expect(parseBigint('9007199254740991')).toBe(9007199254740991);
        expect(parseBigint('-9007199254740991')).toBe(-9007199254740991);
        expect(parseBigint('9007199254740992')).toEqual(BigInt('9007199254740992'));
        expect(parseBigint('-9007199254740992')).toEqual(BigInt('-9007199254740992'));
        expect(parseBigint(null)).toBeNull();
    });

    it('Works Parse Boolean', () => {
        expect(parseBoolean('true')).toBe(1);
        expect(parseBoolean('TRUE')).toBe(1);
        expect(parseBoolean('t')).toBe(1);
        expect(parseBoolean('y')).toBe(1);
        expect(parseBoolean('yes')).toBe(1);
        expect(parseBoolean('on')).toBe(1);
        expect(parseBoolean('1')).toBe(1);
        expect(parseBoolean('false')).toBe(0);
        expect(parseBoolean('False')).toBe(0);
        expect(parseBoolean('f')).toBe(0);
        expect(parseBoolean('n')).toBe(0);
        expect(parseBoolean('no')).toBe(0);
        expect(parseBoolean('off')).toBe(0);
        expect(parseBoolean('0')).toBe(0);
        expect(parseBoolean(null)).toBeNull();
    });

    it('Works Parse String', () => {
        expect(parseString('string')).toBe('string');
        expect(parseString(null)).toBeNull();
    });

    it('Works No Parse', () => {
        expect(noParse(1000)).toBe('1000');
    });

    it('Works Set Type Parser', () => {
        setTypeParser(1, 'test', (value: string) => 'test' + value);
        expect(typeof typeParsers.test[1] === 'function').toBeTruthy();
        expect(typeParsers.test[1]('baz')).toBe('testbaz');
        setTypeParser(2, 'test');
        expect(2 in typeParsers.test).toBeFalsy();
        setTypeParser(9999999999, (value: string) => 'text' + value);
        expect(typeof typeParsers.text[9999999999] === 'function').toBeTruthy();
        expect(typeParsers.text[9999999999]('bar')).toBe('textbar');
    });

    it('Works Get Type Parser', () => {
        expect(getTypeParser(1, 'not-exists')).toEqual(noParse);
        expect(typeof getTypeParser(9999999999) === 'function').toBeTruthy();
        expect(getTypeParser(9999999999)).not.toEqual(noParse);
        expect(getTypeParser(99999999999)).toEqual(noParse);
    });
});

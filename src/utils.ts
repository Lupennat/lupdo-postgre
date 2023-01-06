export function sqlQuestionMarkToNumericDollar(sql: string): string {
    let questionCount = 0;
    sql = sql.replace(/\\?\?/g, match => {
        if (match === '\\?') {
            return '?';
        }

        questionCount += 1;
        return `$${questionCount}`;
    });

    return sql;
}

/* eslint-disable @typescript-eslint/no-var-requires */
const { parse } = require('postgres-array');

export function parseBigint(value: string | null): number | bigint | null {
    if (value === null) {
        return null;
    }
    const bigint = BigInt(value);
    if (bigint > Number.MAX_SAFE_INTEGER || bigint < Number.MIN_SAFE_INTEGER) {
        return bigint;
    }
    return Number(value);
}

export function parseArrayBigint(a: string | null): (number | bigint | null)[] {
    return parse(a, parseBigint);
}

export function parseBoolean(value: string | null): number | null {
    if (value === null) {
        return null;
    }
    return value === 'TRUE' ||
        value === 't' ||
        value === 'true' ||
        value === 'y' ||
        value === 'yes' ||
        value === 'on' ||
        value === '1'
        ? 1
        : 0;
}

export function parseArrayBoolean(a: string | null): (number | null)[] {
    return parse(a, parseBoolean);
}

export function parseString(value: string | null): string | null {
    return value;
}

export function parseArrayString(a: string | null): (string | null)[] {
    return parse(a, parseString);
}

export function noParse(val: any): string {
    return String(val);
}

//returns a function used to convert a specific type (specified by
//oid) into a result javascript type
//note: the oid can be obtained via the following sql query:
//SELECT oid FROM pg_type WHERE typname = 'TYPE_NAME_HERE';
export function getTypeParser(oid: number, format?: string): Function {
    format = format || 'text';
    if (!(format in typeParsers)) {
        return noParse;
    }
    return typeParsers[format][oid] || noParse;
}

export function setTypeParser(oid: number, format: string | Function, parseFn?: Function): void {
    if (typeof format === 'function') {
        parseFn = format;
        format = 'text';
    }

    if (parseFn == null) {
        return void 0;
    }

    if (!(format in typeParsers)) {
        typeParsers[format] = {};
    }

    typeParsers[format][oid] = parseFn;
}

export const typeParsers: {
    [key: string]: { [key: number]: Function };
} = {
    text: {},
    binary: {}
};

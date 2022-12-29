import { Pdo } from 'lupdo';
import { types } from 'pg';
import PostgreDriver from './postgres-driver';

const toBigInt = (value: string): number | bigint => {
    const bigint = BigInt(value);
    if (bigint > Number.MAX_SAFE_INTEGER || bigint < Number.MIN_SAFE_INTEGER) {
        return bigint;
    }
    return Number(value);
};

types.setTypeParser(20, toBigInt);

const parseBigIntArray = types.getTypeParser(1016);
types.setTypeParser(1016, a => parseBigIntArray(a).map(toBigInt));

Pdo.addDriver('pg', PostgreDriver);
Pdo.addDriver('pgsql', PostgreDriver);

export { default as PostgreDriver } from './postgres-driver';
export * from './types';

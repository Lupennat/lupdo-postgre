import { Pdo } from 'lupdo';
import PostgresDriver from './postgres-driver';

import PdoAttributes from 'lupdo/dist/typings/types/pdo-attributes';
import { PoolOptions } from 'lupdo/dist/typings/types/pdo-pool';
import { PostgressOptions } from './types';

Pdo.addDriver('pg', PostgresDriver);
Pdo.addDriver('pgsql', PostgresDriver);

export function createPostgresPdo(
    options: PostgressOptions,
    poolOptions?: PoolOptions,
    attributes?: PdoAttributes
): Pdo {
    return new Pdo('pgsql', options, poolOptions, attributes);
}

export { default as PostgresDriver } from './postgres-driver';
export * from './types';

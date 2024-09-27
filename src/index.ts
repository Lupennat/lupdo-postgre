import { Pdo, PdoAttributes, PdoPoolOptions } from 'lupdo';

import PostgresDriver from './postgres-driver';
import { PostgresOptions } from './types';

Pdo.addDriver('pg', PostgresDriver);
Pdo.addDriver('pgsql', PostgresDriver);

Pdo.addDriver('crdb', PostgresDriver);
Pdo.addDriver('cockroachdb', PostgresDriver);

export function createPostgresPdo(
  options: PostgresOptions,
  poolOptions?: PdoPoolOptions,
  attributes?: PdoAttributes,
): Pdo {
  return new Pdo('pgsql', options, poolOptions, attributes);
}

export { default as PostgresDriver } from './postgres-driver';
export * from './types';

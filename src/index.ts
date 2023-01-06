import { Pdo } from 'lupdo';
import PostgresDriver from './postgres-driver';

Pdo.addDriver('pg', PostgresDriver);
Pdo.addDriver('pgsql', PostgresDriver);

export { default as PostgresDriver } from './postgres-driver';
export * from './types';

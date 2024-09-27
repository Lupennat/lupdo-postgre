import { PdoAffectingData } from 'lupdo';
import { Client, ClientConfig } from 'pg';

export interface PostgresOptions extends Omit<ClientConfig, 'host'> {
  /**
   * The hostname of the database you are connecting to.
   * It Accept a list of Hosts of type host:port for random connection
   */
  host?: string | string[] | undefined;
}

export interface PostgresPoolConnection extends Client {
  __lupdo_uuid: string;
  __lupdo_killed: boolean;
  __lupdo_postgres_debug: boolean;
  processID: string;
}

export interface PdoPostgresAffectingData extends PdoAffectingData {
  command: string;
}

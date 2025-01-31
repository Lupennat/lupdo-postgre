import {
  ATTR_DEBUG,
  DEBUG_ENABLED,
  PdoAttributes,
  PdoConnectionI,
  PdoDriver,
  PdoPoolOptions,
  PdoRawConnectionI,
} from 'lupdo';
import { Client, Notification } from 'pg';

import PostgresConnection from './postgres-connection';
import PostgresRawConnection from './postgres-raw-connection';
import types from './postgres-types-parser';
import { PostgresOptions, PostgresPoolConnection } from './types';

export class PostgresDriver extends PdoDriver {
  protected static subscriptions: {
    [key: string]: ((message: Notification) => void)[];
  } = {};

  constructor(
    driver: string,
    protected options: PostgresOptions,
    poolOptions: PdoPoolOptions,
    attributes: PdoAttributes,
  ) {
    super(driver, poolOptions, attributes);
  }

  public static subscribe(
    channel: string,
    callable: (message: Notification) => void,
  ): boolean {
    if (!(channel in PostgresDriver.subscriptions)) {
      PostgresDriver.subscriptions[channel] = [];
    }
    const findIndex = PostgresDriver.subscriptions[channel].findIndex(
      (fn) => fn === callable,
    );
    if (findIndex === -1) {
      PostgresDriver.subscriptions[channel].push(callable);
      return true;
    }

    return false;
  }

  public static unsubscribe(
    channel: string,
    callable: (message: Notification) => void,
  ): boolean {
    if (
      channel in PostgresDriver.subscriptions &&
      PostgresDriver.subscriptions[channel].length
    ) {
      const findIndex = PostgresDriver.subscriptions[channel].findIndex(
        (fn) => fn === callable,
      );
      if (findIndex > -1) {
        PostgresDriver.subscriptions[channel].splice(findIndex, 1);
        return true;
      }
    }

    return false;
  }

  protected async createConnection(
    unsecure = false,
  ): Promise<PostgresPoolConnection> {
    let { host, port } = this.options;
    const { ...postgresOptions } = this.options;
    const debugMode = this.getAttribute(ATTR_DEBUG) as number;

    if (Array.isArray(host)) {
      const exploded = host[Math.floor(Math.random() * host.length)].split(':');
      port = Number(exploded.pop() as string);
      host = exploded.join(':');
    }

    if (!unsecure) {
      postgresOptions.types = types;
    }

    const client = new Client({
      ...postgresOptions,
      host: host,
      port: port,
    }) as PostgresPoolConnection;
    if (!unsecure) {
      client.__lupdo_postgres_debug = debugMode === DEBUG_ENABLED;

      client.on('notification', (msg: Notification) => {
        const channel = msg.channel;
        if (channel in PostgresDriver.subscriptions) {
          for (const callable of PostgresDriver.subscriptions[channel]) {
            callable(msg);
          }
        }
      });
    }

    await client.connect();
    return client;
  }

  protected createPdoConnection(
    connection: PostgresPoolConnection,
  ): PdoConnectionI {
    return new PostgresConnection(connection);
  }

  protected async closeConnection(
    connection: PostgresPoolConnection,
  ): Promise<void> {
    await connection.end();
    connection.removeAllListeners();
  }

  protected async destroyConnection(
    connection: PostgresPoolConnection,
  ): Promise<void> {
    // get new connection to force kill pending
    const newConn = await this.createConnection();
    await newConn.query(
      'SELECT pg_terminate_backend(' + connection.processID + ')',
    );
    await connection.end();
    connection.removeAllListeners();
    await newConn.end();
    newConn.removeAllListeners();
  }

  protected validateRawConnection(): boolean {
    return true;
  }

  public getRawConnection(): PdoRawConnectionI {
    return new PostgresRawConnection(this.pool);
  }

  protected async getVersionFromConnection(
    connection: PostgresPoolConnection,
  ): Promise<string> {
    const res = await connection.query<string[], string[]>({
      rowMode: 'array',
      text: 'SELECT VERSION() as version',
    });

    return res.rows[0][0];
  }
}

export default PostgresDriver;

import { PdoConnection } from 'lupdo';
import { Client } from 'pg';

export class PostgresConnection extends PdoConnection {
  constructor(public readonly connection: Client) {
    super();
  }

  async query(sql: string): Promise<void> {
    await this.connection.query(sql);
  }
}

export default PostgresConnection;

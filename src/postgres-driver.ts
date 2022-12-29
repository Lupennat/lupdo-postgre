import { ATTR_DEBUG, PdoConnectionI, PdoDriver, PdoRawConnectionI } from 'lupdo';
import PdoAttributes from 'lupdo/dist/typings/types/pdo-attributes';
import { PoolOptions } from 'lupdo/dist/typings/types/pdo-pool';
import { Client, Notification } from 'pg';
import PostgresConnection from './postgres-connection';
import PostgressRawConnection from './postgres-raw-connection';
import { PostgressOptions, PostgressPoolConnection } from './types';

class PostgresDriver extends PdoDriver {
    protected static notifiers: { [key: string]: ((message: Notification) => void)[] } = {};

    constructor(
        driver: string,
        protected options: PostgressOptions,
        poolOptions: PoolOptions,
        attributes: PdoAttributes
    ) {
        super(driver, poolOptions, attributes);
    }

    public static listen(channel: string, callable: (message: Notification) => void): void {
        if (!(channel in PostgresDriver.notifiers)) {
            PostgresDriver.notifiers[channel] = [];
        }

        PostgresDriver.notifiers.channel.push(callable);
    }

    protected async createConnection(unsecure = false): Promise<PostgressPoolConnection> {
        const { ...postgresOptions } = this.options;
        const debugMode = this.getAttribute(ATTR_DEBUG) as number;

        if (!unsecure) {
            postgresOptions.types = undefined;
        }

        const client = new Client(postgresOptions);
        if (!unsecure) {
            if (debugMode) {
                client.on('notice', msg => console.log('notice:', msg));
            }

            client.on('notification', (msg: Notification) => {
                const channel = msg.channel;
                for (const callable of PostgresDriver.notifiers[channel] ?? []) {
                    callable(msg);
                }
            });
        }

        await client.connect();
        return client as PostgressPoolConnection;
    }

    protected createPdoConnection(connection: PostgressPoolConnection): PdoConnectionI {
        return new PostgresConnection(connection);
    }

    protected async closeConnection(connection: PostgressPoolConnection): Promise<void> {
        await connection.end();
        connection.removeAllListeners();
    }

    protected async destroyConnection(connection: PostgressPoolConnection): Promise<void> {
        // get new connection to force kill pending
        const newConn = await this.createConnection();
        await newConn.query('SELECT pg_cancel_backend(' + connection.processID + ')');
        await connection.end();
        connection.removeAllListeners();
        await newConn.end();
        newConn.removeAllListeners();
    }

    protected validateRawConnection(): boolean {
        return true;
    }

    public getRawConnection(): PdoRawConnectionI {
        return new PostgressRawConnection(this.pool);
    }
}

export default PostgresDriver;

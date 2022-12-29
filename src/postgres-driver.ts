import { ATTR_DEBUG, DEBUG_ENABLED, PdoConnectionI, PdoDriver, PdoRawConnectionI } from 'lupdo';
import PdoAttributes from 'lupdo/dist/typings/types/pdo-attributes';
import { PoolOptions } from 'lupdo/dist/typings/types/pdo-pool';
import { Client, Notification } from 'pg';
import PostgresConnection from './postgres-connection';
import PostgressRawConnection from './postgres-raw-connection';
import { PostgressOptions, PostgressPoolConnection } from './types';

class PostgresDriver extends PdoDriver {
    protected static subscriptions: { [key: string]: ((message: Notification) => void)[] } = {};

    constructor(
        driver: string,
        protected options: PostgressOptions,
        poolOptions: PoolOptions,
        attributes: PdoAttributes
    ) {
        super(driver, poolOptions, attributes);
    }

    public static subscribe(channel: string, callable: (message: Notification) => void): boolean {
        if (!(channel in PostgresDriver.subscriptions)) {
            PostgresDriver.subscriptions[channel] = [];
        }
        const findIndex = PostgresDriver.subscriptions[channel].findIndex(fn => fn === callable);
        if (findIndex === -1) {
            PostgresDriver.subscriptions[channel].push(callable);
            return true;
        }

        return false;
    }

    public static unsubscribe(channel: string, callable: (message: Notification) => void): boolean {
        if (channel in PostgresDriver.subscriptions && PostgresDriver.subscriptions[channel].length) {
            const findIndex = PostgresDriver.subscriptions[channel].findIndex(fn => fn === callable);
            if (findIndex > -1) {
                PostgresDriver.subscriptions[channel].splice(findIndex, 1);
                return true;
            }
        }

        return false;
    }

    protected async createConnection(unsecure = false): Promise<PostgressPoolConnection> {
        const { ...postgresOptions } = this.options;
        const debugMode = this.getAttribute(ATTR_DEBUG) as number;

        if (!unsecure) {
            postgresOptions.types = undefined;
        }

        const client = new Client(postgresOptions) as PostgressPoolConnection;
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

# Lupdo-postgres

[Lupdo](https://www.npmjs.com/package/lupdo) Driver For PostgreSql.

## Supported Databases

-   [postgreSql](https://www.postgresql.org/)

## Third Party Library

Lupdo-postgres, under the hood, uses stable and performant npm packages:

-   [node-postgres](https://node-postgres.com/)

## Usage

Base Example

```js
const Pdo = require('lupdo');
require('lupdo-postgres');
// ES6 or Typescrypt
import Pdo from 'lupdo';
import 'ludpo-postgres';

const pdo = new Pdo(
    'pgsql',
    {
        host: 'localhost',
        port: 5432,
        user: 'user',
        password: 'password',
        database: 'database'
    },
    { min: 2, max: 3 }
);

const run = async () => {
    const statement = await pdo.query('SELECT 2');
    const res = statement.fetchArray().all();
    console.log(res);
    await pdo.disconnect();
};

run();
```

## Driver Options

[https://node-postgres.com/apis/client](https://node-postgres.com/apis/client)

## Pg Overrides

By default Ludpo-sqlite overrides user connection options with this:

```ts
{
    types: undefined;
}
```

Lupdo-postgres convert string for postgres bigint to number or bigint to preserve precision. [credits](https://github.com/brianc/node-pg-types/issues/78#issuecomment-538632724)

## Postgres Named Parameter

Lupdo-postgres support named parameter with syntax `:name`, through the package [yesql](https://github.com/pihvi/yesql)

## Kill Connection

Lupdo-postgres support kill query.

## Postgres Prepared Statement

Postgres support [prepared statement](https://node-postgres.com/features/queries#prepared-statements) however, it requires that the statement be prepared only at first execution, which makes it impossible to intercept syntax errors in the query before it is executed.

Prepared Statement require a unique-name for each prepared statement, under the hood this is done automatically by lupdo-postgres through the package [uuid-by-string](https://github.com/Danakt/uuid-by-string)

## PostgresDriver Subscribe

PostgresDriver expose two static method to subscribe/unsuscribe [notification](https://www.postgresql.org/docs/current/sql-notify.html)

```ts
import PostgresDriver from 'lupdo-postgres';

const testSubscription = message => {
    console.log(message);
};

PostgresDriver.subscribe('test_channel', message);
PostgresDriver.unsubscribe('test_channel', message);
```

message received is of type [Notification](https://node-postgres.com/apis/client#notification)

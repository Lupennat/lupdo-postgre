> **Warning**
> This Package is Still a Beta Release

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

## PostgresDriver Notification

PostgresDriver expose a static method to subscribe [notification](https://www.postgresql.org/docs/current/sql-notify.html)

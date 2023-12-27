<p align="center">
	<a href="https://www.npmjs.com/package/lupdo-postgres" target="__blank">
        <img src="https://img.shields.io/npm/v/lupdo-postgres?color=0476bc&label=" alt="NPM version">
    </a>
	<a href="https://www.npmjs.com/package/lupdo-postgres" target="__blank">
        <img alt="NPM Downloads" src="https://img.shields.io/npm/dm/lupdo-postgres?color=3890aa&label=">
    </a>
    <a href="https://app.codecov.io/github/Lupennat/lupdo-postgres" target="__blank">
        <img src="https://codecov.io/github/Lupennat/lupdo-postgres/branch/main/graph/badge.svg?token=64B998KKDF"/>
    </a>
    <a href="https://snyk.io/test/github/lupennat/lupdo-postgres" target="__blank">
        <img src="https://snyk.io/test/github/lupennat/lupdo-postgres/badge.svg">
    </a>
</p>

# Lupdo-postgres

[Lupdo](https://www.npmjs.com/package/lupdo) Driver For PostgreSql and CockroachDB.

## Supported Databases

-   [postgreSql](https://www.postgresql.org/) (v12,v13,v14,v15,v16)
-   [CockroachDB](https://www.cockroachlabs.com/) (v22.1,v22.2,v23.1)

## Third Party Library

Lupdo-postgres, under the hood, uses stable and performant npm packages:

-   [node-postgres](https://node-postgres.com/)

## Usage

Base Example

```js
const { createPostgresPdo } = require('lupdo-postgres');
// ES6 or Typescrypt
import { createPostgresPdo } from 'ludpo-postgres';

const pdo = createPostgresPdo(
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

> **Note**
> The `host` option also accepts a list of `host:port` the pool will generate the connection using a random host from the list.

## Pg Overrides

By default Ludpo-sqlite overrides user connection options with this:

```ts
{
    types: customParser;
}
```

Lupdo postgres has a custom type parser

-   `boolean` are returned as number 1 or 0
-   `int8` are returned as number or BigInt when necessary
-   `bytea` are returned as Buffer
-   all others types are always returned as string
-   array are returned as Javascript `Array` of corresponding parsed type

## Parameters Binding

Lupdo-postgres ignore type definition of `TypeBinding` parameter.\
Lupdo-postgres support array of parameters.

## Postgres Named Parameter

Lupdo-postgres support named parameter with syntax `:name`, through the package [yesql](https://github.com/pihvi/yesql)

## Postgres Numeric Parameter

Lupdo-postgres support numeric parameter with syntax `?`, you can escape it using syntax `??`.

## Kill Connection

Lupdo-postgres support kill query (only for Postgress Database not CockroachDB).

## Postgres Returing

Lupdo-postgres support queries with `returning`, results can be fetched from statement.

```ts
const stmt = pdo.query("INSERT INTO users (name, gender) VALUES ('Claudio', 'All') returning *;");
console.log(stmt.fetchArray().all());
/*
[
    [33, 'Claudio', 'All']
]
*/
```

## Postgres lastInsertId

When `pdo.query()` is executed outside a transaction, lupdo-postgres automatically try to fetch LastInsertId and if available it will return last id when `stmt.lastInsertId()` is called.

Lupdo-postgres can fetch LastInsertId on real-time when called inside a `transaction` or when statement is prepared through `pdo.prepare()`.\
If you pass sequence name as parameter, it should retrieve current session value of sequence.

> **Warning**
> Calling `stmt.lastInsertId(name?)` inside a transaction or from a PreparedStatement, will raise an error if value is not defined inside current session.

> **Note**
> You can always get insert ID through [`insert returing`](#postgres-returing) syntax.

## Postgres Prepared Statement

Postgres support [prepared statement](https://node-postgres.com/features/queries#prepared-statements) however, it requires that the statement be prepared only at first execution, which makes it impossible to intercept syntax errors in the query before it is executed.

Prepared Statement require a unique-name for each prepared statement, under the hood this is done automatically by lupdo-postgres through the package [uuid-by-string](https://github.com/Danakt/uuid-by-string)

## PostgresDriver Subscribe

PostgresDriver expose two static method to subscribe/unsuscribe [notification](https://www.postgresql.org/docs/current/sql-notify.html)

```ts
const { PostgresDriver } = require('lupdo-postgres');
// ES6 or Typescrypt
import { PostgresDriver } from 'ludpo-postgres';

const testSubscription = message => {
    console.log(message);
};

PostgresDriver.subscribe('test_channel', testSubscription);
PostgresDriver.unsubscribe('test_channel', testSubscription);
```

message received is of type [Notification](https://node-postgres.com/apis/client#notification)

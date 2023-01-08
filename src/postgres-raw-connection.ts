/* eslint-disable @typescript-eslint/no-var-requires */
import { PdoError, PdoRawConnection } from 'lupdo';
import PdoAffectingData from 'lupdo/dist/typings/types/pdo-affecting-data';
import PdoColumnData from 'lupdo/dist/typings/types/pdo-column-data';
import { Params, ValidBindingsSingle } from 'lupdo/dist/typings/types/pdo-prepared-statement';
import PdoRowData from 'lupdo/dist/typings/types/pdo-raw-data';

import { QueryArrayResult } from 'pg';
import getUuidByString from 'uuid-by-string';
import yesql from 'yesql';
import { PostgressPoolConnection } from './types';
import { sqlQuestionMarkToNumericDollar } from './utils';

class PostgressRawConnection extends PdoRawConnection {
    public async lastInsertId(
        {
            affectingResults
        }: {
            affectingResults: PdoAffectingData;
        },
        name?: string
    ): Promise<string | number | bigint | null> {
        if (this.connection == null) {
            return await super.lastInsertId({ affectingResults });
        }

        try {
            return await this.executeGetLastIdQuery(this.connection as PostgressPoolConnection, name);
        } catch (error: any) {
            if (name) {
                throw new PdoError(
                    `currval of sequence "${name}" is not yet defined in this session, you can retrieve through the query "SELECT last_value FROM ${name};"`,
                    error
                );
            } else {
                throw new PdoError(error);
            }
        }
    }

    protected logQuery(connection: PostgressPoolConnection, sql: string, params?: Params): void {
        if (connection.__lupdo_postgres_debug) {
            console.log(
                `[postgress debug] processId: ${connection.processID} | query: ${sql} | params: `,
                params ?? 'null'
            );
        }
    }

    protected async doBeginTransaction(connection: PostgressPoolConnection): Promise<void> {
        this.logQuery(connection, 'BEGIN');
        await connection.query('BEGIN');
    }

    protected async doCommit(connection: PostgressPoolConnection): Promise<void> {
        this.logQuery(connection, 'COMMIT');
        await connection.query('COMMIT');
    }

    protected async doRollback(connection: PostgressPoolConnection): Promise<void> {
        this.logQuery(connection, 'ROLLBACK');
        await connection.query('ROLLBACK');
    }

    protected async getStatement(sql: string): Promise<string> {
        return sql;
    }

    protected async executeStatement(
        sql: string,
        bindings: Params,
        connection: PostgressPoolConnection
    ): Promise<[string, PdoAffectingData, PdoRowData[], PdoColumnData[]]> {
        sql = sqlQuestionMarkToNumericDollar(sql);

        if (!Array.isArray(bindings)) {
            const adapted = yesql.pg(sql)(bindings);
            sql = adapted.text;
            bindings = adapted.values;
        }
        this.logQuery(connection, sql, bindings);

        return [
            sql,
            ...this.adaptResponse(
                await connection.query({
                    name: getUuidByString(sql, 5),
                    rowMode: 'array',
                    text: sql,
                    values: bindings
                })
            )
        ];
    }

    protected async closeStatement(): Promise<void> {
        return void 0;
    }

    protected async doExec(connection: PostgressPoolConnection, sql: string): Promise<PdoAffectingData> {
        this.logQuery(connection, sql);
        return this.adaptResponse(
            await connection.query({
                rowMode: 'array',
                text: sql
            })
        )[0];
    }

    protected async doQuery(
        connection: PostgressPoolConnection,
        sql: string
    ): Promise<[PdoAffectingData, PdoRowData[], PdoColumnData[]]> {
        this.logQuery(connection, sql);
        const [pdoAffectingData, ...rest] = this.adaptResponse(
            await connection.query({
                rowMode: 'array',
                text: sql
            })
        );
        if (!this.inTransaction) {
            try {
                pdoAffectingData.lastInsertRowid = await this.executeGetLastIdQuery(connection);
            } catch (error) {}
        }
        return [pdoAffectingData, ...rest];
    }

    protected async executeGetLastIdQuery(
        connection: PostgressPoolConnection,
        name?: string
    ): Promise<number | bigint> {
        const sql = name ? 'SELECT CURRVAL($1)' : 'SELECT LASTVAL();';
        const bindings = name ? [name] : [];
        this.logQuery(connection, sql, bindings);
        const res = await connection.query({
            rowMode: 'array',
            text: sql,
            values: bindings
        });
        const row = res.rows.pop() as any[];
        return row[0];
    }

    protected adaptResponse(result: QueryArrayResult): [PdoAffectingData, PdoRowData[], PdoColumnData[]] {
        return [
            ['INSERT', 'UPDATE', 'DELETE'].includes(result.command.toUpperCase())
                ? {
                      affectedRows: result.rowCount
                  }
                : {},
            result.rows,
            result.fields.map(field => {
                return {
                    name: field.name,
                    table: '',
                    tableID: field.tableID,
                    columnID: field.columnID,
                    dataTypeID: field.dataTypeID,
                    dataTypeSize: field.dataTypeSize,
                    dataTypeModifier: field.dataTypeModifier,
                    format: field.format
                };
            })
        ];
    }

    protected adaptBindValue(value: ValidBindingsSingle): ValidBindingsSingle {
        if (typeof value === 'boolean') {
            return Number(value);
        }

        return value;
    }
}

export default PostgressRawConnection;

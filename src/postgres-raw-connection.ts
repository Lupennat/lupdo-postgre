/* eslint-disable @typescript-eslint/no-var-requires */
import { PdoRawConnection } from 'lupdo';
import PdoAffectingData from 'lupdo/dist/typings/types/pdo-affecting-data';
import PdoColumnData from 'lupdo/dist/typings/types/pdo-column-data';
import { Params, ValidBindingsSingle } from 'lupdo/dist/typings/types/pdo-prepared-statement';
import PdoRowData from 'lupdo/dist/typings/types/pdo-raw-data';

import { QueryArrayResult } from 'pg';
import getUuidByString from 'uuid-by-string';
import yesql from 'yesql';
import { PdoPostgresAffectingData, PostgressPoolConnection } from './types';
import { sqlQuestionMarkToNumericDollar } from './utils';

class PostgressRawConnection extends PdoRawConnection {
    public async lastInsertId(
        {
            selectResults,
            columns,
            affectingResults
        }: {
            affectingResults: PdoAffectingData;
            selectResults: PdoRowData[];
            columns: PdoColumnData[];
        },
        name?: string
    ): Promise<string | number | bigint | null> {
        if (name == null || (affectingResults as PdoPostgresAffectingData).command !== 'INSERT') {
            return await super.lastInsertId({ affectingResults });
        }

        const index = columns.findIndex(column => column.name.toLowerCase() === name.toLowerCase());

        if (index > -1 && selectResults.length > 0) {
            const value = selectResults[selectResults.length - 1][index];
            if (typeof value === 'string' || typeof value === 'bigint' || typeof value === 'number') {
                return value;
            }
        }

        return null;
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
        return this.adaptResponse(
            await connection.query({
                rowMode: 'array',
                text: sql
            })
        );
    }

    protected adaptResponse(result: QueryArrayResult): [PdoPostgresAffectingData, PdoRowData[], PdoColumnData[]] {
        return [
            ['INSERT', 'UPDATE', 'DELETE'].includes(result.command.toUpperCase())
                ? {
                      affectedRows: result.rowCount,
                      command: result.command.toUpperCase()
                  }
                : {
                      command: result.command.toUpperCase()
                  },
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

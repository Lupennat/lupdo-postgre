/* eslint-disable @typescript-eslint/no-var-requires */
import { PdoRawConnection } from 'lupdo';
import PdoAffectingData from 'lupdo/dist/typings/types/pdo-affecting-data';
import PdoColumnData from 'lupdo/dist/typings/types/pdo-column-data';
import { Params, ValidBindings } from 'lupdo/dist/typings/types/pdo-prepared-statement';
import PdoRowData from 'lupdo/dist/typings/types/pdo-raw-data';

import { QueryArrayResult } from 'pg';
import getUuidByString from 'uuid-by-string';
import yesql from 'yesql';
import { PostgressPoolConnection } from './types';

class PostgressRawConnection extends PdoRawConnection {
    protected isInsert = false;

    public async lastInsertId(name?: string): Promise<string | number | bigint | null> {
        if (name == null || !this.isInsert) {
            return await super.lastInsertId();
        }
        const index = this.columns.findIndex(column => column.name.toLowerCase() === name.toLowerCase());

        if (index > -1 && this.selectResults.length > 0) {
            const value = this.selectResults[this.selectResults.length - 1][index];
            if (typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint') {
                return value;
            }
        }

        return null;
    }

    protected async doBeginTransaction(connection: PostgressPoolConnection): Promise<void> {
        await connection.query('BEGIN');
    }

    protected async doCommit(connection: PostgressPoolConnection): Promise<void> {
        await connection.query('COMMIT');
    }

    protected async doRollback(connection: PostgressPoolConnection): Promise<void> {
        await connection.query('ROLLBACK');
    }

    protected async getStatement(sql: string): Promise<string> {
        return sql;
    }

    protected async executeStatement(
        statement: string,
        bindings: Params,
        connection: PostgressPoolConnection
    ): Promise<[PdoAffectingData, PdoRowData[], PdoColumnData[]]> {
        if (!Array.isArray(bindings)) {
            const adapted = yesql.pg(statement)(bindings);
            statement = adapted.text;
            bindings = adapted.values;
        }

        return this.adaptResponse(
            await connection.query({
                name: getUuidByString(statement, 5),
                rowMode: 'array',
                text: statement,
                values: bindings
            })
        );
    }

    protected async closeStatement(): Promise<void> {
        return void 0;
    }

    protected async doExec(connection: PostgressPoolConnection, sql: string): Promise<PdoAffectingData> {
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
        return this.adaptResponse(
            await connection.query({
                rowMode: 'array',
                text: sql
            })
        );
    }

    protected adaptResponse(result: QueryArrayResult): [PdoAffectingData, PdoRowData[], PdoColumnData[]] {
        this.isInsert = result.command.toUpperCase() === 'INSERT';
        return [
            ['INSERT', 'UPDATE', 'DELETE'].includes(result.command.toUpperCase())
                ? {
                      affectedRows: result.rowCount,
                      lastInsertRowid: undefined
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

    protected adaptBindValue(value: ValidBindings): ValidBindings {
        if (typeof value === 'boolean') {
            return Number(value);
        }

        return value;
    }
}

export default PostgressRawConnection;

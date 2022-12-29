import { Client, ClientConfig } from 'pg';

export type PostgressOptions = ClientConfig;

export interface PostgressPoolConnection extends Client {
    __lupdo_uuid: string;
    __lupdo_killed: boolean;
    __lupdo_postgres_debug: boolean;
    processID: string;
}

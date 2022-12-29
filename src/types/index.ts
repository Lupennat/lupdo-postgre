import { Client, ClientConfig } from 'pg';

export type PostgressOptions = ClientConfig;

export interface PostgressPoolConnection extends Client {
    __lupdo_uuid: string;
    __lupdo_killed: boolean;
    processID: string;
}

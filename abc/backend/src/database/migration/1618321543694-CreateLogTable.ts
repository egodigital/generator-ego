/* eslint-disable unicorn/filename-case */

import { MigrationInterface, QueryRunner, Table } from 'typeorm';

const logTable = new Table({
    name: 'tdta_log',
    columns: [
        // id
        {
            name: 'id',
            type: 'bigint',
            unsigned: true,
            isPrimary: true,
            isGenerated: true,
            isNullable: false
        },
        // message
        {
            name: 'message',
            type: 'json',
            isNullable: true
        },
        // tag
        {
            name: 'tag',
            type: 'varchar',
            isNullable: true
        },
        // time
        {
            name: 'time',
            type: 'timestamp with time zone',
            isNullable: false
        },
        // type
        {
            name: 'type',
            type: 'int2',
            isNullable: true
        }
    ],
    indices: [
        {
            columnNames: ['tag'],
            name: 'tdta_log_idx_tag'
        },
        {
            columnNames: ['type'],
            name: 'tdta_log_idx_type'
        }
    ]
});

export class CreateLogTable1618321543694 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.createTable(logTable);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropTable(logTable);
    }
}

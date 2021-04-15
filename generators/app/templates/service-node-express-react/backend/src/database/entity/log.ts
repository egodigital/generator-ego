import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Nullable } from '@egodigital/types';

@Entity('tdta_log')
export class Log<TMsg extends any = any> {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    public id!: number;

    @Column({ nullable: true, type: 'json' })
    public message?: Nullable<TMsg>;

    @Column({ nullable: true, type: 'varchar' })
    public tag?: Nullable<string>;

    @Column({ nullable: false, type: 'timestamp with time zone' })
    public time!: Date;

    @Column({ nullable: true, type: 'int2', unsigned: true })
    public type?: Nullable<number>;
}

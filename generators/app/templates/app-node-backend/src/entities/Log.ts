import { Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

/**
 * A log entry.
 */
@Entity()
export class Log {
    @ObjectIdColumn()
    id: ObjectID;

    /**
     * The message.
     */
    @Column()
    message?: any;

    /**
     * The tag.
     */
    @Column()
    tag?: string;

    /**
     * The timestamp.
     */
    @Column()
    time: Date;

    /**
     * The type.
     */
    @Column()
    type?: number;
}
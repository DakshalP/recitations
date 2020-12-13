import { Type } from 'class-transformer';
import { BaseEntity, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn, TableInheritance } from 'typeorm';
import { MeetableInterface } from '../interfaces';
import { MeetingTime } from '../models';

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class Meetable extends BaseEntity implements MeetableInterface {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @OneToMany(type => MeetingTime, meetingTime => meetingTime.meetable, {
        eager: true,
        cascade: true,
    })
    @JoinColumn()
    @Type(() => MeetingTime)
    public meetingTimes?: MeetingTime[];

    constructor(args: Partial<Meetable> = {}) {
        super();
        Object.assign(this, args);
    }
}

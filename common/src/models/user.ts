import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserInterface } from '../interfaces';

@Entity()
export class User extends BaseEntity implements UserInterface {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column()
    public firstName: string;

    @Column()
    public lastName: string;

    @Column()
    public username: string;

    @Column()
    public email: string;

    @Column({ select: false })
    public passwordHash: string;

    constructor(args: Partial<User> = {}) {
        super();
        Object.assign(this, args);
    }

    public getFullName(): string {
        return this.firstName + ' ' + this.lastName;
    }
}
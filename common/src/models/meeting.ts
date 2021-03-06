import { Expose, Type } from 'class-transformer';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { MeetingType } from '../enums';
import { Course, Lesson, MeetingTime } from '../models';

dayjs.extend(utc);
dayjs.extend(timezone);

export class Meeting<Type extends MeetingType = MeetingType> {
    @Type(() => MeetingTime)
    meetingTime: MeetingTime;

    meetingType: Type;

    date: Date;

    @Expose()
    getAccessCode() {
        const baseStr = JSON.stringify({
            leader: this.meetingTime.leader?.id,
            meetingType: this.meetingType,
            date: dayjs(this.date).unix(),
        });

        // Based loosely on the Java hash function.
        const hash = baseStr.split('').reduce<number>((hash, char) => {
            const charCode = char.charCodeAt(0);
            // eslint-disable-next-line no-bitwise
            const firstStep = (hash << 5) - hash + charCode;
            // eslint-disable-next-line no-bitwise
            return Math.abs(firstStep | 0);
        }, 0);

        const randomData: string[] = [
            '5',
            '1',
            'U',
            '8',
            'F',
            'H',
            'T',
            '4',
            'V',
            'Y',
            'S',
            'B',
            '7',
            'Q',
            'Z',
            'E',
            'G',
            '6',
            '9',
            'D',
            'P',
            'N',
            'R',
            'X',
            'A',
            'C',
            'I',
            'J',
            '3',
            'W',
            'M',
            'L',
            '2',
            'K',
        ];

        return [1, 0.5, 0.25, 0.125].reduce<string>(
            (str, divisor) => str + randomData[Math.ceil(Math.abs(hash / divisor)) % randomData.length ?? 0],
            ''
        );
    }

    canTakeQuiz(course: Course): boolean {
        const startTime = dayjs(this.date)
            .tz()
            .add(course.getNumberSetting('semester_start_date')?.value ?? 50, 'minute');
        const endTime = dayjs(this.date)
            .tz()
            .add(course.getNumberSetting('semester_end_date')?.value ?? 60 * 24 * 5, 'minute');

        return dayjs().isAfter(startTime) && dayjs().isBefore(endTime);
    }

    constructor(args: Partial<Meeting> = {}) {
        Object.assign(this, args);
    }
}

export class MeetingWithLesson<Type extends MeetingType = MeetingType> extends Meeting<Type> {
    lesson: Lesson;

    constructor(args: Partial<MeetingWithLesson> = {}) {
        super(args);
        Object.assign(this, args);
    }
}

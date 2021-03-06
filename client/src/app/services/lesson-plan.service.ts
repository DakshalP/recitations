import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Course, LessonPlan, LessonPlanStep, StandardResponseInterface } from '@dynrec/common';
import { DeleteRequest, GetRequest, ListRequest, UpsertRequest } from '../decorators';
import { HttpFilterInterface } from '../http/httpFilter.interface';

@Injectable({
    providedIn: 'root',
})
export class LessonPlanService {
    constructor(private http: HttpClient) {}

    @UpsertRequest<LessonPlan>(LessonPlan, 'lessonplan')
    public async upsertLessonPlan(lessonPlan: LessonPlan): Promise<StandardResponseInterface<LessonPlan>> {
        throw new Error('Decorator Overloading Failed');
    }

    @UpsertRequest<LessonPlanStep>(LessonPlanStep, 'lessonplanstep')
    public async upsertLessonPlanStep(
        lessonPlanStep: LessonPlanStep
    ): Promise<StandardResponseInterface<LessonPlanStep>> {
        throw new Error('Decorator Overloading Failed');
    }

    @ListRequest<LessonPlan>(LessonPlan, 'lessonplan')
    public async getCourseLessonPlans(
        course: Course,
        args?: HttpFilterInterface
    ): Promise<StandardResponseInterface<LessonPlan[]>> {
        throw new Error('Decorator Overloading Failed');
    }

    @GetRequest<LessonPlan>(LessonPlan, 'lessonplan')
    public async getLessonPlan(lessonPlanID: string): Promise<StandardResponseInterface<LessonPlan>> {
        throw new Error('Decorator Overloading Failed');
    }

    @DeleteRequest<LessonPlan>(LessonPlan, 'lessonplan')
    public async deleteLessonPlan(lessonPlanID: string): Promise<StandardResponseInterface<LessonPlan>> {
        throw new Error('Decorator Overloading Failed');
    }
}

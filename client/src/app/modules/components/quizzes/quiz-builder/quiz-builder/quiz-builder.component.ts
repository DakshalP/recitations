import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EditElementPayload } from '@components/quizzes/quiz-view/quiz-view.component';
import { Form, MultipleChoice, Quiz, QuizElement, QuizElementId, QuizElementItem } from '@dynrec/common';
import { FreeResponse } from '../../../../../../../../common/src/definitions/quiz/FreeResponse.definition';

@Component({
    selector: 'app-quiz-builder',
    templateUrl: './quiz-builder.component.html',
    styleUrls: ['./quiz-builder.component.scss'],
})
export class QuizBuilderComponent {
    @Input() quiz: Quiz;
    @Output() quizChange: EventEmitter<Quiz> = new EventEmitter<Quiz>();

    quizElements: QuizElement[] = [new MultipleChoice(), new FreeResponse()];

    newElementId?: QuizElementId;

    selectedElement?: QuizElementItem;
    selectedIndex?: number;
    selectedConfigForm?: Form;
    isEditFormVisible: boolean = false;
    forceClose: EventEmitter<void> = new EventEmitter<void>();

    handleAddElement() {
        const element = this.quizElements.find(e => e.id === this.newElementId);

        if (!element) {
            return;
        }

        this.selectedElement = {
            elementId: element.id,
            config: element.getInitialState(),
            points: 1,
        };

        this.selectedConfigForm = element.getConfigForm();
        this.isEditFormVisible = true;
        this.selectedIndex = undefined;
    }

    handleSetQuizName(name: Event) {
        this.quiz.name = (name.target as HTMLInputElement).value ?? this.quiz.name;
        this.quizChange.emit(this.quiz);
    }

    handleClose() {
        this.selectedElement = undefined;
        this.selectedConfigForm = undefined;
        this.isEditFormVisible = false;
        this.selectedIndex = undefined;
        this.forceClose.emit();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formSubmitted(config: any) {
        if (this.selectedIndex === undefined) {
            this.quiz.elements.push({
                ...this.selectedElement!,
                config,
            });
        } else {
            this.quiz.elements[this.selectedIndex].config = config;
        }

        this.quizChange.emit(this.quiz);
        this.handleClose();
    }

    handleEditElement(payload: EditElementPayload) {
        const { index, element } = payload;

        const definition = this.quizElements.find(e => e.id === element.elementId);
        if (!definition) {
            return;
        }

        this.selectedElement = element;
        this.selectedIndex = index;
        this.selectedConfigForm = definition.getConfigForm(element.config);
        this.isEditFormVisible = true;

        this.quizChange.emit(this.quiz);
    }

    handleDeleteElement(payload: EditElementPayload) {
        const { index, element } = payload;

        this.quizChange.emit(this.quiz);
    }
}

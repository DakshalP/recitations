import {Component, Input, OnInit} from '@angular/core';
import {Problem} from "@models/problem";
import {ProblemDifficulty} from "@enums/problemDifficulty.enum";
import {User} from '@models/user'
import {animate, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-problem-view',
  templateUrl: './problem-view.component.html',
  styleUrls: ['./problem-view.component.scss'],
  animations: [
    trigger(
      'inOutAnimation',
      [
        transition(
          ':enter',
          [
            style({ height: 0, opacity: 0 }),
            animate('.08s ease-out',
              style({ height: 300, opacity: 1 }))
          ]
        ),
        transition(
          ':leave',
          [
            style({ height: 300, opacity: 1 }),
            animate('.08s ease-in',
              style({ height: 0, opacity: 0 }))
          ]
        )
      ]
    )
  ]
})
export class ProblemViewComponent implements OnInit {

  constructor() {
  }

  isEditProblemModalOpen = false;
  @Input() problem: Problem;
  userFullName: string;
  showSolution = false;
  solutionButtonText = "Show Solution";


  ngOnInit() {
    this.userFullName = User.getFullName(this.problem.creator);
  }



  get problemDifficulty() {
    return ProblemDifficulty;
  }

  handleSolutionButton() {
    this.showSolution = !this.showSolution;
    this.showSolution ? this.solutionButtonText = "Hide Solution" : this.solutionButtonText = "Show Solution";
  }

  handleOpenEditProblemModal() {
    this.isEditProblemModalOpen = true
  }

  handleCloseEditProblemModal() {
    this.isEditProblemModalOpen = false
  }

  getMinuteUnit(estimatedDuration: number) {
    return Problem.getMinuteUnit(estimatedDuration);
  }
}

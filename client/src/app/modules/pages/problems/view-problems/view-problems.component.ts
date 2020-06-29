import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { CourseService } from '@services/course.service';
import { ProblemService } from '@services/problem.service';

import { Course } from '@models/course'
import { Problem } from '@models/problem'

@Component({
  selector: 'app-view-problems',
  templateUrl: './view-problems.component.html',
  styleUrls: ['./view-problems.component.scss']
})
export class ViewProblemsComponent implements OnInit {
  	course: Course
  	problems: Problem[]
  	isLoading: boolean = true

  	selectedEditProblem: Problem = null
  	isEditProblemModalOpen: boolean = false

	constructor(
		private _courseService: CourseService,
		private _problemService: ProblemService,
		private route: ActivatedRoute,
	) { }

	ngOnInit() {
		this.route.params.subscribe(async (params) => {
			if(params['courseID']) {
				this.course = await this._courseService.getCourse(params['courseID'])
				this.problems = await this._problemService.getCourseProblems(this.course)
				this.isLoading = false
			}
		});
	}

	handleOpenNewProblemModal() {
		this.isEditProblemModalOpen = true

		this.selectedEditProblem = new Problem()
		this.selectedEditProblem.course = this.course;
	}
	
	handleCloseEditProblemModal() {
		this.isEditProblemModalOpen = false

		// And now we add the problem if needed
		// We perform a search for if there is a problem with that id already
		const foundProblem = this.problems.find((problem) => {
			if(problem.id == this.selectedEditProblem.id) return true
		})

		// if the problem was found, we already have it in our array, and the data would be updated via the component
		// if it wasn't found, we insert it new.
		if(!foundProblem) this.problems.push(this.selectedEditProblem)

		this.selectedEditProblem = null;
	}

	handleOpenEditProblemModal(problem: Problem) {
		this.isEditProblemModalOpen = true
		this.selectedEditProblem = problem
	}
}
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { Form } from '@models/forms/form'

@Component({
  selector: 'app-form-modal',
  templateUrl: './form-modal.component.html',
  styleUrls: ['./form-modal.component.scss']
})
export class FormModalComponent implements OnInit {

	@Input() form: Form
	@Input() title: string
	@Input() submitText: string
	@Input() showModal: boolean
	@Output() onSubmit: EventEmitter<{}> = new EventEmitter();
	@Output() onClose: EventEmitter<{}> = new EventEmitter();
	@Output() onFieldChange: EventEmitter<{ name: string, value: any }> = new EventEmitter();


	constructor(){}

	ngOnInit(){}

	handleOnSubmit(val) {
		this.onSubmit.emit(val)
	}

	handleOnClose() {
		this.onClose.emit(null)
	}

	handleOnFieldChange(val) {
		this.onFieldChange.emit(val)
	}


}
import {Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: '<form-number-input></form-number-input>',
  templateUrl: './app/assets/scripts/modules/form-controls/form-number-input/form-number-input.component.html',
  styleUrls: ['./app/assets/scripts/modules/form-controls/form-number-input/form-number-input.component.css'],
  inputs: [
    'model',
    'alt',
    'placeholder',
    'name',
    'label'
  ],
  host: {
    '(input)': 'isNum($event.target.value)'
  }
})

export class FormNumberInputComponent {
  @Input() model: number;
  @Output() modelChange = new EventEmitter();

  isNum(value) {

    value = value.replace(/[^0-9.-]/g, '');

    this.modelChange.next(value);
  }
}
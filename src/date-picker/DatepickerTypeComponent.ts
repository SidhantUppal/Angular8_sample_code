import { Component, ViewChild } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { BsDatepickerConfig } from 'ngx-bootstrap';
@Component({
  selector: 'app-form-datepicker-type',
  template: `
    <input
      type="text"
      class="form-control calendar"
      placement="bottom"
      bsDatepicker
      [formControl]="formControl"
      [formlyAttributes]="field"
      #dobDate="bsDatepicker"
     
      placeholder="YYYY-MM-DD"
      [class.is-invalid]="showError">`
  ,
})
export class DatepickerTypeComponent extends FieldType {
  // Optional: only if you want to rely on `MatInput` implementation
  /*bsConfig: Partial<BsDatepickerConfig> = {
    dateInputFormat: 'YYYY-MM-DD',
    showWeekNumbers: false,
    containerClass: 'theme-dark-blue'
  };
  */
}

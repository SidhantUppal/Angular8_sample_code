import { Component, OnInit } from '@angular/core';
 
import { FieldType, FieldArrayType, FormlyFieldConfig } from '@ngx-formly/core';
@Component({
  selector: 'app-formly-template-type',
  templateUrl: './formly-template-type.component.html',
  styleUrls: ['./formly-template-type.component.scss']
})
export class FormlyTemplateTypeComponent extends FieldType {

  mainField: any = null;
  GetText() {
    return (model: any, formState: any, currentField: FormlyFieldConfig) => {
      let val = "";
      if (!currentField.key) {
        if (currentField["text"]) {
          return currentField["text"];
        }
      }
      if (model && currentField.key) {
        if (model[currentField.key]) {
          val = model[currentField.key];
        }
      }

      return val;
    };
  }
  

  onPopulate(field: FormlyFieldConfig) {
    this.mainField = field;
    field.expressionProperties = {

      'templateOptions.template': this.GetText()

    };
   

  }

  ngOnInit() {
    
  }

}

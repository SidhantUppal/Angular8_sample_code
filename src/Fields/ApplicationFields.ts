 
import { FormlyFieldConfig } from "@ngx-formly/core";
import { Guid } from "guid-typescript";
import * as cloneDeep from 'lodash/cloneDeep';




export class ApplicationFields {
  //private FieldType: ApplicationInputs = null;
  //public FieldConfig: FormlyFieldConfig = null;

  
  static FindField(key:string,allFields: FormlyFieldConfig[]) {
    for (let i = 0; i < allFields.length; i++) {
      if (allFields[i].key == key) {
        return allFields[i];
      }
      
      if (allFields[i].fieldGroup != null) {
        let f = ApplicationFields.FindField(key, allFields[i].fieldGroup);
        if (f != null) {
          return f;
        }
      }
      if (allFields[i].fieldArray != null) {
        if (allFields[i].fieldArray.key == key) {
          return allFields[i].fieldArray;
        }
       
      }


    }

    return null;

  }
  static InitializeField(field: FormlyFieldConfig) {
  
    if (!field.key && field.type) {
      if (field.type != "Address"
        && field.type != "template") {
        
        field.key = Guid.create().toString().replace(/-/gi, ""); 
      }
      
    }
     
    if (!field.templateOptions) {
      field.templateOptions = {};
    }
    if (!field.templateOptions.label) {
      field.templateOptions.label = "";
    }
    if (!field.templateOptions.type) {
      field.templateOptions.type = "text";
    }
    if (!field.templateOptions.placeholder) {
      field.templateOptions.placeholder = "Enter " + field.templateOptions.label;
    }
   
  if (!field.validation) {
    field.validation = {};
    }

  if (!field.validation.messages) {
    field.validation.messages = {};
    }
    if (field.templateOptions.required) {
      if (!field.validators) {
        field.validators = {};
      }
      if (!field.validators.validation) {
        field.validators.validation = [];
      }
      field.validators.validation.push("noWhiteSpace");
    }
  if (!field.validation.messages["required"]) {
    field.validation.messages["required"] = 'Please enter ' + field.templateOptions.label;
  }
//ToDo: Remove commeted after testing (moved to app.module)
  // field.validation.messages["existingLoginName"] = 'Login Name already exists';
  // field.validation.messages["existingApplicationRoleName"] = 'Application Role Name already exists';
  // field.validation.messages["confirmPassword"] = 'Passwords do not match';
  // field.validation.messages["existingGLAccountCode"] = 'GL Account Code already already exists';

  }
  static InitializeFields(allFields: FormlyFieldConfig[]) {
    for (let i = 0; i < allFields.length; i++) {
      ApplicationFields.InitializeField(allFields[i]);
      if (allFields[i].fieldGroup != null) {
       
        ApplicationFields.InitializeFields(allFields[i].fieldGroup);
      }
      if (allFields[i].fieldArray != null) {
        ApplicationFields.InitializeField(allFields[i].fieldArray);
      }


    }

    return cloneDeep(allFields);

  }
  /*KeyID: Guid = null;
  constructor(fieldtype: ApplicationInputs) {
    this.KeyID = Guid.create();
    this.FieldType = fieldtype;
    this.Prepare();

  }
  
  public SetExpressions(key: string, expression: any) {
    
    if (this.FieldConfig.expressionProperties == null) {
      this.FieldConfig.expressionProperties = {};
    }
    this.FieldConfig.expressionProperties[key] = expression;
    return this;

  }
  private Prepare() {
    switch (this.FieldType) {
      case ApplicationInputs.Country:
        this.FieldConfig = cloneDeep(CountriesField);
        break;
      case ApplicationInputs.CountryState:
        this.FieldConfig = cloneDeep(AddressStateField);
        break;
      case ApplicationInputs.AddressStreet:
        
        this.FieldConfig = cloneDeep(AddressStreetField);
        break;
      case ApplicationInputs.AddressSuburb:
        this.FieldConfig = cloneDeep(AddressSuburb);
        break;
     
      case ApplicationInputs.AddressPostCode:
        this.FieldConfig = cloneDeep(AddressPostCode);
        break;
      case ApplicationInputs.LoginName:
        this.FieldConfig = cloneDeep(Loginfields.LoginNameField);
        break;
      default:
        throw Error("Field not configured");
    }
    if (!this.FieldConfig.key) {
      this.FieldConfig.key = this.KeyID.toString();
    }
    if (!this.FieldConfig.templateOptions ) {
      this.FieldConfig.templateOptions = {};
    }
    if (!this.FieldConfig.templateOptions.label ) {
      this.FieldConfig.templateOptions.label = "";
    }
    if (!this.FieldConfig.templateOptions.placeholder) {
      this.FieldConfig.templateOptions.placeholder = "Enter " + this.FieldConfig.templateOptions.label;
    }
    if (!this.FieldConfig.validation) {
      this.FieldConfig.validation = {};
    }
    if (!this.FieldConfig.validation.messages) {
      this.FieldConfig.validation.messages = {};
    }
    if (!this.FieldConfig.validation.messages["required"]) {
      this.FieldConfig.validation.messages["required"] = 'Please enter ' + this.FieldConfig.templateOptions.label;
    }
    this.FieldConfig.validation.messages["existingLoginName"] = 'Login Name already exists';
    this.FieldConfig.validation.messages["confirmPassword"] = 'Passwords do not match';
    this.FieldConfig.validation.messages["email"] = 'Email Address is not valid';
    console.log(JSON.stringify(this.FieldConfig));
  }
*/
}

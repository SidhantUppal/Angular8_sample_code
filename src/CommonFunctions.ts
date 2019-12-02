import * as cloneDeep from 'lodash/cloneDeep';
import { FormGroup, ValidatorFn, AbstractControl, AsyncValidatorFn, ValidationErrors, FormControl, NgModel, FormArray } from '@angular/forms';
import * as AppEnums from "@src/app/AppEnums";
import { DataService } from './data.service';
import { Observable, of, Subject } from 'rxjs';
import { map, delay, switchMap, takeUntil, tap } from 'rxjs/operators';
import * as moment_ from 'moment-mini';

const moment = moment_;
 
export function FormatDates(data) {
  if (data != null) {
    Object.keys(data).forEach(key => {
      if (data[key] != null) {

        let dt = data[key];
        if (typeof dt === "object") {
          dt=FormatDates(dt);
        } else {
          if (key.toLowerCase().endsWith("epoch")) {


            if (dt.indexOf("/Date(") == 0 && dt.endsWith(")/")) {
              try {

                dt = dt.substring(6);
                dt = dt.substring(0, dt.length - 2);
                dt = new Date(parseInt(dt));
                dt=  moment(dt).format('YYYY-MM-DD');
              } catch (e) {

              }


            }

          } else {
            if (typeof dt === "string") {
              if (dt.indexOf("T") > 0 && dt.indexOf(":") > 0) {
                const isDateValid = moment(dt).isValid();
                data[key] = isDateValid ? moment(new Date(dt)).format('YYYY-MM-DD'): dt;
              }

            }

          }
        }
       

      }
     


    });
  }
  return data;
}

export function GetDateValue(value) {
  if (value == null || value == "") {
    return value;
  }
  const isDateValid = moment(value).isValid();
  return (value && isDateValid) ? new Date(value) : value;
}
export function FixDateFields(data) {

  if (data != null) {
    Object.keys(data).forEach(key => {

      if (data[key] != null) {
        if (typeof data[key] === "object") {
          if (typeof data[key].getMonth === 'function') {
            data[key] = FixDateField(data[key]);
          } else {
            data[key] = FixDateFields(data[key]);
          }
          
        } else {
          console.log(key);
          console.log(data[key]);
          console.log(typeof data[key]);
          data[key] = FixDateField(data[key]);
        }
     
        
      }


    });
  }
  return data;
}
export function FixDateField(data) {
  if (data != null) {
    if (typeof data.getMonth === 'function') {
      data = moment(data).format("DD-MMM-YYYY");
    }
  }
  return data;
}

export function GetMonthYear(data) {
  if (!data) {
    return data;
  }
  let momentDate = moment(data);
   
  const isDateValid = momentDate.isValid();
  return isDateValid ? momentDate.format('YYYY-MM') : data;
  
}

export function MoveArrayItem(arr, old_index, new_index) {
  if (new_index >= arr.length) {
    var k = new_index - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  return arr;
};
export function findInvalidControlsRecursive(formToInvestigate: FormGroup | FormArray): string[] {
  var invalidControls: string[] = [];
  let recursiveFunc = (form: FormGroup | FormArray) => {
    Object.keys(form.controls).forEach(field => {
      const control = form.get(field);
      if (control.invalid) {
        invalidControls.push(field);
      }
      if (control instanceof FormGroup) {
        recursiveFunc(control);
      } else if (control instanceof FormArray) {
        recursiveFunc(control);
      }
    });
  }
  recursiveFunc(formToInvestigate);
  return invalidControls;
}
export function InvalidateRequiredFields(form) {
  Object.keys(form.controls).forEach(key => {
    if (form.get(key) instanceof FormGroup) {
      InvalidateRequiredFields(form.get(key));

    } else {
      if (form.get(key).validator != null) {
        form.get(key).markAsDirty();
        form.get(key).markAsTouched();
        form.get(key).updateValueAndValidity();
        //form.get(key).markAsUntouched();
        //form.get(key).markAsPristine();
      }
    }


  });
  // form.markAsPristine();
  //form.markAsUntouched();
}
export function GetMasterGridConfig(containedInID) {
  return cloneDeep({
    autoResize: {
      containerId: containedInID,
    },
    enableAutoResize: true,       // true by default
    enableGridMenu: false,
    enableCellNavigation: true,
    multiColumnSort: false,
    enableColumnReorder: false,
    rowHeight: 50,
    headerRowHeight: 50,
    enableColumnPicker: false,
    enableHeaderMenu: false,
    enableHeaderButton: false,
    enableCheckboxSelector: false,

    enableRowSelection: true,

    rowSelectionOptions: {
      // True (Single Selection), False (Multiple Selections)
      selectActiveRow: false
    }

  }
  );
}
export function GetAutoTextValues(val, autoTextType: AppEnums.AutoTextTypes = null) {
 
  let fieldName = "dataOptionID";
  if (autoTextType != null) {
    switch (autoTextType) {
      case AppEnums.AutoTextTypes.ApplicationRole:
        fieldName = "applicationRoleID";
        break;
      case AppEnums.AutoTextTypes.AccountType:
        fieldName = "gLAccountTypeID";
        break;
      case AppEnums.AutoTextTypes.BusinessEntity:
      case AppEnums.AutoTextTypes.BusinessDivision:
      case AppEnums.AutoTextTypes.BusinessArea:
      case AppEnums.AutoTextTypes.Home:
      case AppEnums.AutoTextTypes.Clients:
        fieldName = "id";
        break;
      case AppEnums.AutoTextTypes.BSB:
        fieldName = "bSBDetailID";
        break;


    }
  }

  return GetAutoTextValueByField(val,fieldName);
  //return currentValue;

}



export function GetAutoTextValue(val) {
  if (!val) {
    return val;
  }
  if (typeof val === "string" || typeof val === "number") {
    return val.toString();

  }
 
  
  let currentValue = "";
  let allValues = [];

  if (Array.isArray(val)) {
    for (let i = 0; i < val.length; i++) {
      if (!val[i]["id"]) {
        continue;
      }
      if (currentValue != "") {
        currentValue = currentValue + ",";
      }
      currentValue = currentValue + val[i]["id"].toString();

    }

  }
  return currentValue;

}


export function GetAutoTextValueByField(val,fieldName ) {
  if (!val) {
    return val;
  }
  if (typeof val === "string" || typeof val === "number") {
    return val.toString();

  }
 
  
  let currentValue = "";
  let allValues = [];

  if (Array.isArray(val)) {
    for (let i = 0; i < val.length; i++) {
      if (!val[i][fieldName]) {
        continue;
      }
      if (currentValue != "") {
        currentValue = currentValue + ",";
      }
      currentValue = currentValue + val[i][fieldName].toString();

    }

  }
  return currentValue;

}

export function SetAutoTextValues(val, fieldName) {
  if (!val) {
    return val;
  }
  if (typeof val === "string" || typeof val === "number") {
    return val.toString();

  }
  let currentValue = "";
  let allValues = [];


  if (Array.isArray(val)) {
    for (let i = 0; i < val.length; i++) {
      if (!val[i][fieldName]) {
        continue;
      }
      if (allValues.find(x => x == val[i][fieldName].toString()) != null) {
        continue;
      }
      if (currentValue != "") {
        currentValue = currentValue + ",";
      }

      currentValue = currentValue + val[i][fieldName].toString();
      allValues.push(val[i][fieldName].toString());

    }

  }
  return currentValue;

}

export function gLAccountCodeValidator(dataService: DataService, model : any): AsyncValidatorFn {
  return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {

    return of(null)
      .pipe(delay(500), switchMap(() => {
        const isWhitespace = (control.value || '').toString().trim().length === 0;
        if (isWhitespace || !model) {
          return null;
        }
        return dataService.ValidateGLAccountCode(control.value, model.gLAccountID).
          map(duplicateCounts => {
            if (duplicateCounts != null) {
              return { 'existingGLAccountCode': true };
            }
            return null;
          },
          );
      }));
  };
}

export function gLAccountTypeAndEntityTypeValidator(dataService: DataService, model: any, accountID : number): AsyncValidatorFn {
  return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {

    return of(null)
      .pipe(delay(500), switchMap(() => {
        if(!model || !model.gLAccountTypeID || model.gLAccountTypeID.length == 0 || !(Array.isArray(model.gLEntityID)) || model.gLEntityID.length == 0) {
          return null;
        }        
        
        return dataService.ValidateGLAccountAndEntityType(model.gLAccountTypeID[0].gLAccountTypeID, GetAutoTextValueByField(model.gLEntityID, "gLEntityID"), accountID).
          map(duplicateCounts => {
            if (duplicateCounts != null) {
              return { 'existingGLAccount': true };
            }
            return null;
          },
          );
      }));
  };
}
export function twoDecimal(chgVar) {
  if (!chgVar) {
    return 0.00;
  }
  var twoDec = chgVar.toFixed(2);
  return twoDec;
}
export function bankAccountValidator(dataService: DataService, model: any,currentControlName): AsyncValidatorFn {
  return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {

    return of(null)
      .pipe(delay(500), switchMap(() => {
        
        if(!model 
          || !model
          || !model.bankAccount 
          || !model.bankAccount.bSBDetailID 
          || !(Array.isArray(model.bankAccount.bSBDetailID)) 
          || model.bankAccount.bSBDetailID.length == 0 
          || !model.bankAccount.accountNumber
          || (model.bankAccount.accountNumber || "").toString().trim().length === 0) {
          return of(null);
        }
        
        let bSBDetailID = GetAutoTextValueByField(model.bankAccount.bSBDetailID, "bSBDetailID");
        const isBSBEmpty = (bSBDetailID || "").toString().trim().length === 0; 
        if(isBSBEmpty) {          
          return of(null);
        }
        
        return dataService.ValidateBankAccount(bSBDetailID, model.bankAccount.accountNumber, model.bankAccount.bankAccountID).
          map(duplicateCounts => {
            if (duplicateCounts != null) {
              return { 'existingBankAccount': true };
            }
            if (currentControlName == "bSBDetailID") {
              if (control.parent.controls["accountNumber"].invalid
                || control.parent.controls["accountNumber"].status == "PENDING") {
                control.parent.controls["accountNumber"].updateValueAndValidity();
              }
            } else {
              if (control.parent.controls["bSBDetailID"].invalid
                || control.parent.controls["bSBDetailID"].status == "PENDING") {
                control.parent.controls["bSBDetailID"].updateValueAndValidity();
              }
            }
            
             
            return null;
          }
          );
      }));
  };
}

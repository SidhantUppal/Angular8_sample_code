import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as cloneDeep from 'lodash/cloneDeep';
import { AsyncValidatorFn, ValidatorFn, AbstractControl, ValidationErrors, FormGroup, FormControl, Validators, FormArray } from "@angular/forms";
import { AngularEditorConfig } from '@kolkov/angular-editor';
import * as moment_ from 'moment-mini';
const moment = moment_;
import { ConfirmationMessageComponent } from './confirmation-message/confirmation-message.component';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/switchMap';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Subject, Observable, of, concat } from 'rxjs';
import { mapTo, delay, debounceTime, switchMap } from 'rxjs/operators';
import { CustomAuthenticationService } from './custom-authentication.service'; 
import * as Dataservice from "./data.service";
import * as MobileComponentLibrary from "@src/app/mobileComponentLibrary";
import * as WebComponentLibrary from "@src/app/webComponentLibrary";
import { environment} from "@src/environments/environment";
import * as Breadcrumb from "@src/app/breadcrumb";
import * as CurrentAppRoutes from "@src/app/CurrentAppRoutes";
import { GetCurrentRoutes } from './CurrentAppRoutes';
import * as AppRoutes from "@src/app/CurrentAppRoutes";
export const GlobalSettings = {
  
  IsLoggedIn: false,
  CurrentUser: null,
  MustChangePassword: false,
  ForceChangePassword: false,
  
  SystemConfigs: null,
  IsAdminUser: false,
  IsCFMUser: false,
  IsMobileApp:false
}

export function noWhitespaceValidator(control: FormControl) {

  const isWhitespace = (control.value || '').toString().trim().length === 0;
  const isValid = !isWhitespace;
  return isValid ? null : { 'required': true };
}
export class CustomFunctions {
  static AllowedRoutes() {
    let routes = GetCurrentRoutes();
     
    let AllowedItems = [];
    for (let i = 0; i < routes.length; i++) {

      if (routes[i].path != '' && routes[i].path.toLowerCase() != 'login'
        && routes[i].path.toLowerCase().indexOf("/") <= 0
      ) {
        let allowed = false;
        if (routes[i].data == null) {
          allowed = true;
        } else {
          allowed = CustomFunctions.IsInRole(routes[i].data["Roles"]);
        }
        if (environment.production && allowed) {


          if (routes[i].data != undefined) {
            if (routes[i].data["IsProductionReady"] != null) {
              allowed = routes[i].data["IsProductionReady"];
            }
          }
        }
        if (allowed) {
          let bc = new Breadcrumb.BreadCrumb();
          bc.label = "";
          if (routes[i].data != undefined) {
            if (routes[i].data["BreadCrumbName"] != undefined) {
              bc.label = routes[i].data["BreadCrumbName"];
            }

            if (routes[i].data["Icon"] != null) {
              bc.icon = routes[i].data["Icon"];
            }

          }
          if (bc.label == "") {
            bc.label = routes[i].path;
          }
          bc.url = routes[i].path;
          AllowedItems.push(bc);

        }
      }
    }
    return AllowedItems;
  }
  static CheckAccess(route: ActivatedRouteSnapshot) {
    return CustomFunctions.IsInRole(route.data["Roles"]);


  }
  static user = null;
  static async   canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot, authService: CustomAuthenticationService, router: Router) {
    
    if (GlobalSettings.IsLoggedIn) {
      //return true;
      if (this.CheckAccess(route)) {
        return true;
      }

    }
    this.user = <any>await authService.CheckUser();
    
    if (GlobalSettings.IsLoggedIn) {
      //return true;
      if (this.CheckAccess(route)) {
        return true;
      }
    }

    authService.logout();
    // not logged in so redirect to login page with the return url
    router.navigate(['/Login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
  static IsInRole(roles) {
    if (roles == undefined || roles == null || roles == "") {
      return true;
    }

    if (GlobalSettings.CurrentUser != null && GlobalSettings.CurrentUser.roles != null) {
      let allRoles = GlobalSettings.CurrentUser.roles.split(',');
      for (let i = 0; i < roles.length; i++) {

        for (var j = 0; j < allRoles.length; j++) {
          if (allRoles[j] == roles[i]) {
            return true;
          }
        }
      }
    }
    return false;
  }
  static FixDateFields(data) {
    if (data != null) {
      Object.keys(data).forEach(key => {
         
        if (data[key] != null) {
         
          if (typeof data[key].getMonth === 'function') {
             
            data[key] = moment(data[key]).format("DD-MMM-YYYY");
          } else {
            if (data[key].toString().indexOf("T") > 0 && data[key].toString().indexOf(":") > 0) {
              if (moment(data[key]).isValid()) {
                
                data[key] = moment(data[key]).toDate();
              }
              
            }
            //const isDateValid = moment(control.value).isValid();
          }
        }


      });
    }
    return data;
  }
  static FireConfirmation(validationMessage,DeactivationHandler: any, modalService: NgbModal ) {
    DeactivationHandler = new Subject<boolean>();
    const modalRef = modalService.open(ConfirmationMessageComponent,
      { centered: true, keyboard: false, size: 'lg' });
    modalRef.componentInstance.MiddleMessage = validationMessage;
    let FooterButtons = [];
    let btn = {};
    btn["Text"] = "Ok";
    btn["css"] = "btn-primary";


    let btn2 = {};
    btn2["Text"] = "Cancel";
    btn2["css"] = "btn-secondary";
    FooterButtons.push(btn2);
    modalRef.componentInstance.title = "User Confirmation";
    FooterButtons.push(btn);
    modalRef.componentInstance.FooterButtons = FooterButtons;
    modalRef.result.then((result) => {
      //console.log(result);
      if (result != null) {
        if (result.Text == "Ok") {

          DeactivationHandler.next(true);
          DeactivationHandler.complete();
          return;
        }

      }
      DeactivationHandler.next(false);
      DeactivationHandler.complete();
    });
    return DeactivationHandler.asObservable();
  }
  static InvalidateRequiredFields(form) {
    if (form == null) {
      return;
    }
    Object.keys(form.controls).forEach(key => {
      if (form.get(key).validator != null) {
        form.get(key).markAsDirty();
        form.get(key).markAsTouched();
        form.get(key).updateValueAndValidity();
        //form.get(key).markAsUntouched();
        //form.get(key).markAsPristine();
      }

    });
    // form.markAsPristine();
    //form.markAsUntouched();
  }
  static GetDate(value) {
    if (value == null || value == "") {
      return value;
    }
    const isDateValid = moment(value).isValid();
    return (value && isDateValid) ? moment(value).format("DD-MMM-YYYY") : value;
  }

  static GetUserInactiveLoginCheckInDays() {

    let userActiveCheckConfig = GlobalSettings.SystemConfigs.find(x => x.code == "UserInactiveLoginCheckInDays");  
    if(userActiveCheckConfig != null) {
      return userActiveCheckConfig.value;
    } else {
      return 30;
    }    
  }

  static GetBudgetCategoryTypeDataOptionTypeID() {

    let userActiveCheckConfig = GlobalSettings.SystemConfigs.find(x => x.code == "DataOption_BudgetCategoryType");
    if (userActiveCheckConfig != null) {
      return userActiveCheckConfig.value;
    } else {
      return -1;
    }
  }
   
}

export function CustomAmountOrPercentageValidator(IsAmount:boolean): ValidatorFn {
  return (control: AbstractControl): { [key: string]: string } | null => {

    if (control.parent == undefined) {
      return null;
    }
    let otherControl = control.parent.controls["appliedPercentage"];
    if (!IsAmount) {
      otherControl = control.parent.controls["appliedAmount"];
    }

    if (control.value == null || control.value == "") {
      if (otherControl.value == null || otherControl.value == "") {
        return { 'AmountPerError': "Applied $ Or Applied % required" };
      }
      return null;
    }
   return null;
  };
}


export function CustomTierRangeValidator(allTiers:any[]): ValidatorFn {
  return (control: AbstractControl): { [key: string]: string } | null => {

    if (control.parent == undefined) {
      return null;
    }
    if (control.value == null || control.value == "") {
      return null;
    }
    
    return null;
    //return { 'StartEndError': "Overlapping" };
    /*
    if (control.value == null || control.value == "") {
      if (otherControl.value == null || otherControl.value == "") {
        return { 'AmountPerError': "Amount Or Percentage required" };
      }
      return null;
    }
    return null;
    */
  };
}

export class FormDirtyCheck {
  OriginalObject: any = null;
  CurrentFormGroup: FormGroup = null;
  constructor(formGroup, data) {
    this.OriginalObject = cloneDeep(data);
    this.CurrentFormGroup = formGroup;
  }
  ResetData() {
    Object.keys(this.CurrentFormGroup.controls).forEach(key => {
      this.OriginalObject[key] = this.CurrentFormGroup.get(key).value;
    });
  }
  IsDirty() {
    let isDirty = false;
    Object.keys(this.CurrentFormGroup.controls).forEach(key => {
      if (this.OriginalObject[key] != this.CurrentFormGroup.get(key).value && !isDirty) {
        isDirty = true;
        if (this.OriginalObject[key] != null && this.CurrentFormGroup.get(key).value != null) {
          isDirty = this.OriginalObject[key].toString() != this.CurrentFormGroup.get(key).value.toString();
        }
        if (isDirty) {
          console.log(key);
          console.log(this.OriginalObject[key]);
          console.log(this.CurrentFormGroup.get(key).value);
        }
        

      }
      
      
    });
    return isDirty;
  }
}

export class SystemConfig {  
  static GetMasterGridConfig(containedInID) {
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
}
 


export const WysiWygConfig: AngularEditorConfig = {
  editable: true,
  spellcheck: true,
  height: '25rem',
  minHeight: '5rem',
  placeholder: 'Enter text here...',
  translate: 'no'
};

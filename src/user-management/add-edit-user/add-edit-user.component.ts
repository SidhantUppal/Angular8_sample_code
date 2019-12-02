import { Component, OnInit, Input, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, ValidatorFn, AbstractControl, AsyncValidatorFn, ValidationErrors, FormControl, NgModel, FormArray } from '@angular/forms';
import { FormlyField, FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { ToastrService } from 'ngx-toastr';
import { DataService } from 'src/app/data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of, Subject } from 'rxjs';
import { map, delay, switchMap, takeUntil, tap } from 'rxjs/operators';
import { FormConfig } from 'src/app/form-config';
import { Address } from 'src/app/address/address';

import * as cloneDeep from 'lodash/cloneDeep';
import { TabsetComponent, TabDirective } from 'ngx-bootstrap/tabs';
import * as AppEnums from "@src/app/AppEnums";
import { FormDirtyChecker } from "@src/app/FormDirtyChecker";
import * as CommonFunctions from "@src/app/CommonFunctions";
import * as ApplicationFields from "@src/app/Fields/ApplicationFields";
import tabonefields from './tabonefields.json';
import tabtwofields from './tabtwofields.json';

export function ConfirmPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {

    if (control.parent == undefined) {
      return null;
    }
    let otherControl = control.parent.controls["password"];


    if (control != null && otherControl != null && otherControl != undefined && control.value != otherControl.value) {
      return { 'passwordsNotMatching': true };
    }
    return null;
  };
}


export function loginNameValidator(dataService: DataService, ApplicationUserID: number): AsyncValidatorFn {
  return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {

    return of(null)
      .pipe(delay(500), switchMap(() => {
        const isWhitespace = (control.value || '').toString().trim().length === 0;
        if (isWhitespace) {
          return null;
        }
        return dataService.ValidateLoginName(control.value, ApplicationUserID).
          map(duplicateCounts => {
            if (duplicateCounts != null) {
              return { 'existingLoginName': true };
            }
            //return null;
            return null;
          },
          );
      }));
  };
}

export interface TabType {
  heading: string;
  fields: FormlyFieldConfig[];
}

@Component({
  selector: 'app-add-edit-user',
  templateUrl: './add-edit-user.component.html',
  styleUrls: ['./add-edit-user.component.scss']
})
export class AddEditUserComponent implements OnInit {
  ErrorMessage: string = "";
  onDestroy$ = new Subject<void>();
  private _isAdd: boolean;
  private _forFinAdmin: boolean = false;
  private _finAdminId: number = 0;
  private _isOrg: boolean = false;

  @Input('IsAdd')
  get IsAdd() {
    return this._isAdd
  }
  set IsAdd(value: boolean) {
    this._isAdd = value;
  }

  @Input('ForFinAdmin')
  get ForFinAdmin() {
    return this._forFinAdmin
  }
  set ForFinAdmin(value: boolean) {
    this._forFinAdmin = value;
  }

  @Input('FinAdminId')
  get FinAdminId() {
    return this._finAdminId
  }
  set FinAdminId(value: number) {
    this._finAdminId = value;
  }

  @Input('IsOrg')
  get IsOrg() {
    return this._isOrg
  }
  set IsOrg(value: boolean) {
    this._isOrg = value;
  }
  

  public _CurrentData: any;
  @Input('CurrentData')

  public get CurrentData() {
    return this._CurrentData;
  }
  public set CurrentData(value: any) {
    this._CurrentData = value;
  }

  @ViewChild('tabset', { static: false }) tabset: TabsetComponent;

  applicationUserID: any;
  public SelectedBusinessEntities: any = [];
  public SelectedBusinessDivisions: any = [];
  public SelectedAreas: any = [];
  public SelectedHomes: any = [];
  public SelectedClients: any = [];
  public formGroup: FormArray;
  public formModel: any = {};
  //public formFields: FormlyFieldConfig[];
  public tabs: TabType[] = [];
  public options: FormlyFormOptions[];

  public title: string = "";
  public userDataLoaded: boolean = false;
  constructor(private toastr: ToastrService, private dataService: DataService, public activeModal: NgbActiveModal) {

  }

  GotoTab(id) {
    this.tabset.tabs[id].active = true;
  }
  dirtyChecker: any = null;
  GetApplicationRole() {
    if (this.formModel.applicationRoleID != null) {
      if (this.formModel.applicationRoleID.length > 0) {
        return this.formModel.applicationRoleID[0];
      }
    }
    return null;
  }
  CheckExternalUser() {
    return (model: any, formState: any, currentField: FormlyFieldConfig) => {
      let appRole = this.GetApplicationRole();
      if (appRole != null) {
        return appRole.systemRoleTypeID == AppEnums.SystemRoleType.ExternalUsers.valueOf();

      }
      return false;
    };
  }

  CheckFinancialAdministrator() {
    return (model: any, formState: any, currentField: FormlyFieldConfig) => {
      let appRole = this.GetApplicationRole();
      if (appRole != null) {
        return appRole.systemRoleID ==
          AppEnums.SystemRole.FinancialAdministrator.valueOf();

      }
      return false;
    };
  }

  CheckIsAdminRole() {
    return (model: any, formState: any, currentField: FormlyFieldConfig) => {
      let appRole = this.GetApplicationRole();
      if (appRole != null) {
        return appRole.systemRoleID ==
          AppEnums.SystemRole.CFMAdmin.valueOf();

      }
      return false;
    };
  }
  PrepareUI() {

    if(!this._forFinAdmin || this._isOrg){
      this.tabs = [
        {
          heading: 'User Details',
          fields: []
        },
        {
          heading: 'Data Access',
          fields: [
  
          ]
        }
      ];
    }
    else{
      this.formModel.applicationRoleID = AppEnums.SystemRole.FinancialAdministrator.valueOf();
      this.tabs = [
        {
          heading: 'User Details',
          fields: []
        }
      ]
    }
    

    let currentTabFields = ApplicationFields.ApplicationFields.InitializeFields(tabonefields);


    ApplicationFields.ApplicationFields.FindField("loginName", currentTabFields).asyncValidators = {
      validation: [loginNameValidator(this.dataService, this.applicationUserID)]
    }
    ApplicationFields.ApplicationFields.FindField("sendPasswordReset", currentTabFields).templateOptions.onClick = ($event) => {
      this.dataService.ResetPassword(this.CurrentData.loginName, this.CurrentData.applicationUserID)
        .subscribe(result => {
          this.ErrorMessage = "Password Reset Email has been sent to the user";
        });
    }
    
    ApplicationFields.ApplicationFields.FindField("confirmPassword", currentTabFields).validators = {
      fieldMatch: {
        expression: (control) => control.value === this.formModel.password,
        message: 'Passwords do not match',
      },
    }
    ApplicationFields.ApplicationFields.FindField("confirmPassword", currentTabFields).expressionProperties = {
      'templateOptions.disabled': () => !this.formModel.password
    };
    ApplicationFields.ApplicationFields.FindField("physicalAddress", currentTabFields).expressionProperties = {
      'templateOptions.required': this.CheckExternalUser()
    };
    ApplicationFields.ApplicationFields.FindField("statementDeliveryOptionID", currentTabFields).expressionProperties = {
      'templateOptions.required': this.CheckFinancialAdministrator()
    };

    ApplicationFields.ApplicationFields.FindField("postalAddress", currentTabFields).expressionProperties = {
      'templateOptions.disabled': () => this.formModel.sameAsPhysicalAddress,
      'templateOptions.required': this.CheckExternalUser()
    };
    this.tabs[0].fields = currentTabFields;

    let currentTabTwoFields = ApplicationFields.ApplicationFields.InitializeFields(tabtwofields);

    ApplicationFields.ApplicationFields.FindField("access", currentTabTwoFields).expressionProperties = {
      'templateOptions.externalUser': this.CheckExternalUser(),
      'templateOptions.isAdmin': this.CheckIsAdminRole()
    };

    ApplicationFields.ApplicationFields.FindField("access", currentTabTwoFields).hideExpression = this.HideDataAccessFields();
    if(!this._forFinAdmin || this._isOrg )
    {
      this.tabs[1].fields = currentTabTwoFields;
    }

    if(this._isOrg){      
      this.setApplicationRoleAutoText(currentTabTwoFields)
    }



    this.formGroup = new FormArray(this.tabs.map(() => new FormGroup({})));

    this.options = this.tabs.map(() => <FormlyFormOptions>{});
    this.dirtyChecker = new FormDirtyChecker(this.formModel);
    setTimeout(() => CommonFunctions.InvalidateRequiredFields(this.formGroup));
    
    this.UIReady = true;
  }

  setApplicationRoleAutoText(currentTabTwoFields){
    ApplicationFields.ApplicationFields.FindField("applicationRoleID", currentTabTwoFields).expressionProperties = {       
      'templateOptions.autoTextCode': (model: any, formState: any, field: FormlyFieldConfig) => {       
          return AppEnums.AutoTextTypes.FinancialAdminApplicationRole;        
      }
    };
  }


  UIReady: boolean = false;
  ngOnInit() {  

    this.formModel = {
      loginName: '',
      email: '',
      password: '',
      confirmPassword: '',
      mustChangePassword: false,
      resetPassword: false,
      firstName: '',
      lastName: '',
      mobile: '',
      workNo: '',
      isActive: true,
      isAdd: this.IsAdd,
      physicalAddress: {},
      postalAddress: {},
      sameAsPhysicalAddress: false,
      access: {},
      showErrorState: true,
      applicationRoleID: '',
      statementDeliveryOptionID: ''
    };
    if (this.IsAdd) {
      this.title = "Add User";
      this.userDataLoaded = true;
      this.applicationUserID = 0;
      this.PrepareUI();



    } else {
      this.applicationUserID = this.CurrentData.applicationUserID;
      this.title = "Edit User - " + this.CurrentData.loginName;
      this.dataService.GetUserDetails(this.CurrentData.applicationUserID).subscribe(result => {
        this.formModel = result[0].Data[0];
        this.formModel.isAdd = false;
        this.formModel.showErrorState = true;
        this.formModel.sameAsPhysicalAddress = result[0].Data[0].sameAsPhysicalAddress;
        if (result[1].Data.length > 0) {
          this.formModel.physicalAddress = result[1].Data[0];
        } else {
          this.formModel.physicalAddress = {};
        }
        if (this.formModel.sameAsPhysicalAddress) {
          this.formModel.postalAddress = cloneDeep(this.formModel.physicalAddress);
        } else {


          if (result[2].Data.length > 0) {
            this.formModel.postalAddress = result[2].Data[0];
          } else {
            this.formModel.postalAddress = {};
          }
        }

        this.formModel.access = {};
        this.formModel.access.businessEntityIDs = CommonFunctions.SetAutoTextValues(result[3].Data, "businessEntityID");
        this.formModel.access.businessDivisionIDs = CommonFunctions.SetAutoTextValues(result[3].Data, "businessDivisionID");
        this.formModel.access.businessAreaIDs = CommonFunctions.SetAutoTextValues(result[3].Data, "businessAreaID");
        this.formModel.access.houseIDs = CommonFunctions.SetAutoTextValues(result[3].Data, "homeID");
        this.formModel.access.clientIDs = CommonFunctions.SetAutoTextValues(result[3].Data, "clientID");

        //this.isSystemRole = result[0].Data[0].isSystemRole;

        //user["applicationRoleID"] = CommonFunctions.GetAutoTextValues(this.formModel.applicationRoleID, AppEnums.AutoTextTypes.ApplicationRole);        
        this.PrepareUI();
      });
      // Get the user data from the data Service and set the form Model 

    }

   

    // this.formGroup = new FormGroup({});      


  }

  CheckRequired() {
    return (model: any, formState: any, currentField: FormlyFieldConfig) => {
       
      return true;
    };
  }

  isSystemRole: boolean = false;
  isExternalUserRole: boolean = false;
  isCFMAdmin: boolean = false;
  HideDataAccessFields() {
    return (model: any, formState: any, currentField: FormlyFieldConfig) => {
      return this.isCFMAdmin || !this.isSystemRole || this.isExternalUserRole; 
    };
  }

  ngAfterViewInit() {

  }

  changeModel(e) {
    let allChanges = [];
    if (this.dirtyChecker != null) {
      allChanges = this.dirtyChecker.GetChanges(this.formModel);
    }
    if (this.formModel.sameAsPhysicalAddress &&
      (allChanges.find(x => x.key == "physicalAddress") != null
        || allChanges.find(x => x.key == "sameAsPhysicalAddress") != null)) {
      let postalAddressControl = this.formGroup.controls[0].get("postalAddress");
      if (postalAddressControl != null) {
        if (this.formModel.physicalAddress != null) {

          postalAddressControl.setValue({
            "street": this.formModel.physicalAddress.street ? this.formModel.physicalAddress.street : "",
            "suburb": this.formModel.physicalAddress.suburb ? this.formModel.physicalAddress.suburb : "",
            "stateID": this.formModel.physicalAddress.stateID ? this.formModel.physicalAddress.stateID : null,
            "countryID": this.formModel.physicalAddress.countryID ? this.formModel.physicalAddress.countryID : null,
            "postCode": this.formModel.physicalAddress.postCode ? this.formModel.physicalAddress.postCode : ""
          }
          );
        } else {
          postalAddressControl.setValue(null);
        }
      }
    }

    let applicationRole = allChanges.find(x => x.key == "applicationRoleID");
    
    if(applicationRole) {
      if (applicationRole != null && applicationRole.val.length > 0) {      
        this.isSystemRole = applicationRole.val[0].isSystemRole;
        this.isExternalUserRole = applicationRole.val[0].systemRoleTypeID == AppEnums.SystemRoleType.ExternalUsers;
        this.isCFMAdmin = applicationRole.val[0].systemRoleID == AppEnums.SystemRole.CFMAdmin;
    } else {
        let formGroup = <FormGroup>this.formGroup.at(1);
        let accessControl = formGroup.get("access");        
        if(accessControl) {
          accessControl.setValue({
            "businessEntityIDs": null,
            "businessDivisionIDs": null,
            "businessAreaIDs": null,
            "houseIDs": null
            //,"clientIDs" : null
          });
        }
      }
    }        
  }

  Save() {
    console.log(this.formModel);

    if (!this.formGroup.valid) {
      let invalidControls = CommonFunctions.findInvalidControlsRecursive(this.formGroup);

      if (invalidControls.find(x => x == "0") == null) {

        this.GotoTab(1);
      } else {
        this.GotoTab(0);
      }
      this.toastr.error('', "Please fix highlighted errors");
      return;
    }

    let user = {
      "loginName": this.formModel.loginName,
      "emailAddress": this.formModel.emailAddress,
      "mustChangePassword": this.formModel.mustChangePassword,
      "password": this.formModel.password,
      "firstName": this.formModel.firstName,
      "lastName": this.formModel.lastName,
      "isActive": this.formModel.isActive,
      "mobilePhone": this.formModel.mobilePhone,
      "workPhone": this.formModel.workPhone,
      "applicationUserID": this.applicationUserID,
      "SameAsPhysicalAddress": this.formModel.sameAsPhysicalAddress
    }

    let physicalAddress = this.GetAddress(this.formModel.physicalAddress);

    user["applicationRoleID"] = CommonFunctions.GetAutoTextValues(this.formModel.applicationRoleID, AppEnums.AutoTextTypes.ApplicationRole);
    user["statementDeliveryOptionID"] = CommonFunctions.GetAutoTextValues(this.formModel.statementDeliveryOptionID, AppEnums.AutoTextTypes.StatementDeliveryOption);

    let postalAddress = this.GetAddress(this.formModel.postalAddress);

    if (this.formModel.access) {
      this.formModel.businessEntityIDs = CommonFunctions.GetAutoTextValues(this.formModel.access.businessEntityIDs, AppEnums.AutoTextTypes.BusinessEntity);
      this.formModel.businessDivisionIDs = CommonFunctions.GetAutoTextValues(this.formModel.access.businessDivisionIDs, AppEnums.AutoTextTypes.BusinessDivision);
      this.formModel.businessAreaIDs = CommonFunctions.GetAutoTextValues(this.formModel.access.businessAreaIDs, AppEnums.AutoTextTypes.BusinessArea);
      this.formModel.houseIDs = CommonFunctions.GetAutoTextValues(this.formModel.access.houseIDs, AppEnums.AutoTextTypes.Home);
      // this.formModel.clientIDs = CommonFunctions.GetAutoTextValues(this.formModel.access.clientIDs, AppEnums.AutoTextTypes.Clients);


    }
    console.log(this.formModel);

    this.dataService.SaveUser({
      "isFinAdmin": this._forFinAdmin,
      "finAdminId": this._finAdminId,
      "User": user,
      "IsResettingPassword": this.formModel.resetPassword,
      "PhysicalAddress": physicalAddress,
      "PostalAddress": postalAddress,
      "BusinessEntitieIDs": this.formModel.businessEntityIDs,
      "BusinessDivisionIDs": this.formModel.businessDivisionIDs,
      "BusinessAreaIDs": this.formModel.businessAreaIDs,
      "HomeIDs": this.formModel.houseIDs,
      // "ClientIDs": this.formModel.clientIDs
    }).subscribe(result => {         
      this.activeModal.close(result);
    });

    // if(this._forFinAdmin)
    //   {
    //     this.dataService.SaveFinAdministrator({
    //       "name": this.formModel.firstName,
    //       "isOrganisatioin": false,
    //       "email": this.formModel.emailAddress,
    //       "addressId": result.physicalAddressID
  
    //     }).subscribe(result=>{
            
    //     });
    //   }

   

  }

  GetAddress(obj) {
    if (!obj.addressId) {
      obj.addressId = -1;
    }

    obj.stateID = CommonFunctions.GetAutoTextValues(obj.stateID);
    obj.countryID = CommonFunctions.GetAutoTextValues(obj.countryID);
    return obj;
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  /*
  GetSelectedBusinessEntities() {
    let selectedBusinessEntities: any = [];
    if (this.formModel.access.businessEntityIDs != null && this.formModel.access.businessEntityIDs.length > 0) {
      this.formModel.access.businessEntityIDs.forEach(element => {
        let entity = { "ID": element.businessEntityID };
        selectedBusinessEntities.push(entity)
      });
    }

    return selectedBusinessEntities;
  }

  GetSelectedBusinessDivisions() {
    let selectedBusinessDivisions: any = [];
    if (this.formModel.access.businessDivisionIDs != null && this.formModel.access.businessDivisionIDs.length > 0) {
      this.formModel.access.businessDivisionIDs.forEach(element => {
        let division = { "ID": element.businessDivisionID };
        selectedBusinessDivisions.push(division)
      });
    }

    return selectedBusinessDivisions;
  }

  GetSelectedBusinessAreas() {
    let selectedBusinessAreas: any = [];
    if (this.formModel.access.businessAreaIDs != null && this.formModel.access.businessAreaIDs.length > 0) {
      this.formModel.access.businessAreaIDs.forEach(element => {
        let area = { "ID": element.businessAreaID }
        selectedBusinessAreas.push(area)
      });
    }

    return selectedBusinessAreas;
  }

  GetSelectedHouses() {
    let selectedHouses: any = [];
    if (this.formModel.access.houseIDs != null && this.formModel.access.houseIDs.length > 0) {
      this.formModel.access.houseIDs.forEach(element => {
        let home = { "ID": element.homeID };
        selectedHouses.push(home)
      });
    }

    return selectedHouses;
  }

  GetSelectedClients() {
    let selectedClients: any = [];
    if (this.formModel.access.clientIDs != null && this.formModel.access.clientIDs.length > 0) {
      this.formModel.access.clientIDs.forEach(element => {
        let client = { "ID": element.id }
        selectedClients.push(client)
      });
    }

    return selectedClients;
  }
  */
}

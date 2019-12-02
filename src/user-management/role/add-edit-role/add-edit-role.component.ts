import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Subject, Observable, of } from 'rxjs';
// import { TabsetComponent } from 'ngx-bootstrap/tabs/public_api';
import { FormArray, AsyncValidatorFn, AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '@src/app/data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as CommonFunctions from "@src/app/CommonFunctions";
import * as ApplicationFields from "@src/app/Fields/ApplicationFields";
import formFields from './formFields.json';
import { map, delay, switchMap, takeUntil, tap } from 'rxjs/operators';
import * as AppEnums from "@src/app/AppEnums";
import { FormDirtyChecker } from '@src/app/FormDirtyChecker';

export function applicationRoleNameValidator(dataService: DataService, ApplicationRoleID: number): AsyncValidatorFn {
  return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {

    return of(null)
      .pipe(delay(500), switchMap(() => {
        const isWhitespace = (control.value || '').toString().trim().length === 0;
        if (isWhitespace) {
          return null;
        }
        return dataService.ValidateApplicationRoleName(control.value, ApplicationRoleID).
          map(duplicateCounts => {
            if (duplicateCounts != null) {
              return { 'existingApplicationRoleName': true };
            }
            //return null;
            return null;
          },
          );
      }));
  };
}

@Component({
  selector: 'app-add-edit-role',
  templateUrl: './add-edit-role.component.html',
  styleUrls: ['./add-edit-role.component.scss']
})

export class AddEditRoleComponent implements OnInit {

  ErrorMessage: string = "";
  onDestroy$ = new Subject<void>();
  private _isAdd: boolean;
  @Input('IsAdd')
  get IsAdd() {
    return this._isAdd
  }
  set IsAdd(value: boolean) {
    this._isAdd = value;
  }

  public _CurrentData: any;
  @Input('CurrentData')

  public get CurrentData() {
    return this._CurrentData;
  }
  public set CurrentData(value: any) {
    this._CurrentData = value;
  }

  // @ViewChild('tabset', { static: false }) tabset: TabsetComponent;

  applicationRoleID: any;
  public SelectedBusinessEntities: any = [];
  public SelectedBusinessDivisions: any = [];
  public SelectedAreas: any = [];
  public SelectedHomes: any = [];
  public SelectedClients: any = [];
  public formGroup: FormGroup;
  public formModel: any = {};
  public options: FormlyFormOptions[];
  public formFields: FormlyFieldConfig[];


  public title: string = "";
  public userDataLoaded: boolean = false;
  UIReady: boolean = false;
  dirtyChecker: any = null;

  constructor(private toastr: ToastrService, private dataService: DataService, public activeModal: NgbActiveModal) { }

  ngOnInit() {

    this.formModel = {
      applicationRoleName: '',
      systemRole: '',
      isActive: true,
      isAdd: this.IsAdd,
      access: {},
      showErrorState: true,
    };

    if (this.IsAdd) {
      this.title = "Add Role";
      this.userDataLoaded = true;
      this.applicationRoleID = 0;
      this.PrepareUI();
    } else {
      this.applicationRoleID = this.CurrentData.applicationRoleID;
      this.title = "Edit Role - " + this.CurrentData.name;
      this.dataService.GetRoleDetails(this.CurrentData.applicationRoleID).subscribe(result => {
        this.formModel.applicationRoleName = result[0].Data[0].name;
        this.formModel.isActive = result[0].Data[0].isActive;
        this.formModel.systemRole = CommonFunctions.SetAutoTextValues(result[0].Data, "systemRoleID");
        this.formModel.isAdd = false;
        this.formModel.showErrorState = true;
        this.formModel.access = {};
        this.formModel.access.businessEntityIDs = CommonFunctions.SetAutoTextValues(result[1].Data, "businessEntityID");
        this.formModel.access.businessDivisionIDs = CommonFunctions.SetAutoTextValues(result[1].Data, "businessDivisionID");
        this.formModel.access.businessAreaIDs = CommonFunctions.SetAutoTextValues(result[1].Data, "businessAreaID");
        this.formModel.access.houseIDs = CommonFunctions.SetAutoTextValues(result[1].Data, "homeID");
       // this.formModel.access.clientIDs = CommonFunctions.SetAutoTextValues(result[1].Data, "clientID");
        //user["applicationRoleID"] = CommonFunctions.GetAutoTextValues(this.formModel.applicationRoleID, AppEnums.AutoTextTypes.ApplicationRole);
        console.log(result);
        this.PrepareUI();

      });      
      // Get the user data from the data Service and set the form Model 

    }    
  }

  GetSystemRole() {
    if (this.formModel.systemRole != null) {
      if (this.formModel.systemRole.length > 0) {        
        return this.formModel.systemRole[0];
      }
    }
    return null;
  }

  CheckExternalUser() {
    return (model: any, formState: any, currentField: FormlyFieldConfig) => {
      let appRole = this.GetSystemRole();
      if (appRole != null) {
        return appRole.systemRoleTypeID == AppEnums.SystemRoleType.ExternalUsers.valueOf();

      }
      return false;
    };
  }

  CheckFinancialAdministrator() {
    return (model: any, formState: any, currentField: FormlyFieldConfig) => {
      let appRole = this.GetSystemRole();
      if (appRole != null) {
        return appRole.systemRoleID ==
          AppEnums.SystemRole.FinancialAdministrator.valueOf();

      }
      return false;
    };
  }
  
  CheckIsAdminRole() {
    return (model: any, formState: any, currentField: FormlyFieldConfig) => {
      let appRole = this.GetSystemRole();
      if (appRole != null) {
        return appRole.systemRoleID ==
          AppEnums.SystemRole.CFMAdmin.valueOf();

      }
      return false;
    };
  }

  PrepareUI() {
    this.formFields = ApplicationFields.ApplicationFields.InitializeFields(formFields);
    ApplicationFields.ApplicationFields.FindField("applicationRoleName", this.formFields).asyncValidators = {
      validation: [applicationRoleNameValidator(this.dataService, this.applicationRoleID)]
    }

    ApplicationFields.ApplicationFields.FindField("access", this.formFields).expressionProperties = {
      'templateOptions.externalUser': this.CheckExternalUser(),
      'templateOptions.isAdmin': this.CheckIsAdminRole()
    };

    this.dirtyChecker = new FormDirtyChecker(this.formModel);
    this.formGroup = new FormGroup({});
    setTimeout(() => CommonFunctions.InvalidateRequiredFields(this.formGroup));
    //CommonFunctions.InvalidateRequiredFields(this.formGroup);
    this.UIReady = true;
  }

  changeModel(model) {

  }

  Save() {

    if (!this.formGroup.valid) {
      this.toastr.error('', "Please fix highlighted errors");
      return;
    }

    let role = {
      "name": this.formModel.applicationRoleName,
      "systemRoleID": this.formModel.systemRole[0].systemRoleID,
      "isActive": this.formModel.isActive,
      "applicationRoleID": this.applicationRoleID
    }

    if (this.formModel.access) {
      this.formModel.businessEntityIDs = CommonFunctions.GetAutoTextValues(this.formModel.access.businessEntityIDs, AppEnums.AutoTextTypes.BusinessEntity);
      this.formModel.businessDivisionIDs = CommonFunctions.GetAutoTextValues(this.formModel.access.businessDivisionIDs, AppEnums.AutoTextTypes.BusinessDivision);
      this.formModel.businessAreaIDs = CommonFunctions.GetAutoTextValues(this.formModel.access.businessAreaIDs, AppEnums.AutoTextTypes.BusinessArea);
      this.formModel.houseIDs = CommonFunctions.GetAutoTextValues(this.formModel.access.houseIDs, AppEnums.AutoTextTypes.Home);
      this.formModel.clientIDs = CommonFunctions.GetAutoTextValues(this.formModel.access.clientIDs, AppEnums.AutoTextTypes.Clients);
    }

    this.dataService.SaveRole({
      "Role": role,
      "BusinessEntityIDs": this.formModel.businessEntityIDs,
      "BusinessDivisionIDs": this.formModel.businessDivisionIDs,
      "BusinessAreaIDs": this.formModel.businessAreaIDs,
      "HomeIDs": this.formModel.houseIDs,
      "ClientIDs": this.formModel.clientIDs
    }).subscribe(result => {
      this.activeModal.close(result);
    });
  }

}

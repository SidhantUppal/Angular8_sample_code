import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '@src/app/data.service';
import * as cloneDeep from 'lodash/cloneDeep';
import * as AppEnums from "@src/app/AppEnums";
import { FormDirtyChecker } from "@src/app/FormDirtyChecker";
import * as CommonFunctions from "@src/app/CommonFunctions";
import * as ApplicationFields from "@src/app/Fields/ApplicationFields";
import { AsyncValidatorFn, AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';
import { Observable, of, Subject } from 'rxjs';
import { map, delay, switchMap, takeUntil, tap } from 'rxjs/operators';
import formFields from './formFields.json';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { GLEntityType } from '@src/app/AppEnums';
import { CustomFunctions } from '@src/app/GlobalSettings';

@Component({
  selector: 'app-add-edit-gl-home-account',
  templateUrl: './add-edit-gl-home-account.component.html',
  styleUrls: ['./add-edit-gl-home-account.component.scss']
})
export class AddEditGlHomeAccountComponent implements OnInit {
  DeactivationHandler: any = null;
  private _isAdd: boolean;
  @Input('IsAdd')
  get IsAdd() {
    return this._isAdd
  }
  set IsAdd(value: boolean) {
    this._isAdd = value;
  }

  private existingData: any = null;
  private InactivatedData: any = null;

  public _CurrentData: any;
  @Input('CurrentData')
  public get CurrentData() {
    return this._CurrentData;
  }
  public set CurrentData(value: any) {
    this._CurrentData = value;
    this.existingData = cloneDeep(value);
  }

  public formGroup: FormGroup;
  public formModel: any = {};
  public formFields: FormlyFieldConfig[];
  public title: string = "";

  public ErrorMessage: string = "";
  dirtyChecker: FormDirtyChecker;
  public UIReady: boolean = false;

  constructor(private toastr: ToastrService, private dataService: DataService, public activeModal: NgbActiveModal, private modalService: NgbModal) { }

  ngOnInit() {

    if (this.IsAdd) {
      this.SetTitle(this.IsAdd);

    } else {
      this.SetTitle(false);
    }

    this.formModel = this.existingData;
    //this.formModel.accountType = this.CurrentData.gLAccountTypeID;

    // this.formModel.bsb = CommonFunctions.SetAutoTextValues(this.CurrentData, "bSBDetailID");
    //this.formModel.accountType = CommonFunctions.SetAutoTextValues(this.CurrentData, "gLAccountTypeID");
    //this.formModel.gLAccountTypeID= CommonFunctions.GetAutoTextValues(this.CurrentData, "gLAccountTypeID");

    this.PrepareUI();
  }

  PrepareUI() {
    this.formFields = ApplicationFields.ApplicationFields.InitializeFields(formFields);

    ApplicationFields.ApplicationFields.FindField("accountCode", this.formFields).asyncValidators = {
      validation: [CommonFunctions.gLAccountCodeValidator(this.dataService, this.existingData.gLAccountID)]
    };

    // ApplicationFields.ApplicationFields.FindField("gLAccountTypeID", this.formFields).expressionProperties = {
    //   //'templateOptions.disabled': this.CheckDisabled(),
    //   // 'templateOptions.required': this.CheckRequired(),
    //   'templateOptions.parentID': (model: any, formState: any, field: FormlyFieldConfig) => {
    //     return GLEntityType.Home;
    //   }
    // };

    ApplicationFields.ApplicationFields.FindField("bankName", this.formFields).expressionProperties = {
      "templateOptions.disabled": () => true,
      "template": () => {
        if (!this.existingData) {
          return;
        }


        let bankName = this.formGroup.controls["bankName"];
        if (this.existingData.bSBDetailID != null && this.existingData.bSBDetailID.length > 0) {
          bankName.setValue(this.existingData.bSBDetailID[0].bankName);
        } else {
          bankName.setValue(null);
        }

      }
    };

    this.formGroup = new FormGroup({});
    this.dirtyChecker = new FormDirtyChecker(this.existingData);

    CommonFunctions.InvalidateRequiredFields(this.formGroup);
    this.UIReady = true;
  }

  SetTitle(isAdd) {
    if (isAdd) {
      this.title = "Add GL Account";

    } else {
      if (this.CurrentData && this.CurrentData.accountCode != null) {
        this.title = "Edit GL Account - " + this.CurrentData.accountCode;
      } else {
        this.title = "Edit GL Account";
      }
    }
  }

  closeResult: string;
  inActiveConfirmed: boolean = false;
  modelChange(model) {
    if (this.UIReady && !model.isActive) {
      if (!this.inActiveConfirmed) {
        console.log("CurrentData", this.CurrentData);
        console.log("Existing Data", this.existingData);
        this.inActiveConfirmed = true;
        let message = `This would inactivate the account and you would have to add a new account. Are you sure you want to continue ?`;
        let resp = CustomFunctions.FireConfirmation(message,
          this.DeactivationHandler,
          this.modalService);
        resp.subscribe(result => {
          if (!result) {
            return;
          }

          if (!this.InactivatedData) {
            this.InactivatedData = cloneDeep(this.CurrentData);
            this.InactivatedData.isActive = false;
          }

          this.ClearForm(this.formGroup);
          this.existingData.gLAccountID = null;
          ApplicationFields.ApplicationFields.FindField("accountCode", this.formFields).asyncValidators = {
            validation: [CommonFunctions.gLAccountCodeValidator(this.dataService, this.existingData.gLAccountID)]
          };
          this.SetTitle(true);
        });
      }
    } else {
      // this.SetTitle(false);
      this.inActiveConfirmed = false;
    }
  }

  ClearForm(form: FormGroup) {
    Object.keys(form.controls).forEach(key => {
      console.log("Clear Form", key);
      if (form.get(key) && key != "accountType") {
        form.get(key).setValue(null);
      }
    });
  }

  close() {

  }

  Save() {
    if (!this.formGroup.valid) {
      this.toastr.error('', "Please fix highlighted errors");
      return;
    }

    if (!this.existingData.isActive) {
      this.toastr.error('', "Please mark the account as active.");
      return;
    }

    let glAccounts = [];

    if (this.InactivatedData != null) {            
      glAccounts.push(this.InactivatedData);
    }
    
    this.existingData.bSB = this.existingData.bSBDetailID[0].displayValue;    
    this.existingData.bSBDetailID = this.existingData.bSBDetailID[0].bSBDetailID;
    glAccounts.push(this.existingData)

    this.dataService.SaveAccountDetails({ "GLEntityID" : this.existingData.gLEntityID, "GLAccounts": glAccounts }).subscribe(result => {
      this.activeModal.close(result);
    });
  }
}



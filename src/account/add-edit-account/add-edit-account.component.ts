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
  selector: 'app-add-edit-account',
  templateUrl: './add-edit-account.component.html',
  styleUrls: ['./add-edit-account.component.scss']
})
export class AddEditAccountComponent implements OnInit {
  DeactivationHandler: any = null;

  private _isAdd: boolean;

  private _showIsActiveField: boolean;

  public formCleared: boolean;

  @Input('IsAdd')
  get IsAdd() {
    return this._isAdd
  }
  set IsAdd(value: boolean) {
    this._isAdd = value;
  }

  @Input('ShowIsActiveField')
  get ShowIsActiveField() {
    return this._showIsActiveField
  }
  set ShowIsActiveField(value: boolean) {
    this._showIsActiveField = value;
  }

  public _entityType: GLEntityType;
  @Input('EntityType')
  get EntityType() {
    return this._entityType;
  }
  set EntityType(value: GLEntityType) {
    this._entityType = value;
  }

  private _entityID: number;
  @Input('EntityID')
  get EntityID() {
    return this._entityID;
  }
  set EntityID(value: number) {
    this._entityID = value;
    this.InitialEntityID = value;
  }
  private InitialEntityID: number = null;
  public existingData: any = null;
  private InactivatedData: any = null;

  public _inputData: any;
  @Input('InputData')
  public get InputData() {
    return this._inputData;
  }
  public set InputData(value: any) {
    this._inputData = value;
  }

  public formGroup: FormGroup;
  public formModel: any = {};
  public formFields: FormlyFieldConfig[];
  public title: string = "";

  public ErrorMessage: string = "";
  dirtyChecker: FormDirtyChecker;
  public UIReady: boolean = false;
  public account: any
  public gLAccountID: any;

  constructor(private toastr: ToastrService, private dataService: DataService, public activeModal: NgbActiveModal, private modalService: NgbModal) { }
  GetEntityParentCode() {
    let gLEntityTypeID = CommonFunctions.GetAutoTextValueByField(this.existingData.gLAccountTypeID, "gLEntityTypeID");
    let currentType = null;

    if (gLEntityTypeID == AppEnums.GLEntityType.Home.valueOf()) {
      currentType = AppEnums.AutoTextTypes.HomeGlEntity;
    }
    if (gLEntityTypeID == AppEnums.GLEntityType.Client.valueOf()) {
      if (this.EntityType && this.EntityType == GLEntityType.Home) {
        currentType = AppEnums.AutoTextTypes.HomeClients;
      } else {
        currentType = AppEnums.AutoTextTypes.Clients;
      }
    }
    if (gLEntityTypeID == AppEnums.GLEntityType.FinancialAdministrator.valueOf()) {

      currentType = AppEnums.AutoTextTypes.FinAdministratorGlEntity;
    }
    return currentType;
  }
  ngOnInit() {

    // this.formModel = {
    //   accountType: '',
    //   gLEntityID: '',
    //   isActive: null,
    //   accountCode: '',
    //   gLAccountName: '',
    //   hasBankAccount: null,
    //   bSBDetailID: '',
    //   bankName: '',
    //   bankAccountName: '',
    //   accountNumber: ''
    // };

    if (this.IsAdd) {
      this.SetTitle(this.IsAdd);
      this.gLAccountID = -1;
      this.existingData = {
        glEntityRequirementMet: false,
        hasTransactions: false,
        hasBankAccount: false,
        canHaveBankAccount: false,
        isActive: true,
        bankAccountID: -1,
        gLAccountID: -1
      };

      this.PrepareUI();
      //this.existingData.hasBankAccount = this.HasBankAccount;
    } else {
      this.SetTitle(false);
      this.formModel = this.existingData;
      this.gLAccountID = this.InputData.gLAccountID;
      this.dataService.GetAccountDetails(this.InputData.gLAccountID).subscribe(result => {
        console.log("Result", result);
        this.account = {};
        this.account = result[0].Data[0] != null ? result[0].Data[0] : {};

        if (this.InputData.canHaveBankAccount) {
          this.account.bankAccount = result[1].Data[0] != null ? result[1].Data[0] : {};
          this.account.bankAccount.bsbDetail = result[2].Data[0] != null ? result[2].Data[0] : {};
          this.account.bankAccount.bsbDetail.bankName = result[3].Data[0] != null ? result[3].Data[0].bankName : {};
          this.account.bankAccount.bankAccountCards = result[4].Data != null ? result[4].Data : {};
        }

        //CommonFunctions.FormatDates(result);
        if (this.account.bankAccount && this.account.bankAccount.bankAccountCards) {
          for (var i = 0; i < this.account.bankAccount.bankAccountCards.length; i++) {
            this.account.bankAccount.bankAccountCards[i].expDate = CommonFunctions.GetMonthYear(this.account.bankAccount.bankAccountCards[i].expDate);
          }
        }

        this.existingData = cloneDeep(this.account);
        this.existingData.gLAccountID = this.InputData.gLAccountID;
        this.existingData.isMandatory = this.InputData.isMandatory;
        this.existingData.canHaveBankAccount = this.InputData.canHaveBankAccount;

        // if (!this.existingData.canHaveBankAccount) {
        //   this.existingData.bankAccount = null;
        // }

        this.existingData.hasBankAccount = this.InputData.hasBankAccount;
        this.existingData.hasTransactions = this.InputData.hasTransactions;
        this.PrepareUI();
      });
    }

    //this.formModel.accountType = this.CurrentData.gLAccountTypeID;

    // this.formModel.bsb = CommonFunctions.SetAutoTextValues(this.CurrentData, "bSBDetailID");
    //this.formModel.accountType = CommonFunctions.SetAutoTextValues(this.CurrentData, "gLAccountTypeID");
    //this.formModel.gLAccountTypeID= CommonFunctions.GetAutoTextValues(this.CurrentData, "gLAccountTypeID");    
  }

  CheckDisabled(isgLEntityID) {
    
    let disabled = this.existingData.hasTransactions || (this.InactivatedData && !this.InactivatedData.isActive) || (!this.IsAdd && this.EntityType == GLEntityType.Home && this.existingData.isMandatory);
    if (!disabled && isgLEntityID) {
      return this.EntityID != null;
    }
    return disabled;
  }

  CurrentEntityTypeID: number = null;
  CurrentAccountTypeID: number = null;
  LastBankName:string="";
  PrepareUI() {
    this.formFields = ApplicationFields.ApplicationFields.InitializeFields(formFields);

    ApplicationFields.ApplicationFields.FindField("accountCode", this.formFields).asyncValidators = {
      validation: [CommonFunctions.gLAccountCodeValidator(this.dataService, this.existingData)]
    };

    ApplicationFields.ApplicationFields.FindField("gLAccountTypeID", this.formFields).expressionProperties = {
      'templateOptions.disabled': () => this.CheckDisabled(false)
      , 'templateOptions.parentID': (model: any, formState: any, field: FormlyFieldConfig) => {
        return this._entityType;
      }
    };

    ApplicationFields.ApplicationFields.FindField("gLEntityID", this.formFields).asyncValidators = {
      validation: [CommonFunctions.gLAccountTypeAndEntityTypeValidator(this.dataService, this.existingData, this.gLAccountID)]
    };

    ApplicationFields.ApplicationFields.FindField("bankAccount.bSBDetailID", this.formFields).asyncValidators = {
      validation: [CommonFunctions.bankAccountValidator(this.dataService, this.existingData, "bSBDetailID")]
    };

    ApplicationFields.ApplicationFields.FindField("bankAccount.accountNumber", this.formFields).asyncValidators = {
      validation: [CommonFunctions.bankAccountValidator(this.dataService, this.existingData, "accountNumber")]
    };

    //    ApplicationFields.ApplicationFields.FindField("bankDetails", this.formFields).asyncValidators = {
    //      validation: [CommonFunctions.bankAccountValidator(this.dataService, this.existingData)]
    //    };

    //    if (this.account) {
    //      let curretEntityType = this.GetEntityParentCode(this.account.gLAccountTypeID);
    //      ApplicationFields.ApplicationFields.FindField("gLEntityID", this.formFields).templateOptions.autoTextCode =
    //        curretEntityType;
    //      if (curretEntityType != null) {
    //        setTimeout(() => ApplicationFields.ApplicationFields.FindField("gLEntityID", this.formFields).templateOptions.ClearList());
    //      }
    //    }

    //ApplicationFields.ApplicationFields.FindField("gLEntityID", this.formFields).hideExpression = this.EntityNotNeeded();
    ApplicationFields.ApplicationFields.FindField("gLEntityID", this.formFields).hideExpression = (model: any, formState: any, field: FormlyFieldConfig) => {
    
    

      let currentType = this.GetEntityParentCode();;

      return currentType == null;
    }

 
     
    ApplicationFields.ApplicationFields.FindField("gLEntityID", this.formFields).expressionProperties = {
      'templateOptions.disabled': () => this.CheckDisabled(true),
      'templateOptions.autoTextCode': (model: any, formState: any, field: FormlyFieldConfig) => {

        if (this.existingData && this.existingData.gLAccountTypeID) {
          if (Array.isArray(this.existingData.gLAccountTypeID)) {
            if (this.existingData.gLAccountTypeID.length == 0) {
              if (!this.formCleared) {
                setTimeout(() => ApplicationFields.ApplicationFields.FindField("gLEntityID", this.formFields).templateOptions.ClearList());
               // this.ClearForm(this.formGroup);
                this.formCleared = true;
              }
              return null;
            }

            let gLEntityTypeID = CommonFunctions.GetAutoTextValueByField(this.existingData.gLAccountTypeID, "gLEntityTypeID");
            let currentType = this.GetEntityParentCode();;


            if (this.CurrentEntityTypeID != gLEntityTypeID) {
              if (this.InitialEntityID != null) {
                this.existingData.gLEntityID = this.InitialEntityID;
                //this.InitialEntityID = null;
                setTimeout(() => ApplicationFields.ApplicationFields.FindField("gLEntityID", this.formFields).templateOptions.ClearList());
              }
              setTimeout(() => ApplicationFields.ApplicationFields.FindField("gLEntityID", this.formFields).templateOptions.ClearList());
              if (currentType) {
                switch (currentType) {
                  case AppEnums.AutoTextTypes.HomeGlEntity:
                    setTimeout(() => ApplicationFields.ApplicationFields.FindField("gLEntityID", this.formFields)
                      .templateOptions.label = "Home");
                    break;
                  case AppEnums.AutoTextTypes.FinAdministratorGlEntity:
                    setTimeout(() => ApplicationFields.ApplicationFields.FindField("gLEntityID", this.formFields)
                      .templateOptions.label = "Administrator");
                    break;
                  default:
                    setTimeout(() => ApplicationFields.ApplicationFields.FindField("gLEntityID", this.formFields)
                      .templateOptions.label = "Client");
                    break;

                }
              }

              this.CurrentEntityTypeID = gLEntityTypeID;
            }
            let gLAccountTypeID = CommonFunctions.GetAutoTextValueByField(this.existingData.gLAccountTypeID, "gLAccountTypeID");

            if (this.CurrentAccountTypeID != gLAccountTypeID) {
              this.CurrentAccountTypeID = gLAccountTypeID;
            
              if (this.InitialEntityID != null) {
                this.existingData.gLEntityID = this.InitialEntityID;
                //this.InitialEntityID = null;
                setTimeout(() => ApplicationFields.ApplicationFields.FindField("gLEntityID", this.formFields).templateOptions.ClearList());
              }
            }
            this.formCleared = false;
            return currentType;

          }
        }

        return null;
      },
      'templateOptions.parentID': (model: any, formState: any, field: FormlyFieldConfig) => {
        if (this.existingData && this.existingData.gLAccountTypeID) {
          if (Array.isArray(this.existingData.gLAccountTypeID)) {
            if (this.existingData.gLAccountTypeID.length == 0) {
              return null;
            }

            let gLEntityTypeID = CommonFunctions.GetAutoTextValueByField(this.existingData.gLAccountTypeID, "gLEntityTypeID")
            if (gLEntityTypeID == AppEnums.GLEntityType.Client.valueOf()) {
              if (this.EntityType && (this.EntityType == GLEntityType.Home) || this.EntityType == GLEntityType.FinancialAdministrator) {
                return this.EntityID;
              }
            }
          }
        }
      }
    }

    ApplicationFields.ApplicationFields.FindField("bankAccount.bsbDetail.bankName", this.formFields).expressionProperties = {
      "templateOptions.disabled": () => true,
      "template": () => {
        if (!this.existingData) {
          return;
        }

        let bankName = this.formGroup.get('bankAccount.bsbDetail.bankName');
        
        if (bankName) {
          let newValue = "";
          

          if (this.existingData && this.existingData.bankAccount && this.existingData.bankAccount.bSBDetailID != null && this.existingData.bankAccount.bSBDetailID.length > 0) {
            newValue=this.existingData.bankAccount.bSBDetailID[0].bankName;
          } else {
            newValue = null;
          }
          if (this.LastBankName != newValue) {
            bankName.setValue(newValue);
            this.LastBankName = newValue;
          }
        }
      }
    };

    // ApplicationFields.ApplicationFields.FindField("hasBankAccount", this.formFields).hideExpression = this.CheckBankAccountMandatory();

    ApplicationFields.ApplicationFields.FindField("hasBankAccount", this.formFields).expressionProperties = {
      "templateOptions.disabled": () => this.CheckBankAccountMandatory()
    }

    // ApplicationFields.ApplicationFields.FindField("hasBankAccount", this.formFields).expressionProperties = {
    //   "templateOptions.disabled": () => this.CheckBankAccountMandatory()
    // }

    // ApplicationFields.ApplicationFields.FindField("bankDetails", this.formFields).hideExpression = (model: any, formState: any, field: FormlyFieldConfig) => {
    //   if (!this.existingData.glEntityRequirementMet || !this.existingData.hasBankAccount) {
    //     return true;
    //   }

    //   return false;
    // }

    // ApplicationFields.ApplicationFields.FindField("bankAccountMandatory", this.formFields).expressionProperties = {
    //   "templateOptions.disabled": () => this.CheckBankAccountMandatory()
    // }

    this.formGroup = new FormGroup({});
    this.dirtyChecker = new FormDirtyChecker(this.existingData);
    setTimeout(() => CommonFunctions.InvalidateRequiredFields(this.formGroup));
    //CommonFunctions.InvalidateRequiredFields(this.formGroup);
    this.UIReady = true;
  }

  public canHaveBankCards: boolean = false;
  HideBankAccountFields() {
    return (model: any, formState: any, currentField: FormlyFieldConfig) => {
      if (this.existingData && this.existingData.gLAccountTypeID) {
        if (Array.isArray(this.existingData.gLAccountTypeID)) {
          if (this.existingData.gLAccountTypeID.length == 0) {
            return null;
          }
          let gLAccountTypeID = this.existingData.gLAccountTypeID[0];
          this.canHaveBankCards = gLAccountTypeID.canHaveBankCards;
          return !gLAccountTypeID.canHaveBankAccount;
        }
      }
    }
  }

  SetTitle(isAdd) {
    if (isAdd) {
      this.title = "Add GL Account";

    } else {
      if (this.existingData && this.existingData.accountCode != null) {
        this.title = "Edit GL Account - " + this.existingData.accountCode;
      } else {
        this.title = "Edit GL Account";
      }
    }
  }

  closeResult: string;
  inActiveConfirmed: boolean = false;
  modelLoaded: boolean = false;

  RefreshModelValues() {
    let bankAccountMandatoryControl = this.formGroup.get('hasBankAccount');
    if (this.CheckBankAccountMandatory()) {
      bankAccountMandatoryControl.disable();
    }
    else {
      bankAccountMandatoryControl.enable();
    }


    //ApplicationFields.ApplicationFields.FindField("hasBankAccount", this.formFields).templateOptions.disabled=this.CheckBankAccountMandatory();

  }

  CheckBankAccountMandatory() {
    if (this.UIReady) {
      return this.existingData.isMandatory && this.existingData.canHaveBankAccount;
    }

    return false;
  }
  modelChange(model) {

    var allChanges = this.dirtyChecker.GetChanges(model);
    let accountType = allChanges.find(x => x.key == "gLAccountTypeID");
    let gLEntity = allChanges.find(x => x.key == "gLEntityID");
    let hasBankAccount = allChanges.find(x => x.key == "hasBankAccount");

    // if (accountType != null && accountType.val != null && accountType.val.length > 0) {
    //   let accountTypeValue = accountType.val[0];
    //   console.log(accountTypeValue);
    //   this.existingData.bankAccountMandatory = accountTypeValue.canHaveBankAccount && accountTypeValue.isMandatory;
    //   console.log("mandatory", this.existingData.bankAccountMandatory);
    // }     

    if (accountType != null || gLEntity != null) {

      if (this.existingData.gLAccountTypeID == null || this.existingData.gLAccountTypeID.length == 0) {
        let gLEntityIDControl = this.formGroup.get('gLEntityID');
        if (gLEntityIDControl && gLEntityIDControl.value != null) {
          gLEntityIDControl.setValue(null);
        }

        let hasBankAccountControl = this.formGroup.get('hasBankAccount');
        if (hasBankAccountControl && hasBankAccountControl.value != null) {
          hasBankAccountControl.setValue(null);
        }

        this.existingData.glEntityRequirementMet = false;
        //this.existingData.bankAccount = null;
        this.existingData.hasBankAccount = false;
        this.existingData.isMandatory = false;
        this.existingData.canHaveBankAccount = false;
        //this.ClearForm(this.formGroup);
        
      }
      else{
        let accountTypeID = this.existingData.gLAccountTypeID[0];
        this.canHaveBankCards = accountTypeID.canHaveBankCards;
        //this.existingData.bankAccountMandatory = accountTypeID.isMandatory;
        if (accountTypeID.canHaveBankAccount && accountTypeID.isMandatory) {
          this.existingData.hasBankAccount = true;
        }
        

        //this.existingData.hasBankAccount = accountTypeID.canHaveBankAccount && accountTypeID.isMandatory;
        this.existingData.canHaveBankAccount = accountTypeID.canHaveBankAccount;
        this.existingData.isMandatory = accountTypeID.isMandatory;
        let currentType = this.GetEntityParentCode();

        if (currentType == null) {
          this.existingData.glEntityRequirementMet = true;
          setTimeout(() => CommonFunctions.InvalidateRequiredFields(this.formGroup));
        } else {
          if (this.existingData.gLEntityID == null || this.existingData.gLEntityID.length == 0) {
            this.existingData.glEntityRequirementMet = false;
          } else {
            this.existingData.glEntityRequirementMet = true;
            setTimeout(() => CommonFunctions.InvalidateRequiredFields(this.formGroup));
          }

        }
      }
    }

    if (this.CheckBankAccountMandatory()) {
      let bankAccountMandatoryControl = this.formGroup.get('hasBankAccount');
      if (bankAccountMandatoryControl && bankAccountMandatoryControl.value != true) {
        bankAccountMandatoryControl.setValue(true);
      }
    }

    if (hasBankAccount) {
      if (this.existingData.hasBankAccount) {
        if (!this.existingData.bankAccount) {
          this.existingData.bankAccount = {};
        }
        this.existingData.bankAccount.isActive = true;
      } else {
        this.existingData.bankAccount = null;
      }
    }

    if (this.existingData.isMandatory) {
      if (model.isActive != null && !model.isActive && !this.IsAdd && this.account.isActive && !this.inActiveConfirmed) {
        this.AccountMarkedInactive();
      } else {
        // this.inActiveConfirmed = false;
      }
    }
    else {
      // this.SetTitle(false);
      // this.modelLoaded = false;
    }
  }

  GetAccountTypeChange() {
    if (this.existingData && this.existingData.gLAccountTypeID) {
      if (Array.isArray(this.existingData.gLAccountTypeID)) {
        if (this.existingData.gLAccountTypeID.length == 0) {
          return null;
        } else {
          return this.existingData.gLAccountTypeID[0];
        }
      }
      // else if(this.existingData.gLAccountTypeID) {
      //   return this.existingData.gLAccountTypeID; 
      // }

      return null;
    }
  }

  AccountMarkedInactive() {
    this.inActiveConfirmed = true;
    let message = `This would inactivate the current account and you would have to add a new account. Are you sure you want to continue ?`;
    let resp = CustomFunctions.FireConfirmation(message,
      this.DeactivationHandler,
      this.modalService);
    resp.subscribe(result => {
      this.inActiveConfirmed = false;
      let isActiveControl = this.formGroup.get('isActive');
      if (isActiveControl) {
        isActiveControl.setValue(true);
      }
      if (!result) {
        return;
      }

      if (!this.InactivatedData) {
        this.InactivatedData = cloneDeep(this.account);
        this.InactivatedData.isActive = false;
      }


      let fieldsToIgnore = ["gLEntityID", "gLAccountTypeID", "isActive"];

      if (this.CheckBankAccountMandatory()) {
        fieldsToIgnore.push("hasBankAccount");
        this.existingData.bankAccountID = -1;
        this.existingData.bankAccount = { "isActive": true };
      }

      this.ClearForm(this.formGroup, fieldsToIgnore);
      CommonFunctions.InvalidateRequiredFields(this.formGroup);
      this.existingData.gLAccountID = -1;
      this.SetTitle(true);
    });
  }

  ClearForm(form, controlsToIgnore: string[] = null) {
    Object.keys(form.controls).forEach(key => {
      if (form.get(key) instanceof FormGroup) {
        this.ClearForm(form.get(key), controlsToIgnore);
      } else {
        if (form.get(key) && controlsToIgnore && !controlsToIgnore.includes(key)) {
          form.get(key).setValue(null);
        }
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

    if (this.existingData.isMandatory && !this.existingData.isActive) {
      this.toastr.error('', "Please mark the account as active.");
      return;
    }
    let hasErrors = false;
    if (this.existingData
      && this.existingData.bankAccount
      && this.existingData.bankAccount.bankAccountCards) {
      for (var i = 0; i < this.existingData.bankAccount.bankAccountCards.length; i++) {
        hasErrors = !this.existingData.bankAccount.bankAccountCards[i].formGroup.valid;
        if (hasErrors) {
          break;
        }


      }

    }
    if (hasErrors) {
      this.toastr.error('', "Please fix highlighted errors.");
      return;
    }
    let accounts = [];

    if (this.InactivatedData != null) {
      accounts.push(this.InactivatedData);
    }

    // if (this.IsAdd && this.existingData.bankAccount) {
    //   this.existingData.bankAccount.isActive = true;
    // }

    if (this.existingData != null && this.existingData.bankAccount) {
      this.existingData.bankAccount.bsbNumber = CommonFunctions.GetAutoTextValueByField(this.existingData.bankAccount.bSBDetailID, "displayValue");
      this.existingData.bankAccount.bSBDetailID = CommonFunctions.GetAutoTextValues(this.existingData.bankAccount.bSBDetailID, AppEnums.AutoTextTypes.BSB);
      this.existingData.bankAccount.accountNumber = this.existingData.bankAccount.accountNumber;

      // if (this.IsAdd) {
      //   this.existingData.bankAccount.bankAccountID = -1;
      // }
    } else {
      this.existingData.bankAccountID = null;
    }

    let currentType = this.GetEntityParentCode();

    if (this.existingData && currentType) {
      this.existingData.gLEntityID = CommonFunctions.GetAutoTextValueByField(this.existingData.gLEntityID, "gLEntityID");
    }

  

    //TodO: Loop between all cards - Implement this.
    if (this.existingData.bankAccount && this.existingData.bankAccount.bankAccountCards != null && this.existingData.bankAccount.bankAccountCards.length > 0) {

      this.existingData.bankAccount.bankAccountCards.forEach(card => {
        card.formGroup = null;
        card.heldByStaffID = CommonFunctions.GetAutoTextValueByField(card.heldByStaffID, "applicationUserID");
      });
    }
    let modifiedAccount = cloneDeep(this.existingData);
    if (modifiedAccount.gLAccountTypeID != null) {

      let gLEntityTypeID = CommonFunctions.GetAutoTextValueByField(modifiedAccount.gLAccountTypeID, "gLEntityTypeID");
      if (gLEntityTypeID == null) {
        modifiedAccount.gLEntityID = 0;
      }
      

      modifiedAccount.gLAccountTypeID = CommonFunctions.GetAutoTextValueByField(modifiedAccount.gLAccountTypeID, "gLAccountTypeID");
    }

    accounts.push(modifiedAccount);


    
    
    this.dataService.SaveGlAccountDetails(accounts).subscribe(result => {
      this.activeModal.close(result);
    });
  }



  bankAccountCardID: number = -1;

  AddCard() {
    this.bankAccountCardID--;
    if (this.existingData.bankAccount) {
      if (!this.existingData.bankAccount.bankAccountCards) {
        this.existingData.bankAccount.bankAccountCards = [];
      }
      this.existingData.bankAccount.bankAccountCards.push({ "bankAccountCardID": this.bankAccountCardID, "isActive": true });
    }
    else {
      this.existingData.bankAccount = { "isActive": true };
      this.existingData.bankAccount.bankAccountCards = [];
      this.existingData.bankAccount.bankAccountCards.push({});
    }
  }

  OnBankCardRemoved(bankCard) {
    bankCard.isActive = false;
    const index: number = this.existingData.bankAccount.bankAccountCards.indexOf(bankCard);
    if (index !== -1 && bankCard.bankAccountCardID < 0) {
      this.existingData.bankAccount.bankAccountCards.splice(index, 1);
    }
  }
}



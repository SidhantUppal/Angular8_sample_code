import { Component, OnInit, Input, OnChanges, ViewChild } from '@angular/core';
import formfields from './formfields-addUpdateAccount.json';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormGroup } from '@angular/forms';
import * as ApplicationFields from "@src/app/Fields/ApplicationFields";
import { FormDirtyChecker } from '../../FormDirtyChecker';
import { DataService } from '@src/app/data.service';
import * as CommonFunctions from "@src/app/CommonFunctions";
import * as cloneDeep from 'lodash/cloneDeep';
import { ToastrService } from 'ngx-toastr';
import * as AppEnums from "@src/app/AppEnums";
import { AddAccountDetailsComponent } from './add-account-details/add-account-details.component';

@Component({
  selector: 'app-add-update-account',
  templateUrl: './add-update-account.component.html',
  styleUrls: ['./add-update-account.component.scss']
})
export class AddUpdateAccountComponent implements OnInit, OnChanges {
  public _selectedAccount: any;
 public glAccount: any
  //form field declaration
  public formFields: FormlyFieldConfig[];  
 
  public formGroup: FormGroup;

  editMode: boolean = true
  constructor(private dataService: DataService, private toastr: ToastrService) { this.glAccount = {}}
  
  @Input('SelectedAccount')
  get SelectedAccount() {    
    return this._selectedAccount;
  }
  set SelectedAccount(value: any) {      
    this._selectedAccount = value;
  }
  @ViewChild(AddAccountDetailsComponent, { static: false }) AddAccountDetailsComponentPointer: AddAccountDetailsComponent;

  ngOnChanges(){
    //this.formModel = this._selectedAccount;
  }
  Test()
  {
    console.log(this._selectedAccount.gLAccountTypeID);
    console.log(CommonFunctions.GetAutoTextValues(this._selectedAccount.gLAccountTypeID,AppEnums.AutoTextTypes.AccountType));
  }
  ngOnInit() {
   
    
    this.formGroup = new FormGroup({});    
    this.formFields = ApplicationFields.ApplicationFields.InitializeFields(formfields);   
    

    ApplicationFields.ApplicationFields.FindField("gLAccountTypeID", this.formFields).expressionProperties = {
       
      'templateOptions.parentID': (model: any, formState: any, field: FormlyFieldConfig) => {
       
        if(this._selectedAccount)
        { 
          if(!this._selectedAccount.codeEditable)
        {
          
          return this._selectedAccount.gLEntityTypeID;
        }
        }
        return null;
        
      }

    };

    ApplicationFields.ApplicationFields.FindField("accountCode", this.formFields).expressionProperties = {
       
      'templateOptions.disabled': (model: any, formState: any, field: FormlyFieldConfig) => {
       
        
        return !model.codeEditable
        
      }

    };

        

    ApplicationFields.ApplicationFields.FindField("gLEntityID", this.formFields).expressionProperties = {
       
      'templateOptions.autoTextCode': (model: any, formState: any, field: FormlyFieldConfig) => {
        if(this._selectedAccount && this._selectedAccount.gLAccountTypeID)
        {
          if (Array.isArray(this._selectedAccount.gLAccountTypeID)) {
            if(this._selectedAccount.gLAccountTypeID.length==0)
            {
              return null;
            }
          
            let gLEntityTypeID=this._selectedAccount.gLAccountTypeID[0].gLEntityTypeID;
            if(gLEntityTypeID==AppEnums.GLEntityType.Home.valueOf())
            {
              return AppEnums.AutoTextTypes.Home;
            }
            if(gLEntityTypeID==AppEnums.GLEntityType.Client.valueOf())
            {
              return AppEnums.AutoTextTypes.Clients;
            }
            if(gLEntityTypeID==AppEnums.GLEntityType.FinancialAdministrator.valueOf())
            {
              return AppEnums.AutoTextTypes.Administrator;
            }
            
          }
         
        
          
        }
        return null;
        
      }

    };


    //console.log(JSON.stringify(this.formFields))    
  }  

  modelChange(event){
    
    // if(event)
    // {      
    //   this.SelectedAccount = cloneDeep(event);
    // }  
    
    //console.log("model changed "+ model2)    
  }


  Save() {

    // if (!this.formGroup.valid) {
    //   this.toastr.error('', "Please fix highlighted errors");
    //   return;
    // }

    debugger

    this.glAccount.accountName = this._selectedAccount.accountName;
    if (this.glAccount.bankAccount != null) {
      this.glAccount.bankAccount.bsbDetailID = CommonFunctions.GetAutoTextValues(this.glAccount.bankAccount.bsbDetailID, AppEnums.AutoTextTypes.BSB);
    }

    //ToDo: remove when date is finalized on UI and db
//    this.glAccount.bankAccount.bankAccountCards[0].expDate = new Date()
//    this.glAccount.bankAccount.bankAccountCards[0].heldFrom = new Date()
//    this.glAccount.bankAccount.bankAccountCards[0].heldTo = new Date()

    this.dataService.SaveGlAccountDetails(this.glAccount).subscribe(result=>{      
      console.log(result);
    });
  }

  //ToDo: Implement Cancel
  Cancel(){}

}

import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import formfields from './formfields-addAccountDetails.json';
import { FormGroup } from '@angular/forms';
import * as ApplicationFields from "@src/app/Fields/ApplicationFields";
import { DataService } from '@src/app/data.service';
import * as cloneDeep from 'lodash/cloneDeep';
import * as CommonFunctions from "@src/app/CommonFunctions";
import * as AppEnums from "@src/app/AppEnums";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-account-details',
  templateUrl: './add-account-details.component.html',
  styleUrls: ['./add-account-details.component.scss']
})
export class AddAccountDetailsComponent implements OnInit, OnChanges{
 
  public formFields: FormlyFieldConfig[]; 
  public formGroup: FormGroup;
  public _selectedAccount:any 
  public formModel:any
  
  public glAccount:any
 // @Output() SaveDetails = new EventEmitter()

 


  @Input('SelectedAccount')
  get SelectedAccount() {    
    return this._selectedAccount;
  }
  set SelectedAccount(value: any) {
    console.log("event");
    this._selectedAccount = value;
  }
  constructor(private dataService: DataService, private toastr: ToastrService) {
    console.log("constructor");
    this.formModel = {}
    this.formGroup = new FormGroup({});    
    this.glAccount =   {};
  }

  ngOnChanges(): void {
    console.log("onChanges");

    this.dataService.GetGlAccountWithBankAccount(this._selectedAccount.gLAccountID).subscribe(result=>{
      console.log(result);
      //CommonFunctions.FormatDates(result);
      if (result.bankAccount && result.bankAccount.bankAccountCards) {
        for (var i = 0; i < result.bankAccount.bankAccountCards.length; i++) {
          result.bankAccount.bankAccountCards[i].expDate = CommonFunctions.GetMonthYear(result.bankAccount.bankAccountCards[i].expDate);
          
        }

      }
      this.glAccount = result;       
    });   
  }


  ngOnInit() {
    console.log("onInit");
     
    this.formFields = ApplicationFields.ApplicationFields.InitializeFields(formfields);
    //Todo: AJ-Possibility to improve the template initialization with NULL checking
          ApplicationFields.ApplicationFields.FindField("currentBalance", this.formFields).expressionProperties = {
        'template': () =>
          'Account Balance ' +  0  //ToDo: Display only field (need a service call)
      };      
  }

  AddCard(){
    this.glAccount.bankAccount.bankAccountCards.push({});

  }

  
  // Save() {

  //   if (!this.formGroup.valid) {
  //     this.toastr.error('', "Please fix highlighted errors");
  //     return;
  //   }

  //   this.glAccount.accountName = this._selectedAccount.accountName;
  //   if (this.glAccount.bankAccount != null) {
  //     this.glAccount.bankAccount.bsbDetailID = CommonFunctions.GetAutoTextValues(this.glAccount.bankAccount.bsbDetailID, AppEnums.AutoTextTypes.BSB);
  //   }

  //   this.dataService.SaveGlAccountDetails(this.glAccount).subscribe(result=>{      
  //     console.log(result);
  //   });
  // }

  // //ToDo: Implement Cancel
  // Cancel(){}

}

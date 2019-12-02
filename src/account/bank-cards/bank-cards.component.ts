import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import formfields from './formfields-bankCard.json';
import { FormGroup, FormControl, ValidatorFn, AbstractControl } from '@angular/forms';
import * as ApplicationFields from "@src/app/Fields/ApplicationFields";
import { DataService } from '@src/app/data.service';
import * as cloneDeep from 'lodash/cloneDeep';
import * as CommonFunctions from "@src/app/CommonFunctions";
import * as moment_ from 'moment-mini';
const moment = moment_;


export function DateRangeValidator(currentControl, minDateControl, maxDateControl, model: any): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    if (!model[minDateControl] || !model[maxDateControl]) {
      return null;
    }
    if (control.parent == undefined) {
      return null;
    }
    if (control.parent.controls[maxDateControl] && control.parent.controls[minDateControl] && control.parent.controls[minDateControl].value) {

      if(control.parent.controls[maxDateControl].value) {
        let minControlValue = moment(control.parent.controls[minDateControl].value).format("DD-MMM-YYYY");
        let maxControlValue = moment(control.parent.controls[maxDateControl].value).format("DD-MMM-YYYY");
        let minControlDate = moment(minControlValue);
        let maxControlDate = moment(maxControlValue);
  
        if (minControlDate.isSameOrAfter(maxControlDate)) {
          return { 'dateOutofRangeError': true };
        }        
      }

      if (currentControl == minDateControl) {
        if (control.parent.controls[maxDateControl]) {
          if (control.parent.controls[maxDateControl].invalid) {
            control.parent.controls[maxDateControl].updateValueAndValidity();
          }
        }
      }
      else {
        if (control.parent.controls[minDateControl]) {
          if (control.parent.controls[minDateControl].invalid) {
            control.parent.controls[minDateControl].updateValueAndValidity();
          }
        }
      }
    }




    return null;
  };
}



@Component({
  selector: 'app-bank-cards',
  templateUrl: './bank-cards.component.html',
  styleUrls: ['./bank-cards.component.scss']
})
export class BankCardsComponent implements OnInit {
  public formFields: FormlyFieldConfig[];
  public formGroup: FormGroup;
  bankCard: any


  @Input('BankCard')
  get BankCard() {
    return this.bankCard;
  }
  set BankCard(value: any) {
    this.bankCard = value;
    this.InitComponentData();
  }

  @Output() OnBankCardRemoved: EventEmitter<any> = new EventEmitter<any>();

  constructor(private dataService: DataService) {
    this.formGroup = new FormGroup({});
  }
  InitComponentData() {
    if (this.bankCard != null) {
      // this.bankCard.formDirty = this.formDirty;
      this.bankCard.formGroup = this.formGroup;
    }
    setTimeout(() => CommonFunctions.InvalidateRequiredFields(this.formGroup));
  }
  ngOnInit() {
    this.formFields = ApplicationFields.ApplicationFields.InitializeFields(formfields);

    ApplicationFields.ApplicationFields.FindField("remove", this.formFields).templateOptions.onClick = ($event) => {
      this.OnBankCardRemoved.emit(this.bankCard);
    }

    // ApplicationFields.ApplicationFields.FindField("heldDate", this.formFields).validators = {
    //   fieldMatch: {
    //     expression: (control) => {
    //       const value = control.value;
    //       // avoid displaying the message error when values are empty
    //       return (!value.heldFrom || !value.heldTo) ||
    //         moment(value.heldTo).isAfter(moment(value.heldFrom));
    //     },
    //     message: "Please select Held To date greater than Held From date or leave Held To as empty.",
    //     errorPath: "heldTo",
    //   },
    // };

    ApplicationFields.ApplicationFields.FindField("heldFrom", this.formFields).validators = {
      validation: [DateRangeValidator("heldFrom", "heldFrom", "heldTo", this.BankCard)]
    };


    ApplicationFields.ApplicationFields.FindField("heldTo", this.formFields).validators = {
      validation: [DateRangeValidator("heldTo", "heldFrom", "heldTo", this.BankCard)]
    };

    this.InitComponentData();
  }
}

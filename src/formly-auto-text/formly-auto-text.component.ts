import { Component, OnInit, Input } from '@angular/core';
import { Guid } from "guid-typescript";

import { DataService } from './../data.service';
import { Subject, Observable, of, concat } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, tap, switchMap, finalize } from 'rxjs/operators';
import { FieldType, FieldArrayType, FormlyFieldConfig } from '@ngx-formly/core';
import { get } from 'lodash';
@Component({
  selector: 'app-formly-auto-text',
  templateUrl: './formly-auto-text.component.html',
  styleUrls: ['./formly-auto-text.component.scss']
})
export class FormlyAutoTextComponent extends FieldType implements OnInit {
  AutoTextControlID: Guid = null;
  constructor(private dataService: DataService) {

    super();
  }
  CheckRequired() {
    return (model: any, formState: any, currentField: FormlyFieldConfig) => {
      console.log(this.to.required);
      if (this.to.required == undefined) {
        return false;
      }
      return this.to.required;
    };
  }
 
  ngOnInit() {
   
    if (!this.field.expressionProperties) {
      this.field.expressionProperties = {};
    }
//    this.field.expressionProperties['templateOptions.required']= this.CheckRequired();
//    this.field.expressionProperties = {
//      'templateOptions.required': this.CheckRequired()
//
//    };

    this.AutoTextControlID = Guid.create();
    if (this.to.allowMultiple && this.to.maxSelectedItems == undefined) {
      this.to.maxSelectedItems = 999;
    }
    let thisClass = this;
    this.to.ClearList = function () {

      thisClass.ResetSearch(true);
    }
    this.ResetSearch(false);
    //this.field.templateOptions.change  = this.FieldChanged();

    this.formControl.valueChanges.subscribe(val => {
      if (!val) {
        return;
      }
      if (!this.to.autoTextCode) {
        return;
      }
      if (this.currentValue != val) {

        if (typeof val === "string" || typeof val === "number") {
          let currentparentID = "";
          if (typeof this.to.parentID === "string" || typeof this.to.parentID === "number") {
            currentparentID = this.to.parentID.toString();
          }

          this.dataService.AutoTextSearch(this.to.autoTextCode,
            this.CurrentText,
            currentparentID,
            null,
            this.to.secondParentID,
            this.to.thirdParentID,
            this.to.fourthParentID,
            this.to.fifthParentID,
            val.toString()).subscribe(result => {
              this.currentValue = result;
              
            this.formControl.setValue(result);

          });

        } else {
          if (Array.isArray(val)) {
            if (val.length == 0) {
              if (!this.to.donotloaddefault) {
                this.LoadDefaultValues("",false);
              }
            }
          }
        }
      }
      //console.log(val);
    });

  }
  currentValue: any = null;
  firstFocus: boolean = true;
  defaultValues: any[] = [];
  TextBoxFocussed() {
    if (this.firstFocus) {
      console.log(this.firstFocus);
      //someArrayOfStrings.map(opt => ({ label: opt, value: opt }));
      this.firstFocus = false;

      /*
      
       */
    }


  }
  TextSearch$: Observable<any[]>;
  TextSearchLoading = false;
  TextSearchinput$ = new Subject<string>();
  CurrentText: any = "";

  ResetSearch(isClearing) {
    let currentSelections = "";
    if (this.model && this.key) {
      currentSelections = get(this.model, this.key);

      /*
      if (this.model[this.key]) {
        val = this.model[this.key];
      }
      */
    }
    if (!currentSelections) {
      currentSelections = "";
    }
     
    if (currentSelections == "") {
      if (this.to.donotloaddefault) {
        this.ResetSearchInternal();
        return;
      }

    }
    if (!this.to.autoTextCode) {
      return;
    }
    if (Array.isArray(currentSelections)) {
      if (currentSelections.length == 0) {
        if (!this.to.donotloaddefault) {
          this.LoadDefaultValues("", false);
        }
      }
    } else {
      this.LoadDefaultValues(currentSelections, true);
    }
    //if (!isClearing)
    {
     
    }

    
    //    if (currentSelections != "") {
    //      this.ResetSearchInternal();
    //      return;
    //    }


  }
  LoadDefaultValues(currentSelections,makeSelections) {
    this.dataService.AutoTextSearch(this.to.autoTextCode, this.CurrentText, this.to.parentID, null,
      this.to.secondParentID, this.to.thirdParentID, this.to.fourthParentID, this.to.fifthParentID, currentSelections).subscribe(result => {
      let resp = [];
        for (let i = 0; i < result.length; i++) {
          let allowed = this.IsAllowed(result[i]);

        if (allowed) {
          resp.push(result[i]);
        }
        }
        this.AddForcedList(resp);

        this.defaultValues = resp;
        if (makeSelections) {
          if (currentSelections != "") {
             
            this.formControl.setValue(result);
            console.log(this.key);
            console.log(result);
            //  this.model[this.key] = result;
          } else {
            if (result.length > 0) {
              if (result[0].defaultSelected) {
                
                this.formControl.setValue([result[0]]);
              }
            }

          }
        }
      
      this.ResetSearchInternal();
    });

  }
  IsAllowed(data) {
    let allowed = true;
    if (this.to.IgnoredTexts) {


      for (let j = 0; j < this.to.IgnoredTexts.length; j++) {
        if (data.displayValue == this.to.IgnoredTexts[j]) {
          allowed = false;
          break;
        }
      }
    }
    return allowed;
  }
  AddForcedList(resp) {
    if (!this.to.ForcedItems) {
      return;
    }
    if (this.to.ForcedItems != null) {


      for (let j = 0; j < this.to.ForcedItems.length; j++) {
        let allowed = true;
        for (let i = 0; i < resp.length; i++) {
          if (resp[i].displayValue == this.to.ForcedItems[j].displayValue) {
            allowed = false;
            break;
          }
        }
        if (allowed) {
          resp.push(this.to.ForcedItems[j]);
        }
      }
    }
  }
  ResetSearchInternal() {



    //this.defaultValues = [{ "displayValue": "aaaaaaaaaaaaa" }];
    this.TextSearch$ = null;
    this.TextSearch$ = concat(
      of(this.defaultValues), // default items
      this.TextSearchinput$.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        tap(() => this.TextSearchLoading = true),
        switchMap(term => of(this.CurrentText = term)),
        //switchMap(term => of(this.TextChanged.emit(this.CurrentText))),
        switchMap(term => this.dataService.AutoTextSearch(this.to.autoTextCode, this.CurrentText, this.to.parentID, null,
          this.to.secondParentID, this.to.thirdParentID, this.to.fourthParentID, this.to.fifthParentID).pipe(
            map(
              (data: any) => {
                console.log(data);
                let resp = [];
                for (let i = 0; i < data.length; i++) {
                  let allowed = this.IsAllowed(data[i]);
                  
                  if (allowed) {
                    resp.push(data[i]);
                  }
                }
                this.AddForcedList(resp);
                /*
                if (this.to.ForcedItems != null) {


                  for (let j = 0; j < this.to.ForcedItems.length; j++) {
                    let allowed = true;
                    for (let i = 0; i < resp.length; i++) {
                      if (data[i].displayValue == this.to.ForcedItems[j].displayValue) {
                        allowed = false;
                        break;
                      }
                    }
                    if (allowed) {
                      resp.push(this.to.ForcedItems[j]);
                    }
                  }
                }

                */
                return resp;
                //return (data.length != 0 ? data as any[] : []);
              }
            ),

            catchError(() => of([])), // empty list on error
            tap(() => this.TextSearchLoading = false)
          ))
      )
    );
  }

  ResetSearchOld() {


    //this.defaultValues = [{ "displayValue": "aaaaaaaaaaaaa" }];
    this.TextSearch$ = null;
    this.TextSearch$ = concat(
      of(this.defaultValues), // default items
      this.TextSearchinput$.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        tap(() => this.TextSearchLoading = true),
        switchMap(term => of(this.CurrentText = term)),
        //switchMap(term => of(this.TextChanged.emit(this.CurrentText))),
        switchMap(term => this.dataService.AutoTextSearch(this.to.autoTextCode, this.CurrentText, this.to.parentID, null,
          this.to.secondParentID, this.to.thirdParentID, this.to.fourthParentID, this.to.fifthParentID).pipe(
            map(
              (data: any) => {
                console.log(data);
                let resp = [];
                for (let i = 0; i < data.length; i++) {
                  let allowed = true;
                  if (this.to.IgnoredTexts != null) {


                    for (let j = 0; j < this.to.IgnoredTexts.length; j++) {
                      if (data[i].displayValue == this.to.IgnoredTexts[j]) {
                        allowed = false;
                        break;
                      }
                    }
                  }
                  if (allowed) {
                    resp.push(data[i]);
                  }
                }
                if (this.to.ForcedItems != null) {


                  for (let j = 0; j < this.to.ForcedItems.length; j++) {
                    let allowed = true;
                    for (let i = 0; i < resp.length; i++) {
                      if (data[i].displayValue == this.to.ForcedItems[j].displayValue) {
                        allowed = false;
                        break;
                      }
                    }
                    if (allowed) {
                      resp.push(this.to.ForcedItems[j]);
                    }
                  }
                }
                return resp;
                //return (data.length != 0 ? data as any[] : []);
              }
            ),

            catchError(() => of([])), // empty list on error
            tap(() => this.TextSearchLoading = false)
          ))
      )
    );
  }

}

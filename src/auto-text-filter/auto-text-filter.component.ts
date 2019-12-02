import { NgModule, forwardRef ,Component, Output, EventEmitter, OnInit, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { DataService } from './../data.service';
import { Subject, Observable, of, concat } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, tap, switchMap, finalize } from 'rxjs/operators';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const customValueProvider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AutoTextFilterComponent),
  multi: true
};

@Component({
  selector: 'app-auto-text-filter',
  templateUrl: './auto-text-filter.component.html',
  styleUrls: ['./auto-text-filter.component.scss'],
  providers: [customValueProvider]
})
export class AutoTextFilterComponent implements OnInit, ControlValueAccessor{
  public writeValue(obj: any) {
  }
  propagateChange: any = () => { };

  public registerOnChange(fn: any) {
    this.propagateChange = fn;
  }
  public registerOnTouched(fn: any) {
    // this.propagateChange = fn;
  }
 
  @Input('') InputMask: string = "";
  private _AutoTextCode: string;  
  @Input('') PlaceHolder: string= "";  
  @Input('') RequiredMessage: string = "This field is required";

  public _IsRequired: boolean = false;
  @Input('IsRequired') 
  set IsRequired(value: boolean) {
    this._IsRequired = value;
    // this.IsValid();
  };


  _maxSelectedItems:number=1;
  public _AllowMultiple: boolean = false;
  @Input('AllowMultiple')
  set AllowMultiple(value: boolean) {
     
    if (value != null) {
      this._AllowMultiple = value;
      if (value) {
        this._maxSelectedItems = 999;
      }
    }
    
    
  };


  @Input('AutoTextCode')
  set AutoTextCode(name: string) {
    this._AutoTextCode = name;
    this.ResetSearch();
  }

  private _disabled: boolean = false;
  @Input('disabled')
  get disabled() {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = value;
  }
 
  IsValid()
  {
    if (this._IsRequired) {
      return this.SelectedObject != null;

    }
    return true;
  }

  private _IgnoredTexts: any[] = [];

  @Input('IgnoredTexts')
  set IgnoredTexts(name: any[]) {
    this._IgnoredTexts = name;

  }


  private _ForcedItems: any[] = [];

  @Input('ForcedItems')
  set ForcedItems(name: any[]) {
    this._ForcedItems = name;

  }
   
  private _ParentID: number = null;

  @Input('ParentID')
  set ParentID(name: number) {
    console.log(name);
    this._ParentID = name;
    this.ResetSearch();
  }



  private _SecondParentID: any = null;

  @Input('SecondParentID')
  set SecondParentID(name: number) {
    console.log(name);
    this._SecondParentID = name;
    this.ResetSearch();
  }


  public InternalSelectedObject=[];
  private _CurrentID: number = null;


  @Output('CurrentIDChange') CurrentIDemitter: EventEmitter<any> = new EventEmitter<any>();

  @Input('CurrentID')
  set CurrentID(name: number) {
    console.log(name);
    this._CurrentID = name;
    if ((name == null || name == undefined || name.toString() == "") ) {
      // this._Selection = null;
      // this.SelectedObject = null;
      return;
    }
    this.dataService.AutoTextSearch(this._AutoTextCode, "", this._ParentID, this._CurrentID,null).subscribe(result => {
      if (result.length > 0) {
        this._Selection = result[0];
        this.SelectedObject = result[0];
        this.InternalSelectedObject = [];
        console.log(this.SelectedObject);
        this.InternalSelectedObject.push(this.SelectedObject);
        console.log(this.InternalSelectedObject);
        this.emitter.emit(this.SelectedObject);
        this.DataChanged.emit(this.SelectedObject);
      }
      
      

    });
   
  }




  @Output('SelectionChange') emitter: EventEmitter<any> = new EventEmitter<any>();

  private _Selection: any;
  @Input('Selection')
  set Selection(name: any) {
    this._Selection = name;
    this.SelectedObject = name;
    this.InternalSelectedObject = [];
    if (this.SelectedObject != null && this.SelectedObject != undefined) {
      this.InternalSelectedObject.push(this.SelectedObject);
    }
    

  }

  TextSearch$: Observable<any[]>;
  TextSearchLoading = false;
  TextSearchinput$ = new Subject<string>();

  SelectedObject: any;
  @Output() DataChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() TextCleared: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() TextChanged: EventEmitter<any> = new EventEmitter<any>();
  EmitEvent() {
    console.log(this.InternalSelectedObject);
    this.propagateChange(this.InternalSelectedObject);
    this.emitter.emit(this.InternalSelectedObject);
    this.DataChanged.emit(this.InternalSelectedObject);
    /*
    if (this.InternalSelectedObject.length == 0) {
      this.propagateChange(null);
    } else {
      this.propagateChange(this.InternalSelectedObject[0].id);
    }
    
    this.emitter.emit(this.InternalSelectedObject[0]);
    this.DataChanged.emit(this.InternalSelectedObject[0]);
    */
  }

  constructor(private dataService: DataService) {

  }
  SetTextCleared() {
    this.CurrentID = null;
    this._Selection = null;    
    this.TextCleared.emit(true);
    this.CurrentIDemitter.emit(null);
  }
  CurrentText:any="";
  ResetSearch() {
    this._Selection = null;
    setTimeout(() => this.SetTextCleared());
    //this.SelectedText = null;

    this.TextSearch$ = null;
    this.TextSearch$ = concat(
      of([]), // default items
      this.TextSearchinput$.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        tap(() => this.TextSearchLoading = true),
        switchMap(term => of(this.CurrentText = term)),
        switchMap(term => of(this.TextChanged.emit(this.CurrentText ))),
        switchMap(term => this.dataService.AutoTextSearch(this._AutoTextCode, this.CurrentText, this._ParentID, null, this._SecondParentID).pipe(
           map(
            (data: any) => {
               console.log(data);
               let resp = [];
               for (let i = 0; i < data.length; i++) {
                 let allowed = true;
                 if (this._IgnoredTexts != null) {


                   for (let j = 0; j < this._IgnoredTexts.length; j++) {
                     if (data[i].DisplayValue == this._IgnoredTexts[j]) {
                       allowed = false;
                       break;
                     }
                   }
                 }
                 if (allowed) {
                   resp.push(data[i]);
                 }
               }
               if (this._ForcedItems != null) {


                 for (let j = 0; j < this._ForcedItems.length; j++) {
                   let allowed = true;
                   for (let i = 0; i < resp.length; i++) {
                     if (data[i].DisplayValue == this._ForcedItems[j].DisplayValue) {
                       allowed = false;
                       break;
                     }
                   }
                   if (allowed) {
                     resp.push(this._ForcedItems[j]);
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
  ngOnInit() {
    this.ResetSearch();

  }

}

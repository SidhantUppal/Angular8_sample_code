import { NgModule, Component, Output, EventEmitter, OnInit, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';

import { DataService } from './../data.service';
import { Subject, Observable, of, concat } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, tap, switchMap, finalize } from 'rxjs/operators';


@Component({
  selector: 'app-data-option-display',
  templateUrl: './data-option-display.component.html',
  styleUrls: ['./data-option-display.component.scss']
})
export class DataOptionDisplayComponent implements OnInit {
  private _DataOptionTypeCode: string="";
  @Input('DataOptionTypeCode')
  set DataOptionTypeCode(name: string) {
    this._DataOptionTypeCode = name;
    this.ResetSearch();
  }

  @Output('CurrentIDChange') CurrentIDemitter: EventEmitter<any> = new EventEmitter<any>();


  private _CurrentID: number = null;

  @Input('CurrentID')
  set CurrentID(name: number) {
    this._CurrentID = name;
    if (name == null || name == undefined) {
      return;
    }
    
    this.dataService.GetDataOptions(this._DataOptionTypeCode, false, null, null).subscribe(result => {
      if (result.length > 0) {
        console.log(result);
        this.DataOptions = result;
        for (var i = 0; i < result.length; i++) {
          if (result[i].DataOptionID == this._CurrentID ) {
            this._Selection = result[i];
            this.SelectedValue = this._CurrentID;

          }
        }
        


       
        
      }



    });

  }


  @Output('SelectionChange') emitter: EventEmitter<any> = new EventEmitter<any>();

  private _Selection: any;
  @Input('Selection')
  set Selection(name: any) {
    this._Selection = name;
    


  }

  private _disabled: boolean = false;
  @Input('disabled')
  get disabled() {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = value;
  }

  @Output() DataChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
  Changed() {
    for (let i = 0; i < this.DataOptions.length; i++) {
      if (this.DataOptions[i].DataOptionID == this.SelectedValue) {
        this._Selection = this.DataOptions[i];
        this._CurrentID = this.DataOptions[i].DataOptionID;
      }
    }
    this.EmitEvent();
  }
  
  EmitEvent() {
   
    this.CurrentIDemitter.emit(this._CurrentID);
    this.emitter.emit(this._Selection);
    this.DataChanged.emit(true);
  }

  constructor(private dataService: DataService) {

  }
  SelectedValue:number=-1;
  ResetSearch() {
    if (this._DataOptionTypeCode == "") {
      return;
    }
    this.dataService.GetDataOptions(this._DataOptionTypeCode, false, null, null).subscribe(result => {
      this.DataOptions = result;
      console.log(result);
      if (result.length > 0 ) {
        let defaultSelected = false;
        for (var i = 0; i < result.length; i++) {
          if (result[i].IsDefaultValue && this._CurrentID == null) {
            this._Selection = result[i];
            defaultSelected = true;
          }
        }
        if (!defaultSelected && this._CurrentID == null) {
          this._Selection = result[0];
        }
        if (this._CurrentID == null) {


          this._CurrentID = this._Selection.DataOptionID;
          this.SelectedValue = this._CurrentID;
        }
        this.EmitEvent();
      }
      

    });

  }
  DataOptions:any[]=[];
  InternalSelectedObject:any=null;
  ngOnInit() {
    this.ResetSearch();
  }

}

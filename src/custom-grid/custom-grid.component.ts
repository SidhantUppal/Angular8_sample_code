import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Guid } from "guid-typescript";
import { SlickRemoteModel, SlickRemoteModelConfiguration } from '../SlickRemote';
import {
  Formatter, Formatters, AngularGridInstance, Column, FieldType, Editors,
  EditorArgs,
  OnEventArgs,
  EditorValidator,
  GridOption, GridOdataService
} from 'angular-slickgrid';


import { DataService } from './../data.service';
import * as GlobalSettings from "../GlobalSettings";

@Component({
  selector: 'app-custom-grid',
  templateUrl: './custom-grid.component.html',
  styleUrls: ['./custom-grid.component.scss']
})
export class CustomGridComponent implements OnInit, OnChanges {
  GridID: Guid = null;

  ngOnChanges(changes: SimpleChanges) {


    for (let propName in changes) {
      // only run when property "data" changed
      if (propName === 'gridParams') {
        //console.log(this.CurrentGrid);
        if (changes[propName].firstChange) {
          return;
        }
        this.LoadGrid(changes[propName].currentValue["isCompleteRefresh"]);
      }
    }
  }
  constructor(private dataService: DataService) {
    this.GridID = Guid.create();

  }
  _customgridOptions: any = null;
  @Input('customgridOptions')
  set customgridOptions(name: any) {
    this._customgridOptions = name;



    console.log(this._customgridOptions);
  }
  _customcolumnDefinitions: Column[] = null;
  @Input('customcolumnDefinitions')
  set customcolumnDefinitions(name: Column[]) {
    this._customcolumnDefinitions = name;

  }

  _gridWidth: any = null;
  @Input('gridWidth')
  set gridWidth(name: any) {
    this._gridWidth = name;

  }
  _gridHeight: any = null;
  @Input('gridHeight')
  set gridHeight(name: any) {
    this._gridHeight = name;

  }
  @Output('onCustomAngularGridCreated') emitter: EventEmitter<AngularGridInstance> = new EventEmitter<AngularGridInstance>();
  @Output('CustomOnClick') clickEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output('CustomOnSelectedRowsChanged') SelectedRowsChangedEmitter: EventEmitter<any> = new EventEmitter<any>();

  @Input('dataProvider') dataProvider: (params) => any[];
  @Input('gridParams') gridParams: any;
  ngOnInit() {
    if (this._customgridOptions == null || this._customgridOptions == undefined) {
      this._customgridOptions = GlobalSettings.SystemConfig.GetMasterGridConfig(this.GridID.toString() + "Wrap");
    } else {
      this._customgridOptions.autoResize.containerId = this.GridID.toString() + "Wrap";
    }
  }
  slickRemote: SlickRemoteModel;
  slickRemoteConf: SlickRemoteModelConfiguration;
  CurrentGrid: any = null;
  SortColumn: string = "";
  SortOrder: string = "";
  angularGridReady(angularGrid: AngularGridInstance) {
    console.log("bbbbbbbbbbbbbbbbbbb");
    console.log(this.dataProvider);

    this.slickRemoteConf = new SlickRemoteModelConfiguration((params) => this.dataProvider(params), angularGrid,
      null, null, null);
    this.CurrentGrid = angularGrid;
    this.slickRemote = new SlickRemoteModel(this.slickRemoteConf);

    angularGrid.slickGrid.setData(this.slickRemote.data);
    const thisClass = this;
    console.log(this.CurrentGrid.slickGrid);
    this.CurrentGrid.slickGrid.onSort.subscribe(function (e, args) {
      alert("qqqqqqqqqqqqq");
      thisClass.SortColumn = args.sortCol.field;
      thisClass.SortOrder = args.sortAsc ? "asc" : "desc";

      thisClass.slickRemote.setSort(args.sortCol.field, args.sortAsc ? 1 : -1);
      const vpl = thisClass.CurrentGrid.slickGrid.getViewport();
      thisClass.slickRemote.ensureData(vpl.top, vpl.bottom, true, thisClass.gridParams);
    });
    this.LoadGrid(true);
    this.emitter.emit(angularGrid);
  }
  GridInitialised: boolean = false;
  LoadGrid(isCompleteRefresh) {
    //this.CurrentSelectedRule = null;
    if (this.CurrentGrid == null) {
      return;
    }

    if (isCompleteRefresh) {
      const vp = this.CurrentGrid.slickGrid.getViewport();
      this.slickRemote.ensureData(vp.top, vp.bottom, true, this.gridParams);
      this.GridInitialised = true;
      //setTimeout(this.RefreshGridUI, 50);
      setTimeout(() => this.RefreshGridUI(), 50);
    } else {
      this.slickRemote.refreshData(this.gridParams);
    }
  }
  RefreshGridUI() {

    this.CurrentGrid.slickGrid.invalidate();
    this.CurrentGrid.slickGrid.render();

  }

  onCellClicked(e) {
    this.clickEmitter.emit(e);
  }
  onSelectedRowsChanged(e) {
    this.SelectedRowsChangedEmitter.emit(e);

  }
}

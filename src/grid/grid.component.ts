import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { KeyValueChanges, KeyValueDiffer, KeyValueDiffers } from '@angular/core';
import { Column, AngularGridInstance } from 'angular-slickgrid';
import { SlickRemoteModel, SlickRemoteModelConfiguration } from '../SlickRemote';
import { Guid } from "guid-typescript";
import { GridSettings } from './grid-settings';
import { SystemConfig } from '../GlobalSettings';
import * as cloneDeep from 'lodash/cloneDeep';
import * as CommonFunctions from "@src/app/CommonFunctions";

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit {

  GridID: Guid = null;

  // private _gridId: string;
  // @Input('GridId')
  // get GridId() {
  //   return this._gridId;
  // }
  // set GridId(value: string) {
  //   this._gridId = value;
  // }

  // private _id: string;
  // @Input('Id')
  // get Id() {
  //   return this._id;
  // }
  // set Id(value: string) {
  //   this._id = value;
  // }

  private _gridSettings: GridSettings;
  @Input('GridSettings')
  get GridSettings() {
    return this._gridSettings;
  }
  set GridSettings(value: GridSettings) {
    this._gridSettings = value;
  }


  private _gridHeight: string;
  @Input('GridHeight')
  get GridHeight() {
    return this._gridHeight;
  }
  set GridHeight(value: string) {
    this._gridHeight = value;
  }

  private _gridWidth: string;
  @Input('GridWidth')
  get GridWidth() {
    return this._gridWidth;
  }
  set GridWidth(value: string) {
    this._gridWidth = value;
  }

  private _gridWrap: string;
  get GridWrap() {
    return this._gridWrap;
  }
  set GridWrap(value: string) {
    this._gridWrap = value;
  }

  private _columnDefinitions: Column[];
  @Input('ColumnDefinitions')
  get ColumnDefinitions() {
    return this._columnDefinitions;
  }
  set ColumnDefinitions(value: Column[]) {
    this._columnDefinitions = value;
  }

  private _gridOptions: any[];
  @Input('GridOptions')
  get GridOptions() {
    return this._gridOptions;
  }
  set GridOptions(value: any) {
    this._gridOptions = value;
  }

  // private _gridWidth: any[];
  // @Input('GridWidth')
  // get GridWidth() {
  //   return this._gridWidth;
  // }
  // set GridWidth(value: any) {
  //   this._gridWidth = value;
  // }

  // private _gridHeight: any[];
  // @Input('GridHeight')
  // get GridHeight() {
  //   return this._gridHeight;
  // }
  // set GridHeight(value: any) {
  //   this._gridHeight = value;
  // }

  // DataService function
  private _dataSource: any;
  @Input('DataSource')
  get DataSource() {
    return this._dataSource;
  }
  set DataSource(value: any) {
    this._dataSource = value;
  }

  // The Grid Params
  private _gridParams: any;
  @Input('GridParams')
  get GridParams() {
    return this._gridParams;
  }
  set GridParams(value: any) {
    this._gridParams = value;
    this.LastGridParams = cloneDeep(value);
  }
  private _GridData: any;
  @Input('GridData')
  get GridData() {
    return this._GridData;
  }
  set GridData(value: any) {
    this._GridData = value;
    if (this.CurrentGrid) {


      this.CurrentGrid.slickGrid.setData(this._GridData);
      this.CurrentGrid.slickGrid.invalidate();
      this.CurrentGrid.slickGrid.render();
    }
  }
  private _selectedRow: any;
  get SelectedRow() {
    return this._selectedRow;
  }
  set SelectedRow(value: any) {
    this._selectedRow = value;
  }

  // private _sortColumn: string = "";
  // @Input('SortColumn')
  // get SortColumn() {
  //   return this._sortColumn;
  // }
  // set SortColumn(value: string) {
  //   this._sortColumn = value;
  // }

  // private _sortOrder: string = "";
  // @Input('SortOrder')
  // get SortOrder() {
  //   return this._sortOrder;
  // }
  // set SortOrder(value: string) {
  //   this._sortOrder = value;
  // }

  slickRemote: SlickRemoteModel;
  slickRemoteConf: SlickRemoteModelConfiguration;
  CurrentGrid: any = null;
  public gridInitialised: boolean = false;

  @Output() onCellClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() OnSelectedRowsChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() OnBeforeEditCell: EventEmitter<any> = new EventEmitter<any>();
  @Output() SelectedRowChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() onAngularGridCreated: EventEmitter<AngularGridInstance> = new EventEmitter<AngularGridInstance>();

  constructor() {
    this.GridID = Guid.create();

    // if (this.GridSettings == null) {
    //   this.GridSettings = new GridSettings();
    // }

  }

  ngOnInit() {
    this.GridWrap = this.GridID + "Wrap";

    if (this.GridSettings == null) {
      this.GridSettings = new GridSettings(this.GridHeight, this.GridWidth);
    }

    if (this.GridOptions == null) {
      this.GridOptions = SystemConfig.GetMasterGridConfig(this.GridWrap);
    }
    else {
      this.GridOptions.autoResize = {
        "containerId": this.GridWrap,
      };
    }
  }

  LastGridParams = null;
  ngDoCheck(): void {

    if(this.gridInitialised) {
      if (this.LastGridParams == null) {
        if (this.GridParams != null) {
          
          this.LastGridParams = cloneDeep(this.GridParams);
           
          this.LoadGridInternal();
          return;
        }
  
      }
      else {
        if (JSON.stringify(this.LastGridParams) != JSON.stringify(this.GridParams)) {
          
          this.LastGridParams = cloneDeep(this.GridParams);
          
          this.LoadGridInternal();
          return;
  
        }
  
      }
    }
  }

  LoadGridInternal() {
    if (this.GridParams.isCompleteRefresh != null) {
      this.LoadGrid(this.GridParams.isCompleteRefresh);
    } else {
      this.LoadGrid(true);
    }

  }

  /*
  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
    for (let propName in changes) {
      // only run when property "data" changed
      if (propName === 'GridParams') {
        //console.log(this.CurrentGrid);
        if (changes[propName].firstChange) {
          return;
        }
                
        this.LoadGridInternal();
        
        //if (changes[propName].currentValue["isCompleteRefresh"] != null) {
          //this.LoadGrid(changes[propName].currentValue["isCompleteRefresh"]);
        //} else {
          //this.LoadGrid(true);
        //}
        

      }
    }
  } */

  sgOnAngularGridCreated(angularGrid: AngularGridInstance) {
    this.CurrentGrid = angularGrid;
    if (this.DataSource) {
      this.slickRemoteConf = new SlickRemoteModelConfiguration(this.DataSource,
        angularGrid,
        null,
        null,
        null);

      this.slickRemote = new SlickRemoteModel(this.slickRemoteConf);

      angularGrid.slickGrid.setData(this.slickRemote.data);
    } else {
      angularGrid.slickGrid.setData(this._GridData);
    }
    

    const thisClass = this;
    this.CurrentGrid.slickGrid.onSort.subscribe(function (e, args) {
      thisClass.GridSettings.sortColumn = args.sortCol.field;
      thisClass.GridSettings.sortOrder = args.sortAsc ? "asc" : "desc";
      if (thisClass.slickRemote) {


        thisClass.slickRemote.setSort(args.sortCol.field, args.sortAsc ? 1 : -1);
        const vpl = thisClass.CurrentGrid.slickGrid.getViewport();
        thisClass.slickRemote.ensureData(vpl.top, vpl.bottom, true, this.Params);
      }
    });

    this.LoadGrid(true);
    this.onAngularGridCreated.emit(angularGrid);
  }

  LoadGrid(isCompleteRefresh) {
    this.SelectedRow = null;
    //this.EmitEvent();

    if (this.CurrentGrid == null) {
      return;
    }
    if (this.slickRemote) {


      if (isCompleteRefresh) {
        const vp = this.CurrentGrid.slickGrid.getViewport();

        this.slickRemote.setSort(this.GridSettings.sortColumn, this.GridSettings.sortOrder);
        this.CurrentGrid.slickGrid.setSortColumn(this.GridSettings.sortColumn, true);

        this.slickRemote.ensureData(vp.top, vp.bottom, true, this.GridParams);
        if (!this.gridInitialised) {
          this.gridInitialised = true;
        }
      } else {
        this.slickRemote.refreshData(this.GridParams);
      }
    }
    this.LastGridParams = cloneDeep(this.GridParams);
  }

  RefreshGridUI() {
    this.CurrentGrid.slickGrid.invalidate();
    this.CurrentGrid.slickGrid.render();
  }

  // On Cell Clicked
  sgOnCellClicked(event) {
    //const gridData = this.slickRemoteConf.CurrentGrid.slickGrid.getData();  
    //this.SelectedRow = gridData[args.row];
    //this.slickRemoteConf.CurrentGrid.slickGrid.setSelectedRows([args.row]);

    //this.onCellClicked.emit({ eventData : e, arguments: args});
    this.onCellClicked.emit(event);
    //this.EmitEvent();
  }


  // EmitEvent() {
  //   this.SelectedRowChanged.emit(this.SelectedRow);
  // }

  // Before the Cell is Edited
  sgOnBeforeEditCell(event) {
    this.OnBeforeEditCell.emit(event);
  }

  // Selected Rows Changed
  sgOnSelectedRowChanged(event) {
    this.OnSelectedRowsChanged.emit(event);
  }

}

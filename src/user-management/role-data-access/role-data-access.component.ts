import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { DataService } from 'src/app/data.service';
import { GridComponent } from 'src/app/grid/grid.component';
import { Formatters, Column } from 'angular-slickgrid';
import { GridSettings } from 'src/app/grid/grid-settings';
import * as GlobalSettings from '../../GlobalSettings';

@Component({
  selector: 'app-role-data-access',
  templateUrl: './role-data-access.component.html',
  styleUrls: ['./role-data-access.component.scss']
})
export class RoleDataAccessComponent implements OnInit {
  
  columnDefinitions: Column[];
  gridOptions: any;  
  gridSettings : GridSettings;
  public CurrentInputText: string = "";

  public gridParams: any = {};
  public dataSource: any;

  public _CurrentSearchParams: any;
  @Input('CurrentSearchParams')
  get CurrentSearchParams() {
    return this._CurrentSearchParams;
  }
  set CurrentSearchParams(value: any) {
    this._CurrentSearchParams = value;
    this.gridParams.ApplicationRoleID = value.ApplicationRoleID;   
  }
  
  @ViewChild(GridComponent, { static: false }) GridComponentPointer: GridComponent;
  
  constructor(private dataService: DataService) { }

  ngOnInit() {    
    this.dataSource = this.GetRoleDataAccessGridDataSource();    

    this.columnDefinitions = [
      { id: 'Type', name: 'Type', field: 'type', sortable: true },
      { id: 'Name', name: 'Name', field: 'name', sortable: true }            
    ];
  }

  GetRoleDataAccessGridDataSource() {
    return (params) => this.dataService.SearchRoleDataAccess(params);
  }
}
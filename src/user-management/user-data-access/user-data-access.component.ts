import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Column, Formatters } from 'angular-slickgrid';
import { GridSettings } from 'src/app/grid/grid-settings';
import { GridComponent } from 'src/app/grid/grid.component';
import * as GlobalSettings from '../../GlobalSettings';
import { DataService } from 'src/app/data.service';
import { setTime } from 'ngx-bootstrap/chronos/utils/date-setters';

@Component({
  selector: 'app-user-data-access',
  templateUrl: './user-data-access.component.html',
  styleUrls: ['./user-data-access.component.scss']
})
export class UserDataAccessComponent implements OnInit {

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
    this.gridParams.ApplicationUserID = value.ApplicationUserID;   
  }
  
  @ViewChild(GridComponent, { static: false }) GridComponentPointer: GridComponent;
  
  constructor(private dataService: DataService) { }

  ngOnInit() {    
    this.dataSource = this.GetUserDataAccessGridDataSource();
    // this.gridParams = this.CurrentSearchParams;

    this.columnDefinitions = [
      { id: 'Type', name: 'Type', field: 'type', sortable: true },
      { id: 'Name', name: 'Name', field: 'name', sortable: true }
    ];
  }

  GetUserDataAccessGridDataSource() {
    return (params) => this.dataService.SearchUserDataAccess(params);
  }
}

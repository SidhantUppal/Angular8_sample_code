import { Component, OnInit, ViewChild } from '@angular/core';
import { Column, Formatters, Formatter } from 'angular-slickgrid';
import { GridSettings } from 'src/app/grid/grid-settings';
import { GridComponent } from 'src/app/grid/grid.component';
import { DataService } from 'src/app/data.service';
import { CustomEditPencilFormatter } from 'src/CustomComponents/SlickFormatters/Slick.CustomCheckMarkFormatter';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

import * as GlobalSettings from 'src/app/GlobalSettings';
import * as cloneDeep from 'lodash/cloneDeep';
import { AddEditRoleComponent } from './add-edit-role/add-edit-role.component';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import formFields from './formFields.json';
import * as ApplicationFields from "@src/app/Fields/ApplicationFields";
import { get } from 'lodash';
@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss']
})
export class RoleComponent implements OnInit {

  public formGroup: FormGroup;
  public formModel: any = {};
  public formFields: FormlyFieldConfig[];

  columnDefinitions: Column[];
  gridOptions: any;
  gridSettings: GridSettings;
 
  public gridParams: any = { "showInactive": false };
  public dataSource: any;
  systemRoleColumnDefinitions: Column[];
  systemRoleGridOptions: any;
  systemRoleGridSettings: GridSettings;

  public CurrentInputText: string = "";
  public SelectedRole: any;
  public showInactiveRoles: boolean = false;
  CurrentSearchParams: any = {};

  @ViewChild(GridComponent, { static: false }) GridComponentPointer: GridComponent;

  constructor(private toastr: ToastrService, private modalService: NgbModal, private dataService: DataService) { }

  ngOnInit() {

    const CustomEditFormatter: Formatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any) => {  
      if(dataContext.isSystemRole) {
        return "";
      } else {
        return '<i class="fa fa-pencil-alt pointer edit-icon" aria-hidden="true"></i>';
      }    
    };


    
    this.gridParams = this.GetGridParams();
    this.dataSource = this.GetRoleGridDataSource();

    this.formModel = {
      applicationRole: null,
      showInactive: false
    };

    this.columnDefinitions = [
      {
        id: 'edit',
        field: 'ContractID',
        excludeFromHeaderMenu: true,
        formatter: CustomEditFormatter,
        minWidth: 30,
        maxWidth: 30
      },
      { id: 'role', name: 'Application Role', field: 'name', sortable: true },
      { id: 'systemRole', name: 'System Role', field: 'systemRole', sortable: true },
      { id: 'isActive', name: 'Is Active', field: 'isActive', sortable: true, formatter: Formatters.checkmark }
    ];

    this.formFields = ApplicationFields.ApplicationFields.InitializeFields(formFields);
    this.formGroup = new FormGroup({});
  }

  GetRoleGridDataSource() {
    return (params) => this.dataService.SearchRoles(params);
  }

  GetSystemRoleGridDataSource() {
    return (params) => this.dataService.SearchSystemRolesByApplicationRole(params);
  }

  public DetectChanges() {
    this.gridParams = cloneDeep(this.gridParams);
    return true;
  }

  public GetGridParams(isCompleteRefresh = true) {
    return {
      "ApplicationRoleID": "",
      "showInactive": false,
      "isCompleteRefresh": isCompleteRefresh
    };
  }

  AddRole(currentData, add) {
    const modalRef = this.modalService.open(AddEditRoleComponent, { centered: true, keyboard: false, size: 'lg' });

    modalRef.componentInstance.IsAdd = add;
    if (!add) {
      modalRef.componentInstance.CurrentData = currentData;
    } else {
      modalRef.componentInstance.CurrentData = null;
    }

    modalRef.result.then((result) => {

      if(result != null) {
        this.toastr.success("Role details have been saved successfully");
      }

      if (result != null && result.isActive) {                
        this.SelectedRole = result;
        this.gridParams.isCompleteRefresh = false;
        this.CurrentSearchParams =
          {
            "ApplicationRoleID": this.SelectedRole.applicationRoleID
          };
      } else {
        this.SelectedRole = null;
        this.CurrentSearchParams = null;
        this.gridParams.isCompleteRefresh = true;
      }
    });
  }

  onCellClicked(event) {
    const gridData = this.GridComponentPointer.slickRemoteConf.CurrentGrid.slickGrid.getData();
    if (event.detail != null && event.detail.args != null) {
      var args = event.detail.args;
      this.SelectedRole = gridData[args.row];
      this.SelectedRole["Test"] = {};
      this.SelectedRole["Test"]["a"] = 1;
      console.log(this.SelectedRole.Test);
      console.log(this.SelectedRole.Test.a);
      console.log(this.SelectedRole["Test"]);
      console.log(this.SelectedRole["Test.a"]);
      console.log(get(this.SelectedRole, 'Test.aaa'));
      this.GridComponentPointer.slickRemoteConf.CurrentGrid.slickGrid.setSelectedRows([this.SelectedRole]);
      this.CurrentSearchParams =
        {
          "ApplicationRoleID": this.SelectedRole.applicationRoleID
        };

      if (gridData !== null && args.cell == 0 && !this.SelectedRole.isSystemRole) {
        this.AddRole(this.SelectedRole, false);
      }
    }
  }

  modelChange(model) {
    if (model.applicationRole != null && model.applicationRole.length > 0) {
      this.gridParams.applicationRoleID = model.applicationRole[0].applicationRoleID;
    } else {
      this.gridParams.applicationRoleID = null;
    }
    this.gridParams.showInactive = model.showInactive;
  }
}

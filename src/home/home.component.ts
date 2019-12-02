import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { Column, Formatters } from 'angular-slickgrid';
import { GridSettings } from '../grid/grid-settings';
import { FormDirtyChecker } from '../FormDirtyChecker';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '../data.service';
import { AutoTextTypes } from '../AppEnums';
import { CustomEditPencilFormatter } from '@src/CustomComponents/SlickFormatters/Slick.CustomCheckMarkFormatter';
import { dateAuFormatter } from '@src/CustomComponents/SlickFormatters/Slick.AUDateFormatter';
import { GridComponent } from '../grid/grid.component';
import { Router } from '@angular/router';
import * as ApplicationFields from "@src/app/Fields/ApplicationFields";
import formFields from './formFields.json';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public formGroup: FormGroup;
  public formModel: any = {};
  public formFields: FormlyFieldConfig[];

  columnDefinitions: Column[];
  gridOptions: any;
  gridSettings: GridSettings;
  
  public SelectedHome: any;

  public dataSource: any;
  public gridParams: any = {};

  dirtyChecker: FormDirtyChecker;

  @ViewChild(GridComponent, { static: false }) GridComponentPointer: GridComponent;

  constructor(private toastr: ToastrService, private modalService: NgbModal, private dataService: DataService, private router : Router) {     
  }

  ngOnInit() {

    this.gridParams = this.GetGridParams();
    this.dataSource = this.GetHomeGridDataSource();

    this.formModel = {
      home: '',
      showInactive: false
    };      

      this.columnDefinitions = [    
        {
          id: 'edit',
          field: 'ContractID',
          excludeFromHeaderMenu: true,
          formatter: CustomEditPencilFormatter,
          minWidth: 30,
          maxWidth: 30
        },   
        { id: 'home', name: 'Home', field: 'homeName', sortable: true },
        { id: 'numberOfClients', name: 'Number of Clients', field: 'numberOfClients', sortable: true },
        { id: 'lastBudgetUpdate', name: 'Last Budget Update', field: 'lastBudgetUpdate', sortable: true, formatter: dateAuFormatter },
        { id: 'isActive', name: 'Is Active', field: 'isActive', sortable: true, formatter: Formatters.checkmark },        
      ];

      this.formFields = ApplicationFields.ApplicationFields.InitializeFields(formFields);      
      this.formGroup = new FormGroup({});

  }

  GetGridParams() {
    return {
      "HomeID": "",
      "isActive": null,      
    };
  }

  GetHomeGridDataSource() {
    return (params) => this.dataService.SearchHomes(params);
  }

  // modelChange(model) {
  //   var changes = this.dirtyChecker.GetChanges(model);
  //   console.log('Form Changes', changes);

  // }

  modelChange(model) {
    if (model.home != null && model.home.length > 0) {
      this.gridParams.HomeID = model.home[0].id;
    } else {
      this.gridParams.HomeID = null;
    }
    
    this.gridParams.showInactive = model.showInactive;
  }

  AddEditHome(CurrentData, isAdd) {
    if(isAdd) {
      this.router.navigate(['/HomeManagenent']);
    } else {
      this.router.navigate(['/HomeManagement', { HomeID: CurrentData.homeID }]);
    }
  }

  onCellClicked(event) {
    const gridData = this.GridComponentPointer.slickRemoteConf.CurrentGrid.slickGrid.getData();
    if (event.detail != null && event.detail.args != null) {
      var args = event.detail.args;
      this.SelectedHome = gridData[args.row];
      this.GridComponentPointer.slickRemoteConf.CurrentGrid.slickGrid.setSelectedRows([this.SelectedHome]);      

      if (gridData !== null && args.cell == 0) {
        this.AddEditHome(this.SelectedHome, false);
      }
    } 
  }

} 

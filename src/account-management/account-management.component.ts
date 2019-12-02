import { Component, OnInit, ViewChild } from '@angular/core';
import { GridComponent } from '../grid/grid.component';
import { DataService } from '../data.service';
import { GridSettings } from '../grid/grid-settings';
import { Column, Formatters } from 'angular-slickgrid';
import { CustomEditPencilFormatter } from 'src/CustomComponents/SlickFormatters/Slick.CustomCheckMarkFormatter';
import * as GlobalSettings from '../GlobalSettings';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { AutoTextTypes } from '../AppEnums';
import * as cloneDeep from 'lodash/cloneDeep';
import formfields from './formfields.json';
import * as ApplicationFields from "@src/app/Fields/ApplicationFields";

@Component({
  selector: 'app-account-management',
  templateUrl: './account-management.component.html',
  styleUrls: ['./account-management.component.scss']
})
export class AccountManagementComponent implements OnInit {

  //declarations

  columnDefinitions: Column[];
  gridOptions: any;
  gridSettings: GridSettings;

  public SelectedAccount: any;
  public CurrentInputText: string = "";

  AccountTypes: any[] = null;
  selectedAccountType: any = null;
  public dataSource: any;
  public gridParams: any = {};
  CurrentSearchParams: any = {};

  public formGroup: FormGroup;
  public formModel: any = {};
  public formFields: FormlyFieldConfig[];

  @ViewChild(GridComponent, { static: false }) GridComponentPointer: GridComponent;

  constructor(private toastr: ToastrService, private modalService: NgbModal, private dataService: DataService) { }

  ngOnInit() {

    this.gridParams = this.GetGridParams();
    this.dataSource = this.GetAccountGridDataSource();

    this.formModel = {
      account: '',
      accountType: ''
    };
    /*
    this.formGroup = new FormGroup({});

    this.formFields = [
      {
        fieldGroupClassName: 'row',
        fieldGroup: [
          {
            className: 'col-sm-6',
            key: 'account',
            type: 'AutoText',
            templateOptions: {
              label: '',
              maxSelectedItems: 1,
              required: false,
              placeholder: 'Select Account',
              autoTextCode: AutoTextTypes.Account,
            },
          },
          {
            className: 'col-sm-6',
            key: 'accountType',
            type: 'AutoText',
            templateOptions: {
              label: '',
              maxSelectedItems: 1,
              required: false,
              placeholder: 'Select Account Type',
              autoTextCode: AutoTextTypes.AccountType,
            },
          },
        ]

      }];
    console.log(JSON.stringify(this.formFields));
    this.formFields = ApplicationFields.ApplicationFields.InitializeFields(formfields);

    this.columnDefinitions = [
      {
        id: 'edit',
        field: 'ContractID',
        excludeFromHeaderMenu: true,
        formatter: CustomEditPencilFormatter,
        minWidth: 30,
        maxWidth: 30
      },
      { id: 'accountCode', name: 'Account Code', field: 'accountCode', sortable: true },
      { id: 'accountName', name: 'Account Name', field: 'accountName', sortable: true },
      { id: 'accountType', name: 'Account Type', field: 'accountType', sortable: true },
      { id: 'hasBank', name: 'Has Bank', field: 'hasBank', sortable: true, formatter: Formatters.checkmark }
    ];
    */
    // this.gridSettings = new GridSettings("AccountGrid", "AccountGrid1", "AccountGridWrap", "100%", "300", "AccountCode", 1);
    // this.gridOptions = this.gridSettings.GetMasterGridConfig(this.gridSettings.gridWrap);
  }

  modelChange(model) {
    console.log("model", model);    
    if(model.account != null && model.account.length > 0) {
      this.gridParams.AccountID = model.account[0].accountID;
    } else {
      this.gridParams.AccountID = null;
    }

    if(model.accountType != null && model.accountType.length > 0) {
      this.gridParams.AccountTypeID = model.accountType[0].accountTypeID;
    } else {
      this.gridParams.AccountTypeID = null;
    }
  }

  AddAccount(currentData, add) {

    this.SelectedAccount = { hasTransactions: false };
    
  }

  GetAccountGridDataSource() {
    return (params) => this.dataService.SearchAccounts(params);
  }

  GetGridParams() {
    return {
      
      "AccountID": "",
      
      "AccountTypeID": ""
    };
  }

  // onCellClicked(event) {
  //   const gridData = this.GridComponentPointer.slickRemoteConf.CurrentGrid.slickGrid.getData();
  //   if (event.detail != null && event.detail.args != null) {
  //     var args = event.detail.args;
  //     this.SelectedAccount = gridData[args.row];
  //     this.GridComponentPointer.slickRemoteConf.CurrentGrid.slickGrid.setSelectedRows([this.SelectedAccount]);
  //     this.CurrentSearchParams =
  //       {
  //         "AccountID": this.SelectedAccount.accountID
  //       };

  //     if (gridData !== null && args.cell == 0) {
  //       this.AddAccount(this.SelectedAccount, false);
  //     }
  //   }
  // }

  SelectionChanged(event){
    
    if(event)
    {      
      this.SelectedAccount = cloneDeep(event);
    }  
  }
}

import { Component, OnInit, ViewChild, Input, Output, EventEmitter, NgModuleRef } from '@angular/core';
import { Column, Formatters, Formatter } from 'angular-slickgrid';
import { GridSettings } from '../grid/grid-settings';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { GridComponent } from '../grid/grid.component';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '../data.service';
import { AutoTextTypes, GLEntityType } from '../AppEnums';
import { FormConfig } from '../form-config';
import { FormDirtyChecker } from '../FormDirtyChecker';
import * as ApplicationFields from "@src/app/Fields/ApplicationFields";
import formfields from './formfields.json';
import { CustomEditPencilFormatter } from '@src/CustomComponents/SlickFormatters/Slick.CustomCheckMarkFormatter';
import { AddEditAccountComponent } from './add-edit-account/add-edit-account.component';
import * as CommonFunctions from "@src/app/CommonFunctions";
import { GlobalSettings } from "@src/app/GlobalSettings";

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  columnDefinitions: Column[];
  gridOptions: any;
  gridSettings: GridSettings;
  public CurrentInputText: string = "";
  public SelectedAccount: any;
  public showHighBalanceAccounts: boolean = false;
  AccountTypes: any[] = [];
  selectedAccountType: any = null;

  Administrators: any[] = [];
  selectedAdministrator: any = null;

  public dataSource: any;
  public gridParams: any = {};
  CurrentSearchParams: any = {};

  public formGroup: FormGroup;
  public formModel: any = {};
  public formFields: FormlyFieldConfig[];

  private _showRefund: boolean;
  private _showAdministrator: boolean;
  private _showHighBalance: boolean;
  private _showFilters: boolean = true;
  private _allowAdd: boolean = true;
  private _showIsActiveField: boolean = true;
  dirtyChecker: FormDirtyChecker;
  public GlobalSettings = GlobalSettings;

  @Input('ShowIsActiveField')
  get ShowIsActiveField() {
    return this._showIsActiveField
  }
  set ShowIsActiveField(value: boolean) {
    this._showIsActiveField = value;
  }

  @Input()
  get ShowRefund() {
    return this._showRefund;
  }
  set ShowRefund(value: boolean) {
    this._showRefund = value;
  }

  @Input()
  get ShowAdministrator() {
    return this._showAdministrator;
  }
  set ShowAdministrator(value: boolean) {
    this._showAdministrator = value;
  }

  @Input()
  get ShowHighBalance() {
    return this._showHighBalance;
  }
  set ShowHighBalance(value: boolean) {
    this._showHighBalance = value;
  }

  @Input()
  get ShowFilters() {
    return this._showFilters;
  }
  set ShowFilters(value: boolean) {
    this._showFilters = value;
  }

  public _entityType: GLEntityType;
  @Input('EntityType')
  get EntityType() {
    return this._entityType;
  }
  set EntityType(value: GLEntityType) {
    this._entityType = value;
    this.gridParams.EntityTypeID = value;
  }

  private _entityID: number;
  @Input('EntityID')
  get EntityID() {
    return this._entityID;
  }
  set EntityID(value: number) {
    this._entityID = value;
    this.gridParams.EntityID = value;
  }

  @Input()
  get AllowAdd() {
    return this._allowAdd;
  }
  set AllowAdd(value: boolean) {
    this._allowAdd = value;
  }

  @Output() SelectionChanged: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild(GridComponent, { static: false }) GridComponentPointer: GridComponent;

  constructor(private toastr: ToastrService, private modalService: NgbModal, private dataService: DataService) {
  }

  ngOnInit() {

    const CustomEditFormatter: Formatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any) => {
      if (this.AllowAdd && dataContext.isAccountEditable) {
        return '<i class="fa fa-pencil-alt pointer edit-icon" aria-hidden="true"></i>';
      } else {
        return "";
      }
    };

    this.gridParams = this.GetGridParams();
    this.dataSource = this.GetAccountGridDataSource();

    this.formModel = {
      administrator: '',
      account: '',
      accountType: '',
      highBalanceOnly: false,
      showAdministrator: this.ShowAdministrator,
      showHighBalance: this.ShowHighBalance,
      showFilters: this.ShowFilters,
      showInactive: false
    };

    this.formFields = ApplicationFields.ApplicationFields.InitializeFields(formfields);

    this.columnDefinitions = [
      {
        id: 'edit',
        field: 'ContractID',
        excludeFromHeaderMenu: true,
        formatter: CustomEditFormatter,
        minWidth: 30,
        maxWidth: 30
      },
      { id: 'accountCode', name: 'Account Code', field: 'accountCode', sortable: true },
      { id: 'gLaccountName', name: 'GL Account Name', field: 'gLAccountName', sortable: true },
      { id: 'accountType', name: 'Account Type', field: 'accountType', sortable: true },
      { id: 'bankName', name: 'Bank', field: 'bankName', sortable: true },
      { id: 'bsb', name: 'BSB', field: 'bSB', sortable: true },
      { id: 'bankAccountName', name: 'Bank Account Name', field: 'bankAccountName', sortable: true },
      { id: 'accountNumber', name: 'Account No', field: 'accountNumber', sortable: true },
      { id: 'isActive', name: 'Is Active', field: 'isActive', sortable: true, formatter: Formatters.checkmark },
      { id: 'balance', name: 'Balance', field: 'currentBalance', sortable: true }
    ];

    if (this.ShowRefund) {
      this.columnDefinitions.push({ id: 'refund', name: 'Refund', field: 'refund', sortable: true });
    }

    this.dirtyChecker = new FormDirtyChecker(this.formModel);
    this.formGroup = new FormGroup({});
  }

  HideFilters() {
    return (model: any, formState: any, currentField: FormlyFieldConfig) => {
      return !this.ShowAdministrator;
    };
  }

  GetGridParams() {
    return this.gridParams;
    //    return {
    //      "AccountName": "",
    //      "AccountID": null,
    //      "AccountType": "",
    //      "AccountTypeID": null,
    //      "AdministratorID": null,
    //      "HighBalanceOnly": false,
    //      "EntityTypeID": this.EntityType,
    //      "EntityID": this.EntityID
    //    };
  }

  onCellClicked(event) {
    const gridData = this.GridComponentPointer.slickRemoteConf.CurrentGrid.slickGrid.getData();
    if (event.detail != null && event.detail.args != null) {
      var args = event.detail.args;
      this.SelectedAccount = gridData[args.row];
      this.GridComponentPointer.slickRemoteConf.CurrentGrid.slickGrid.setSelectedRows([this.SelectedAccount]);
      this.CurrentSearchParams =
        {
          "AccountID": this.SelectedAccount.accountID
        };

      this.SelectionChanged.emit(this.SelectedAccount);

      if (gridData !== null && args.cell == 0 && this.AllowAdd && this.SelectedAccount.isAccountEditable) {
        this.AddEditAccount(this.SelectedAccount, false);
      }
    }
  }

  AddEditAccount(currentData, add) {
    const modalRef = this.modalService.open(AddEditAccountComponent, { centered: true, keyboard: false, size: 'xl' });

    modalRef.componentInstance.ShowIsActiveField = this._showIsActiveField;
    modalRef.componentInstance.EntityType = this.EntityType;
    modalRef.componentInstance.EntityID = this.EntityID;

    modalRef.componentInstance.IsAdd = add;
    if (!add) {
      // modalRef.componentInstance.SelectedAccountID = currentData.gLAccountID;
      // modalRef.componentInstance.HasBankAccount = currentData.hasBankAccount;
      modalRef.componentInstance.InputData = currentData;
    } else {
      //modalRef.componentInstance.SelectedAccountID = 0;
    }

    modalRef.result.then((result) => {
      if (result !== null && result) {
        this.toastr.success("Account details have been saved successfully");
        this.gridParams.isCompleteRefresh = !this.gridParams.isCompleteRefresh;
      }
    });
  }

  GetAccountGridDataSource() {
    return (params) => this.dataService.SearchAccounts(params);
  }

  modelChange(model) {
    let allChanges = this.dirtyChecker.GetChanges(model);

    let showInactiveChange = allChanges.find(x => x.key == "showInactive");

    if (model.administrator != null && model.administrator.length > 0) {
      this.gridParams.AdministratorID = model.administrator[0].administratorID;
    } else {
      this.gridParams.AdministratorID = null;
    }
    this.gridParams.AccountID = CommonFunctions.GetAutoTextValueByField(model.account, "gLAccountID");

    this.gridParams.AccountTypeID = CommonFunctions.GetAutoTextValueByField(model.accountType, "gLAccountTypeID");

    this.gridParams.HighBalanceOnly = model.highBalanceOnly;
    if (showInactiveChange) {
      this.gridParams.showInactive = model.showInactive;
    }
    this.SelectedAccount = null;
    this.SelectionChanged.emit(null);
  }
}

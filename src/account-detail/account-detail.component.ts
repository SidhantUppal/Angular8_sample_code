import { Component, OnInit, ViewChild, Input, AfterViewInit } from '@angular/core';
import { Column } from 'angular-slickgrid';
import { GridSettings } from '../grid/grid-settings';
import { GridComponent } from '../grid/grid.component';
import { DataService } from '../data.service';

export enum AccountStatementType {
  Administrator = 'Administrator',
  Client = 'Client',
  Liabilities = 'Liabilities'
}

@Component({
  selector: 'app-account-detail',
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.css']
})
export class AccountDetailComponent implements OnInit {

  columnDefinitions: Column[];
  gridOptions: any;
  gridSettings: GridSettings;

  public dataSource: any;
  public gridParams: any = {};
  CurrentSearchParams: any = {};
  public viewInitialized: boolean;

  private _account: any;
  @Input('Account')
  get Account() {
    return this._account;
  }
  set Account(value: any) {
    this._account = value;
    this.gridParams.AdministratorID = value.administratorID;
    this.gridParams.AccountID = value.accountID;    
  }

  private _statementSummary: any;
  @Input('StatementSummary')
  get StatementSummary() {
    return this._statementSummary;
  }
  set StatementSummary(value: any) {
    this._statementSummary = value;    
  }

  private _statementPeriodDate: Date;
  @Input('StatementPeriodDate')
  get StatementPeriodDate() {
    return this._statementPeriodDate;
  }
  set StatementPeriodDate(value: Date) {
    this._statementPeriodDate = value;
    this.gridParams.StatementPeriodDate = value;    
  }

  private _statementPeriodID: number;
  @Input('StatementPeriodID')
  get StatementPeriodID() {
    return this._statementPeriodID;
  }
  set StatementPeriodID(value: number) {
    this._statementPeriodID = value;
    this.gridParams.StatementPeriodID = value;    
  }

  private _clientID: number;
  @Input('ClientID')
  get ClientID() {
    return this._clientID;
  }
  set ClientID(value: number) {
    this._clientID = value;
    this.gridParams.ClientID = value;    
  }

  private _accountStatementType: string;
  @Input('AccountStatementType')
  get AccountStatementType() {
    return this._accountStatementType;
  }
  set AccountStatementType(value: string) {
    this._accountStatementType = value;
    this.gridParams.AccountStatementType = value;    
  }

  constructor(private dataService: DataService) {
  }

  ngOnInit() {
    this.gridParams = this.GetGridParams();
    this.dataSource = this.GetAccountGridDataSource();

    this.columnDefinitions = [
      { id: 'transactionID', name: 'Transaction ID', field: 'transactionID', sortable: true },
    ];

    if (this.AccountStatementType == AccountStatementType.Liabilities) {
      this.columnDefinitions.push({ id: 'loanRef', name: 'Loan Ref', field: 'reference', sortable: true });
    } else {
      this.columnDefinitions.push({ id: 'bankRef', name: 'Bank Ref', field: 'reference', sortable: true });
    }

    this.columnDefinitions.push(
      { id: 'costCenter', name: 'Cost Ctr', field: 'costCenter', sortable: true },
      { id: 'date', name: 'Date', field: 'date', sortable: true },
      { id: 'amount', name: 'Amount', field: 'amount', sortable: true },
      { id: 'description', name: 'Description', field: 'description', sortable: true },
      { id: 'category', name: 'Category', field: 'category', sortable: true },
      { id: 'gstAmount', name: 'GST Amount', field: 'gstAmount', sortable: true }
    );

    this.GetAccountSummary();
  }

  GetGridParams() {
    return {
      "AccountID": this.Account.accountID,
      "AdministratorID": this.Account.administratorID,
      "StatementPeriodDate": this.StatementPeriodDate,
      "StatementPeriodID": this.StatementPeriodID,
      "AccountStatementType": this.AccountStatementType,
      "ClientID": this.ClientID
    };
  }

  GetAccountGridDataSource() {
    return (params) => this.dataService.SearchAccountStatementDetails(params);
  }

  GetAccountSummary() {    
    // this.dataService.SearchAcc
  }
}

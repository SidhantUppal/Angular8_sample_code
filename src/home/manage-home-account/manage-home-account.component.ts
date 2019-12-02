import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Column, Formatters } from 'angular-slickgrid';
import { GridSettings } from '@src/app/grid/grid-settings';
import { GridComponent } from '@src/app/grid/grid.component';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '@src/app/data.service';
import { CustomEditPencilFormatter } from '@src/CustomComponents/SlickFormatters/Slick.CustomCheckMarkFormatter';
import { dateAuFormatter } from '@src/CustomComponents/SlickFormatters/Slick.AUDateFormatter';
import { AddEditGlHomeAccountComponent } from './add-edit-gl-home-account/add-edit-gl-home-account.component';

@Component({
  selector: 'app-manage-home-account',
  templateUrl: './manage-home-account.component.html',
  styleUrls: ['./manage-home-account.component.scss']
})
export class ManageHomeAccountComponent implements OnInit {

  columnDefinitions: Column[];
  gridOptions: any;
  gridSettings: GridSettings;
  
  public SelectedHome: any;
  public SelectedGLHomeAccount: any;

  public dataSource: any;
  public gridParams: any = {};

  private _homeID : number;
  @Input('HomeID')
  get HomeID() {
    return this._homeID;
  }
  set HomeID(value: number) {
    this._homeID = value;
  }

  @ViewChild(GridComponent, { static: false }) GridComponentPointer: GridComponent;

  constructor(private toastr: ToastrService, private modalService: NgbModal, private dataService: DataService,) { }

  ngOnInit() {
    this.gridParams = this.GetGridParams();
    this.dataSource = this.GetHomeGLAccountDetailsGridDataSource();

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
      { id: 'accountType', name: 'Type', field: 'accountType', sortable: true },
      { id: 'accountName', name: 'Account Name', field: 'accountName', sortable: true },
      { id: 'bankName', name: 'Bank', field: 'bankName', sortable: true },
      { id: 'bsb', name: 'BSB', field: 'bSB', sortable: true },
      { id: 'accountNumber', name: 'Account No', field: 'accountNumber', sortable: true },      
      { id: 'isActive', name: 'Is Active', field: 'isActive', sortable: true, formatter: Formatters.checkmark }      
    ];
    
  }

  GetGridParams() {
    return {
      "HomeID": this.HomeID    
    };
  }

  GetHomeGLAccountDetailsGridDataSource() {
    return (params) => this.dataService.GetHomeGLAccountDetails(params);
  }

  onCellClicked(event) {
    const gridData = this.GridComponentPointer.slickRemoteConf.CurrentGrid.slickGrid.getData();
    if (event.detail != null && event.detail.args != null) {
      var args = event.detail.args;
      this.SelectedGLHomeAccount = gridData[args.row];
      this.GridComponentPointer.slickRemoteConf.CurrentGrid.slickGrid.setSelectedRows([this.SelectedGLHomeAccount]);      
      if (gridData !== null && args.cell == 0) {
        this.AddEditGlHomeAccount(this.SelectedGLHomeAccount, false);
      }
    }
  }

  userDataToAdd: any = null;
  AddEditGlHomeAccount(currentData, add) {
    const modalRef = this.modalService.open(AddEditGlHomeAccountComponent, { centered: true, keyboard: false, size: 'lg' });

    modalRef.componentInstance.IsAdd = add;
    if (!add) {
      modalRef.componentInstance.CurrentData = currentData;
    } else {
      modalRef.componentInstance.CurrentData = null;
    }

    modalRef.result.then((result) => {      
      if (result != null) {
        this.toastr.success("Home Account details have been saved successfully");
        this.SelectedGLHomeAccount = result;
        this.gridParams.isCompleteRefresh = !this.gridParams.isCompleteRefresh;        
      }
    });
  }

}

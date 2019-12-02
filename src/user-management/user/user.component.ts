import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Column, Formatters, AngularGridInstance, Formatter, OnEventArgs } from 'angular-slickgrid';
import * as GlobalSettings from '../../GlobalSettings';
import { dateAuFormatter } from 'src/CustomComponents/SlickFormatters/Slick.AUDateFormatter';
import { CustomEditPencilFormatter } from 'src/CustomComponents/SlickFormatters/Slick.CustomCheckMarkFormatter';
import { DataService } from '../../data.service';
import { GridComponent } from '../../grid/grid.component';
import { GridSettings } from 'src/app/grid/grid-settings';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CustomFunctions, SystemConfig } from '../../GlobalSettings';
import { AddEditUserComponent } from '../add-edit-user/add-edit-user.component';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import formFields from './formFields.json';
import * as ApplicationFields from "@src/app/Fields/ApplicationFields";
import * as Settings from "../../GlobalSettings";
import * as moment_ from 'moment-mini';
const moment = moment_;

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  DeactivationHandler: any = null;
  columnDefinitions: Column[];
  gridOptions: any;
  gridSettings: GridSettings;
  public dataSource: any;

  public CurrentInputText: string = "";
  public SelectedUser: any;
  CurrentSearchParams: any = {};
  public gridParams: any = {};

  public formGroup: FormGroup;
  public formModel: any = {};
  public formFields: FormlyFieldConfig[];

  public isShowUsersByRoleChecked: boolean = false;  

  _selectedRole: any = null;
  @Input('SelectedRole')
  get SelectedRole() {
    return this._selectedRole;
  }
  set SelectedRole(data: any) {
    this._selectedRole = data;
    if (this.formModel.showUsersForSelectedRole) {
      this.gridParams.ApplicationRoleID = this.SelectedRole.applicationRoleID;
    }
  }

  @ViewChild(GridComponent, { static: false }) GridComponentPointer: GridComponent;

  constructor(private toastr: ToastrService, private modalService: NgbModal, private dataService: DataService) { }

  ngOnInit() {
    const ActiveCheckFormatter: Formatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any) => {            
      
      let lastActiveCheckDays = CustomFunctions.GetUserInactiveLoginCheckInDays();      

      let userInactive = moment().subtract(lastActiveCheckDays, 'days').toDate() > dataContext.lastLoggedOn;

      if (userInactive) {
        return " <button type='button' class='btn btn-primary' style='margin:0px !important;'  id='sendActiveCheck'>Send Check Active</button>";
      } else {
        return "";
      }
    }

    this.gridParams = this.GetGridParams();

    this.dataSource = this.GetUserGridDataSource();

    this.formModel = {
      applicationUser: null,
      showUsersForSelectedRole: false
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
      { id: 'loginName', name: 'Login Name', field: 'loginName', sortable: true, minWidth: 125},
      { id: 'firstName', name: 'First Name', field: 'firstName', sortable: true, minWidth: 125 },
      { id: 'lastName', name: 'Last Name', field: 'lastName', sortable: true, minWidth: 125 },
      { id: 'applicationRole', name: 'Role', field: 'applicationRole', sortable: true, minWidth: 125},
      { id: 'active', name: 'Active', field: 'isActive', sortable: true, formatter: Formatters.checkmark, minWidth: 75, maxWidth: 75 },
      { id: 'lastLoginDate', name: 'Last Login Date', field: 'lastLoggedOn', sortable: true, formatter: dateAuFormatter, minWidth: 100 },
      //{ id: 'lastActiveCheckSentOn', name: 'Last Active Check Date', field: 'lastActiveCheckSentOn', sortable: true, formatter: dateAuFormatter },
      {
        id: 'SendActiveCheck', name: 'Active User Check', field: 'activeUserCheck', sortable: true, formatter: ActiveCheckFormatter, minWidth: 175
        , onCellClick: (e: Event, args: OnEventArgs) => {
          let message = "Are you sure you want to Send Active Check ?";

          return CustomFunctions.FireConfirmation(message, this.DeactivationHandler, this.modalService).subscribe(
            result => {              
              if (!result) {
                return;
              }
              this.dataService.SendActiveUserCheck(args.dataContext["applicationUserID"]).subscribe(result => {
                if(result.isSuccess) {
                  this.gridParams.isCompleteRefresh = !this.gridParams.isCompleteRefresh;
                  this.toastr.success("Active Check email has been sent successfully");
                } else {             
                  this.toastr.error("Active Check email could not be sent. Please try again after sometime.");     
                }
              });
            });
        }
      },
    ];

    this.formFields = ApplicationFields.ApplicationFields.InitializeFields(formFields);

    ApplicationFields.ApplicationFields.FindField("showUsersForSelectedRole", this.formFields).hideExpression = this.HideShowUserBySelectedRole();

    this.formGroup = new FormGroup({});
  }

  HideShowUserBySelectedRole() {
    return (model: any, formState: any, currentField: FormlyFieldConfig) => {
      return this.SelectedRole == null || this.SelectedRole.applicationRoleID == null;


    };
  }

  GetUserGridDataSource() {
    return (params) => this.dataService.SearchUsers(params);
  }

  GetApplicationRoleGridDataSource() {
    return (params) => this.dataService.SearchApplicationRolesByUserRole(params);
  }

  public GetGridParams(isCompleteRefresh = true) {

    var applicationRoleId: any = null;

    if (this.isShowUsersByRoleChecked) {
      applicationRoleId = this.SelectedRole.applicationRoleID;
    }

    return {
      "LoginName": this.CurrentInputText,
      "ApplicationUserID": null,
      "ApplicationRoleID": applicationRoleId,
      "isCompleteRefresh": isCompleteRefresh
    };
  }
  
  onCellClicked(event) {
    const gridData = this.GridComponentPointer.slickRemoteConf.CurrentGrid.slickGrid.getData();
    if (event.detail != null && event.detail.args != null) {
      var args = event.detail.args;
      this.SelectedUser = gridData[args.row];
      this.GridComponentPointer.slickRemoteConf.CurrentGrid.slickGrid.setSelectedRows([this.SelectedUser]);
      this.CurrentSearchParams =
        {
          "ApplicationUserID": this.SelectedUser.applicationUserID
        };

      if (gridData !== null && args.cell == 0) {
        this.AddUser(this.SelectedUser, false);
      }
    }
  }

  userDataToAdd: any = null;
  AddUser(currentData, add) {
    const modalRef = this.modalService.open(AddEditUserComponent, { centered: true, keyboard: false, size: 'lg' });

    modalRef.componentInstance.IsAdd = add;
    if (!add) {
      modalRef.componentInstance.CurrentData = currentData;
    } else {
      modalRef.componentInstance.CurrentData = null;
    }

    modalRef.result.then((result) => {      
      if (result != null) {
        this.toastr.success("User details have been saved successfully");
        this.SelectedUser = result;
        this.gridParams.isCompleteRefresh = !this.gridParams.isCompleteRefresh;

        this.CurrentSearchParams =
          {
            "ApplicationUserID": this.SelectedUser.applicationUserID
          };
      }
    });
  }

  modelChange(model) {
    if (model.applicationUser != null && model.applicationUser.length > 0) {
      this.gridParams.ApplicationUserID = model.applicationUser[0].applicationUserID;
    } else {
      this.gridParams.ApplicationUserID = null;
    }

    if (model.showUsersForSelectedRole) {
      if (this.SelectedRole == null || this.SelectedRole.applicationRoleID == null) {
        this.toastr.clear();
        this.toastr.error('', "Please select an Application Role");
      } else {
        this.gridParams.ApplicationRoleID = this.SelectedRole.applicationRoleID;
      }
    } else {
      this.gridParams.ApplicationRoleID = null;
    }
  }

}

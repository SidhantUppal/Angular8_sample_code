import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '@src/app/data.service';
import { FormDirtyChecker } from '@src/app/FormDirtyChecker';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { AutoTextTypes, GLEntityType } from '@src/app/AppEnums';
import { ToastrService } from 'ngx-toastr';
import { InvalidateRequiredFields } from '@src/app/CommonFunctions';
import * as ApplicationFields from "@src/app/Fields/ApplicationFields";
import formFields from './formFields.json';
import * as CommonFunctions from "@src/app/CommonFunctions";

@Component({
  selector: 'app-add-edit-home',
  templateUrl: './add-edit-home.component.html',
  styleUrls: ['./add-edit-home.component.css']
})
export class AddEditHomeComponent implements OnInit {

  public HomeID: any;
  public GLEntityID: any;

  public formGroup: FormGroup;
  public formModel: any = {};
  public formFields: FormlyFieldConfig[];

  public SelectedHome: any;

  public isAdminRole: boolean = true;
  public UIReady: boolean = false;

  dirtyChecker: FormDirtyChecker;
  public title: string;
  public EnityType : GLEntityType;

  constructor(private toastr: ToastrService, private router: Router, private route: ActivatedRoute, private dataService: DataService, private modalService: NgbModal) { }

  ngOnInit() {
    
    this.EnityType = GLEntityType.Home;

    this.formModel = {
      homeCostCentreID: '',
      isActive: false,
      homeName: '',
      parcel: '',
      beds: '',
      accomodationTypeID: '',
      address: {},
      gstApplicable: false,
      numberOfVacancies: ''
    };

    if (this.route.snapshot.params.HomeID != undefined) {
      this.HomeID = this.route.snapshot.params.HomeID;      
      this.title = 'Edit Home - ' + this.HomeID;
      this.dataService.GetHomeDetails(this.HomeID).subscribe(result => {
        this.SelectedHome = result[0].Data[0];        
        this.formModel = result[0].Data[0];
        this.formModel.beds = { "targetBeds" : result[0].Data[0].targetBeds, "bedsInHome" : result[0].Data[0].bedsInHome }
        if (result[0].Data[0].address) {
          this.formModel.address = result[0].Data[0].address;
        } else if(result[1].Data.length > 0) {
          this.formModel.address = result[1].Data[0];
        } else {
          this.formModel.address = {};
        }
        this.PrepareUI();
      });
    } else {
      this.title = 'Add Home';
      this.PrepareUI();
    }      
  }

  PrepareUI() {
    this.formFields = ApplicationFields.ApplicationFields.InitializeFields(formFields);    

    ApplicationFields.ApplicationFields.FindField("numberOfVacancies", this.formFields).expressionProperties = {
      'template': () => {
        if (this.SelectedHome != null) {
          return "Number of Vacancies:" + this.SelectedHome.numberOfVacancies
        }
      }
    };

    ApplicationFields.ApplicationFields.FindField("beds", this.formFields).validators = {
      fieldMatch: {
        expression: (control) => {
          const value = control.value;
          return value.bedsInHome > value.targetBeds
            // avoid displaying the message error when values are empty
            || (!value.bedsInHome || !value.targetBeds);
        },
        message: "Beds in Home must be more than SIL Target Beds for residents",
        errorPath: "bedsInHome",
      },
    };

    ApplicationFields.ApplicationFields.FindField("gstApplicable", this.formFields).expressionProperties = {
      "templateOptions.disabled": () => true,
      "template": () => {
        let gstApplicable = this.formGroup.controls["gstApplicable"];
        if (this.formModel.accommodationTypeID != null && this.formModel.accommodationTypeID.length > 0 && this.formModel.accommodationTypeID[0].code == "STAA/Respite") {
          gstApplicable.setValue(true);
        } else {
          gstApplicable.setValue(false);
        }
      }
    };
    

    ApplicationFields.ApplicationFields.FindField("numberOfVacancies", this.formFields).hideExpression = this.HideNumberOfVacancies();

    ApplicationFields.ApplicationFields.FindField("bedsInHome", this.formFields).hideExpression = this.HideBedsInHome();

    this.formGroup = new FormGroup({});
    this.dirtyChecker = new FormDirtyChecker(this.formModel);
        
    CommonFunctions.InvalidateRequiredFields(this.formGroup);
    this.UIReady = true;
  }

  HideNumberOfVacancies() {
    return (model: any, formState: any, currentField: FormlyFieldConfig) => {
      return !this.HomeID; 
    };
  }

  HideBedsInHome() {
    return (model: any, formState: any, currentField: FormlyFieldConfig) => {
      return !this.isAdminRole; 
    };
  }

  NavigateBack() {
    this.router.navigate(['/Home']);
  }

  modelChange(model) {

  }

  Save() {
    InvalidateRequiredFields(this.formGroup);
    if (!this.formGroup.valid) {
      this.toastr.error('', "Please fix highlighted errors");
      return;
    }

    let home = {
      "HomeID" : this.HomeID,
      "IsActive": this.formModel.isActive,
      "HomeCostCentreCode": this.formModel.homeCostCentreID[0].homeCostCentreID,
      "IsGST": this.formModel.gstApplicable,
      "HomeName": this.formModel.homeName,
      "Parcel": this.formModel.parcel,
      "SILTarget": this.formModel.beds.targetBeds,
      "NoofBeds": this.formModel.beds.bedsInHome,
      "AccommodationTypeId": this.formModel.accommodationTypeID[0].dataOptionID
    };

    let address = this.formModel.address;
    this.GetAddress(address);

    this.dataService.SaveHomeDetails({"Home" : home, "Address" : address}).subscribe(result => {
      if(result) {
        this.toastr.success("Home Details have been saved successfully");
      } 
    });
  }

  GetAddress(obj) {
    if (!obj.addressId) {
      obj.addressId = -1;
    }

    obj.stateID = CommonFunctions.GetAutoTextValues(obj.stateID);
    obj.countryID = CommonFunctions.GetAutoTextValues(obj.countryID);
  }


}

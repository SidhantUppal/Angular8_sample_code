  import { Component, OnInit } from '@angular/core';

import { AsyncValidatorFn, ValidatorFn, AbstractControl, ValidationErrors, FormGroup, FormControl, Validators, FormArray } from "@angular/forms";
import { FormlyFieldConfig } from '@ngx-formly/core';
import { GlobalSettings, CustomFunctions } from './../GlobalSettings';
//import { Title } from '@angular/platform-browser';
import { DataService } from './../data.service';
import { CustomAuthenticationService } from './../custom-authentication.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgZone } from '@angular/core';
import changepasswordfields from './changepasswordfields.json';
import formfields from './formfields.json';
import resetpassword from './resetpassword.json';
import * as ApplicationFields from "@src/app/Fields/ApplicationFields";
@Component({
  selector: 'app-app-login',
  templateUrl: './app-login.component.html',
  styleUrls: ['./app-login.component.scss']
})
export class AppLoginComponent implements OnInit {
  formGroup = new FormGroup({});
  formModel = { email: '', password: '', ForgotPasswordVisible:false };
  

  formFields = ApplicationFields.ApplicationFields.InitializeFields(formfields);

  
  ShowForgotPasswordPanel(isVisible) {
    this.formModel.ForgotPasswordVisible = isVisible;
  }
  confirmPasswordError: boolean = false;
  ForgotPasswordToken: string = null;
  IsChangingPassword: boolean = false;
  constructor(
    public zone: NgZone,
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private authService: CustomAuthenticationService) {
    if (this.route.snapshot.params.Code != undefined) {
      this.ForgotPasswordToken = this.route.snapshot.params.Code;

    }
    if (this.route.snapshot.params.ForChangePassword != undefined) {
      if (this.route.snapshot.params.ForChangePassword == "1"
        && GlobalSettings.CurrentUser != null) {
        this.IsChangingPassword = true;

      }

    }
    
  }


  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    if (this.IsChangingPassword) {
      this.formFields = ApplicationFields.ApplicationFields.InitializeFields(changepasswordfields);
    }
    if (this.ForgotPasswordToken) {
      this.formFields = ApplicationFields.ApplicationFields.InitializeFields(resetpassword);
    }
    console.log(this.formFields);
  }
  returnUrl: string;
  ErrorMessage: string = "";
  Login() {
    if (!this.formGroup.valid) {
      return;
    }
    if (this.IsChangingPassword) {
      this.dataService
        .UpdatePassword(this.formGroup.controls["currentpassword"].value, this.formGroup.controls["password"].value)
        .subscribe(result => {
          console.log(result);
          if (result.isSuccess) {
            this.zone.run(() => { this.router.navigate(['/']); });

            return;
          } else {
            this.ErrorMessage = "Unable to change password. Please check current password";
          }


        });
    } else {
      if (this.ForgotPasswordToken) {
        this.dataService.ChangePassword(this.ForgotPasswordToken, this.formGroup.controls["password"].value).subscribe(result => {
          console.log(result);
          if (result.isSuccess) {
            this.zone.run(() => { this.router.navigate(['/Login']); });
            //this.router.navigate(['/Login']);
            return;
          } else {
            this.ErrorMessage = result["errorMessage"];
          }


        });

      } else {
        if (this.formModel.ForgotPasswordVisible) {

          this.dataService.ResetPassword(this.formModel["loginName"], 0).subscribe(result => {
            this.ErrorMessage = "Please check your email";
            this.ShowForgotPasswordPanel(false);
          });


          return;

        } else {
          this.authService.login(this.formModel["loginName"], this.formModel["password"]).
            then(result => {

                //console.log(result);
                if (GlobalSettings.IsLoggedIn) {
                  if (GlobalSettings.MustChangePassword || GlobalSettings.ForceChangePassword) {
                    this.zone.run(() => { this.router.navigate(['/Login/ForChangePassword/1']); });
                  } else {

                    this.router.navigate([this.returnUrl]);

                  }

                  //this.router.navigate([this.returnUrl]);
                } else {
                  this.ErrorMessage = result["errorMessage"];
                  this.ErrorMessage = "Unable to login. please check username and password";

                }
              }
            );
        }
        

      }
     

    }
    

  }

}

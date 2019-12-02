import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DataService } from './../data.service';
import { CustomAuthenticationService } from './../custom-authentication.service';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalSettings, CustomFunctions } from './../GlobalSettings';
import { AsyncValidatorFn, ValidatorFn, AbstractControl, ValidationErrors, FormGroup, FormControl, Validators, FormArray } from "@angular/forms";
import { NgZone } from '@angular/core';
import * as Settings from "../GlobalSettings";

export function ConfirmPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: string } | null => {

    if (control.parent == undefined) {
      return null;
    }
    let otherControl = control.parent.controls["password"];


    if (control.value != otherControl.value) {
      return { 'notSame': "Passwords do not match" };
    }
    return null;
  };
}
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  ResetPasswordVisible: boolean = false;
  returnUrl: string;
  //UserName: string = "";
  //Password: string = "";
  ErrorMessage: string = "";
  ForgotPasswordToken: string = null;
  IsChangingPassword:boolean=false;
  constructor(private titleService: Title, public zone: NgZone, private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private authService: CustomAuthenticationService) {
    //debugger;
    this.titleService.setTitle("Login");
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
  formGroup: FormGroup;
  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    //alert(this.route.snapshot.queryParams['returnUrl']);
    if (this.IsChangingPassword) {
      this.formGroup = new FormGroup({
        currentpassword: new FormControl('', [
          Validators.required, Settings.noWhitespaceValidator

        ]),
        password: new FormControl('', [
          Validators.required, Validators.minLength(8), Settings.noWhitespaceValidator

        ]),
        confirmpassword: new FormControl('', [Validators.required, Settings.noWhitespaceValidator, Validators.minLength(8), ConfirmPasswordValidator()])
         
      });
    } else {
      if (this.ForgotPasswordToken != null) {
        this.formGroup = new FormGroup({

          password: new FormControl('', [
            Validators.required, Settings.noWhitespaceValidator

          ]),
          confirmpassword: new FormControl('', [
            Validators.required, Settings.noWhitespaceValidator

          ])
        });
      } else {
        this.formGroup = new FormGroup({
          email: new FormControl('', [
            Validators.required,
            Settings.noWhitespaceValidator,
            Validators.email
          ]),
          password: new FormControl('', [
            Validators.required, Settings.noWhitespaceValidator

          ])
        });
      }
    }
   
    CustomFunctions.InvalidateRequiredFields(this.formGroup);
    

  }
  ShowResetPasswordPanel(isVisible) {
    this.ResetPasswordVisible = isVisible;
  }
  confirmPasswordError: boolean = false;

  CheckPasswordConfirmed() {
    this.confirmPasswordError = this.formGroup.get('password').value != this.formGroup.get('confirmpassword').value;

  }
  Login() {
     
    if (this.IsChangingPassword) {
      this.CheckPasswordConfirmed();
      if (this.formGroup.invalid || this.confirmPasswordError) {
        return;
      }
      if (this.formGroup.controls["confirmpassword"].value != this.formGroup.controls["password"].value) {
        this.ErrorMessage ="passwords dont match";
        return;
      }
      if (this.formGroup.controls["confirmpassword"].value == this.formGroup.controls["currentpassword"].value) {
        this.ErrorMessage ="New password can not be same as the current password";
        return;
      }
      /*
      this.dataService.UpdatePassword(this.formGroup.controls["currentpassword"].value, this.formGroup.controls["password"].value).subscribe(result => {
        console.log(result);
        if (result.isSuccess) {
          this.zone.run(() => { this.router.navigate(['/']); });
          
          return;
        } else {
          this.ErrorMessage = "Unable to change password. Please check current password";
        }


      });
      */
      return;

    }
    if (this.ForgotPasswordToken != null) {
      if (this.formGroup.controls["confirmpassword"].value != this.formGroup.controls["password"].value) {
        this.ErrorMessage="passwords dont match";
        return;
      }

      return;
    }
    if (this.ResetPasswordVisible) {
      /*
      this.dataService.ResetPassword(this.formGroup.controls["email"].value, 0).subscribe(result => {
        this.ErrorMessage = "Please check your email";
        this.ShowResetPasswordPanel(false);
      });
      */

      return;
    }

    this.authService.login(this.formGroup.controls["email"].value, this.formGroup.controls["password"].value).
      then(result => {
 
        //console.log(result);
        if (GlobalSettings.IsLoggedIn) {
          if (GlobalSettings.MustChangePassword || GlobalSettings.ForceChangePassword) {
            this.zone.run(() => { this.router.navigate(['/Login/ForChangePassword/1']); });
          } else {
            //this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
           //alert(this.returnUrl);
            this.router.navigate([this.returnUrl]);
            //this.zone.run(() => { this.router.navigate([this.returnUrl]); });
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

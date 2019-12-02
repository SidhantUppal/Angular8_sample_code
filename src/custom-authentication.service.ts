import { Injectable } from '@angular/core';

import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { Promise } from 'es6-promise';
import { environment } from './../environments/environment';
import { GlobalSettings, CustomFunctions } from './GlobalSettings';

import { DataService } from './data.service';

import { NgZone } from '@angular/core';
import { UserType } from './AppEnums';
@Injectable()
export class CustomAuthenticationService {
  constructor(public zone: NgZone,  private router: Router,  private dataService: DataService) { }

  CheckUser() {
    GlobalSettings.IsLoggedIn = false;
     
    return new Promise((resolve, reject) => {
      debugger;
      this.dataService.CheckUser().subscribe((user) => {
        console.log(user);
        if (user["isSuccess"]) {

          this.LocalLogin(user).then(result => {

              resolve(result);
            }
          );


        } else {
          resolve(null);
        }

      });
    });

  }
  LocalLogin(user): Promise<any> {
    if (GlobalSettings.SystemConfigs == null) {


      this.dataService.GetSystemConfigs().subscribe((configs) => {
        GlobalSettings.SystemConfigs = configs;

      });

    }
    return new Promise((resolve, reject) => {

      GlobalSettings.IsLoggedIn = false;
      if (user["isSuccess"]) {
        GlobalSettings.CurrentUser = user;
        GlobalSettings.IsLoggedIn = true;        
        GlobalSettings.IsCFMUser = CustomFunctions.IsInRole([UserType.CFMUser]);
        GlobalSettings.IsAdminUser = CustomFunctions.IsInRole([UserType.CFMAdmin]);
        
        if(GlobalSettings.IsAdminUser) {
          GlobalSettings.IsCFMUser = true;
        }

        GlobalSettings.MustChangePassword = user["mustChangePassword"];
        GlobalSettings.ForceChangePassword = user["forceChangePassword"];
        if (user["mustChangePassword"] || user["forceChangePassword"]) {
          this.router.navigate(['/Login/ForChangePassword/1']);
       
        }
        
        
        resolve(user);

      }
      resolve(user);
    });
  }

  login(username: string, password: string): Promise<any> {
    
    GlobalSettings.IsLoggedIn = false;
    return new Promise((resolve, reject) => {
      this.dataService.LoginUser(username, password).subscribe((user) => {

        if (user["isSuccess"]) {

          this.LocalLogin(user).then(result => {

            resolve(result);
          }
          );


        } else {
          resolve(user);
        }

      });
    });


  }
  logout() {    
    return this.dataService.LogoutUser().subscribe(user => {
      GlobalSettings.IsLoggedIn = false;
      GlobalSettings.CurrentUser = null;
      this.zone.run(() => { this.router.navigate(['/Login']); });
    
      return null;
    });
   

    //localStorage.removeItem('currentUser');
    //this.router.navigate(['/Login']);
    //this.cookieService.delete('TokenID');
    /*
   
    */


  }
}

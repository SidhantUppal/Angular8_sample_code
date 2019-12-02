import { Routes, RouterModule, CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'; 
import { AccountManagementComponent } from './account-management/account-management.component';

import { UserManagementComponent } from './user-management/user-management.component';


import { ManageDataAccessComponent } from './manage-data-access/manage-data-access.component';
import { mobileComponents, mobileroutes } from "@src/app/mobileComponentLibrary";
import { CanDeactivateGuard} from "./can-deactivate.guard";
import { AuthGuard } from './auth.guard'
import { NgModule, Injectable } from '@angular/core';
import * as AppEnums from "@src/app/AppEnums";
import * as Customauthenticationservice from "@src/app/custom-authentication.service";
import * as GlobalSettings from "@src/app/GlobalSettings";

import { HomeComponent } from './home/home.component';
 
export const webComponents = [
  AccountManagementComponent,
  
  UserManagementComponent,
  
  ManageDataAccessComponent,
  
  ...mobileComponents
];

@Injectable()
export class WebAuthGuard implements CanActivate {

  constructor(private router: Router,

    private authService: Customauthenticationservice.CustomAuthenticationService) {
  }

  async  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    let d = await GlobalSettings.CustomFunctions.canActivate(route, state, this.authService, this.router);
    
    return d;

  }

}


export const webroutes: Routes = [
 
   
  {
    path: 'UserManagement', component: UserManagementComponent, canActivate: [WebAuthGuard ], data: {
      Roles: [AppEnums.UserType.CFMAdmin],
      BreadCrumbName: "User Management",
      Icon: "fas fa-user",
      IsProductionReady: true
    },
    canDeactivate: [CanDeactivateGuard]
  },
  {
    path: 'AccountManagement', component: AccountManagementComponent, canActivate: [WebAuthGuard ], data: {
      Roles: [AppEnums.UserType.CFMAdmin],
      BreadCrumbName: "Account Management",
      Icon: "fas fa-file-invoice-dollar",
      IsProductionReady: true
    },
    canDeactivate: [CanDeactivateGuard]
  },
    
  
  
  ...mobileroutes
];


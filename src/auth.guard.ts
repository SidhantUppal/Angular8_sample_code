import { Injectable } from '@angular/core';

import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { GlobalSettings, CustomFunctions } from './GlobalSettings';

import { CustomAuthenticationService } from './custom-authentication.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private router: Router,
    
    private authService: CustomAuthenticationService) {    
  }
  user = null;
  async  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    if (GlobalSettings.IsLoggedIn) {
      //return true;
      if (this.CheckAccess(route)) {
        return true;
      }

    }
    this.user = <any>await this.authService.CheckUser();
    if (GlobalSettings.IsLoggedIn) {
      //return true;
      if (this.CheckAccess(route)) {
        return true;
      }
    }

    this.authService.logout();
    // not logged in so redirect to login page with the return url
    this.router.navigate(['/Login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
  CheckAccess(route: ActivatedRouteSnapshot) {
    return CustomFunctions.IsInRole(route.data["Roles"]);
   

  }
}

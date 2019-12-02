import { Injectable } from '@angular/core';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { AppLoginComponent } from './app-login/app-login.component';
import { LogoutComponent } from './logout/logout.component';
import { Routes, RouterModule } from '@angular/router';
import { GlobalSettings, CustomFunctions } from './GlobalSettings';
import { AuthGuard } from './auth.guard'
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { CustomAuthenticationService } from './custom-authentication.service';
export const mobileComponents = [
  LandingPageComponent,
  AppLoginComponent,
  LogoutComponent
];





@Injectable()
export class AuthGuard2 implements CanActivate {

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
@Injectable()
export class MobileAuthGuard implements CanActivate {

  constructor(private router: Router,

    private authService: CustomAuthenticationService) {
  }
  
  async  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot){

    return await CustomFunctions.canActivate(route, state, this.authService,this.router);
  }
  
}

export const mobileroutes: Routes = [
  { path: '', component: LandingPageComponent, pathMatch: 'full', canActivate: [MobileAuthGuard] },
  { path: 'Login', component: AppLoginComponent },

  {
    path: 'Logout', component: LogoutComponent, canActivate: [MobileAuthGuard], data: {

      Icon: "fas fa-door-open"
    }
  },
  {
    path: 'Login/forgottenPasswordReset/:Code',
    component: AppLoginComponent,
    pathMatch: 'full',
    data: {
      TopMenuLabel: "Login"
    }
  },
  {
    path: 'Login/ForChangePassword/:ForChangePassword',
    component: AppLoginComponent,
    pathMatch: 'full',
    data: {
      TopMenuLabel: "Login"
    }
  },

];

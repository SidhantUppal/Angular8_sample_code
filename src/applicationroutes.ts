import * as Candeactivateguard from "./can-deactivate.guard";
import { Injectable } from '@angular/core';
import * as Homecomponent from "./home/home.component";
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { LoginTestComponent } from './login-test/login-test.component';
import { Routes, RouterModule } from '@angular/router';
import { AppLoginComponent } from './app-login/app-login.component';
import { AuthGuard } from './auth.guard';


export const routes: Routes = [
  { path: '', component: Homecomponent.HomeComponent, pathMatch: 'full', canActivate: [AuthGuard] },
  { path: 'Login', component: AppLoginComponent },
  


  {
    path: 'Logout', component: LogoutComponent, data: {

      Icon: "fas fa-door-open"
    }
  },
  {
    path: 'Login/forgottenPasswordreset/:Code',
    component: LoginComponent,
    pathMatch: 'full',
    data: {
      TopMenuLabel: "Login"
    }
  },
  {
    path: 'Login/ForChangePassword/:ForChangePassword',
    component: LoginComponent,
    pathMatch: 'full',
    data: {
      TopMenuLabel: "Login"
    }
  }
];

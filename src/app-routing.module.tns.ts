import { NgModule } from '@angular/core';
import { NativeScriptRouterModule } from 'nativescript-angular/router';

import * as MobileComponentLibrary from "@src/app/mobileComponentLibrary";
 
@NgModule({
  imports: [NativeScriptRouterModule.forRoot(MobileComponentLibrary.mobileroutes)],
  exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }

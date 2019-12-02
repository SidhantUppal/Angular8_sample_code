import { NgModule, Injectable} from '@angular/core';

import { Routes, RouterModule } from '@angular/router';
 

import { webroutes} from "@src/app/webComponentLibrary";



@NgModule({
  imports: [RouterModule.forRoot(webroutes, { useHash: true })],
  exports: [RouterModule]
})
 
export class AppRoutingModule { }

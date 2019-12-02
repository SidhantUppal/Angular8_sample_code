import { Component, OnInit } from '@angular/core';
 
import { BreadCrumb } from './../breadcrumb';
import * as GlobalSettings from "@src/app/GlobalSettings";


@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  AllowedItems: BreadCrumb[] = [];
  constructor() { }

  ngOnInit() {
     
    this.AllowedItems = GlobalSettings.CustomFunctions.AllowedRoutes();
    
  }

}

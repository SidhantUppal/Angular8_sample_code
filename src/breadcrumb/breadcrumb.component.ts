import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivationEnd, Router } from "@angular/router";
import { BreadCrumb, BreadCrumbDetails } from './../breadcrumb';
import { Title } from "@angular/platform-browser";

import * as Applicationroutes from "../applicationroutes";
import * as GlobalSettings from "@src/app/GlobalSettings";


@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {
  Crumbs :BreadCrumb[]=[];
  CurrentPath: string = "";
  AllowedItems: BreadCrumb[] = [];
  CurrentPage: BreadCrumb = new BreadCrumb();
  
  IsVisible:boolean=true;
  constructor(private titleService: Title, private router: Router) {
    
    this.router.events.subscribe(e => {
      if (e instanceof ActivationEnd) {
        let allowedItems = GlobalSettings.CustomFunctions.AllowedRoutes();;
        this.AllowedItems = [];
        for (let k = 0; k < allowedItems.length; k++) {
          let allowed = true;
          if (allowedItems[k].data != undefined) {
            if (allowedItems[k].data.ShowOnMenu != undefined) {
              allowed = allowedItems[k].data.ShowOnMenu;
            }

          }
          if (allowed) {
            this.AllowedItems.push(allowedItems[k]);
          }
        }

        let currentRoute = null;
        this.Crumbs = [];
        let currentPath = e.snapshot.routeConfig.path;
       /* for (let j = 0; j < routes.length; j++) {
          if (routes[j].path.toLowerCase() == currentPath.toLowerCase()) {
            currentRoute = routes[j];
          }
        }
        console.log(currentRoute);
       
        console.log(e.snapshot.routeConfig.path.split('/'));
        */
        console.log(e.snapshot.routeConfig.path);
        this.CurrentPath = e.snapshot.routeConfig.path;
        if (this.CurrentPath== null) {
          this.CurrentPath = "";

        }
        this.CurrentPath = this.CurrentPath.toLowerCase();
        this.IsVisible = false;
        if (this.CurrentPath != '' && this.CurrentPath.toLowerCase() != 'login'
          && this.CurrentPath.toLowerCase().indexOf("login")!=0) {
          this.IsVisible = true;
        }
        //debugger;
        let tempCurrentPath = "";
        let tempRouterPath = "";
        let splits = e.snapshot.routeConfig.path.split('/');
        //console.log(e.snapshot.routeConfig.path);
        for (var i = 0; i < splits.length; i++) {
          if (tempCurrentPath!="") {
            tempCurrentPath = tempCurrentPath + "/";
            tempRouterPath = tempRouterPath + "/";
            
          }
          tempCurrentPath = tempCurrentPath + splits[i];
          tempRouterPath = tempRouterPath + splits[i];
          currentRoute = null;
          for (let j = 0; j < Applicationroutes.routes.length; j++) {
            if (Applicationroutes.routes[j].path.toLowerCase() == tempRouterPath.toLowerCase()) {
              currentRoute = Applicationroutes.routes[j];
            }
          }
          //console.log(tempCurrentPath);
         // console.log(tempRouterPath);
          
          if (currentRoute != null) {
            if (currentRoute.data != undefined && currentRoute.data.ShowAsParent != undefined) {
              if (!currentRoute.data.ShowAsParent && i < splits.length-1) {
                continue;
              }
            }
            let bc = new BreadCrumb();
            bc.label = "";
            bc.icon = "";
            if (currentRoute.data != undefined && currentRoute.data != null) {
              if (currentRoute.data.BreadCrumbName != undefined && currentRoute.data.BreadCrumbName != null) {
                bc.label = currentRoute.data.BreadCrumbName;
              }
              if(currentRoute.data.Icon != undefined && currentRoute.data.Icon != null) {
                bc.icon = currentRoute.data.Icon;
              }
            }
            if (bc.label==="")
            {
              bc.label = currentRoute.path;                            
            }
            this.titleService.setTitle("CFM - " + bc.label);
            this.CurrentPage = bc;            
            
            if (tempRouterPath == e.snapshot.routeConfig.path) {
              bc.url = "";
            } else {
              for (var property in e.snapshot.params) {
               
                if (e.snapshot.params.hasOwnProperty(property)) {
                  tempCurrentPath = tempCurrentPath.replace("/:" + property,"/"+ e.snapshot.params[property]);
                }
              }
              bc.url = tempCurrentPath;
            }
            
            this.Crumbs.push(bc);
          }

           
        }
       
        
      }
    });

    //this.breadcrumbProvider._addItem.subscribe(breadcrumb => this.breadcrumbs.push(breadcrumb));
  }

  ngOnInit() {
    
    console.log(this.AllowedItems);
  }

  
}

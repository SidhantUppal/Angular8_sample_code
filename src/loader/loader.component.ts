import { Component, OnInit, AfterContentInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { LoaderService, LoaderState } from '../loader.service';
import { LoaderSettings } from './../AppSharedData';
@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements AfterContentInit {
  show = false;
  CurrentText: string;
  private subscription: Subscription;
  currentSpinnerCount = 0;
  IsVisible: boolean = false;
  constructor(private spinner: NgxSpinnerService, private loaderService: LoaderService) { }

  ngAfterContentInit() {
    this.subscription = this.loaderService.loaderState
      .subscribe((state: LoaderState) => {
        // console.log(GlobalSettings.CurrentLoadingText);
        //console.log("this.currentSpinnerCount->" + this.currentSpinnerCount);
        if (state.show) {
          this.currentSpinnerCount++;
        } else {
          this.currentSpinnerCount--;
        }
        //  console.log("this.currentSpinnerCount2->" + this.currentSpinnerCount);
        if (this.currentSpinnerCount > 0) {

          if (!this.IsVisible) {
            if (LoaderSettings.CurrentLoadingText == "") {
              this.CurrentText = "Loading...";
            } else {
              this.CurrentText = LoaderSettings.CurrentLoadingText;
            }
            setTimeout(() => {

              this.spinner.show();
            }, 1);

            this.IsVisible = true;
            this.show = state.show;
          }

        } else {
          if (this.currentSpinnerCount < 0) {
            this.currentSpinnerCount = 0;
          }
          this.IsVisible = false;
          setTimeout(() => {

            this.spinner.hide();
          }, 1);

          LoaderSettings.CurrentLoadingText = "";
          this.show = state.show;
        }

      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}

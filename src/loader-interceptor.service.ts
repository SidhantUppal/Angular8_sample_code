import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { LoaderService } from './loader.service';
import { LoaderSettings } from './AppSharedData';
import * as CommonFunctions from "@src/app/CommonFunctions";

@Injectable({
  providedIn: 'root'
})
export class LoaderInterceptorService implements HttpInterceptor {

  constructor(private route: ActivatedRoute,
    private router: Router, private loaderService: LoaderService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!LoaderSettings.DoNotShowLoading) {
      //if (request.method == "POST") {
      //  if (request.body) {
      //    CommonFunctions.FixDateFields(request.body);
      //  }
      //  debugger;
      //}
      
      this.showLoader();
    }
    const httpRequest = request.clone({
      headers: new HttpHeaders({
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': 'Sat, 01 Jan 2000 00:00:00 GMT'
      })
    });
    return next.handle(httpRequest).pipe(tap((event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            if (event.body) {
              return event.clone({
                body: CommonFunctions.FormatDates(event.body)
              });
            }
          }
        },

        (err: any) => {

          if (err.status === 401) {
            // auto logout if 401 response returned from api
            this.router.navigate(['/']);

          }

          const error = err.error.message || err.statusText;
          return throwError(error);
        }),
      finalize(() => {
        this.onEnd();
      }));

  }

  private onEnd(): void {
    this.hideLoader();
  }

  private showLoader(): void {
    this.loaderService.show();
  }

  private hideLoader(): void {
    if (!LoaderSettings.DoNotShowLoading) {
      this.loaderService.hide();
    }
    LoaderSettings.DoNotShowLoading = false;
  }
}

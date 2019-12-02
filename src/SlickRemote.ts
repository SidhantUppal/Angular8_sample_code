import { AngularGridInstance, Column, GridOption, GridOdataService } from 'angular-slickgrid';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as cloneDeep from 'lodash/cloneDeep';  
export class SlickRemoteModelConfiguration {
  public PAGESIZE: number;
  public sortcol: string;
  public sortdir: number;
  OnAfterDataLoad:any=null;
  constructor(public Source, public CurrentGrid: AngularGridInstance, public BeforeDataLoad,public MetaDataProvider,public ManipulateData) {

  }
  
}
export class RemoteRequest {
  Start: number;

  End: number;


}
export class SlickRemoteModel {

  PAGESIZE = 50;
  //CurrentURL = url;
  //CurrentParamFunction = paramFunction;
  data = { length: 0, getItemMetadata:null };
  searchstr = "";
  sortcol = null;
  sortdir = 1;
  h_request = null;
  req = null;
  InPullProgress = Array<RemoteRequest>();
  /*
  constructor(private URL: string, private ParamFuncton: any, private http: HttpClient) {
    //this.http = new HttpClient();
    console.log(ParamFuncton());
  }
  */
  constructor(private Configuration: SlickRemoteModelConfiguration) {
    
    if (Configuration.PAGESIZE != null) {
      this.PAGESIZE = Configuration.PAGESIZE;
    }

    var thisClass = this;
    Configuration.CurrentGrid.slickGrid.onViewportChanged.subscribe(function (e, args) {
      if (this.ViewportChangedTimer) {
        clearTimeout(this.ViewportChangedTimer);

      }
      this.ViewportChangedTimer = setTimeout(() => thisClass.ViewportChangedCaller(), 5 * 100);
      //this.ViewportChangedTimer = setTimeout(this.ViewportChangedCaller.bind(this), 5 * 100);


      var vp = Configuration.CurrentGrid.slickGrid.getViewport();

      //  thisClass.ensureData(vp.top, vp.bottom, false, thisClass.CurrentDataToController);
    });
    //this.URL = Configuration.URL;
  }

  public ViewportChangedCaller() {

    var vp = this.Configuration.CurrentGrid.slickGrid.getViewport();

    this.ensureData(vp.top, vp.bottom, false, this.CurrentDataToController);
  }
  ViewportChangedTimer: any;
  public clear() {
    for (var key in this.data) {
      delete this.data[key];
    }
    this.data.length = 0;
  }

  public deleteItem(index) {
    
    let newdata = { length: 0, getItemMetadata: null };
    let cnt = 0;
    for (let i = 0; i < this.data.length; i++) {
      if (i != index) {
        newdata[cnt] = this.data[i];
        cnt++;
      }
    }
    newdata.length = cnt;
    this.data = newdata;
    this.Configuration.CurrentGrid.slickGrid.setData(newdata);

    //this.Configuration.CurrentGrid.slickGrid.invalidateRow(index);
   


    this.Configuration.CurrentGrid.slickGrid.updateRowCount();
    this.Configuration.CurrentGrid.slickGrid.render();
    
     
  }
  public setSort(column, dir) {
    this.sortcol = column;
    this.sortdir = dir;
    this.clear();
  }
  CurrentDataToController: any;

  public refreshData(dataToController: any) {
    var vp = this.Configuration.CurrentGrid.slickGrid.getViewport();

    this.ensureData(vp.top, vp.bottom, true, dataToController);
  }

  public ensureData(from: number, to: number, isForced: boolean, dataToController: any) {
    if (isForced) {
      this.clear();
    }
    if (dataToController == null || dataToController == undefined) {
      dataToController = {};
    }
    this.CurrentDataToController = dataToController;

    if (from < 0) {
      from = 0;
    }

    var fromPage = Math.floor(from / this.PAGESIZE);

    var toPage = Math.floor(to / this.PAGESIZE);
    if (this.data != null) {

      while (this.data[fromPage * this.PAGESIZE] !== undefined && fromPage < toPage)
        fromPage++;

      while (this.data[toPage * this.PAGESIZE] !== undefined && fromPage < toPage)
        toPage--;
    }
    var actualFrom = fromPage * this.PAGESIZE;
    var totalItems = (toPage - fromPage) * this.PAGESIZE;
    if (totalItems == 0) {
      totalItems = this.PAGESIZE;
    }
    if (!isForced) {
      var missingData = false;
      if (this.data.length == 0) {
        missingData = true;
      }
      if (from < to && !missingData) {
        var cid = from;
        while (cid <= to) {
          if (cid < this.data.length) {
            if (this.data[cid] == undefined) {
              missingData = true;
              break;
            }

          }
          cid++;
        }
      }

      if (!missingData) {
        return;
      }
    }
    var offset = (fromPage * this.PAGESIZE);

    var count = (((toPage - fromPage) * this.PAGESIZE) + this.PAGESIZE);
    if (this.data != null) {


      if (actualFrom >= this.data.length && this.data.length > 0) {
        return;
      }
    }
    
    if (!isForced) {
      for (var i = 0; i < this.InPullProgress.length; i++) {
        if (this.InPullProgress[i].Start == offset) {
          return;
        }
      }
      
    } else {
      this.InPullProgress = Array<RemoteRequest>();
    }
    let rr = new RemoteRequest();

    rr.Start = offset;
    rr.End = count;
    this.InPullProgress.push(rr);

 
    var currentDataToApi = this.CurrentDataToController;
    currentDataToApi.PageStart = offset;
    currentDataToApi.PageSize = count;
    if (this.sortcol != null) {
      currentDataToApi.SortColumn = this.sortcol;
      currentDataToApi.SortOrder = (this.sortdir > 0) ? "asc" : "desc";

    }
    
    this.Configuration.Source(currentDataToApi).subscribe((searchData: any[]) => {
       
      {
       
        var resp = searchData;
       
        var from = currentDataToApi.PageStart, to = from + resp.length;
        if (this.Configuration.MetaDataProvider != null) {
          this.data.getItemMetadata = this.Configuration.MetaDataProvider;
        }
        
        if (resp.length > 0) {
          //console.log(resp[0].totalRows);
          if (resp[0].totalRows == undefined) {
            this.data.length = resp.length;
          } else {
            this.data.length = resp[0].totalRows;
          }
        } else {
          this.data.length = 0;
        }
        
        if (this.Configuration.ManipulateData == null) {
          for (var i = 0; i < resp.length; i++) {
            var item = resp[i];
            if (this.Configuration.BeforeDataLoad != null) {
              item = this.Configuration.BeforeDataLoad(item, from + i);
            }
            this.data[from + i] = item;
            this.data[from + i].index = from + i;
            
            this.Configuration.CurrentGrid.slickGrid.invalidateRow(from + i);

          }
        } else {
          let originalData = cloneDeep(resp);
          this.Configuration.ManipulateData(resp).subscribe((searchData: any[]) => {
            if (searchData.length != originalData.length) {
              this.data.length = this.data.length + (searchData.length - originalData.length);
            }
            
            for (var i = 0; i < searchData.length; i++) {
              var item = searchData[i];
              if (this.Configuration.BeforeDataLoad != null) {
                item = this.Configuration.BeforeDataLoad(item, from + i);
              }
              this.data[from + i] = item;
              this.data[from + i].index = from + i;
              
              this.Configuration.CurrentGrid.slickGrid.invalidateRow(from + i);

            }
          
            this.Configuration.CurrentGrid.slickGrid.updateRowCount();
            this.Configuration.CurrentGrid.slickGrid.render();
          
          });

        }
       
       
        
       
        this.Configuration.CurrentGrid.slickGrid.updateRowCount();
        this.Configuration.CurrentGrid.slickGrid.render();
        if (this.Configuration.OnAfterDataLoad != null) {
          this.Configuration.OnAfterDataLoad();
        }
        /*
        if (currentDataToApi.PageStart == 0) {
          let thisClass = this;
          setTimeout(() => {
            console.log(thisClass.Configuration.CurrentGrid);
            thisClass.Configuration.CurrentGrid.slickGrid.resizeCanvas();

          }, 1000);
        }
        */
      }

    });

  }


}



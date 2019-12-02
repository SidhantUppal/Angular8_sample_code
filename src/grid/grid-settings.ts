import { Column } from "angular-slickgrid/app/modules/angular-slickgrid";
import * as cloneDeep from 'lodash/cloneDeep';

export class GridSettings {
    gridWidth: string = "100%";
    gridHeight: string = "300";
    sortColumn: string = "";
    sortOrder: string = "1";
  
  constructor(gridHeight = null, gridWidth = null) {

    if (gridHeight) {
      this.gridHeight = gridHeight;
    }

    if (gridWidth) {
      this.gridWidth = gridWidth;
    }
    
  }
    /*
    constructor(gridId, id, gridWrap, gridWidth, gridHeight, sortColumn, sortOrder) {
        this.gridId = gridId;
        this.id = id;
        this.gridWrap = gridWrap;
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.sortColumn = sortColumn;
        this.sortOrder = sortOrder;
    }
    */

    SetGridOptions() {                
    }

    GetMasterGridConfig(containedInID) {
        return cloneDeep({
            autoResize: {
                containerId: containedInID,
            },
            enableAutoResize: true,       // true by default
            enableGridMenu: false,
            enableCellNavigation: true,
            multiColumnSort: false,
            enableColumnReorder: false,
            rowHeight: 50,
            headerRowHeight: 50,
            enableColumnPicker: false,
            enableHeaderMenu: false,
            enableHeaderButton: false,
            enableCheckboxSelector: false,

            enableRowSelection: true,

            rowSelectionOptions: {
                // True (Single Selection), False (Multiple Selections)
                selectActiveRow: false
            }
        });
    }
}

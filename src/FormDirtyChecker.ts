
import * as cloneDeep from 'lodash/cloneDeep';
import { FormGroup} from "@angular/forms";

export class FormDirtyChecker {
  constructor(currentModel) {
    this.CurrentFormModel = cloneDeep(currentModel);
  }
  GetProperties(formModel) {
    var a = [];
    if (formModel) {


      for (var key in formModel) {
        if (formModel.hasOwnProperty(key)) {
          if (formModel[key]) {
   
            if ( formModel[key] instanceof  FormGroup) {
              continue;
            }
          }
          a.push({ key: key, val: formModel[key] });
        }
      }
    }
    return a;
  }
  GetChanges(formModel) {
    let currentProperties = this.GetProperties(formModel);
    let oldProperties = this.GetProperties(this.CurrentFormModel);
    let hasChange = false;
    let changes = [];
    for (var i = 0; i < currentProperties.length; i++) {
      let oldProp=oldProperties.find(x => x.key == currentProperties[i].key);
      if (oldProp != null) {
        hasChange = JSON.stringify(currentProperties[i].val) != JSON.stringify(oldProp.val);
        if (hasChange) {
          changes.push(currentProperties[i]);
        }
      } else {
        if (currentProperties[i].val != null) {
          changes.push(currentProperties[i]);
        }
      }

    }


    for (var i = 0; i < oldProperties.length; i++) {
      let newProp = currentProperties.find(x => x.key == oldProperties[i].key);
      hasChange = false;
      if (newProp != null) {
        hasChange = JSON.stringify(oldProperties[i].val) != JSON.stringify(newProp.val);
         
      } else {
        if (oldProperties[i].val != null) {
          hasChange = true;
          
        }
      }
      if (hasChange) {
        if (changes.find(x => x.key == oldProperties[i].key) == null) {
          changes.push(oldProperties[i]);
        }
      }

    }
    this.CurrentFormModel = cloneDeep(formModel);
    

    return changes;
  }

  CurrentFormModel: any = null;
}

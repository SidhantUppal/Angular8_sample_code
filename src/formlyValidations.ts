import { AsyncValidatorFn, ValidatorFn, AbstractControl, ValidationErrors, FormGroup, FormControl, Validators, FormArray } from "@angular/forms";
export function noWhitespaceValidator(control: FormControl) {

  const isWhitespace = (control.value || '').toString().trim().length === 0;
  const isValid = !isWhitespace;
  return isValid ? null : { 'required': true };
}

const emailRegex = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

export function EmailValidator(control: FormControl) {
  if (control.value && !emailRegex.test(control.value)) {
    return {
      'email': true
    };
  }

  return null;
}



export function ConfirmPasswordValidator(control: FormControl)  {
  if (control.parent == undefined) {
    return null;
  }
  let otherControl = control.parent.controls["password"];


  if (control != null && otherControl != null && otherControl != undefined && control.value != otherControl.value) {
    return { 'passwordsNotMatching': true };
  }
  return null;
}



export function currentAndNewPasswordValidator(control: FormControl) {
  if (control.parent == undefined) {
    return null;
  }
  let otherControl = control.parent.controls["currentpassword"];


  if (control != null && otherControl != null && otherControl != undefined && control.value == otherControl.value) {
    return { 'passwordsSameAsOld': true };
  }
  return null;
}

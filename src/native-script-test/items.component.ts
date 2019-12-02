import { Component, OnInit } from "@angular/core";
import { AbstractControl, FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NativeScriptFormsModule } from "nativescript-angular/forms";

import { FormlyFieldConfig } from '@ngx-formly/core';
@Component({
    selector: "ns-items",
    templateUrl: "./items.component.html"
})
export class ItemsComponent implements OnInit {
  
    public counter: number = 16;

    loginForm: FormGroup = new FormGroup({});
   
    username = 'aaaaaaaaaaaaaa';

    SetTextCleared() {
    
    }
  constructor() {
    
    setTimeout(() => this.SetTextCleared());
    this.username = "qqq";
      console.log(this.formModel);
    }
    formModel = {
        username2:
            '',
        username: ''
    };
    formFields: FormlyFieldConfig[] = [{
            key: 'email',
            type: 'input',
            templateOptions: {
                label: 'Email address',
                placeholder: 'Enter email',
                required: true
            },
            validation: {
                messages: {

                    required: 'Please provide email address.'
                }

            }
        },
        {
            key: 'username',
            type: 'input',
            templateOptions: {
                label: 'username',
                placeholder: 'username',
                required: true
            },
            validation: {
                messages: {

                    required: 'Please provide password.'
                }

            }
        },
        {
            key: 'username2',
            type: 'input',
            templateOptions: {
                label: 'username2',
                placeholder: 'username2',
                required: true
            },
            validation: {
                messages: {

                    required: 'Please provide password.'
                }

            }
        }];
    ngOnInit(): void {
        
        /*this.loginForm = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]]
        });
        */
       // this.usernameControl = this.loginForm.controls['username'];
    }
    public get message(): string {
        if (this.counter > 0) {
            return this.counter + " taps left";
        } else {
            return "Hoorraaay! \nYou are ready to start building!";
        }
    }

    public onTap() {
        this.counter--;
       // this.username = this.usernameControl.value;
        alert(this.username + "," + this.formModel.username);
    }
}


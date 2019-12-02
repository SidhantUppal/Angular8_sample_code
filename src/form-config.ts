
import { FormlyFieldConfig } from "@ngx-formly/core";

export class FormConfig {
    className: string;
    key: string;
    type: string;
    templateOptions: any;
    required: boolean;
    hideExpression: string | boolean;
  disableExpression: any = null;
  reqdExpression: any = null;
    asyncValidatorFn: any;
    debounceTime: number = 0;
    validatorFn: any;

  constructor(className, key, type, templateOptions, required, hideExpression = null,
    disableExpression = null, asyncValidatorFn = null, validatorFn = null, debounceTime = 0 
  ) {
        this.className = className;
        this.key = key;
        this.type = type;
        this.templateOptions = templateOptions;
        this.required = required;
        this.hideExpression = hideExpression;
    this.disableExpression = disableExpression;
 
        this.asyncValidatorFn = asyncValidatorFn;
        this.validatorFn = validatorFn;
    this.debounceTime = debounceTime;
     
  }
  public RequiredExpression(exp) {
    this.reqdExpression = exp;
    return this;
  }

    public GetFormlyFieldConfig(this: FormConfig): FormlyFieldConfig {
        let config: FormlyFieldConfig = {
            className: this.className,
            key: this.key,
            type: this.type,
            templateOptions: this.templateOptions,
           
            hideExpression: this.hideExpression,
            validation: {
                // show: true,
                messages: {
                    required: 'Please enter ' + this.templateOptions.label,
                    existingLoginName: 'Login Name already exists',
                    confirmPassword: 'Passwords do not match',
                    email : 'Email Address is not valid'
                }
            },
            modelOptions: {
                debounce: {
                    default: this.debounceTime,
                },
            },
        }

        config.templateOptions.required = this.required;
      config.templateOptions.placeholder = 'Enter ' + this.templateOptions.label;
      if (config.expressionProperties == null) {
        config.expressionProperties = {};
      }
      if (this.disableExpression != null) {

        config.expressionProperties['templateOptions.disabled'] = this.disableExpression;
      }
      if (this.reqdExpression != null) {

        config.expressionProperties['templateOptions.required'] = this.reqdExpression;
      }
      

      if (this.asyncValidatorFn != null) {
            config.asyncValidators = {
                validation: [this.asyncValidatorFn]
            }
        }

        if (this.validatorFn != null) {
            config.validators =  {
                validation: [this.validatorFn],
            }
        }

        return config;
    }
}



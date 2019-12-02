import { Injectable } from '@angular/core';
import { Promise } from 'es6-promise';
import { LoaderSettings } from './AppSharedData';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/delay';
import { of } from 'rxjs';

import { debounceTime } from 'rxjs/internal/operators/debounceTime';

import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {


  constructor(public http: HttpClient) { }
  CheckUser(): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Validating Last login...";


    return this.http.get<any>(environment.apiPath + '/api/User');
  }
  GetSystemConfigs(): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Initialising Application...";


    return this.http.get<any>(environment.apiPath + '/api/SystemConfig');
  }
  ChangePassword(userName, password): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Changing Password...";
    var params = {};
    params["LoginName"] = userName;
    params["Password"] = password;

    return this.http.post<any>(environment.apiPath + '/api/Login/ChangePassword', params);
  }
  UpdatePassword(CurrentPassword, password): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Updating Password...";
    var params = {};

    params["Password"] = password;
    params["CurrentPassword"] = CurrentPassword;

    return this.http.post<any>(environment.apiPath + '/api/Login/UpdatePassword', params);
  }
  LoginUser(userName, password): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Logging in...";
    var params = {};
    params["LoginName"] = userName;
    params["Password"] = password;

    return this.http.post<any>(environment.apiPath + '/api/Login', params);
  }
  LogoutUser(): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Logging out...";


    return this.http.get<any>(environment.apiPath + '/api/User/Logout');
  }

  CurrentEditableOptionTypes = null;
  GetEditableOptionTypes(): Observable<any[]> {
    if (this.CurrentEditableOptionTypes != null) {
      return of(this.CurrentEditableOptionTypes);
    }
    LoaderSettings.CurrentLoadingText = "Fetching Option Types...";
    return this.http.get<any>(environment.apiPath + "/api/DataOption/GetEditableOptionTypes")
      .pipe(map(data => {
        this.CurrentEditableOptionTypes = data;

        return data;
      }));
  }

  CurrentDataOptionSortTypes = null;
  GetDataOptionSortTypes(): Observable<any[]> {
    if (this.CurrentDataOptionSortTypes != null) {
      return of(this.CurrentDataOptionSortTypes);
    }
    LoaderSettings.DoNotShowLoading = true;
    return this.http.get<any>(environment.apiPath + "/api/DataOption/GetDataOptionTypeSort")
      .pipe(map(data => {
        this.CurrentDataOptionSortTypes = data;

        return data;
      }));
  }

  UpdateDataOptions(params): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Saving...";


    return this.http.post<any>(environment.apiPath + '/api/DataOptionManage', params);
  }

  GetValidDataOptions(dataoptionTypeID, currentID): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Fetching data...";

    let url = environment.apiPath + '/api/DataOption/GetValidDataOptions/' + dataoptionTypeID + '/';
    if (currentID) {
      url = url + currentID;
    }
    return this.http.get<any>(url);
  }
  SearchRoles(params): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Loading Application Roles...";


    return this.http.post<any>(environment.apiPath + '/api/ApplicationRole/Search', params);
  }

  SearchSystemRolesByApplicationRole(params): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Loading System Roles...";


    return this.http.post<any>(environment.apiPath + '/api/SystemRole/SearchByApplicationRole', params);
  }
  GetAllMailingTemplates(): Observable<any[]> {

    let url = environment.apiPath + '/api/ManageMailingTemplate';

    return this.http.get<any[]>(url);
  }

  SearchMailingTemplate(params): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Loading Email Templates...";

    return this.http.post<any>(environment.apiPath + '/api/ManageMailingTemplate/Search', params);
  }

  SaveMailingTemplates(data): Observable<any> {
    return this.http.post<any>(environment.apiPath + '/api/ManageMailingTemplate', data);
  }

  SendActiveUserCheck(id): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Sending Check...";


    return this.http.get<any>(environment.apiPath + '/api/UserManager/SendActiveCheck/' + id);
  }

  GetUserDetails(id): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Getting User Details...";


    return this.http.get<any>(environment.apiPath + '/api/UserManager/UserDetails/' + id);
  }

  GetRoleDetails(id): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Getting Role Details...";


    return this.http.get<any>(environment.apiPath + '/api/ApplicationRole/RoleDetails/' + id);
  }

  GetHomeBudgets(id): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Getting Budgets...";


    return this.http.get<any>(environment.apiPath + '/api/Budget/GetHomeBudget/' + id);
  }

  GetBudgetDetails(id): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Getting Budget Details...";


    return this.http.get<any>(environment.apiPath + '/api/Budget/GetBudget/' + id);
  }


  SaveBudget(data): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Saving Budget...";


    return this.http.post<any>(environment.apiPath + '/api/Budget',data);
  }
  CurrentAutoTextResults = [];
  ResetAutoTextCache() {
    this.CurrentAutoTextResults = [];

  }
  AutoTextSearch(code,
    term,
    ParentID,
    currentID,
    secondParentID = "",
    thirdParent = "",
    fourthParent = "",
    fifthParent = "",
    currentSelections = ""
  ): Observable<any[]> {
    if (code == "fixedList") {
      return of([]);
    }
    var url = environment.apiPath + '/api/AutoText/' + code;
    if (term != undefined && term != null && term != "") {
      url = url + "/" + term;
    } else {
      url = url + "/EMPTY";
    }
    if (ParentID != undefined && ParentID != null && ParentID != "") {
      url = url + "/" + ParentID;
    } else {
      url = url + "/EMPTY";
    }
    if (currentID != undefined && currentID != null && currentID != "") {
      url = url + "/" + currentID;
    } else {
      url = url + "/-99999";
    }

    if (secondParentID != undefined && secondParentID != null && secondParentID != "") {
      url = url + "/" + secondParentID;
    } else {
      url = url + "/EMPTY";
    }
    if (thirdParent != undefined && thirdParent != null && thirdParent != "") {
      url = url + "/" + thirdParent;
    } else {
      url = url + "/EMPTY";
    }
    if (fourthParent != undefined && fourthParent != null && fourthParent != "") {
      url = url + "/" + fourthParent;
    } else {
      url = url + "/EMPTY";
    }

    if (fifthParent != undefined && fifthParent != null && fifthParent != "") {
      url = url + "/" + fifthParent;
    } else {
      url = url + "/EMPTY";
    }


    if (currentSelections != undefined && currentSelections != null && currentSelections != "") {
      url = url + "/" + currentSelections;
    } else {
      url = url + "/EMPTY";
    }



    let results = this.CurrentAutoTextResults.find(x => x.url == url);

    if (results != null) {

      return of(results.data);
    }

    LoaderSettings.DoNotShowLoading = true;
    var dataList = this.http.get(url)
      .pipe(
        debounceTime(500),  // WAIT FOR 500 MILISECONDS ATER EACH KEY STROKE.

        map(
          (data: any) => {
            this.CurrentAutoTextResults.push({ "url": url, "data": data });
            return (
              data.length != 0 ? data as any[] : []
            );
          }
        ));

    return dataList;
  }

  GetDataOptions(code, hasParent, ParentID, currentID): Observable<any[]> {
    var url = environment.apiPath + '/api/DataOption/' + code;
    if (hasParent != undefined && hasParent != null) {
      url = url + "/" + hasParent;
    } else {
      url = url + "/false";
    }
    if (ParentID != undefined && ParentID != null && ParentID != "") {
      url = url + "/" + ParentID;
    } else {
      url = url + "/-99999";
    }
    if (currentID != undefined && currentID != null && currentID != "") {
      url = url + "/" + currentID;
    } else {
      url = url + "/-99999";
    }
    console.log(url);
    LoaderSettings.DoNotShowLoading = true;
    var dataList = this.http.get(url)
      .pipe(
        debounceTime(500),  // WAIT FOR 500 MILISECONDS ATER EACH KEY STROKE.

        map(
          (data: any) => {
            return (
              data.length != 0 ? data as any[] : []
            );
          }
        ));

    return dataList;
  }

  SearchUsers(params): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Loading Users...";

    return this.http.post<any>(environment.apiPath + '/api/UserManager/Search', params);
  }

  ResetPassword(userName, applicationUserID): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Resetting Password...";
    var params = {};
    params["LoginName"] = userName;
    params["ApplicationUserID"] = applicationUserID;


    return this.http.post<any>(environment.apiPath + '/api/Login/ResetPassword', params);
  }


  SaveUser(params) {
    LoaderSettings.CurrentLoadingText = "Saving User...";

    return this.http.post<any>(environment.apiPath + '/api/UserManager', params);
  }

  SaveRole(params): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Saving Role...";

    return this.http.post<any>(environment.apiPath + '/api/ApplicationRole', params);
  }

  SearchUserDataAccess(params): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Loading User Data Access...";


    return this.http.post<any>(environment.apiPath + '/api/UserDataAccess/Search', params);
  }

  SearchRoleDataAccess(params): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Loading Role Data Access...";


    return this.http.post<any>(environment.apiPath + '/api/RoleDataAccess/Search', params);
  }

  SearchApplicationRolesByUserRole(params): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Loading Application Roles For User...";


    return this.http.post<any>(environment.apiPath + '/api/ApplicationRole/SearchByUser', params);
  }


  SearchAccounts(params): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Loading Accounts...";

    return this.http.post<any>(environment.apiPath + '/api/Account/Search', params);
  }

  SearchAccountStatementDetails(params): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Loading Accounts...";

    return this.http.post<any>(environment.apiPath + '/api/Account/SearchAccountStatementDetails', params);
  }

  SearchAccountStatementSummary(params): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Loading Accounts...";

    return this.http.post<any>(environment.apiPath + '/api/Account/SearchAccountStatementSummary', params);
  }

  ValidateLoginName(login, userID): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Validating Login Name...";
    if (userID == null) {
      userID = -1;
    }

    return this.http.get<any>(environment.apiPath + '/api/UserManager/' + login + '/' + userID);
  }

  ValidateApplicationRoleName(applicationRoleName, applicationRoleID): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Validating Application Role Name...";
    if (applicationRoleID == null) {
      applicationRoleID = -1;
    }

    return this.http.get<any>(environment.apiPath + '/api/ApplicationRole/' + applicationRoleName + '/' + applicationRoleID);
  }

  SearchTransactionActions(params): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Loading Transactions...";

    return this.http.post<any>(environment.apiPath + '/api/Refund/Search', params);
  }

  SearchHomes(params): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Loading Homes...";

    return this.http.post<any>(environment.apiPath + '/api/HomeManagement/Search', params);
  }

  SaveHomeDetails(params): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Saving Home...";

    return this.http.post<any>(environment.apiPath + '/api/HomeManagement/SaveHomeDetails', params);
  }

  GetHomeGLAccountDetails(params) {
    LoaderSettings.CurrentLoadingText = "Loading Home Account Details...";


    return this.http.get<any>(environment.apiPath + '/api/HomeManagement/GetHomeGLAccountDetails/' + params.HomeID);
  }

  ValidateGLAccountCode(accountCode, glAccountID): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Validating GL Account Code...";
    
    
    return this.http.get<any>(environment.apiPath + '/api/GLAccount/ValidateGLAccount/?accountCode=' + encodeURIComponent(accountCode) + '&glAccountID=' + glAccountID);
  }

  ValidateGLAccountAndEntityType(glAccountTypeID, glEntityTypeID, glAccountID): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Validating GL Account/Entity...";
    
    return this.http.get<any>(environment.apiPath + '/api/GLAccount/ValidateGLAccountAndEntityType/' + glAccountTypeID + '/' + glEntityTypeID + '/' + glAccountID);
  }
  LastBankAccountCheck=[];
  ValidateBankAccount(bsbDetailID, accountNumber, bankAccountID): Observable<any> {
    
    
    let url = environment.apiPath + '/api/Account/ValidateBankAccount/' + bsbDetailID + '/' + accountNumber;
    if (bankAccountID) {
      url = environment.apiPath +
        '/api/Account/ValidateBankAccount/' +
        bsbDetailID +
        '/' +
        accountNumber +
        '/' +
        bankAccountID;
     
    }
    let results = this.LastBankAccountCheck.find(x => x.url == url);
    if (results != null) {
      this.LastBankAccountCheck = [];
      return of(results.data);
    }
    LoaderSettings.CurrentLoadingText = "Validating Bank Account...";
    var dataList = this.http.get(url)
      .pipe(
        

        map(
          (data: any) => {
            this.LastBankAccountCheck.push({ "url": url, "data": data });
            return data;
          }
        ));

   
    
    //return this.http.get<any>(url);
    return dataList;
  }
  
  SaveAccountDetails(params) {
    LoaderSettings.CurrentLoadingText = "Saving Home GL Account Details...";

    return this.http.post<any>(environment.apiPath + '/api/Account/SaveAccountDetails', params);
  }

  SearchClients(params): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Loading Clients...";

    return this.http.post<any>(environment.apiPath + '/api/ClientManagement/Search', params);
  }

  GetBankAccountDetails(id): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Getting Bank Account Details...";
    return this.http.get<any>(environment.apiPath + '/api/BankAccount/' + id);
  }

  GetGlAccountWithBankAccount(id): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Getting GLAccount Details...";
    return this.http.get<any>(environment.apiPath + '/api/GLAccount/' + id);
  }

  
  GetAccountDetails(id): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Getting GLAccount Details...";
    return this.http.get<any>(environment.apiPath + '/api/Account/' + id);
  }

  // GetBankCards(id): Observable<any> {
  //   LoaderSettings.CurrentLoadingText = "Getting Bank Card Details...";
  //   return this.http.get<any>(environment.apiPath + '/api/BankAccount/card/' + id);
  // }

  SaveGlAccountDetails(params) {
    LoaderSettings.CurrentLoadingText = "Saving Bank Account Details...";
    return this.http.post<any>(environment.apiPath + '/api/Account/SaveAccountDetails', params);
  }

  GetClientDetails(clientID) {
    LoaderSettings.CurrentLoadingText = "Loading Client Details...";
    
    return this.http.get<any>(environment.apiPath + '/api/ClientManagement/GetClientDetails/' + clientID);
  }
  
   SaveClientDetails(params) {
    LoaderSettings.CurrentLoadingText = "Saving Client Details...";

    return this.http.post<any>(environment.apiPath + '/api/ClientManagement/SaveClientDetails', params);
  }

  SaveClientAssignment(params) {
    LoaderSettings.CurrentLoadingText = "Saving Client Assignment...";
    return this.http.post<any>(environment.apiPath + '/api/ClientManagement/SaveClientAssignment', params);
  }


  GetHomeDetails(homeID): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Loading Home Details...";

    return this.http.get<any>(environment.apiPath + '/api/HomeManagement/GetHomeDetails/' + homeID);
  }

  ValidateClientAvailability(clientID, sourceEntityType, sourceEntityTypeID, entryDate) {
    LoaderSettings.CurrentLoadingText = "Validating Client Availability...";
    if (clientID == null) {
      clientID = -1;
    }

    return this.http.get<any>(environment.apiPath + '/api/ClientManagement/ValidateClientAvailability/' + clientID + '/' + sourceEntityType + '/' + sourceEntityTypeID + '/' + entryDate);
  }

  SearchClientAssignmentDetails(params) {
    LoaderSettings.CurrentLoadingText = "Loading Client Assignment Details...";

    return this.http.post<any>(environment.apiPath + '/api/ClientManagement/SearchClientAssignmentDetails/', params);
  }

  SearchFinAdministrator(params): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Loading Financial Administrator...";

    return this.http.post<any>(environment.apiPath + '/api/FinAdministrator/Search', params);
  }

  SaveOrgFinAdministrator(params) {
    LoaderSettings.CurrentLoadingText = "Saving Financial Administrator...";
    return this.http.post<any>(environment.apiPath + '/api/FinAdministrator', params);
  }

  GetFinAdminDetails(id,showInactive): Observable<any> {
    LoaderSettings.CurrentLoadingText = "Getting Financial Administrator Details...";
    return this.http.get<any>(environment.apiPath + '/api/FinAdministrator/' + id+ '/'+showInactive);
  }

  AddExistingContact(params) {
    LoaderSettings.CurrentLoadingText = "Saving Financial Administrator...";
    return this.http.post<any>(environment.apiPath + '/api/FinAdministrator/AddContact', params);
  }


}


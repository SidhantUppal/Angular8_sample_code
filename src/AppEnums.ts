
export enum UserType {
  CFMAdmin = 'CFMAdmin',  
  Supervisor = 'Supervisor',
  FinancialAdministrator ='FinancialAdministrator',
  CFMUser = 'CFMUser'  
} 
export enum SystemRoleType {
  InternalUsers=1,
  ExternalUsers=2

} 

export enum AutoTextTypes {
  Home = 'Home',
  HomeGlEntity = 'HomeGlEntity',
  FinAdministratorGlEntity ='FinAdministratorGlEntity',
  BusinessArea = 'BusinessArea',
  BusinessDivision = 'BusinessDivision',
  BusinessEntity ='BusinessEntity',
  Country ='Country',
  States = 'States',
  ApplicationRole ='ApplicationRole',
  Administrator='Administrator',
  Account='Account',
  AccountType='AccountType',
  StatementPeriods='StatementPeriods',
  TransactionActionType = 'TransactionActionType',
  Clients='Clients',
  HomeClients='HomeClients',
  AdministratorClients='AdministratorClients',
  HomeCostCentre='HomeCostCentre',
  AccomodationType='AccomodationType',
  SystemRole='SystemRole',
  ApplicationUser='ApplicationUser',
  StatementDeliveryOption='StatementDeliveryOption',
  BSB='BSB',
  InternalUsers = 'InternalUsers',
  FinancialAdminContact = 'FinancialAdminContact',
  FinancialAdminApplicationRole = 'FinancialAdminApplicationRole'
} 

export enum SystemRole {
   
  CFMAdmin = 1,
  FinancialAdministrator = 2,
  Supervisor=3,
  ClientOthers=8
}

export enum GLEntityType {
  Home = 1,
  Client=2,
  FinancialAdministrator=3,
  SystemAccount=4
}

export enum DataSortOrder {
  Ascending = 1,
  Descending=2,
  Custom=3
}

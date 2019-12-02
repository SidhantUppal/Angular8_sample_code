export class BreadCrumb {
    label: string;
  url: string;
  icon: string;
  constructor() {
    this.label = '';
    this.url = '';
    this.icon = '';
  }
};

export const BreadCrumbDetails = {
  Crumbs: BreadCrumb[4] = new Array(new BreadCrumb(), new BreadCrumb(), new BreadCrumb(), new BreadCrumb()),
  Reset() {
    BreadCrumbDetails.Crumbs= new Array(new BreadCrumb(), new BreadCrumb(), new BreadCrumb(), new BreadCrumb())
  }

}

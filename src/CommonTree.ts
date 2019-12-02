export class CustomTreeNode {
  id: string;
  children: CustomTreeNode[];
  filename: string;
  type: any;
}

export class FlatTreeNode {
  constructor(
    public expandable: boolean,
    public filename: string,
    public level: number,
    public type: any,
    public id: string
  ) { }
}

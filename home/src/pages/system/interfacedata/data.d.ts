export interface InterfacedataListItem  {
  id: string;
  name: string;
  description: string;
};

export interface InterfacedataList  {
  data?: InterfacedataListItem[];
  /** 列表的内容总数 */
  total?: number;
  success?: boolean;
};
export interface InterfacedataListParams {
  id?: number;
  pageSize?: number;
  current?: number;
  currentPage?: number;
  filter?: { [key: string]: any[] };
  sorter?: { [key: string]: any };

}



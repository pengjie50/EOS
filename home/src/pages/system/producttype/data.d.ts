export interface ProducttypeListItem  {
  id: string;
  name: string;
  description: string;
};

export interface ProducttypeList  {
  data?: ProducttypeListItem[];
  /** 列表的内容总数 */
  total?: number;
  success?: boolean;
};
export interface ProducttypeListParams {
  id?: number;
  pageSize?: number;
  current?: number;
  currentPage?: number;
  filter?: { [key: string]: any[] };
  sorter?: { [key: string]: any };

}



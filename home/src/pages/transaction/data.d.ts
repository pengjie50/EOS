export interface TransactionListItem  {
  id: string;
  name: string;
  description: string;
};

export interface TransactionList  {
  data?: TransactionListItem[];
  /** 列表的内容总数 */
  total?: number;
  success?: boolean;
};
export interface TransactionListParams {
  id?: number;
  pageSize?: number;
  current?: number;
  currentPage?: number;
  filter?: { [key: string]: any[] };
  sorter?: { [key: string]: any };

}



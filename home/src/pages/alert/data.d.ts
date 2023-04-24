export interface AlertListItem  {
  id: string;
  name: string;
  description: string;
};

export interface AlertList  {
  data?: AlertListItem[];
  /** 列表的内容总数 */
  total?: number;
  success?: boolean;
};
export interface AlertListParams {
  id?: number;
  pageSize?: number;
  current?: number;
  currentPage?: number;
  filter?: { [key: string]: any[] };
  sorter?: { [key: string]: any };

}



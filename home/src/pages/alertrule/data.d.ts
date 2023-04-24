export interface AlertruleListItem  {
  id: string;
  name: string;
  description: string;
};

export interface AlertruleList  {
  data?: AlertruleListItem[];
  /** 列表的内容总数 */
  total?: number;
  success?: boolean;
};
export interface AlertruleListParams {
  id?: number;
  pageSize?: number;
  current?: number;
  currentPage?: number;
  filter?: { [key: string]: any[] };
  sorter?: { [key: string]: any };

}



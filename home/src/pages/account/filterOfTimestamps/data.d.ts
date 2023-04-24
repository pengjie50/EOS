export interface FilterOfTimestampsListItem  {
  id: string;
  pid: string;
  name: string;
  description: string;
};

export interface FilterOfTimestampsList  {
  data?: FilterOfTimestampsListItem[];
  /** 列表的内容总数 */
  total?: number;
  success?: boolean;
};
export interface FilterOfTimestampsListParams {
  id?: number;
  pageSize?: number;
  current?: number;
  currentPage?: number;
  filter?: { [key: string]: any[] };
  sorter?: { [key: string]: any };

}



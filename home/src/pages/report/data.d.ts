export interface ReportListItem  {
  id: string;
  pid: string;
  name: string;
  description: string;
};

export interface ReportList  {
  data?: ReportListItem[];
  /** 列表的内容总数 */
  total?: number;
  success?: boolean;
};
export interface ReportListParams {
  id?: number;
  pageSize?: number;
  current?: number;
  currentPage?: number;
  filter?: { [key: string]: any[] };
  sorter?: { [key: string]: any };

}



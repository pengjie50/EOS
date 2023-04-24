export interface TerminalListItem  {
  id: string;
  name: string;
  description: string;
};

export interface TerminalList  {
  data?: TerminalListItem[];
  /** 列表的内容总数 */
  total?: number;
  success?: boolean;
};
export interface TerminalListParams {
  id?: number;
  pageSize?: number;
  current?: number;
  currentPage?: number;
  filter?: { [key: string]: any[] };
  sorter?: { [key: string]: any };

}



export interface OperlogListItem  {
  id: string;
  pid: string;
  name: string;
  description: string;
};

export interface OperlogList  {
  data?: OperlogListItem[];
  total?: number;
  success?: boolean;
};
export interface OperlogListParams {
  id?: number;
  pageSize?: number;
  current?: number;
  currentPage?: number;
  filter?: { [key: string]: any[] };
  sorter?: { [key: string]: any };

}



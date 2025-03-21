export interface LoginlogListItem  {
  id: string;
  pid: string;
  name: string;
  description: string;
};

export interface LoginlogList  {
  data?: LoginlogListItem[];
  total?: number;
  success?: boolean;
};
export interface LoginlogListParams {
  id?: number;
  pageSize?: number;
  current?: number;
  currentPage?: number;
  filter?: { [key: string]: any[] };
  sorter?: { [key: string]: any };

}



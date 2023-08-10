export interface SysconfigListItem  {
  id: string;
  pid: string;
  name: string;
  description: string;
};

export interface SysconfigList  {
  data?: SysconfigListItem[];
  total?: number;
  success?: boolean;
};
export interface SysconfigListParams {
  id?: number;
  pageSize?: number;
  current?: number;
  currentPage?: number;
  filter?: { [key: string]: any[] };
  sorter?: { [key: string]: any };

}



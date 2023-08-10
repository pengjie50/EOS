export interface RoleListItem  {
  id: string;
  pid: string;
  name: string;
  description: string;
};

export interface RoleList  {
  data?: RoleListItem[];
  total?: number;
  success?: boolean;
};
export interface RoleListParams {
  id?: number;
  pageSize?: number;
  current?: number;
  currentPage?: number;
  filter?: { [key: string]: any[] };
  sorter?: { [key: string]: any };

}



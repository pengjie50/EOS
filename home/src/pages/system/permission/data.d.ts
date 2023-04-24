export interface PermissionListItem  {
  id: string;
  name: string;
  description: string;
};

export interface PermissionList  {
  data?: PermissionListItem[];
  /** 列表的内容总数 */
  total?: number;
  success?: boolean;
};
export interface PermissionListParams {
  id?: number;
  pageSize?: number;
  current?: number;
  currentPage?: number;
  filter?: { [key: string]: any[] };
  sorter?: { [key: string]: any };

}



export interface FlowListItem  {
  id: string;
  pid: string;
  name: string;
  description: string;
};

export interface FlowList  {
  data?: FlowListItem[];
  total?: number;
  success?: boolean;
};
export interface FlowListParams {
  id?: number;
  pageSize?: number;
  current?: number;
  currentPage?: number;
  filter?: { [key: string]: any[] };
  sorter?: { [key: string]: any };

}



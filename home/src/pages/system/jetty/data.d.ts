export interface JettyListItem  {
  id: string;
  name: string;
  description: string;
};

export interface JettyList  {
  data?: JettyListItem[];
  total?: number;
  success?: boolean;
};
export interface JettyListParams {
  id?: number;
  pageSize?: number;
  current?: number;
  currentPage?: number;
  filter?: { [key: string]: any[] };
  sorter?: { [key: string]: any };

}



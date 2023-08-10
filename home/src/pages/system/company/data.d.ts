export interface CompanyListItem  {
  id: string;
  pid: string;
  name: string;
  description: string;
};

export interface CompanyList  {
  data?: CompanyListItem[];
 
  total?: number;
  success?: boolean;
};
export interface CompanyListParams {
  id?: number;
  pageSize?: number;
  current?: number;
  currentPage?: number;
  filter?: { [key: string]: any[] };
  sorter?: { [key: string]: any };

}



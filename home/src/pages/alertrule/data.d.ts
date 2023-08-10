export interface AlertruleListItem  {
  id: string;
  alertrule_id: string;
  description: string;
};

export interface AlertruleList  {
  data?: AlertruleListItem[];
  total?: number;
  success?: boolean;
};
export interface AlertruleListParams {
  id?: number;
  pageSize?: number;
  current?: number;
  currentPage?: number;
  filter?: { [key: string]: any[] };
  sorter?: { [key: string]: any };

}



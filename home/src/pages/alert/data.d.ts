export interface AlertListItem  {
  id: string;
  alert_id: string;
  description: string;
};

export interface AlertList  {
  data?: AlertListItem[];
  total?: number;
  success?: boolean;
};
export interface AlertListParams {
  id?: number;
  pageSize?: number;
  current?: number;
  currentPage?: number;
  filter?: { [key: string]: any[] };
  sorter?: { [key: string]: any };

}



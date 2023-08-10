export interface UserListItem  {
  id: string;
  username: string;
  nickname: string;
  email: string;

};

export interface UserList  {
  data?: UserListItem[];
 
  total?: number;
  success?: boolean;
};
export interface UserListParams {
  id?: number;
  pageSize?: number;
  current?: number;
  currentPage?: number;
  filter?: { [key: string]: any[] };
  sorter?: { [key: string]: any };

}



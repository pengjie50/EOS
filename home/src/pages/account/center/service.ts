import { request } from 'umi';
import type { CurrentUser, ListItemDataType } from './data.d';



export async function queryCurrent(options?: { [key: string]: any }) {

  return request<{
    data: API.CurrentUser;
  }>('/api/user/info', {
    method: 'POST',
    data: {},
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}
export async function queryFakeList(params: {
  count: number;
}): Promise<{ data: { list: ListItemDataType[] } }> {
  return request('/api/fake_list_Detail', {
    params,
  });
}

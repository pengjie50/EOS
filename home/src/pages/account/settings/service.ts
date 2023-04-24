import { request } from 'umi';
import type { CurrentUser, GeographicItemType } from './data';
/** 获取当前的用户 GET /api/currentUser */
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


export async function queryProvince(): Promise<{ data: GeographicItemType[] }> {
  return request('/api/geographic/province');
}

export async function queryCity(province: string): Promise<{ data: GeographicItemType[] }> {
  return request(`/api/geographic/city/${province}`);
}

export async function query() {
  return request('/api/users');
}

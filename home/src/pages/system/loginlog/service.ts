import { request } from 'umi';
import { LoginlogList, LoginlogListItem, LoginlogListParams } from './data.d';


export async function loginlog(params?: LoginlogListParams) {


  return request('/api/loginlog/list', {
    method: 'POST',
    data: {
      ...params,
      hasFilters: true
    },
  });
}

export async function updateLoginlog(options?: { [key: string]: any }) {
  return request<LoginlogListItem>('/api/loginlog/mod', {
    method: 'POST',
    data: options || {}
  });
}

export async function addLoginlog(options?: { [key: string]: any }) {
  return request<LoginlogListItem>('/api/loginlog/add', {
    method: 'POST',
    data: options || {}

  });
}


export async function removeLoginlog(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/loginlog/del', {
    method: 'POST',
    data: options || {}
  });
}

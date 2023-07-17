import { request } from 'umi';
import { OperlogList, OperlogListItem, OperlogListParams } from './data.d';


export async function operlog(params?: OperlogListParams) {

  return request('/api/operlog/list', {
    method: 'POST',
    data: {
      ...params,
      hasFilters: true
    },
  });
}

export async function updateOperlog(options?: { [key: string]: any }) {
  return request<OperlogListItem>('/api/operlog/mod', {
    method: 'POST',
    data: options || {}
  });
}

export async function addOperlog(options?: { [key: string]: any }) {
  return request<OperlogListItem>('/api/operlog/add', {
    method: 'POST',
    data: options || {}

  });
}


export async function removeOperlog(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/operlog/del', {
    method: 'POST',
    data: options || {}
  });
}

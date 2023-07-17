import { request } from 'umi';
import { SysconfigList, SysconfigListItem, SysconfigListParams } from './data.d';


export async function sysconfig(params?: SysconfigListParams) {

  return request('/api/sysconfig/list', {
    method: 'POST',
    data: {
      ...params,
      hasFilters: true
    },
  });
}

export async function updateSysconfig(options?: { [key: string]: any }) {
  return request<SysconfigListItem>('/api/sysconfig/mod', {
    method: 'POST',
    data: options || {}
  });
}

export async function addSysconfig(options?: { [key: string]: any }) {
  return request<SysconfigListItem>('/api/sysconfig/add', {
    method: 'POST',
    data: options || {}

  });
}


export async function removeSysconfig(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/sysconfig/del', {
    method: 'POST',
    data: options || {}
  });
}

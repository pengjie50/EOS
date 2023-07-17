import { request } from 'umi';
import { InterfacedataList, InterfacedataListItem, InterfacedataListParams } from './data.d';


export async function interfacedata(params?: InterfacedataListParams) {

  return request('/api/interfacedata/list', {
    method: 'POST',
    data: {
      ...params,
      hasFilters: true
    },
  });
}

export async function updateInterfacedata(options?: { [key: string]: any }) {
  return request<InterfacedataListItem>('/api/interfacedata/mod', {
    method: 'POST',
    data: options || {}
  });
}

export async function addInterfacedata(options?: { [key: string]: any }) {
  return request<InterfacedataListItem>('/api/interfacedata/add', {
    method: 'POST',
    data: options || {}

  });
}


export async function removeInterfacedata(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/interfacedata/del', {
    method: 'POST',
    data: options || {}
  });
}

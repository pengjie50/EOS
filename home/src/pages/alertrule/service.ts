import { request } from 'umi';
import { AlertruleList, AlertruleListItem, AlertruleListParams } from './data.d';


export async function alertrule(params?: any) {

  return request('/api/alertrule/list', {
    method: 'POST',
    data: {
      ...params,
      hasFilters: true
    },
  });
}

export async function updateAlertrule(options?: { [key: string]: any }) {
  return request<AlertruleListItem>('/api/alertrule/mod', {
    method: 'POST',
    data: options || {}
  });
}

export async function addAlertrule(options?: { [key: string]: any }) {
  return request<AlertruleListItem>('/api/alertrule/add', {
    method: 'POST',
    data: options || {}

  });
}


export async function removeAlertrule(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/alertrule/del', {
    method: 'POST',
    data: options || {}
  });
}

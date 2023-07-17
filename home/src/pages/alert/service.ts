import { request } from 'umi';
import { AlertList, AlertListItem, AlertListParams } from './data.d';


export async function alert(params?: AlertListParams) {

  return request('/api/alert/list', {
    method: 'POST',
    data: {
      ...params,
      hasFilters: true
    },
  });
}

export async function getAlertBytransactionId(params?: AlertListParams) {

  return request('/api/alert/list', {
    method: 'POST',
    data: {
      ...params,
      hasFilters: true
    },
  });
}
export async function getUserUnreadAlertCount(options?: { [key: string]: any }) {

  return request<AlertListItem>('/api/alert/getUserUnreadAlertCount', {
    method: 'POST',
    data: options || {}
  });
}
export async function updateAlert(options?: { [key: string]: any }) {
  return request<AlertListItem>('/api/alert/mod', {
    method: 'POST',
    data: options || {}
  });
}

export async function addAlert(options?: { [key: string]: any }) {
  return request<AlertListItem>('/api/alert/add', {
    method: 'POST',
    data: options || {}

  });
}


export async function removeAlert(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/alert/del', {
    method: 'POST',
    data: options || {}
  });
}

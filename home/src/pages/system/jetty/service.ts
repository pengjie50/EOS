import { request } from 'umi';
import { JettyList, JettyListItem, JettyListParams } from './data.d';


export async function jetty(params?: JettyListParams) {

  return request('/api/jetty/list', {
    method: 'POST',
    data: {
      ...params,
      hasFilters: true
    },
  });
}

export async function updateJetty(options?: { [key: string]: any }) {
  return request<JettyListItem>('/api/jetty/mod', {
    method: 'POST',
    data: options || {}
  });
}

export async function addJetty(options?: { [key: string]: any }) {
  return request<JettyListItem>('/api/jetty/add', {
    method: 'POST',
    data: options || {}

  });
}


export async function removeJetty(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/jetty/del', {
    method: 'POST',
    data: options || {}
  });
}

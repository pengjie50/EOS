import { request } from 'umi';
import { JettyList, JettyListItem, JettyListParams } from './data.d';

/** 获取规则列表 GET /api/rule */
export async function jetty(params?: JettyListParams) {
  console.log(params)
  return request('/api/jetty/list', {
    method: 'POST',
    data: {
      ...params,
      hasFilters:true
    },
  });
}

export async function updateJetty(options?: { [key: string]: any }) {
  return request <JettyListItem>('/api/jetty/mod', {
    method: 'POST',
    data: options || {}
  });
}

export async function addJetty(options?: { [key: string]: any }) {
  return request<JettyListItem>('/api/jetty/add', {
    method: 'POST',
    data:options || {}
    
  });
}


export async function removeJetty(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/jetty/del', {
    method: 'POST',
    data: options || {}
  });
}

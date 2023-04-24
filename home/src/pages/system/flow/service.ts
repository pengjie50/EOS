import { request } from 'umi';
import { FlowList, FlowListItem, FlowListParams } from './data.d';

/** 获取规则列表 GET /api/rule */
export async function flow(params?: FlowListParams) {
  console.log(params)
  return request('/api/flow/list', {
    method: 'POST',
    data: {
      ...params,
      hasFilters:true
    },
  });
}

export async function updateFlow(options?: { [key: string]: any }) {
  return request <FlowListItem>('/api/flow/mod', {
    method: 'POST',
    data: options || {}
  });
}

export async function addFlow(options?: { [key: string]: any }) {
  return request<FlowListItem>('/api/flow/add', {
    method: 'POST',
    data:options || {}
    
  });
}


export async function removeFlow(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/flow/del', {
    method: 'POST',
    data: options || {}
  });
}

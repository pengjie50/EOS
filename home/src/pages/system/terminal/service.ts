import { request } from 'umi';
import { TerminalList, TerminalListItem, TerminalListParams } from './data.d';

/** 获取规则列表 GET /api/rule */
export async function terminal(params?: TerminalListParams) {
  console.log(params)
  return request('/api/terminal/list', {
    method: 'POST',
    data: {
      ...params,
      hasFilters:true
    },
  });
}

export async function updateTerminal(options?: { [key: string]: any }) {
  return request <TerminalListItem>('/api/terminal/mod', {
    method: 'POST',
    data: options || {}
  });
}

export async function addTerminal(options?: { [key: string]: any }) {
  return request<TerminalListItem>('/api/terminal/add', {
    method: 'POST',
    data:options || {}
    
  });
}


export async function removeTerminal(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/terminal/del', {
    method: 'POST',
    data: options || {}
  });
}

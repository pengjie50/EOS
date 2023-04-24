import { request } from 'umi';
import { LoginlogList, LoginlogListItem, LoginlogListParams } from './data.d';

/** 获取规则列表 GET /api/rule */
export async function loginlog(params?: LoginlogListParams) {
  console.log(params)
  
  return request('/api/loginlog/list', {
    method: 'POST',
    data: {
      ...params,
      hasFilters:true
    },
  });
}

export async function updateLoginlog(options?: { [key: string]: any }) {
  return request <LoginlogListItem>('/api/loginlog/mod', {
    method: 'POST',
    data: options || {}
  });
}

export async function addLoginlog(options?: { [key: string]: any }) {
  return request<LoginlogListItem>('/api/loginlog/add', {
    method: 'POST',
    data:options || {}
    
  });
}


export async function removeLoginlog(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/loginlog/del', {
    method: 'POST',
    data: options || {}
  });
}

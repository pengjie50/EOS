import { request } from 'umi';
import { CompanyList, CompanyListItem, CompanyListParams } from './data.d';

/** 获取规则列表 GET /api/rule */
export async function company(params?: CompanyListParams) {
  console.log(params)
  return request('/api/company/list', {
    method: 'POST',
    data: {
      ...params,
      hasFilters:true
    },
  });
}

export async function updateCompany(options?: { [key: string]: any }) {
  return request <CompanyListItem>('/api/company/mod', {
    method: 'POST',
    data: options || {}
  });
}

export async function addCompany(options?: { [key: string]: any }) {
  return request<CompanyListItem>('/api/company/add', {
    method: 'POST',
    data:options || {}
    
  });
}


export async function removeCompany(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/company/del', {
    method: 'POST',
    data: options || {}
  });
}

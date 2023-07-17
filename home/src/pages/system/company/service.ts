import { request } from 'umi';
import { CompanyList, CompanyListItem, CompanyListParams } from './data.d';


export async function company(params?: CompanyListParams) {

  return request('/api/company/list', {
    method: 'POST',
    data: {
      ...params,
      hasFilters: true
    },
  });
}

export async function organization(params?: CompanyListParams) {

  return request('/api/company/organization', {
    method: 'POST',
    data: {
      ...params,
      hasFilters: true
    },
  });
}


export async function updateCompany(options?: { [key: string]: any }) {
  return request<CompanyListItem>('/api/company/mod', {
    method: 'POST',
    data: options || {}
  });
}

export async function addCompany(options?: { [key: string]: any }) {
  return request<CompanyListItem>('/api/company/add', {
    method: 'POST',
    data: options || {}

  });
}


export async function removeCompany(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/company/del', {
    method: 'POST',
    data: options || {}
  });
}

import { request } from 'umi';
import { ReportList, ReportListItem, ReportListParams } from './data.d';

/** 获取规则列表 GET /api/rule */
export async function report(params?: ReportListParams) {
  console.log(params)
  return request('/api/report/list', {
    method: 'POST',
    data: {
      ...params,
      hasFilters:true
    },
  });
}
export async function queryMenuByReportId(params?: { [key: string]: any }) {
  return request('/api/permissiontoreport/list', {
    method: 'POST',
    data: {
      ...params,
     // hasFilters: true
    },
  });
}
export async function updateReportMenu(params?: { [key: string]: any }) {
  console.log(params)
  return request('/api/permissiontoreport/add', {
    method: 'POST',
    data: {
      ...params,
      // hasFilters: true
    },
  });
}

export async function updateReport(options?: { [key: string]: any }) {
  return request <ReportListItem>('/api/report/mod', {
    method: 'POST',
    data: options || {}
  });
}

export async function addReport(options?: { [key: string]: any }) {
  return request<ReportListItem>('/api/report/add', {
    method: 'POST',
    data:options || {}
    
  });
}


export async function removeReport(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/report/del', {
    method: 'POST',
    data: options || {}
  });
}

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

export async function reportSummary(params?: ReportListParams) {
  console.log(params)
  return request('/api/reportSummary/list', {
    method: 'POST',
    data: {
      ...params,
      hasFilters: true
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




export async function reportTemplate(params?: ReportListParams) {
  console.log(params)
  return request('/api/reportTemplate/list', {
    method: 'POST',
    data: {
      ...params,
      hasFilters: true
    },
  });
}



export async function updateReportTemplate(options?: { [key: string]: any }) {
  return request<ReportListItem>('/api/reportTemplate/mod', {
    method: 'POST',
    data: options || {}
  });
}

export async function addReportTemplate(options?: { [key: string]: any }) {
  return request<ReportListItem>('/api/reportTemplate/add', {
    method: 'POST',
    data: options || {}

  });
}


export async function removeReportTemplate(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/reportTemplate/del', {
    method: 'POST',
    data: options || {}
  });
}

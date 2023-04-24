import { request } from 'umi';
import { FilterOfTimestampsList, FilterOfTimestampsListItem, FilterOfTimestampsListParams } from './data.d';

/** 获取规则列表 GET /api/rule */
export async function filterOfTimestamps(params?: FilterOfTimestampsListParams) {
  console.log(params)
  return request('/api/filterOfTimestamps/list', {
    method: 'POST',
    data: {
      ...params,
      hasFilters:true
    },
  });
}

export async function updateFilterOfTimestamps(options?: { [key: string]: any }) {
  return request <FilterOfTimestampsListItem>('/api/filterOfTimestamps/mod', {
    method: 'POST',
    data: options || {}
  });
}

export async function addFilterOfTimestamps(options?: { [key: string]: any }) {
  return request<FilterOfTimestampsListItem>('/api/filterOfTimestamps/add', {
    method: 'POST',
    data:options || {}
    
  });
}


export async function removeFilterOfTimestamps(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/filterOfTimestamps/del', {
    method: 'POST',
    data: options || {}
  });
}

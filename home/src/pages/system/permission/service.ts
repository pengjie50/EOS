import { request } from 'umi';
import { PermissionList, PermissionListItem, PermissionListParams } from './data.d';

/** 获取规则列表 GET /api/rule */
export async function permission(params?: PermissionListParams) {
  console.log(params)
  return request('/api/permission/list', {
    method: 'POST',
    data: {
      ...params,
      hasFilters:true
    },
  });
}

export async function updatePermission(options?: { [key: string]: any }) {
  return request <PermissionListItem>('/api/permission/mod', {
    method: 'POST',
    data: options || {}
  });
}

export async function addPermission(options?: { [key: string]: any }) {
  return request<PermissionListItem>('/api/permission/add', {
    method: 'POST',
    data:options || {}
    
  });
}


export async function removePermission(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/permission/del', {
    method: 'POST',
    data: options || {}
  });
}

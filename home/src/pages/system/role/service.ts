import { request } from 'umi';
import { RoleList, RoleListItem, RoleListParams } from './data.d';


export async function role(params?: RoleListParams) {

  return request('/api/role/list', {
    method: 'POST',
    data: {
      ...params,
      hasFilters: true
    },
  });
}
export async function queryMenuByRoleId(params?: { [key: string]: any }) {
  return request('/api/permissiontorole/list', {
    method: 'POST',
    data: {
      ...params,

    },
  });
}
export async function updateRoleMenu(params?: { [key: string]: any }) {

  return request('/api/permissiontorole/add', {
    method: 'POST',
    data: {
      ...params,

    },
  });
}

export async function updateRole(options?: { [key: string]: any }) {
  return request<RoleListItem>('/api/role/mod', {
    method: 'POST',
    data: options || {}
  });
}

export async function addRole(options?: { [key: string]: any }) {
  return request<RoleListItem>('/api/role/add', {
    method: 'POST',
    data: options || {}

  });
}


export async function removeRole(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/role/del', {
    method: 'POST',
    data: options || {}
  });
}

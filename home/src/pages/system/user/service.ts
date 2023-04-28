import { request } from 'umi';
import { UserList, UserListItem, UserListParams } from './data.d';

/** 获取规则列表 GET /api/rule */
export async function user(params?: UserListParams) {
  console.log(params)
  return request('/api/user/list', {
    method: 'POST',
    data: {
      ...params,
      hasFilters:true
    },
  });
}

export async function checkEmail(options?: { [key: string]: any }) {
  return request<any>('/api/user/checkEmail', {
    method: 'POST',
    data: options || {}
  });
}
export async function uploadFile(options?: { [key: string]: any }) {
  return request<any>('/api/upload/avatar', {
    method: 'POST',
    data: options || {}
  });
}
export async function updateUser(options?: { [key: string]: any }) {
  return request<any>('/api/user/mod', {
    method: 'POST',
    data: options || {}
  });
}

export async function modifyPassword(options?: { [key: string]: any }) {
  return request<any>('/api/user/modifyPassword', {
    method: 'POST',
    data: options || {}
  });
}

export async function addUser(options?: { [key: string]: any }) {
  return request<any>('/api/user/add', {
    method: 'POST',
    data:options || {}
    
  });
}


export async function removeUser(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/user/del', {
    method: 'POST',
    data: options || {}
  });
}

import { request } from 'umi';
import { ProducttypeList, ProducttypeListItem, ProducttypeListParams } from './data.d';


export async function producttype(params?: ProducttypeListParams) {

  return request('/api/producttype/list', {
    method: 'POST',
    data: {
      ...params,
      hasFilters: true
    },
  });
}

export async function updateProducttype(options?: { [key: string]: any }) {
  return request<ProducttypeListItem>('/api/producttype/mod', {
    method: 'POST',
    data: options || {}
  });
}

export async function addProducttype(options?: { [key: string]: any }) {
  return request<ProducttypeListItem>('/api/producttype/add', {
    method: 'POST',
    data: options || {}

  });
}


export async function removeProducttype(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/producttype/del', {
    method: 'POST',
    data: options || {}
  });
}

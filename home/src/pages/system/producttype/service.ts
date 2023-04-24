import { request } from 'umi';
import { ProducttypeList, ProducttypeListItem, ProducttypeListParams } from './data.d';

/** 获取规则列表 GET /api/rule */
export async function producttype(params?: ProducttypeListParams) {
  console.log(params)
  return request('/api/producttype/list', {
    method: 'POST',
    data: {
      ...params,
      hasFilters:true
    },
  });
}

export async function updateProducttype(options?: { [key: string]: any }) {
  return request <ProducttypeListItem>('/api/producttype/mod', {
    method: 'POST',
    data: options || {}
  });
}

export async function addProducttype(options?: { [key: string]: any }) {
  return request<ProducttypeListItem>('/api/producttype/add', {
    method: 'POST',
    data:options || {}
    
  });
}


export async function removeProducttype(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/producttype/del', {
    method: 'POST',
    data: options || {}
  });
}

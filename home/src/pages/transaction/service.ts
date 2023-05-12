import { request } from 'umi';
import { TransactionList, TransactionListItem, TransactionListParams } from './data.d';

/** 获取规则列表 GET /api/rule */
export async function transaction(params?: { [key: string]: any }) {
  console.log(params)
  return request('/api/transaction/list', {
    method: 'POST',
    data: {
      ...params,
      hasFilters: true
    },
  });
}


  export async function statistics(params?: { [key: string]: any }) {
    console.log(params)
    return request('/api/transaction/statistics', {
      method: 'POST',
      data: {
        ...params,
        hasFilters: true
      },
    });
  }
export async function writetoBC(params?: { [key: string]: any }) {
  console.log(params)
  return request('/api/transaction/writetoBC', {
    method: 'POST',
    data: {
      ...params
     
    },
  });
}
export async function validateBC(params?: { [key: string]: any }) {
  console.log(params)
  return request('/api/transaction/validateBC', {
    method: 'POST',
    data: {
      ...params

    },
  });
}
export async function transactionevent(params?: { [key: string]: any }) {
  console.log(params)
  return request('/api/transactionevent/list', {
    method: 'POST',
    data: {
      ...params,
      hasFilters: true
    },
  });
}


export async function addTransactionevent(options?: { [key: string]: any }) {
  return request('/api/transactionevent/add', {
    method: 'POST',
    data: options || {}

  });
}
export async function updateTransactionevent(options?: { [key: string]: any }) {
  return request('/api/transactionevent/mod', {
    method: 'POST',
    data: options || {}

  });
}

export async function updateTransaction(options?: { [key: string]: any }) {
  return request <TransactionListItem>('/api/transaction/mod', {
    method: 'POST',
    data: options || {}
  });
}

export async function addTransaction(options?: { [key: string]: any }) {
  return request<TransactionListItem>('/api/transaction/add', {
    method: 'POST',
    data:options || {}
    
  });
}


export async function removeTransaction(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/transaction/del', {
    method: 'POST',
    data: options || {}
  });
}

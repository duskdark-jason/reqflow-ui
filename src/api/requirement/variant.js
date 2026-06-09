import request from '@/utils/request'

// 查询客户线列表
export function listVariant(query) {
  return request({
    url: '/requirement/variant/list',
    method: 'get',
    params: query
  })
}

// 查询客户线详细
export function getVariant(variantId) {
  return request({
    url: '/requirement/variant/' + variantId,
    method: 'get'
  })
}

// 新增客户线
export function addVariant(data) {
  return request({
    url: '/requirement/variant',
    method: 'post',
    data: data
  })
}

// 修改客户线
export function updateVariant(data) {
  return request({
    url: '/requirement/variant',
    method: 'put',
    data: data
  })
}

// 删除客户线
export function delVariant(variantIds) {
  return request({
    url: '/requirement/variant/' + variantIds,
    method: 'delete'
  })
}

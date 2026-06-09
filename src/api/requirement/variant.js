import request from '@/utils/request'

// 查询项目分支列表
export function listVariant(query) {
  return request({
    url: '/requirement/variant/list',
    method: 'get',
    params: query
  })
}

// 查询项目分支详细
export function getVariant(variantId) {
  return request({
    url: '/requirement/variant/' + variantId,
    method: 'get'
  })
}

// 新增项目分支
export function addVariant(data) {
  return request({
    url: '/requirement/variant',
    method: 'post',
    data: data
  })
}

// 修改项目分支
export function updateVariant(data) {
  return request({
    url: '/requirement/variant',
    method: 'put',
    data: data
  })
}

// 删除项目分支
export function delVariant(variantIds) {
  return request({
    url: '/requirement/variant/' + variantIds,
    method: 'delete'
  })
}

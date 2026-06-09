import request from '@/utils/request'

// 查询仓库列表
export function listRepository(query) {
  return request({
    url: '/requirement/repository/list',
    method: 'get',
    params: query
  })
}

// 查询仓库详细
export function getRepository(repoId) {
  return request({
    url: '/requirement/repository/' + repoId,
    method: 'get'
  })
}

// 新增仓库
export function addRepository(data) {
  return request({
    url: '/requirement/repository',
    method: 'post',
    data: data
  })
}

// 修改仓库
export function updateRepository(data) {
  return request({
    url: '/requirement/repository',
    method: 'put',
    data: data
  })
}

// 删除仓库
export function delRepository(repoIds) {
  return request({
    url: '/requirement/repository/' + repoIds,
    method: 'delete'
  })
}

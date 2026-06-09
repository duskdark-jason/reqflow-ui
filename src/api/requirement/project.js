import request from '@/utils/request'

// 查询项目列表
export function listProject(query) {
  return request({
    url: '/requirement/project/list',
    method: 'get',
    params: query
  })
}

// 查询项目详细
export function getProject(projectId) {
  return request({
    url: '/requirement/project/' + projectId,
    method: 'get'
  })
}

// 新增项目
export function addProject(data) {
  return request({
    url: '/requirement/project',
    method: 'post',
    data: data
  })
}

// 修改项目
export function updateProject(data) {
  return request({
    url: '/requirement/project',
    method: 'put',
    data: data
  })
}

// 删除项目
export function delProject(projectIds) {
  return request({
    url: '/requirement/project/' + projectIds,
    method: 'delete'
  })
}

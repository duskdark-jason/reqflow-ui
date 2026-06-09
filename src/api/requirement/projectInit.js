import request from '@/utils/request'

export function getProjectInit(projectId) {
  return request({
    url: '/requirement/project/init/' + projectId,
    method: 'get'
  })
}

export function addProjectInit(data) {
  return request({
    url: '/requirement/project/init',
    method: 'post',
    data: data
  })
}

export function updateProjectInit(data) {
  return request({
    url: '/requirement/project/init',
    method: 'put',
    data: data
  })
}

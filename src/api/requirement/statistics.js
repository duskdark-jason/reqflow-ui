import request from '@/utils/request'

// 查询统计概览
export function getRequirementOverview(query) {
  return request({
    url: '/requirement/statistics/overview',
    method: 'get',
    params: query
  })
}

// 查询项目排行
export function getProjectRank(query) {
  return request({
    url: '/requirement/statistics/project-rank',
    method: 'get',
    params: query
  })
}

// 查询用户使用统计
export function getUserUsage(query) {
  return request({
    url: '/requirement/statistics/user-usage',
    method: 'get',
    params: query
  })
}

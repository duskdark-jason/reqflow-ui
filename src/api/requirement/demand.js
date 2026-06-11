import request from '@/utils/request'

// 查询需求列表
export function listDemand(query) {
  return request({
    url: '/requirement/demand/list',
    method: 'get',
    params: query
  })
}

// 查询需求详细
export function getDemand(demandId) {
  return request({
    url: '/requirement/demand/' + demandId,
    method: 'get'
  })
}

// 新增需求
export function addDemand(data) {
  return request({
    url: '/requirement/demand',
    method: 'post',
    data: data
  })
}

// 修改需求
export function updateDemand(data) {
  return request({
    url: '/requirement/demand',
    method: 'put',
    data: data
  })
}

// 更新需求状态
export function updateDemandStatus(demandId, status) {
  return request({
    url: '/requirement/demand/' + demandId + '/status/' + status,
    method: 'post'
  })
}

// 获取生成需求说明和执行计划的 MCP 编排指令
export function getDemandPlanInstruction(demandId) {
  return request({
    url: '/requirement/demand/' + demandId + '/plan-instruction',
    method: 'get'
  })
}

// 获取执行开发的 MCP 指令
export function getDemandDevelopInstruction(demandId) {
  return request({
    url: '/requirement/demand/' + demandId + '/develop-instruction',
    method: 'get'
  })
}

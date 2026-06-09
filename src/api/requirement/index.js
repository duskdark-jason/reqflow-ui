import request from '@/utils/request'

// 查询仓库索引批次
export function listIndexBatch(query) {
  return request({
    url: '/requirement/index/batch/list',
    method: 'get',
    params: query
  })
}

// 查询索引模块知识
export function listIndexModule(query) {
  return request({
    url: '/requirement/index/module/tree',
    method: 'get',
    params: query
  })
}

// 推荐需求影响面
export function suggestImpact(query) {
  return request({
    url: '/requirement/index/impact/suggest',
    method: 'get',
    params: query
  })
}

// 备用 JSON 导入入口
export function importRepositoryIndex(data) {
  return request({
    url: '/requirement/index/import',
    method: 'post',
    data: data
  })
}

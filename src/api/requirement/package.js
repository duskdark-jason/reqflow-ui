import request from '@/utils/request'

// 查询需求执行包
export function getDemandPackage(demandId) {
  return request({
    url: '/requirement/package/' + demandId,
    method: 'get'
  })
}

// 查询指定制品最新版本
export function getLatestPackageArtifact(demandId, artifactType) {
  return request({
    url: '/requirement/package/' + demandId + '/' + artifactType + '/latest',
    method: 'get'
  })
}

// 保存指定制品新版本
export function savePackageArtifact(demandId, artifactType, data) {
  return request({
    url: '/requirement/package/' + demandId + '/' + artifactType,
    method: 'post',
    data: data
  })
}

// 生成需求执行包
export function generatePackage(demandId, data) {
  return request({
    url: '/requirement/package/generate/' + demandId,
    method: 'post',
    data: data
  })
}

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const projectList = read('src/views/requirement/project/index.vue');
const accessCenter = read('src/views/requirement/project/detail.vue');

assert(
  /接入状态|接入中心/.test(projectList) && !/>接入<\/el-button>/.test(projectList),
  '项目列表操作入口必须明确为接入状态或接入中心，不能只显示“接入”。'
);

assert(
  accessCenter.includes('access-status-overview') && accessCenter.includes('待处理项'),
  '项目接入中心必须提供状态总览和待处理项。'
);

assert(
  !accessCenter.includes('label="初始化指令"'),
  '项目接入中心不应继续把初始化指令作为项目分支表格主列。'
);

assert(
  accessCenter.includes('openMaintain') && accessCenter.includes('openKnowledge'),
  '项目接入中心必须保留去维护页和知识库详情的明确入口。'
);

console.log('项目接入中心职责收敛静态检查通过');

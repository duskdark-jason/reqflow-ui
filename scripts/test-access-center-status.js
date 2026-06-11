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
const projectMaintain = read('src/views/requirement/project/maintain.vue');
const demandMaintain = read('src/views/requirement/demand/maintain.vue');
const router = read('src/router/index.js');

assert(
  !projectList.includes('接入状态') && !projectList.includes('项目接入中心') && !projectList.includes('handleIntake'),
  '项目列表不应继续保留接入中心或接入状态入口。'
);

assert(
  !projectMaintain.includes('接入中心') && !projectMaintain.includes('/requirement/project/detail') && !projectMaintain.includes('openIntake'),
  '项目维护页不应继续跳转或提示进入接入中心。'
);

assert(
  !demandMaintain.includes('接入中心'),
  '需求维护页的初始化提示不应继续指向接入中心。'
);

assert(
  !router.includes('/requirement/project/detail') && !router.includes('RequirementProjectDetail'),
  '路由配置不应继续声明项目接入中心隐藏页签。'
);

assert(
  !fs.existsSync(path.join(root, 'src/views/requirement/project/detail.vue')),
  '项目接入中心页面文件应被删除。'
);

assert(
  router.includes('/requirement/project/maintain') && router.includes('/requirement/project/knowledge'),
  '项目维护和分支知识库页签必须保留。'
);

console.log('项目接入中心删除静态检查通过');

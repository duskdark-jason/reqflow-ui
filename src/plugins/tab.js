import store from '@/store'
import router from '@/router'

function parentLocationFrom(route) {
  const query = route.query || {}
  const parentPath = query.parentPath || query.backPath || (route.meta && route.meta.activeMenu)
  if (!parentPath || parentPath === route.path || parentPath === route.fullPath) {
    return null
  }
  return parentPath
}

export default {
  // 刷新当前tab页签
  refreshPage(obj) {
    const { path, query, matched } = router.currentRoute
    // 防止在重定向过程中重复刷新
    if (path.startsWith('/redirect/')) {
      return Promise.resolve()
    }
    if (obj === undefined) {
      matched.forEach((m) => {
        if (m.components && m.components.default && m.components.default.name) {
          if (!['Layout', 'ParentView'].includes(m.components.default.name)) {
            obj = { name: m.components.default.name, path: path, query: query }
          }
        }
      })
    }
    return store.dispatch('tagsView/delCachedView', obj).then(() => {
      const { path, query } = obj
      router.replace({
        path: '/redirect' + path,
        query: query
      })
    })
  },
  // 关闭当前tab页签，打开新页签
  closeOpenPage(obj) {
    store.dispatch("tagsView/delView", router.currentRoute)
    if (obj !== undefined) {
      return router.push(obj)
    }
  },
  // 关闭指定tab页签
  closePage(obj) {
    if (obj === undefined) {
      const parentLocation = parentLocationFrom(router.currentRoute)
      return store.dispatch('tagsView/delView', router.currentRoute).then(({ visitedViews }) => {
        // 隐藏页签从父菜单打开时优先回父页面，避免跳到最后打开的无关标签。
        if (parentLocation) {
          return router.push(parentLocation)
        }
        const latestView = visitedViews.slice(-1)[0]
        if (latestView) {
          return router.push(latestView.fullPath)
        }
        return router.push('/')
      })
    }
    return store.dispatch('tagsView/delView', obj)
  },
  // 关闭所有tab页签
  closeAllPage() {
    return store.dispatch('tagsView/delAllViews')
  },
  // 关闭左侧tab页签
  closeLeftPage(obj) {
    return store.dispatch('tagsView/delLeftTags', obj || router.currentRoute)
  },
  // 关闭右侧tab页签
  closeRightPage(obj) {
    return store.dispatch('tagsView/delRightTags', obj || router.currentRoute)
  },
  // 关闭其他tab页签
  closeOtherPage(obj) {
    return store.dispatch('tagsView/delOthersViews', obj || router.currentRoute)
  },
  // 添加tab页签
  openPage(title, url, params) {
    const obj = { path: url, meta: { title: title } }
    store.dispatch('tagsView/addView', obj)
    return router.push({ path: url, query: params })
  },
  // 修改tab页签
  updatePage(obj) {
    return store.dispatch('tagsView/updateVisitedView', obj)
  }
}

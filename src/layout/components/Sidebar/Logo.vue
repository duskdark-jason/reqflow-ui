<template>
  <div class="sidebar-logo-container" :class="{'collapse':collapse}">
    <transition name="sidebarLogoFade">
      <router-link v-if="collapse" key="collapse" class="sidebar-logo-link" to="/">
        <img :src="logo" class="sidebar-logo" />
      </router-link>
      <router-link v-else key="expand" class="sidebar-logo-link" to="/">
        <img :src="logo" class="sidebar-logo" />
        <span class="brand-copy">
          <strong>ReqFlow</strong>
          <small>需求流转平台</small>
        </span>
      </router-link>
    </transition>
  </div>
</template>

<script>
import logoImg from '@/assets/logo/reqflow-logo.svg'

export default {
  name: 'SidebarLogo',
  props: {
    collapse: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      logo: logoImg
    }
  }
}
</script>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  position: relative;
  height: 50px;
  background: #fff;
  border-right: 1px solid #e8eaf0;
  border-bottom: 1px solid #edf0f5;
  overflow: hidden;

  & .sidebar-logo-link {
    display: flex;
    align-items: center;
    height: 100%;
    width: 100%;
    padding: 0 14px;
    box-sizing: border-box;

    & .sidebar-logo {
      width: 32px;
      height: 32px;
      flex: 0 0 auto;
      margin-right: 10px;
    }

    & .brand-copy {
      display: inline-flex;
      flex-direction: column;
      min-width: 0;
      margin: 0;
      color: #1f2937;
      font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
      line-height: 1.1;

      strong {
        font-size: 15px;
        font-weight: 700;
      }

      small {
        margin-top: 3px;
        color: #6b7280;
        font-size: 11px;
      }
    }
  }

  &.collapse {
    .sidebar-logo-link {
      justify-content: center;
      padding: 0;
    }

    .sidebar-logo {
      margin-right: 0;
    }
  }
}
</style>

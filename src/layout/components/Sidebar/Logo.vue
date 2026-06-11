<template>
  <div class="sidebar-logo-container" :class="{'collapse':collapse}">
    <transition name="sidebarLogoFade">
      <router-link v-if="collapse" key="collapse" class="sidebar-logo-link" to="/">
        <img :src="logo" class="sidebar-logo" />
      </router-link>
      <router-link v-else key="expand" class="sidebar-logo-link" to="/">
        <span class="logo-mark">
          <img :src="logo" class="sidebar-logo" />
        </span>
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
    display: flex !important;
    align-items: center;
    gap: 10px;
    height: 100%;
    width: 100%;
    padding: 0 14px;
    box-sizing: border-box;

    & .logo-mark {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      flex: 0 0 34px;
    }

    & .sidebar-logo {
      width: 32px;
      height: 32px;
      display: block;
    }

    & .brand-copy {
      display: inline-flex;
      flex-direction: column;
      justify-content: center;
      min-width: 0;
      margin: 0;
      color: #1f2937;
      font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;

      strong {
        font-size: 15px;
        font-weight: 700;
        line-height: 18px;
      }

      small {
        color: #6b7280;
        font-size: 11px;
        line-height: 14px;
      }
    }
  }

  &.collapse {
    .sidebar-logo-link {
      justify-content: center;
      padding: 0;
      gap: 0;
    }

    .sidebar-logo {
      margin-right: 0;
    }
  }
}
</style>

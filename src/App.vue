<script>
export default {
  name: "App",
};
</script>

<template>
  <div id="app">
    <!-- Vue Router 出口 -->
    <router-view />
  </div>
</template>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  /* 让窗口成为全局滚动容器，避免与页面内滚动冲突 */
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  width: 100%;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* Element Plus 样式覆盖 */
.el-message {
  min-width: 300px;
}

.el-notification {
  min-width: 330px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  #app {
    font-size: 14px;
  }
}
</style>

<template>
  <div class="">
    <router-view />
  </div>
</template>

<script>
export default {
  name: "AuthLayout",
  mounted() {
    // 页面背景设置
    document.body.style.background =
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
  },
  unmounted() {
    // 清理背景设置
    document.body.style.background = "";
  },
};
</script>

<style scoped></style>

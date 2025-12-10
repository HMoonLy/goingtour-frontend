<template>
  <section class="hero">
    <div class="hero-bg" />
    <div class="hero-content">
      <h1 class="hero-title">去哪里旅行</h1>
      <p class="hero-sub">发现灵感目的地 · 开启下一段旅程</p>
      <div class="hero-search">
        <el-input
          :model-value="modelValue"
          placeholder="搜索城市、地区..."
          size="large"
          class="hero-input"
          clearable
          @input="$emit('update:modelValue', $event)"
          @clear="$emit('clear')"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button class="hero-btn" type="primary" @click="$emit('search')">
          搜索
        </el-button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { Search } from "@element-plus/icons-vue";

defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});

defineEmits(["update:modelValue", "search", "clear"]);
</script>

<style scoped>
.hero {
  position: relative;
  height: 320px;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)),
    url("/images/scenarios/weekend_citywalk.jpg");
  background-size: cover;
  background-position: center;
  filter: saturate(1.05);
}

.hero-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  text-align: center;
}

.hero-title {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 1px;
}
.hero-sub {
  margin-top: 6px;
  opacity: 0.9;
}

.hero-search {
  margin-top: 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 8px;
}
.hero-input {
  width: 420px;
}
.hero-btn {
  border-radius: 10px;
}
</style>


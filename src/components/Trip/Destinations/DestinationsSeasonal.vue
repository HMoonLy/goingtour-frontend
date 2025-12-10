<template>
  <div class="city-section season-section">
    <h2>
      <i class="letter-icon">季</i>
      当季推荐
    </h2>
    <div class="month-tabs">
      <button
        v-for="m in months"
        :key="m"
        class="month-tab"
        :class="{ active: month === m }"
        @click="$emit('update:month', m)"
        @mouseenter="$emit('update:month', m)"
      >
        {{ m }}月
      </button>
    </div>
    <div class="dest-grid">
      <div
        v-for="item in cities"
        :key="item.name"
        class="dest-card"
        @click="$emit('select', { 中文名: item.name, adcode: item.adcode })"
      >
        <LazyImage
          :src="item.cover"
          :alt="item.name"
          :height="200"
          class="dest-cover"
        />
        <div class="dest-meta">
          <div class="dest-title">
            {{ item.name }}
          </div>
          <div class="dest-sub">
            {{ item.province || "" }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import LazyImage from "@/components/Common/UI/LazyImage.vue";

defineProps({
  months: {
    type: Array,
    default: () => [],
  },
  month: {
    type: Number,
    required: true,
  },
  cities: {
    type: Array,
    default: () => [],
  },
});

defineEmits(["update:month", "select"]);
</script>

<style scoped>
.city-section {
  margin: 0 0 24px 0;
  padding: 20px;
  background: var(--card-bg, #fff);
  border-radius: 8px;
  border: 1px solid rgba(145, 168, 208, 0.08);
  transition: all 0.3s;
}

.city-section h2 {
  font-size: 20px;
  color: #303133;
  margin: 0 0 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  font-weight: 600;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--card-bg, #fff);
}

.letter-icon {
  font-style: normal;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: var(--bg-secondary, #f5f7fa);
  border: 1px solid var(--border-color, #eaeef2);
  color: var(--text-secondary, #606266);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
}

.month-tabs {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: center;
  gap: 0;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--border-color, #ebeef5);
  padding-bottom: 6px;
}

.month-tab {
  background: transparent;
  border: none;
  outline: none;
  padding: 8px 10px;
  color: var(--text-secondary, #606266);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  transition: color 0.2s ease;
}

.month-tab:hover {
  color: #91a8d0;
}

.month-tab.active {
  color: #91a8d0;
}

.month-tab.active::after {
  content: "";
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: -7px;
  width: 24px;
  height: 3px;
  background: linear-gradient(135deg, #91a8d0 0%, #f7cac9 100%);
  border-radius: 2px;
}

.dest-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  cursor: pointer;
}

.dest-card {
  background: var(--card-bg, #fff);
  border: 1px solid var(--border-color, #ebeef5);
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.2s ease;
  will-change: transform;
}

.dest-card:hover {
  transform: translateY(-2px);
}

.dest-cover {
  height: 200px;
  background: linear-gradient(135deg, #eef2ff, #f8fafc);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dest-meta {
  padding: 12px 12px 14px;
}

.dest-title {
  font-weight: 600;
  color: #303133;
}

.dest-sub {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}
</style>


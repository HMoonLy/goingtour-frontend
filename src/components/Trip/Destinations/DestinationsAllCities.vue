<template>
  <div class="cities-section">
    <div class="section-header">
      <h2>
        <i class="letter-icon">城</i>
        全国城市
      </h2>

      <!-- 模式切换滑块 -->
      <div class="mode-toggle-container">
        <div class="mode-switch">
          <span class="mode-label" :class="{ active: !isWishlistMode }"
            >浏览模式</span
          >
          <div class="toggle-switch" @click="$emit('toggle-wishlist-mode')">
            <div class="toggle-slider" :class="{ active: isWishlistMode }"></div>
          </div>
          <span class="mode-label" :class="{ active: isWishlistMode }"
            >收藏模式</span
          >
        </div>
      </div>
    </div>

    <!-- 现代卡片网格布局 -->
    <VirtualCityGrid
      :city-groups="cityGroups"
      :wishlist-items="wishlistItems"
      @select-city="$emit('select', $event)"
    />
  </div>
</template>

<script setup>
import VirtualCityGrid from "@/components/Common/City/VirtualCityGrid.vue";

defineProps({
  cityGroups: {
    type: Array,
    default: () => [],
  },
  wishlistItems: {
    type: Array,
    default: () => [],
  },
  isWishlistMode: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["select", "toggle-wishlist-mode"]);
</script>

<style scoped>
.cities-section {
  margin: 0 0 24px 0;
  padding: 20px;
  background: var(--card-bg, #fff);
  border-radius: 8px;
  border: 1px solid rgba(145, 168, 208, 0.08);
  transition: all 0.3s;
}

.section-header {
  margin: 0 0 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h2 {
  font-size: 20px;
  color: #303133;
  margin: 0;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
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
}

/* 模式切换滑块样式 */
.mode-toggle-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.mode-switch {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.8);
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid rgba(145, 168, 208, 0.15);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(10px);
}

.mode-label {
  font-size: 14px;
  color: #909399;
  transition: all 0.3s ease;
  user-select: none;
  white-space: nowrap;
  font-weight: 500;
  position: relative;
}

.mode-label.active {
  color: #91a8d0;
  font-weight: 600;
}

.mode-label.active::after {
  content: "";
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 2px;
  border-radius: 1px;
  opacity: 0.8;
}

.toggle-switch {
  position: relative;
  width: 52px;
  height: 28px;
  background: #f5f7fa;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid rgba(145, 168, 208, 0.1);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.toggle-switch:hover {
  background: #edf2f7;
  border-color: rgba(145, 168, 208, 0.2);
  transform: scale(1.02);
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15), 0 1px 2px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(145, 168, 208, 0.1);
}

.toggle-slider.active {
  transform: translateX(24px);
  background: linear-gradient(135deg, #91a8d0, #b8c9e0);
  box-shadow: 0 2px 8px rgba(145, 168, 208, 0.3), 0 1px 3px rgba(145, 168, 208, 0.2);
  border-color: rgba(145, 168, 208, 0.3);
}

.toggle-switch:has(.toggle-slider.active) {
  background: linear-gradient(
    135deg,
    rgba(145, 168, 208, 0.15),
    rgba(247, 202, 201, 0.1)
  );
  border-color: rgba(145, 168, 208, 0.25);
}

.toggle-switch:hover:has(.toggle-slider.active) {
  background: linear-gradient(
    135deg,
    rgba(145, 168, 208, 0.2),
    rgba(247, 202, 201, 0.15)
  );
  border-color: rgba(145, 168, 208, 0.35);
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }
}
</style>


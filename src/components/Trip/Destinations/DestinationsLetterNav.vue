<template>
  <div class="letter-nav-container">
    <!-- 滚动指示器 -->
    <div class="scroll-indicator" :class="{ visible: showIndicator }">
      {{ activeLetter }}
    </div>

    <!-- 字母导航栏 -->
    <div class="letter-nav">
      <div
        class="letter-item special"
        :class="{ active: activeLetter === hotLabel }"
        title="热门城市"
        @click="$emit('change', hotLabel)"
      >
        热门
      </div>

      <div class="letter-section">
        <div
          v-for="letter in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'"
          :key="letter"
          class="letter-item"
          :class="{ active: activeLetter === letter }"
          :title="letter"
          @click="$emit('change', letter)"
        >
          {{ letter }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  activeLetter: {
    type: String,
    required: true,
  },
  hotLabel: {
    type: String,
    default: "热门",
  },
  showIndicator: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["change"]);
</script>

<style scoped>
.letter-nav-container {
  position: fixed;
  right: 20px;
  top: 100px;
  z-index: 99;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

/* 滚动指示器 */
.scroll-indicator {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.8);
  background: rgba(145, 168, 208, 0.9);
  color: #fff;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  opacity: 0;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 999;
  pointer-events: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.scroll-indicator.visible {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

/* 字母导航 */
.letter-nav {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.9);
  text-align: center;
  width: 32px;
  padding: 10px 0;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 100%;
  /* 磨砂玻璃效果 */
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px;
}

.letter-nav:hover {
  box-shadow: 0 4px 16px rgba(145, 168, 208, 0.25);
  width: 42px;
}

.letter-item {
  width: 100%;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  color: #606266;
  transition: all 0.2s;
  user-select: none;
  position: relative;
  margin: 1px 0;
}

.letter-item:after {
  content: "";
  position: absolute;
  left: 0;
  width: 2px;
  height: 0;
  background-color: #91a8d0;
  transition: all 0.2s ease;
  border-radius: 2px;
  opacity: 0;
}

.letter-item:hover:after {
  height: 60%;
  opacity: 0.6;
}

.letter-item.active:after {
  width: 3px;
  height: 80%;
  opacity: 1;
}

.letter-item.special {
  font-weight: 500;
  color: #91a8d0;
  height: 30px;
  font-size: 13px;
  padding: 2px 0;
  margin-top: 0;
  margin-bottom: 8px;
}

.letter-item.special:after {
  height: 0;
  opacity: 0;
}

.letter-item.special.active:after {
  height: 70%;
  opacity: 1;
}

.letter-section {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: space-between;
  padding: 5px 0;
}

.letter-item:hover {
  color: #91a8d0;
  font-weight: 500;
  background-color: #f5f7fa;
}

.letter-item.active {
  color: #fff;
  background-color: #91a8d0;
  font-weight: 500;
}

@media (max-width: 768px) {
  .letter-nav-container {
    position: fixed;
    right: unset;
    top: unset;
    bottom: 0;
    left: 0;
    width: 100%;
    height: auto;
    z-index: 100;
    margin-top: 0;
  }

  .letter-nav {
    width: 100%;
    height: 40px;
    flex-direction: row;
    justify-content: space-around;
    padding: 5px 0;
    border-radius: 0;
    border-top: 1px solid #ebeef5;
    overflow-x: auto;
    overflow-y: hidden;
    max-height: none;
  }

  .letter-nav:hover {
    width: 100%;
  }

  .letter-section {
    flex-direction: row;
    padding: 0;
    margin-left: 10px;
  }

  .letter-item {
    width: auto;
    padding: 0 3px;
  }

  .letter-item:after {
    left: 0;
    bottom: -2px;
    width: 100%;
    height: 0;
  }

  .letter-item:hover:after,
  .letter-item.active:after {
    width: 100%;
    height: 2px;
  }

  .letter-item.special {
    margin: 0;
  }
}
</style>

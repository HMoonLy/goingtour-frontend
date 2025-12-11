<template>
  <div class="recommendation-item vertical-layout">
    <!-- 图片区域 -->
    <div class="recommendation-image">
      <img
        v-if="item.photos && item.photos.length > 0 && !imageError"
        :src="item.photos[0].url"
        :alt="item.name"
        @error="handleImageError"
      />
      <div v-else class="no-image">
        <el-icon><component :is="typeIcon" /></el-icon>
        <span>暂无图片</span>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="recommendation-content-body">
      <!-- 标题 -->
      <h4 :title="item.name" class="full-width-name">
        {{ item.name }}
      </h4>

      <!-- 评分 -->
      <div class="recommendation-rating rating-with-number">
        <el-rate
          :model-value="Number(item.rating) || 0"
          disabled
          text-color="#ff9900"
        />
        <span class="rating-value">{{ item.rating || '暂无评分' }}</span>
      </div>

      <!-- 基础标签 (价格/类型) -->
      <div class="recommendation-tags">
        <el-tag 
          v-if="item.price || item.cost" 
          size="small" 
          type="danger" 
          class="price-tag"
        >
          {{ pricePrefix }}￥{{ item.price || item.cost }}{{ priceSuffix }}
        </el-tag>
        <el-tag size="small" :type="categoryTagType" class="category-tag">
          {{ categoryText }}
        </el-tag>
        <el-tag size="small" class="tag-item">
          {{ item.type || defaultType }}
        </el-tag>
      </div>

      <!-- 特色标签 (推荐/招牌菜/设施) -->
      <div class="feature-section">
        <p class="feature-title">
          <el-icon><Star /></el-icon>
          {{ featureTitle }}
        </p>
        <div v-if="tags && tags.length > 0" class="feature-tags">
          <el-tag
            v-for="(tag, index) in tags.slice(0, 3)"
            :key="index"
            size="small"
            effect="plain"
            :type="featureTagType"
            class="feature-tag"
          >
            {{ tag }}
          </el-tag>
        </div>
        <div v-else class="feature-tags">
          <el-tag
            size="small"
            effect="plain"
            type="info"
            class="feature-tag empty-tag"
          >
            {{ emptyFeatureText }}
          </el-tag>
        </div>
      </div>

      <!-- 地址 -->
      <p class="recommendation-address">
        <el-icon><Location /></el-icon>
        <span class="address-text">{{ item.address || "暂无地址信息" }}</span>
      </p>

      <!-- 操作按钮 -->
      <div class="add-to-plan">
        <el-button
          v-if="!isSelected"
          size="small"
          plain
          @click="$emit('add', item)"
        >
          <el-icon><Plus /></el-icon>
          添加到计划
        </el-button>
        <el-button
          v-else
          type="danger"
          size="small"
          @click="$emit('remove', item)"
        >
          <el-icon><Close /></el-icon>
          取消添加
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import {
  Picture, House, Food, // 用于不同类型的默认图标
  Star, Location, Plus, Close
} from "@element-plus/icons-vue";

export default {
  name: "RecommendationCard",
  components: {
    Picture, House, Food,
    Star, Location, Plus, Close
  },
  props: {
    item: {
      type: Object,
      required: true
    },
    isSelected: {
      type: Boolean,
      default: false
    },
    // 类型: 'attraction' | 'hotel' | 'restaurant'
    type: {
      type: String,
      default: 'attraction'
    }
  },
  emits: ['add', 'remove'],
  setup(props) {
    const imageError = ref(false);
    const handleImageError = () => {
      imageError.value = true;
    };

    // 根据类型配置不同的文案和样式
    const config = computed(() => {
      switch (props.type) {
        case 'hotel':
          return {
            typeIcon: 'House',
            pricePrefix: '￥',
            priceSuffix: '起',
            categoryTagType: 'info',
            categoryText: '住宿服务',
            defaultType: '酒店',
            featureTitle: '特色',
            featureTagType: 'success', // 酒店特色用绿色看起来舒服
            emptyFeatureText: '暂无标签'
          };
        case 'restaurant':
          return {
            typeIcon: 'Food',
            pricePrefix: '人均￥',
            priceSuffix: '',
            categoryTagType: 'warning',
            categoryText: '餐饮服务',
            defaultType: '餐厅',
            featureTitle: '推荐',
            featureTagType: 'success',
            emptyFeatureText: '无'
          };
        case 'attraction':
        default:
          return {
            typeIcon: 'Picture',
            pricePrefix: '门票￥',
            priceSuffix: '',
            categoryTagType: 'success',
            categoryText: '风景名胜',
            defaultType: '景点',
            featureTitle: '推荐 :',
            featureTagType: 'info',
            emptyFeatureText: '无'
          };
      }
    });

    // 统一获取 item 里的 tags 数组
    const tags = computed(() => props.item.tags || []);

    return {
      imageError,
      handleImageError,
      typeIcon: computed(() => config.value.typeIcon),
      pricePrefix: computed(() => config.value.pricePrefix),
      priceSuffix: computed(() => config.value.priceSuffix),
      categoryTagType: computed(() => config.value.categoryTagType),
      categoryText: computed(() => config.value.categoryText),
      defaultType: computed(() => config.value.defaultType),
      featureTitle: computed(() => config.value.featureTitle),
      featureTagType: computed(() => config.value.featureTagType),
      emptyFeatureText: computed(() => config.value.emptyFeatureText),
      tags
    };
  }
};
</script>

<style scoped>
/* 这是一个子组件，直接把之前通用的卡片样式搬过来 */
.recommendation-item {
  border: 1px solid #f0f2f5;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.recommendation-item:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  transform: translateY(-4px);
  border-color: transparent;
}

.recommendation-image {
  height: 180px;
  overflow: hidden;
  position: relative;
}

.recommendation-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.5s;
}

.recommendation-item:hover .recommendation-image img {
  transform: scale(1.05);
}

.no-image {
  background: #f5f7fa;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 24px;
  gap: 8px;
}

.no-image span {
  font-size: 12px;
  color: #c0c4cc;
}

.recommendation-content-body {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.recommendation-content-body h4 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  height: 44px;
}

.recommendation-rating {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.rating-with-number .el-rate {
  font-size: 14px;
}

.rating-value {
  margin-left: 8px;
  color: #ff9900;
  font-size: 13px;
  font-weight: 500;
}

.recommendation-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 6px;
}

.category-tag,
.tag-item {
  font-size: 11px;
}

.feature-section {
  margin: 6px 0;
}

.feature-title {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 0 4px;
  font-size: 11px;
  color: #606266;
}

.feature-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.feature-tag {
  margin-right: 2px;
  margin-bottom: 2px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 10px;
}

.empty-tag {
  opacity: 0.6;
}

.recommendation-address {
  display: flex;
  align-items: flex-start;
  margin: 6px 0;
  color: #606266;
  font-size: 11px;
  line-height: 1.3;
}

.address-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  margin-left: 4px;
}

.add-to-plan {
  margin-top: auto;
  padding-top: 8px;
  text-align: right;
}

.add-to-plan .el-button {
  padding: 6px 12px;
  font-size: 12px;
  background: #91A8D0;
  color: white;
}

@media (max-width: 480px) {
  .recommendation-item {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid #f0f0f0;
  }
  .recommendation-image {
    height: 160px;
  }
  .recommendation-content-body {
    padding: 12px;
  }
  .recommendation-content-body h4 {
    font-size: 15px;
  }
}
</style>

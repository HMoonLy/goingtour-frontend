<template>
  <div class="search-results">
    <h2 v-if="results?.length > 0">搜索结果 ({{ results?.length || 0 }})</h2>
    <el-empty v-else description="未找到匹配的城市，请尝试其他关键词" />

    <!-- 列表视图（默认，仅显示结果，不展示收藏按钮） -->
    <div class="city-rows">
      <div v-for="city in results" :key="city.adcode" class="city-row">
        <div class="city-left" @click="$emit('select', city)">
          <span class="city-name">{{ city.中文名 }}</span>
          <span class="city-province">{{ getProvinceName(city) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  results: {
    type: Array,
    default: () => [],
  },
});

defineEmits(["select"]);

// 获取省份名称
const getProvinceName = (city) => {
  const adcode = String(city.adcode || "");
  if (!adcode || adcode.length < 2) {
    return "";
  }

  // 通过adcode前两位判断省份
  const provinceCode = adcode.substring(0, 2);

  // 省份编码映射
  const provinceMap = {
    11: "北京市",
    12: "天津市",
    13: "河北省",
    14: "山西省",
    15: "内蒙古",
    21: "辽宁省",
    22: "吉林省",
    23: "黑龙江省",
    31: "上海市",
    32: "江苏省",
    33: "浙江省",
    34: "安徽省",
    35: "福建省",
    36: "江西省",
    37: "山东省",
    41: "河南省",
    42: "湖北省",
    43: "湖南省",
    44: "广东省",
    45: "广西",
    46: "海南省",
    50: "重庆市",
    51: "四川省",
    52: "贵州省",
    53: "云南省",
    54: "西藏",
    61: "陕西省",
    62: "甘肃省",
    63: "青海省",
    64: "宁夏",
    65: "新疆",
    71: "台湾省",
    81: "香港",
    82: "澳门",
  };

  return provinceMap[provinceCode] || "";
};
</script>

<style scoped>
.search-results h2 {
  margin-bottom: 20px;
  color: #303133;
  font-size: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
}

.city-rows {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
}

@media (min-width: 992px) {
  .city-rows {
    grid-template-columns: 1fr 1fr;
  }
}

.city-row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  min-height: 36px;
  padding: 6px 10px;
  border-radius: 6px;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.city-row:hover {
  background: var(--bg-secondary, #f5f7fa);
}

.city-left {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.city-left .city-name {
  font-size: 14px;
  color: #303133;
}

.city-left .city-province {
  font-size: 12px;
  color: #909399;
}
</style>


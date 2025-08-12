<template>
  <div class="browse-page">
    <div class="filters">
      <div class="row">
        <label>时间</label>
        <div class="options">
          <span v-for="m in months" :key="m" :class="{active: selectedMonth===m}" @mouseenter="selectedMonth=m">{{ m }}月</span>
        </div>
      </div>
      <div class="row">
        <label>主题</label>
        <div class="options">
          <span v-for="t in themes" :key="t" :class="{active: selectedTheme===t}" @click="selectedTheme=t">{{ t }}</span>
        </div>
      </div>
      <div class="row">
        <label>天数</label>
        <div class="options">
          <span v-for="d in days" :key="d" :class="{active: selectedDays===d}" @click="selectedDays=d">{{ d }}</span>
        </div>
      </div>
    </div>

    <div class="result-grid">
      <div class="card" v-for="item in displayList" :key="item.name">
        <div class="cover" :style="getCoverStyle(item)"></div>
        <div class="meta">
          <div class="title">{{ item.name }}</div>
          <div class="desc">{{ item.desc || '发现这座城市的特色与玩法' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { seasonalByMonth } from '@/data/seasonalCities.js'
import { findCity } from '@/data/destinations.js'

export default {
  name: 'BrowseDestinations',
  setup() {
    const months = Array.from({ length: 12 }, (_, i) => i + 1)
    const themes = ['人文历史','自然风景','海岛','美食','小众','亲子']
    const days = ['不限','2-3天','4-5天','6-9天','10天以上']
    const selectedMonth = Vue.ref(new Date().getMonth() + 1)
    const selectedTheme = Vue.ref('不限')
    const selectedDays = Vue.ref('不限')

    const displayList = Vue.computed(() => {
      const names = seasonalByMonth[selectedMonth.value] || []
      return names.map(n => {
        const hit = findCity(n)
        return { name: n, cover: hit?.cover }
      })
    })

    function getCoverStyle(item) {
      return item.cover
        ? { backgroundImage: `url(${item.cover})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { background: 'linear-gradient(135deg, #e0f2fe, #e9d5ff)' }
    }

    return { months, themes, days, selectedMonth, selectedTheme, selectedDays, displayList, getCoverStyle }
  }
}
</script>

<style scoped>
.browse-page { max-width: 1100px; margin: 0 auto; padding: 24px 16px; }
.filters { background: #fff; border: 1px solid #ebeef5; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; }
.row { display: flex; align-items: center; padding: 8px 0; border-bottom: 1px dashed #eee; }
.row:last-child { border-bottom: 0; }
.row > label { width: 60px; color: #909399; }
.options { display: flex; flex-wrap: wrap; gap: 12px; }
.options span { padding: 4px 10px; border-radius: 6px; cursor: pointer; color: #606266; }
.options span.active, .options span:hover { background: var(--primary-color, #409eff); color: #fff; }
.result-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
.card { background: #fff; border: 1px solid #ebeef5; border-radius: 8px; overflow: hidden; }
.cover { height: 180px; background: #f5f7fa; }
.meta { padding: 12px; }
.title { font-weight: 600; color: #303133; }
.desc { margin-top: 4px; color: #909399; font-size: 13px; }
</style>


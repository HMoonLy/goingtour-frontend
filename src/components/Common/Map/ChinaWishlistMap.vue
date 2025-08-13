<template>
  <div class="china-wishlist-map">
    <div
      ref="mapContainer"
      class="map-chart"
      :style="{ height: height, width: '100%' }"
    ></div>
    <div v-if="loading" class="map-loading">
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item variant="rect" style="height: 100%" />
        </template>
      </el-skeleton>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import * as echarts from 'echarts';

export default {
  name: 'ChinaWishlistMap',
  props: {
    wishlistItems: {
      type: Array,
      default: () => [],
    },
    height: {
      type: String,
      default: '400px',
    },
  },
  emits: ['city-click'],
  setup(props, { emit }) {
    const mapContainer = ref(null);
    const chartInstance = ref(null);
    const loading = ref(true);

    // 省份名称映射（用于ECharts地图）
    const provinceMapping = {
      '北京市': '北京',
      '天津市': '天津',
      '上海市': '上海',
      '重庆市': '重庆',
      '河北省': '河北',
      '山西省': '山西',
      '内蒙古自治区': '内蒙古',
      '辽宁省': '辽宁',
      '吉林省': '吉林',
      '黑龙江省': '黑龙江',
      '江苏省': '江苏',
      '浙江省': '浙江',
      '安徽省': '安徽',
      '福建省': '福建',
      '江西省': '江西',
      '山东省': '山东',
      '河南省': '河南',
      '湖北省': '湖北',
      '湖南省': '湖南',
      '广东省': '广东',
      '广西壮族自治区': '广西',
      '海南省': '海南',
      '四川省': '四川',
      '贵州省': '贵州',
      '云南省': '云南',
      '西藏自治区': '西藏',
      '陕西省': '陕西',
      '甘肃省': '甘肃',
      '青海省': '青海',
      '宁夏回族自治区': '宁夏',
      '新疆维吾尔自治区': '新疆',
      '台湾省': '台湾',
      '香港特别行政区': '香港',
      '澳门特别行政区': '澳门',
    };

    // 根据城市adcode获取省份
    const getProvinceFromAdcode = (adcode) => {
      if (!adcode) return null;
      const code = adcode.toString();
      
      const provinceMap = {
        11: '北京',
        12: '天津',
        13: '河北',
        14: '山西',
        15: '内蒙古',
        21: '辽宁',
        22: '吉林',
        23: '黑龙江',
        31: '上海',
        32: '江苏',
        33: '浙江',
        34: '安徽',
        35: '福建',
        36: '江西',
        37: '山东',
        41: '河南',
        42: '湖北',
        43: '湖南',
        44: '广东',
        45: '广西',
        46: '海南',
        50: '重庆',
        51: '四川',
        52: '贵州',
        53: '云南',
        54: '西藏',
        61: '陕西',
        62: '甘肃',
        63: '青海',
        64: '宁夏',
        65: '新疆',
        71: '台湾',
        81: '香港',
        82: '澳门',
      };

      const provinceCode = code.substring(0, 2);
      return provinceMap[provinceCode] || null;
    };

    // 处理心愿清单数据，按省份统计
    const processWishlistData = () => {
      const provinceData = {};
      const scatterData = [];

      props.wishlistItems.forEach((item) => {
        const province = getProvinceFromAdcode(item.cityCode);
        if (province) {
          // 统计省份城市数量
          if (!provinceData[province]) {
            provinceData[province] = {
              name: province,
              value: 0,
              cities: [],
            };
          }
          provinceData[province].value += 1;
          provinceData[province].cities.push(item);

          // 添加到散点数据（这里使用随机坐标，实际应该用真实的城市坐标）
          scatterData.push({
            name: item.cityName,
            value: [Math.random() * 100, Math.random() * 50, 1], // 临时随机坐标
            itemStyle: {
              color: '#91A8D0',
            },
            data: item,
          });
        }
      });

      return {
        mapData: Object.values(provinceData),
        scatterData,
      };
    };

    // 初始化地图
    const initMap = async () => {
      try {
        loading.value = true;

        // 等待容器渲染完成
        await nextTick();

        if (!mapContainer.value) {
          console.error('Map container not found');
          return;
        }

        // 创建 ECharts 实例
        chartInstance.value = echarts.init(mapContainer.value);

        // 注册中国地图（使用内置地图数据）
        // 注意：需要单独加载中国地图数据，这里先使用简单配置
        const { mapData, scatterData } = processWishlistData();

        const option = {
          title: {
            show: false,
          },
          tooltip: {
            trigger: 'item',
            formatter: function (params) {
              if (params.seriesType === 'map') {
                const data = params.data;
                if (data && data.cities) {
                  const cityNames = data.cities.slice(0, 5).map(c => c.cityName).join('、');
                  const moreText = data.cities.length > 5 ? `等${data.cities.length}个城市` : '';
                  return `${params.name}<br/>心愿城市: ${data.value}个<br/>${cityNames}${moreText}`;
                }
                return `${params.name}<br/>暂无心愿城市`;
              } else if (params.seriesType === 'scatter') {
                const cityData = params.data.data;
                const tags = cityData.tags ? cityData.tags.slice(0, 3).join('、') : '无标签';
                return `${cityData.cityName}<br/>标签: ${tags}<br/>添加时间: ${new Date(cityData.createdAt).toLocaleDateString()}`;
              }
              return params.name;
            },
          },
          visualMap: {
            min: 0,
            max: Math.max(...mapData.map(d => d.value), 1),
            left: 'left',
            top: 'bottom',
            text: ['多', '少'],
            seriesIndex: [0],
            inRange: {
              color: ['#e0f2fe', '#91A8D0', '#1e3a8a'],
            },
            itemWidth: 15,
            itemHeight: 120,
            textStyle: {
              fontSize: 12,
              color: '#666',
            },
          },
          geo: {
            map: 'china',
            roam: true, // 允许缩放和平移
            scaleLimit: {
              min: 1,
              max: 3,
            },
            zoom: 1.2,
            itemStyle: {
              normal: {
                areaColor: '#f5f7fa',
                borderColor: '#ddd',
                borderWidth: 1,
              },
              emphasis: {
                areaColor: '#fef7e0',
                borderColor: '#91A8D0',
                borderWidth: 2,
              },
            },
          },
          series: [
            {
              name: '心愿城市统计',
              type: 'map',
              map: 'china',
              geoIndex: 0,
              data: mapData,
              itemStyle: {
                normal: {
                  borderColor: '#fff',
                  borderWidth: 1,
                },
                emphasis: {
                  areaColor: '#91A8D0',
                  borderColor: '#fff',
                  borderWidth: 2,
                },
              },
            },
            {
              name: '心愿城市',
              type: 'scatter',
              coordinateSystem: 'geo',
              data: scatterData,
              symbolSize: function (val) {
                return Math.max(8, Math.min(20, val[2] * 8));
              },
              itemStyle: {
                normal: {
                  color: '#F7CAC9',
                  borderColor: '#91A8D0',
                  borderWidth: 2,
                },
                emphasis: {
                  color: '#91A8D0',
                  borderColor: '#F7CAC9',
                  borderWidth: 3,
                },
              },
            },
          ],
        };

        chartInstance.value.setOption(option);

        // 添加点击事件
        chartInstance.value.on('click', (params) => {
          if (params.componentType === 'series') {
            if (params.seriesType === 'scatter') {
              emit('city-click', params.data.data);
            } else if (params.seriesType === 'map' && params.data && params.data.cities) {
              emit('city-click', { type: 'province', ...params.data });
            }
          }
        });

        // 监听窗口大小变化
        const handleResize = () => {
          chartInstance.value?.resize();
        };
        window.addEventListener('resize', handleResize);

        loading.value = false;
      } catch (error) {
        console.error('初始化地图失败:', error);
        loading.value = false;
      }
    };

    // 初始化简化地图（无地图数据版本）
    const initMapWithoutGeoData = async () => {
      try {
        loading.value = true;

        await nextTick();

        if (!mapContainer.value) {
          console.error('Map container not found');
          return;
        }

        chartInstance.value = echarts.init(mapContainer.value);

        // 检查是否有心愿清单数据
        if (!props.wishlistItems || props.wishlistItems.length === 0) {
          // 显示空状态
          const emptyOption = {
            title: {
              text: '还没有心愿城市',
              subtext: '添加你想去的城市，它们将在地图上显示',
              left: 'center',
              top: 'middle',
              textStyle: {
                color: '#91A8D0',
                fontSize: 20,
                fontWeight: 'bold',
              },
              subtextStyle: {
                color: '#6b7280',
                fontSize: 14,
              },
            },
            backgroundColor: 'transparent',
            graphic: {
              type: 'image',
              style: {
                image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiM5MUE4RDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMmwtNS41IDlIOS41bDIuNS00IDIuNSA0SDE3TDEyIDJ6bTAgMTBsLTUuNSA5aDN2LTRoNXY0aDNMMTIgMTJ6Ii8+PC9zdmc+',
                width: 64,
                height: 64,
                opacity: 0.3,
              },
              left: 'center',
              top: '35%',
            },
          };
          chartInstance.value.setOption(emptyOption);
          loading.value = false;
          return;
        }

        const { mapData, scatterData } = processWishlistData();

        // 创建一个简化的地图可视化，使用散点图显示城市分布
        const option = {
          title: {
            text: `我的心愿城市分布 (${props.wishlistItems.length}个城市)`,
            left: 'center',
            top: 10,
            textStyle: {
              color: '#91A8D0',
              fontSize: 16,
              fontWeight: 'bold',
            },
          },
          tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#91A8D0',
            borderWidth: 1,
            textStyle: {
              color: '#333',
            },
            formatter: function (params) {
              const cityData = params.data;
              const tags = cityData.tags ? cityData.tags.slice(0, 3).join('、') : '无标签';
              return `<div style="padding: 5px;">
                        <div style="font-weight: bold; margin-bottom: 5px;">${cityData.cityName}</div>
                        <div style="color: #666;">标签: ${tags}</div>
                        <div style="color: #666;">添加: ${new Date(cityData.createdAt).toLocaleDateString()}</div>
                      </div>`;
            },
          },
          grid: {
            left: '8%',
            right: '8%',
            bottom: '8%',
            top: '20%',
            containLabel: true,
          },
          xAxis: {
            type: 'value',
            name: '经度分布',
            nameLocation: 'middle',
            nameGap: 25,
            nameTextStyle: {
              color: '#666',
              fontSize: 12,
            },
            min: 70,
            max: 140,
            axisLine: {
              lineStyle: { color: '#e0e0e0' },
            },
            axisTick: { show: false },
            axisLabel: { 
              show: true,
              color: '#999',
              fontSize: 10,
            },
            splitLine: {
              lineStyle: { 
                color: '#f5f5f5',
                type: 'dashed',
              },
            },
          },
          yAxis: {
            type: 'value',
            name: '纬度分布',
            nameLocation: 'middle',
            nameGap: 35,
            nameTextStyle: {
              color: '#666',
              fontSize: 12,
            },
            min: 15,
            max: 55,
            axisLine: {
              lineStyle: { color: '#e0e0e0' },
            },
            axisTick: { show: false },
            axisLabel: { 
              show: true,
              color: '#999',
              fontSize: 10,
            },
            splitLine: {
              lineStyle: { 
                color: '#f5f5f5',
                type: 'dashed',
              },
            },
          },
          series: [
            {
              name: '心愿城市',
              type: 'scatter',
              data: props.wishlistItems.map((item, index) => {
                // 基于城市名生成更自然的分布坐标
                const hash1 = item.cityName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
                const hash2 = item.cityCode ? parseInt(item.cityCode) : hash1;
                
                return {
                  name: item.cityName,
                  value: [
                    70 + (hash1 % 70), // 经度范围 70-140
                    15 + (hash2 % 40), // 纬度范围 15-55
                    item.cityName,
                  ],
                  itemStyle: {
                    color: '#F7CAC9',
                    borderColor: '#91A8D0',
                    borderWidth: 2,
                    shadowColor: 'rgba(145, 168, 208, 0.3)',
                    shadowBlur: 8,
                  },
                  tags: item.tags,
                  cityName: item.cityName,
                  createdAt: item.createdAt,
                  originalData: item,
                };
              }),
              symbolSize: function (data) {
                // 根据城市名长度和标签数量调整大小
                const cityNameLength = data[2]?.length || 0;
                const item = props.wishlistItems.find(i => i.cityName === data[2]);
                const tagCount = item?.tags?.length || 0;
                return Math.max(18, Math.min(35, cityNameLength * 3 + tagCount * 2));
              },
              emphasis: {
                itemStyle: {
                  color: '#91A8D0',
                  borderColor: '#F7CAC9',
                  borderWidth: 3,
                  shadowColor: 'rgba(145, 168, 208, 0.6)',
                  shadowBlur: 15,
                },
                scale: 1.3,
              },
              animationDuration: 1500,
              animationEasing: 'elasticOut',
              animationDelay: function (idx) {
                return idx * 100;
              },
            },
          ],
          backgroundColor: 'transparent',
          animation: true,
        };

        chartInstance.value.setOption(option);

        // 添加点击事件
        chartInstance.value.on('click', (params) => {
          if (params.componentType === 'series' && params.data.originalData) {
            emit('city-click', params.data.originalData);
          }
        });

        // 监听窗口大小变化
        const handleResize = () => {
          chartInstance.value?.resize();
        };
        window.addEventListener('resize', handleResize);

        loading.value = false;
      } catch (error) {
        console.error('初始化简化地图失败:', error);
        loading.value = false;
      }
    };

    // 更新地图数据
    const updateMapData = () => {
      if (chartInstance.value) {
        if (!props.wishlistItems || props.wishlistItems.length === 0) {
          // 显示空状态
          const emptyOption = {
            title: {
              text: '还没有心愿城市',
              subtext: '添加你想去的城市，它们将在地图上显示',
              left: 'center',
              top: 'middle',
              textStyle: {
                color: '#91A8D0',
                fontSize: 20,
                fontWeight: 'bold',
              },
              subtextStyle: {
                color: '#6b7280',
                fontSize: 14,
              },
            },
            backgroundColor: 'transparent',
            graphic: {
              type: 'image',
              style: {
                image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiM5MUE4RDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMmwtNS41IDlIOS41bDIuNS00IDIuNSA0SDE3TDEyIDJ6bTAgMTBsLTUuNSA5aDN2LTRoNXY0aDNMMTIgMTJ6Ii8+PC9zdmc+',
                width: 64,
                height: 64,
                opacity: 0.3,
              },
              left: 'center',
              top: '35%',
            },
            series: [], // 清空系列数据
            xAxis: null,
            yAxis: null,
            grid: null,
          };
          chartInstance.value.setOption(emptyOption, true);
          return;
        }

        const updatedData = props.wishlistItems.map((item, index) => {
          const hash1 = item.cityName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
          const hash2 = item.cityCode ? parseInt(item.cityCode) : hash1;
          
          return {
            name: item.cityName,
            value: [
              70 + (hash1 % 70), // 经度范围 70-140
              15 + (hash2 % 40), // 纬度范围 15-55
              item.cityName,
            ],
            itemStyle: {
              color: '#F7CAC9',
              borderColor: '#91A8D0',
              borderWidth: 2,
              shadowColor: 'rgba(145, 168, 208, 0.3)',
              shadowBlur: 8,
            },
            tags: item.tags,
            cityName: item.cityName,
            createdAt: item.createdAt,
            originalData: item,
          };
        });

        chartInstance.value.setOption({
          title: {
            text: `我的心愿城市分布 (${props.wishlistItems.length}个城市)`,
          },
          series: [
            {
              data: updatedData,
            },
          ],
        });
      }
    };

    // 监听心愿清单数据变化
    watch(
      () => props.wishlistItems,
      () => {
        updateMapData();
      },
      { deep: true }
    );

    onMounted(async () => {
      // 需要等待中国地图数据加载
      try {
        // 注册中国地图数据
        const chinaMap = {
          type: 'FeatureCollection',
          features: [
            // 简化的中国地图数据，实际项目中应该使用完整的 GeoJSON 数据
            // 这里只是一个示例结构
          ]
        };
        
        // 如果有完整的地图数据，使用 registerMap 注册
        // echarts.registerMap('china', chinaMap);
        
        // 暂时使用简化版本初始化
        await initMapWithoutGeoData();
      } catch (error) {
        console.error('加载地图数据失败:', error);
        loading.value = false;
      }
    });

    onBeforeUnmount(() => {
      if (chartInstance.value) {
        window.removeEventListener('resize', () => {
          chartInstance.value?.resize();
        });
        chartInstance.value.dispose();
        chartInstance.value = null;
      }
    });

    return {
      mapContainer,
      loading,
    };
  },
};
</script>

<style scoped>
.china-wishlist-map {
  position: relative;
  width: 100%;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.map-chart {
  position: relative;
  z-index: 1;
}

.map-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .china-wishlist-map {
    border-radius: 8px;
  }
}
</style>
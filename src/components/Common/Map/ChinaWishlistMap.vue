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

    // 城市坐标映射（主要城市的经纬度）
    const cityCoordinates = {
      '北京市': [116.4074, 39.9042],
      '上海市': [121.4737, 31.2304],
      '广州市': [113.2644, 23.1291],
      '深圳市': [114.0579, 22.5431],
      '杭州市': [120.1614, 30.2936],
      '南京市': [118.7969, 32.0603],
      '成都市': [104.0665, 30.5723],
      '西安市': [108.9399, 34.3412],
      '重庆市': [106.5516, 29.5630],
      '天津市': [117.1901, 39.1084],
      '苏州市': [120.5853, 31.2987],
      '武汉市': [114.3054, 30.5931],
      '厦门市': [118.1025, 24.4801],
      '青岛市': [120.3826, 36.0671],
      '大连市': [121.6147, 38.9140],
      '三亚市': [109.5119, 18.2577],
      '丽江市': [100.2270, 26.8721],
      '桂林市': [110.2993, 25.2742],
      '拉萨市': [91.1409, 29.6456],
      '乌鲁木齐市': [87.6168, 43.7930],
      '哈尔滨市': [126.6420, 45.7560],
      '沈阳市': [123.4315, 41.8057],
      '长春市': [125.3235, 43.8171],
      '济南市': [117.0009, 36.6758],
      '郑州市': [113.6254, 34.7466],
      '太原市': [112.5501, 37.8706],
      '石家庄市': [114.5149, 38.0428],
      '呼和浩特市': [111.7508, 40.8414],
      '银川市': [106.2309, 38.4872],
      '西宁市': [101.7782, 36.6171],
      '兰州市': [103.8236, 36.0581],
      '昆明市': [102.8329, 24.8801],
      '贵阳市': [106.7133, 26.5783],
      '南宁市': [108.3201, 22.8267],
      '海口市': [110.3312, 20.0311],
      '福州市': [119.3063, 26.0745],
      '南昌市': [115.8921, 28.6765],
      '长沙市': [112.9388, 28.2282],
      '合肥市': [117.2272, 31.8206]
    };

    // 根据城市名获取坐标
    const getCityCoordinates = (cityName) => {
      // 直接匹配
      if (cityCoordinates[cityName]) {
        return cityCoordinates[cityName];
      }
      
      // 模糊匹配（去掉"市"后缀）
      const cityNameWithoutSuffix = cityName.replace(/[市县区]/g, '');
      for (const [key, value] of Object.entries(cityCoordinates)) {
        if (key.includes(cityNameWithoutSuffix) || cityNameWithoutSuffix.includes(key.replace(/[市县区]/g, ''))) {
          return value;
        }
      }
      
      // 如果没有找到，返回中国中心点附近的随机坐标
      return [104 + Math.random() * 20 - 10, 35 + Math.random() * 15 - 7.5];
    };

    // 初始化真正的中国地图
    const initRealChinaMap = async () => {
      try {
        loading.value = true;

        // 等待容器渲染完成
        await nextTick();

        if (!mapContainer.value) {
          console.error('Map container not found');
          return;
        }

        // 加载中国地图GeoJSON数据
        const response = await fetch('/data/china.json');
        if (!response.ok) {
          throw new Error(`加载地图数据失败: ${response.status}`);
        }
        const chinaGeoJSON = await response.json();

        // 创建 ECharts 实例
        chartInstance.value = echarts.init(mapContainer.value);

        // 注册中国地图
        echarts.registerMap('china', chinaGeoJSON);

        // 处理心愿清单数据
        const scatterData = props.wishlistItems.map((item) => {
          const coordinates = getCityCoordinates(item.cityName);
          return {
            name: item.cityName,
            value: [...coordinates, item.cityName],
            itemStyle: {
              color: '#F7CAC9',
              borderColor: '#91A8D0',
              borderWidth: 2,
            },
            data: item,
          };
        });

        const option = {
          title: {
            text: `中国心愿地图 (${props.wishlistItems.length}个城市)`,
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
              if (params.seriesType === 'map') {
                return `${params.name}<br/>点击查看详细信息`;
              } else if (params.seriesType === 'scatter') {
                const cityData = params.data.data;
                const tags = cityData.tags ? cityData.tags.slice(0, 3).join('、') : '无标签';
                return `<div style="padding: 5px;">
                          <div style="font-weight: bold; margin-bottom: 5px;">${cityData.cityName}</div>
                          <div style="color: #666;">标签: ${tags}</div>
                          <div style="color: #666;">添加: ${new Date(cityData.createdAt).toLocaleDateString()}</div>
                          ${cityData.reason ? `<div style="color: #666; margin-top: 5px; font-style: italic;">${cityData.reason.slice(0, 50)}${cityData.reason.length > 50 ? '...' : ''}</div>` : ''}
                        </div>`;
              }
              return params.name;
            },
          },
          geo: {
            map: 'china',
            roam: true, // 允许缩放和平移
            scaleLimit: {
              min: 0.8,
              max: 5,
            },
            zoom: 1.1,
            center: [104, 35], // 中国中心点
            itemStyle: {
              areaColor: '#f8fafc',
              borderColor: '#d1d5db',
              borderWidth: 1,
            },
            emphasis: {
              itemStyle: {
                areaColor: '#f1f5f9',
                borderColor: '#91A8D0',
                borderWidth: 2,
              },
            },
            regions: props.wishlistItems.length > 0 ? [] : [
              // 如果没有心愿城市，可以高亮一些热门省份
            ]
          },
          series: [
            {
              name: '心愿城市',
              type: 'scatter',
              coordinateSystem: 'geo',
              data: scatterData,
              symbolSize: function (val, params) {
                // 根据城市名长度和标签数量调整大小
                const cityData = params.data.data;
                const baseSize = 15;
                const tagBonus = (cityData.tags?.length || 0) * 2;
                const reasonBonus = cityData.reason ? 5 : 0;
                return Math.max(12, Math.min(28, baseSize + tagBonus + reasonBonus));
              },
              itemStyle: {
                color: '#F7CAC9',
                borderColor: '#91A8D0',
                borderWidth: 2,
                shadowColor: 'rgba(145, 168, 208, 0.3)',
                shadowBlur: 8,
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
              label: {
                show: true,
                position: 'top',
                formatter: function(params) {
                  return params.data.data.cityName;
                },
                textStyle: {
                  color: '#374151',
                  fontSize: 11,
                  fontWeight: 'bold',
                  textBorderColor: '#fff',
                  textBorderWidth: 1,
                },
              },
              emphasis: {
                label: {
                  show: true,
                  textStyle: {
                    color: '#91A8D0',
                    fontSize: 13,
                  }
                }
              },
              animationDuration: 1500,
              animationEasing: 'elasticOut',
              animationDelay: function (idx) {
                return idx * 100;
              },
            },
          ],
        };

        chartInstance.value.setOption(option);

        // 添加点击事件
        chartInstance.value.on('click', (params) => {
          if (params.componentType === 'series' && params.seriesType === 'scatter' && params.data.data) {
            emit('city-click', params.data.data);
          }
        });

        // 监听窗口大小变化
        const handleResize = () => {
          chartInstance.value?.resize();
        };
        window.addEventListener('resize', handleResize);

        loading.value = false;
      } catch (error) {
        console.error('初始化中国地图失败:', error);
        // 如果地图加载失败，回退到简化版本
        await initMapWithoutGeoData();
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

    // 更新地图数据（用于真实地图）
    const updateRealMapData = () => {
      if (chartInstance.value) {
        if (!props.wishlistItems || props.wishlistItems.length === 0) {
          // 空状态：显示中国地图但没有标记点
          chartInstance.value.setOption({
            title: {
              text: '中国心愿地图 (0个城市)',
            },
            series: [
              {
                data: [],
              },
            ],
          });
          return;
        }

        // 更新散点数据
        const updatedScatterData = props.wishlistItems.map((item) => {
          const coordinates = getCityCoordinates(item.cityName);
          return {
            name: item.cityName,
            value: [...coordinates, item.cityName],
            itemStyle: {
              color: '#F7CAC9',
              borderColor: '#91A8D0',
              borderWidth: 2,
            },
            data: item,
          };
        });

        chartInstance.value.setOption({
          title: {
            text: `中国心愿地图 (${props.wishlistItems.length}个城市)`,
          },
          series: [
            {
              data: updatedScatterData,
            },
          ],
        });
      }
    };

    // 监听心愿清单数据变化
    watch(
      () => props.wishlistItems,
      () => {
        // 根据当前使用的地图类型更新数据
        if (chartInstance.value && chartInstance.value.getOption().geo) {
          // 使用真实地图
          updateRealMapData();
        } else {
          // 使用简化版地图
          updateMapData();
        }
      },
      { deep: true }
    );

    onMounted(async () => {
      // 优先尝试加载真实的中国地图
      try {
        await initRealChinaMap();
      } catch (error) {
        console.error('加载真实地图失败，回退到简化版本:', error);
        // 如果真实地图加载失败，回退到简化版本
        await initMapWithoutGeoData();
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

    // 更新地图数据（用于简化版地图，保持向后兼容）
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
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 
    0 4px 20px rgba(145, 168, 208, 0.15),
    0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(145, 168, 208, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.china-wishlist-map:hover {
  box-shadow: 
    0 8px 32px rgba(145, 168, 208, 0.2),
    0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
  border-color: rgba(145, 168, 208, 0.15);
}

.map-chart {
  position: relative;
  z-index: 1;
  background: transparent;
}

.map-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(248, 250, 252, 0.95);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  border-radius: 16px;
}

/* 地图容器响应式设计 */
@media (max-width: 1200px) {
  .china-wishlist-map {
    border-radius: 14px;
  }
}

@media (max-width: 768px) {
  .china-wishlist-map {
    border-radius: 12px;
    margin: 0 -4px; /* 移动端扩展容器宽度 */
    box-shadow: 
      0 2px 12px rgba(145, 168, 208, 0.1),
      0 1px 4px rgba(0, 0, 0, 0.05);
  }
  
  .china-wishlist-map:hover {
    transform: none; /* 移动端去除hover动画 */
    box-shadow: 
      0 4px 16px rgba(145, 168, 208, 0.15),
      0 2px 6px rgba(0, 0, 0, 0.08);
  }

  .map-loading {
    border-radius: 12px;
  }
}

@media (max-width: 480px) {
  .china-wishlist-map {
    border-radius: 10px;
  }

  .map-loading {
    border-radius: 10px;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .china-wishlist-map {
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
    border: 1px solid rgba(145, 168, 208, 0.2);
    box-shadow: 
      0 4px 20px rgba(0, 0, 0, 0.3),
      0 2px 8px rgba(145, 168, 208, 0.1);
  }
  
  .china-wishlist-map:hover {
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.4),
      0 4px 16px rgba(145, 168, 208, 0.15);
    border-color: rgba(145, 168, 208, 0.3);
  }

  .map-loading {
    background: rgba(31, 41, 55, 0.95);
    backdrop-filter: blur(6px);
  }
}

/* 加载动画优化 */
.map-loading .el-skeleton {
  width: 100%;
  height: 100%;
}

/* 确保地图能够正确响应窗口大小变化 */
.map-chart > div {
  transition: all 0.3s ease;
}

/* 高DPI屏幕优化 */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .china-wishlist-map {
    box-shadow: 
      0 2px 10px rgba(145, 168, 208, 0.15),
      0 1px 4px rgba(0, 0, 0, 0.05);
  }
}
</style>
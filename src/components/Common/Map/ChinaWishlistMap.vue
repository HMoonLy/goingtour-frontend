<template>
  <div class="china-wishlist-map">
    <div
      ref="mapContainer"
      class="map-chart"
      :style="{ height: height, width: '100%' }"
    />
    <div v-if="loading"
class="map-loading">
      <div class="loading-content">
        <div class="loading-spinner">
          <div class="spinner-ring" />
          <div class="spinner-ring" />
          <div class="spinner-ring" />
        </div>
        <div class="loading-text">
          <h4>正在加载地图</h4>
          <p>{{ loadingMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import * as echarts from "echarts";
import { getCityCoordinate, getBatchCityCoordinates } from "@/api/amap.js";
import { debounce } from "@/utils/api/apiOptimizer.js";

export default {
  name: "ChinaWishlistMap",
  props: {
    wishlistItems: {
      type: Array,
      default: () => [],
    },
    height: {
      type: String,
      default: "400px",
    },
    enableMapClick: {
      type: Boolean,
      default: true,
    },
    highlightedCity: {
      type: String,
      default: null,
    },
    autoFocusCity: {
      type: String,
      default: null, // 新添加的城市，需要自动聚焦
    },
  },
  emits: ["city-click", "map-click", "map-right-click"],
  setup(props, { emit }) {
    const mapContainer = ref(null);
    const chartInstance = ref(null);
    const loading = ref(true);
    const loadingMessage = ref("初始化地图组件...");
    let resizeHandler = null;

    // 省份名称映射（用于ECharts地图）
    const provinceMapping = {
      北京市: "北京",
      天津市: "天津",
      上海市: "上海",
      重庆市: "重庆",
      河北省: "河北",
      山西省: "山西",
      内蒙古自治区: "内蒙古",
      辽宁省: "辽宁",
      吉林省: "吉林",
      黑龙江省: "黑龙江",
      江苏省: "江苏",
      浙江省: "浙江",
      安徽省: "安徽",
      福建省: "福建",
      江西省: "江西",
      山东省: "山东",
      河南省: "河南",
      湖北省: "湖北",
      湖南省: "湖南",
      广东省: "广东",
      广西壮族自治区: "广西",
      海南省: "海南",
      四川省: "四川",
      贵州省: "贵州",
      云南省: "云南",
      西藏自治区: "西藏",
      陕西省: "陕西",
      甘肃省: "甘肃",
      青海省: "青海",
      宁夏回族自治区: "宁夏",
      新疆维吾尔自治区: "新疆",
      台湾省: "台湾",
      香港特别行政区: "香港",
      澳门特别行政区: "澳门",
    };

    // 根据城市adcode获取省份
    const getProvinceFromAdcode = (adcode) => {
      if (!adcode) return null;
      const code = adcode.toString();

      const provinceMap = {
        11: "北京",
        12: "天津",
        13: "河北",
        14: "山西",
        15: "内蒙古",
        21: "辽宁",
        22: "吉林",
        23: "黑龙江",
        31: "上海",
        32: "江苏",
        33: "浙江",
        34: "安徽",
        35: "福建",
        36: "江西",
        37: "山东",
        41: "河南",
        42: "湖北",
        43: "湖南",
        44: "广东",
        45: "广西",
        46: "海南",
        50: "重庆",
        51: "四川",
        52: "贵州",
        53: "云南",
        54: "西藏",
        61: "陕西",
        62: "甘肃",
        63: "青海",
        64: "宁夏",
        65: "新疆",
        71: "台湾",
        81: "香港",
        82: "澳门",
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
              color: "#91A8D0",
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

    // 城市坐标获取（使用高德地图API）
    const getCityCoordinates = async (cityName) => {
      try {
        // 使用高德地图API获取精确坐标
        const coordinates = await getCityCoordinate(cityName);
        return coordinates;
      } catch (error) {
        console.warn(`获取城市坐标失败 [${cityName}]:`, error);

        // API失败时的备选方案：使用城市名称hash生成相对固定的坐标
        const hash = cityName
          .split("")
          .reduce((a, b) => a + b.charCodeAt(0), 0);
        const lng = 104 + ((hash % 60) - 30); // 经度范围 74-134
        const lat = 35 + (((hash * 7) % 30) - 15); // 纬度范围 20-50

        console.log(`使用备选坐标 [${cityName}]: [${lng}, ${lat}]`);
        return [lng, lat];
      }
    };

    // 初始化真正的中国地图
    const initRealChinaMap = async () => {
      try {
        loading.value = true;
        loadingMessage.value = "初始化地图组件...";

        // 等待容器渲染完成
        await nextTick();

        if (!mapContainer.value) {
          console.error("Map container not found");
          return;
        }

        loadingMessage.value = "加载中国地图数据...";
        // 加载中国地图GeoJSON数据
        const response = await fetch("/data/china.json");
        if (!response.ok) {
          throw new Error(`加载地图数据失败: ${response.status}`);
        }
        const chinaGeoJSON = await response.json();

        loadingMessage.value = "创建地图实例...";
        // 创建 ECharts 实例
        chartInstance.value = echarts.init(mapContainer.value);

        // 注册中国地图
        echarts.registerMap("china", chinaGeoJSON);

        let cityCoordinatesMap = {};
        if (props.wishlistItems && props.wishlistItems.length > 0) {
          loadingMessage.value = "获取城市坐标信息...";
          // 处理心愿清单数据，区分状态
          // 批量获取所有城市的坐标（优化性能，增加缓存）
          const cityNames = [
            ...new Set(props.wishlistItems.map((item) => item.cityName)),
          ]; // 去重
          cityCoordinatesMap = await getBatchCityCoordinates(cityNames, 100); // 增加间隔避免限流
        }

        loadingMessage.value = "渲染城市标记...";

        const scatterData = props.wishlistItems
          ? props.wishlistItems.map((item) => {
              const coordinates = cityCoordinatesMap[item.cityName] || [
                104, 35,
              ];
              const isVisited = item.ever_visited === true;
              const isHighlighted = props.highlightedCity === item.cityName;

              return {
                name: item.cityName,
                value: [...coordinates, item.cityName],
                itemStyle: {
                  color: isHighlighted
                    ? "#6366f1"
                    : isVisited
                      ? "#f59e0b"
                      : "#91A8D0",
                  borderColor: isHighlighted
                    ? "#f7cac9"
                    : isVisited
                      ? "#d97706"
                      : "#6366f1",
                  borderWidth: isHighlighted ? 3 : 2,
                  shadowColor: isHighlighted
                    ? "rgba(99, 102, 241, 0.4)"
                    : isVisited
                      ? "rgba(245, 158, 11, 0.3)"
                      : "rgba(145, 168, 208, 0.3)",
                  shadowBlur: isHighlighted ? 12 : 8,
                },
                data: item,
              };
            })
          : [];

        const option = {
          title: {
            text: `中国地图`,
            left: "center",
            top: 10,
            textStyle: {
              color: "#91A8D0",
              fontSize: 16,
              fontWeight: "bold",
            },
          },
          tooltip: {
            trigger: "item",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderColor: "#91A8D0",
            borderWidth: 1,
            textStyle: {
              color: "#333",
              fontSize: window.innerWidth <= 768 ? 12 : 14, // 移动端字体稍小
            },
            // 移动端优化：调整tooltip位置避免被手指遮挡
            position: function (point, params, dom, rect, size) {
              if (window.innerWidth <= 768) {
                // 移动端：显示在点击位置上方
                return [
                  point[0] - size.contentSize[0] / 2,
                  point[1] - size.contentSize[1] - 15,
                ];
              }
              return null; // 桌面端使用默认位置
            },
            formatter: function (params) {
              if (params.seriesType === "map") {
                return `${params.name}<br/>点击查看详细信息`;
              } else if (params.seriesType === "scatter") {
                const cityData = params.data.data;
                const tags = cityData.tags
                  ? cityData.tags.slice(0, 3).join("、")
                  : "无标签";
                return `<div style="padding: 5px;">
                          <div style="font-weight: bold; margin-bottom: 5px;">${cityData.cityName}</div>
                          <div style="color: #666;">标签: ${tags}</div>
                          <div style="color: #666;">添加: ${new Date(cityData.createdAt).toLocaleDateString()}</div>
                          ${cityData.reason ? `<div style="color: #666; margin-top: 5px; font-style: italic;">${cityData.reason.slice(0, 50)}${cityData.reason.length > 50 ? "..." : ""}</div>` : ""}
                        </div>`;
              }
              return params.name;
            },
          },
          geo: {
            map: "china",
            roam: true, // 允许缩放和平移
            scaleLimit: {
              min: window.innerWidth <= 768 ? 1.0 : 0.8, // 移动端限制最小缩放
              max: window.innerWidth <= 768 ? 3.0 : 5.0, // 移动端限制最大缩放
            },
            zoom: window.innerWidth <= 768 ? 1.2 : 1.1, // 移动端默认稍微放大
            center: [104, 35], // 中国中心点
            // 移动端优化：更大的触摸区域
            selectedMode: false, // 禁用选择模式，优化触摸体验
            itemStyle: {
              areaColor: "#f8fafc",
              borderColor: "#d1d5db",
              borderWidth: 1,
            },
            emphasis: {
              itemStyle: {
                areaColor: "#f1f5f9",
                borderColor: "#91A8D0",
                borderWidth: 2,
                shadowColor: "rgba(145, 168, 208, 0.3)",
                shadowBlur: 15,
              },
              label: {
                show: props.enableMapClick,
                color: "#91A8D0",
                fontSize: 14,
                fontWeight: "bold",
                formatter: function (params) {
                  return `点击添加城市到${params.name}`;
                },
              },
            },
          },
          series: [
            {
              name: "心愿城市",
              type: "scatter",
              coordinateSystem: "geo",
              data: scatterData,
              symbolSize: function (val, params) {
                // 根据城市名长度和标签数量调整大小
                const cityData = params.data.data;
                const baseSize = 15;
                const tagBonus = (cityData.tags?.length || 0) * 2;
                const reasonBonus = cityData.reason ? 5 : 0;
                // 移动端适配：最小尺寸增大到18，确保触摸友好
                const isMobile = window.innerWidth <= 768;
                const minSize = isMobile ? 18 : 12;
                const maxSize = isMobile ? 32 : 28;
                return Math.max(
                  minSize,
                  Math.min(maxSize, baseSize + tagBonus + reasonBonus),
                );
              },
              itemStyle: {
                color: "#F7CAC9",
                borderColor: "#91A8D0",
                borderWidth: 2,
                shadowColor: "rgba(145, 168, 208, 0.3)",
                shadowBlur: 8,
              },
              emphasis: {
                itemStyle: {
                  color: "#6366f1",
                  borderColor: "#F7CAC9",
                  borderWidth: 3,
                  shadowColor: "rgba(99, 102, 241, 0.5)",
                  shadowBlur: 15,
                },
                scale: 1.3,
                label: {
                  show: true,
                  color: "#91A8D0",
                  fontSize: 13,
                },
              },
              label: {
                show: true,
                position: "top",
                formatter: function (params) {
                  return params.data.data.cityName;
                },
                color: "#374151",
                fontSize: 11,
                fontWeight: "bold",
                textBorderColor: "#fff",
                textBorderWidth: 1,
              },
              animationDuration: 1500,
              animationEasing: "elasticOut",
              animationDelay: function (idx) {
                return idx * 100;
              },
            },
          ],
        };

        chartInstance.value.setOption(option);

        // 使用requestAnimationFrame优化渲染性能
        requestAnimationFrame(() => {
          chartInstance.value?.resize();
        });

        // 增强的点击事件处理
        chartInstance.value.on("click", (params) => {
          if (
            params.componentType === "series" &&
            params.seriesType === "scatter" &&
            params.data.data
          ) {
            // 点击现有城市
            emit("city-click", params.data.data);
          } else if (params.componentType === "geo" && props.enableMapClick) {
            // 点击地图空白区域，添加新城市
            emit("map-click", {
              provinceName: params.name,
              coordinates: [params.event.offsetX, params.event.offsetY], // 屏幕坐标
              type: "add-city",
            });
          }
        });

        // 添加右键点击事件（可选）
        chartInstance.value.on("contextmenu", (params) => {
          // 阻止默认右键菜单
          if (params.event && params.event.event) {
            params.event.event.preventDefault();
          }

          if (params.componentType === "geo" && props.enableMapClick) {
            emit("map-right-click", {
              provinceName: params.name,
              coordinates: [params.event.offsetX, params.event.offsetY],
              type: "quick-add",
            });
          }
        });

        // 监听窗口大小变化（先清除旧的监听器，避免重复绑定）
        if (resizeHandler) {
          window.removeEventListener("resize", resizeHandler);
        }
        resizeHandler = debounce(() => {
          chartInstance.value?.resize();
        }, 150); // 防抖优化性能
        window.addEventListener("resize", resizeHandler);

        loading.value = false;
      } catch (error) {
        console.error("初始化中国地图失败:", error);
        // 如果地图加载失败，回退到简化版本
        await initMapWithoutGeoData();
      }
    };

    // 初始化简化地图（无地图数据版本）
    const initMapWithoutGeoData = async () => {
      try {
        loading.value = true;
        loadingMessage.value = "初始化简化地图...";

        await nextTick();

        if (!mapContainer.value) {
          console.error("Map container not found");
          return;
        }

        loadingMessage.value = "创建图表实例...";
        chartInstance.value = echarts.init(mapContainer.value);

        // 检查是否有心愿清单数据
        if (!props.wishlistItems || props.wishlistItems.length === 0) {
          loadingMessage.value = "渲染空状态...";
          // 显示空状态
          const emptyOption = {
            title: {
              text: "还没有心愿城市",
              subtext: "添加你想去的城市，它们将在地图上显示",
              left: "center",
              top: "middle",
              textStyle: {
                color: "#91A8D0",
                fontSize: 20,
                fontWeight: "bold",
              },
              subtextStyle: {
                color: "#6b7280",
                fontSize: 14,
              },
            },
            backgroundColor: "transparent",
            graphic: {
              type: "image",
              style: {
                image:
                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiM5MUE4RDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMmwtNS41IDlIOS41bDIuNS00IDIuNSA0SDE3TDEyIDJ6bTAgMTBsLTUuNSA5aDN2LTRoNXY0aDNMMTIgMTJ6Ii8+PC9zdmc+",
                width: 64,
                height: 64,
                opacity: 0.3,
              },
              left: "center",
              top: "35%",
            },
          };
          chartInstance.value.setOption(emptyOption);
          loading.value = false;
          return;
        }

        loadingMessage.value = "处理城市数据...";
        const { mapData, scatterData } = processWishlistData();

        loadingMessage.value = "渲染城市分布图...";
        // 创建一个简化的地图可视化，使用散点图显示城市分布
        const option = {
          title: {
            text: `我的心愿城市分布 (${props.wishlistItems.length}个城市)`,
            left: "center",
            top: 10,
            textStyle: {
              color: "#91A8D0",
              fontSize: 16,
              fontWeight: "bold",
            },
          },
          tooltip: {
            trigger: "item",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderColor: "#91A8D0",
            borderWidth: 1,
            textStyle: {
              color: "#333",
            },
            formatter: function (params) {
              const cityData = params.data;
              const tags = cityData.tags
                ? cityData.tags.slice(0, 3).join("、")
                : "无标签";
              return `<div style="padding: 5px;">
                        <div style="font-weight: bold; margin-bottom: 5px;">${cityData.cityName}</div>
                        <div style="color: #666;">标签: ${tags}</div>
                        <div style="color: #666;">添加: ${new Date(cityData.createdAt).toLocaleDateString()}</div>
                      </div>`;
            },
          },
          grid: {
            left: "8%",
            right: "8%",
            bottom: "8%",
            top: "20%",
            containLabel: true,
          },
          xAxis: {
            type: "value",
            name: "经度分布",
            nameLocation: "middle",
            nameGap: 25,
            nameTextStyle: {
              color: "#666",
              fontSize: 12,
            },
            min: 70,
            max: 140,
            axisLine: {
              lineStyle: { color: "#e0e0e0" },
            },
            axisTick: { show: false },
            axisLabel: {
              show: true,
              color: "#999",
              fontSize: 10,
            },
            splitLine: {
              lineStyle: {
                color: "#f5f5f5",
                type: "dashed",
              },
            },
          },
          yAxis: {
            type: "value",
            name: "纬度分布",
            nameLocation: "middle",
            nameGap: 35,
            nameTextStyle: {
              color: "#666",
              fontSize: 12,
            },
            min: 15,
            max: 55,
            axisLine: {
              lineStyle: { color: "#e0e0e0" },
            },
            axisTick: { show: false },
            axisLabel: {
              show: true,
              color: "#999",
              fontSize: 10,
            },
            splitLine: {
              lineStyle: {
                color: "#f5f5f5",
                type: "dashed",
              },
            },
          },
          series: [
            {
              name: "心愿城市",
              type: "scatter",
              data: props.wishlistItems.map((item, index) => {
                // 基于城市名生成更自然的分布坐标
                const hash1 = item.cityName
                  .split("")
                  .reduce((a, b) => a + b.charCodeAt(0), 0);
                const hash2 = item.cityCode ? parseInt(item.cityCode) : hash1;
                const isVisited = item.ever_visited === true;
                const isHighlighted = props.highlightedCity === item.cityName;

                return {
                  name: item.cityName,
                  value: [
                    70 + (hash1 % 70), // 经度范围 70-140
                    15 + (hash2 % 40), // 纬度范围 15-55
                    item.cityName,
                  ],
                  itemStyle: {
                    color: isHighlighted
                      ? "#6366f1"
                      : isVisited
                        ? "#f59e0b"
                        : "#F7CAC9",
                    borderColor: isHighlighted
                      ? "#f7cac9"
                      : isVisited
                        ? "#d97706"
                        : "#91A8D0",
                    borderWidth: isHighlighted ? 3 : 2,
                    shadowColor: isHighlighted
                      ? "rgba(99, 102, 241, 0.4)"
                      : isVisited
                        ? "rgba(245, 158, 11, 0.3)"
                        : "rgba(145, 168, 208, 0.3)",
                    shadowBlur: isHighlighted ? 12 : 8,
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
                const item = props.wishlistItems.find(
                  (i) => i.cityName === data[2],
                );
                const tagCount = item?.tags?.length || 0;
                // 移动端适配：增大触摸区域
                const isMobile = window.innerWidth <= 768;
                const baseSize = isMobile ? 24 : 18;
                const maxSize = isMobile ? 40 : 35;
                return Math.max(
                  baseSize,
                  Math.min(maxSize, cityNameLength * 3 + tagCount * 2),
                );
              },
              emphasis: {
                itemStyle: {
                  color: "#6366f1",
                  borderColor: "#F7CAC9",
                  borderWidth: 3,
                  shadowColor: "rgba(99, 102, 241, 0.5)",
                  shadowBlur: 15,
                },
                scale: 1.3,
              },
              animationDuration: 1500,
              animationEasing: "elasticOut",
              animationDelay: function (idx) {
                return idx * 100;
              },
            },
          ],
          backgroundColor: "transparent",
          animation: true,
        };

        chartInstance.value.setOption(option);

        // 添加点击事件
        chartInstance.value.on("click", (params) => {
          if (params.componentType === "series" && params.data.originalData) {
            emit("city-click", params.data.originalData);
          }
        });

        // 监听窗口大小变化（先清除旧的监听器，避免重复绑定）
        if (resizeHandler) {
          window.removeEventListener("resize", resizeHandler);
        }
        resizeHandler = debounce(() => {
          chartInstance.value?.resize();
        }, 150); // 防抖优化性能
        window.addEventListener("resize", resizeHandler);

        loading.value = false;
      } catch (error) {
        console.error("初始化简化地图失败:", error);
        loading.value = false;
      }
    };

    // 更新地图数据（用于真实地图）
    const updateRealMapData = async () => {
      if (chartInstance.value) {
        if (!props.wishlistItems || props.wishlistItems.length === 0) {
          // 空状态：显示中国地图但没有标记点
          chartInstance.value.setOption({
            title: {
              text: "中国心愿地图 (0个城市)",
            },
            series: [
              {
                data: [],
              },
            ],
          });
          return;
        }

        // 批量获取坐标，避免逐个await造成的卡顿，并去重优化性能
        const cityNames = [
          ...new Set(props.wishlistItems.map((item) => item.cityName)),
        ];
        const coordinatesMap = await getBatchCityCoordinates(cityNames, 100);

        // 更新散点数据
        const updatedScatterData = props.wishlistItems.map((item) => {
          const coordinates = coordinatesMap[item.cityName] || [104, 35];
          const isVisited = item.ever_visited === true;
          const isHighlighted = props.highlightedCity === item.cityName;
          return {
            name: item.cityName,
            value: [...coordinates, item.cityName],
            itemStyle: {
              color: isHighlighted
                ? "#6366f1"
                : isVisited
                  ? "#f59e0b"
                  : "#91A8D0",
              borderColor: isHighlighted
                ? "#f7cac9"
                : isVisited
                  ? "#d97706"
                  : "#6366f1",
              borderWidth: isHighlighted ? 3 : 2,
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

    // 监听心愿清单数据变化（添加防抖处理）
    const updateMapDebounced = debounce(() => {
      // 根据当前使用的地图类型更新数据
      if (chartInstance.value && chartInstance.value.getOption().geo) {
        // 使用真实地图
        updateRealMapData();
      } else {
        // 使用简化版地图
        updateMapData();
      }
    }, 300);

    watch(
      () => props.wishlistItems,
      () => {
        updateMapDebounced();
      },
      { deep: true },
    );

    // 监听高亮城市变化，动态更新样式
    watch(
      () => props.highlightedCity,
      () => {
        if (!chartInstance.value) return;
        if (chartInstance.value.getOption().geo) {
          updateRealMapData();
        } else {
          updateMapData();
        }
      },
    );

    // 监听自动聚焦城市，实现地图聚焦功能
    watch(
      () => props.autoFocusCity,
      async (newCity) => {
        if (!newCity || !chartInstance.value) return;

        try {
          // 获取城市坐标
          const coordinates = await getCityCoordinate(newCity);
          if (coordinates && chartInstance.value.getOption().geo) {
            // 如果是真实地图，聚焦到城市位置
            chartInstance.value.setOption({
              geo: {
                center: coordinates,
                zoom: 2.5, // 放大显示
              },
            });

            // 3秒后恢复默认视图
            setTimeout(() => {
              if (chartInstance.value) {
                chartInstance.value.setOption({
                  geo: {
                    center: [104, 35],
                    zoom: 1.1,
                  },
                });
              }
            }, 3000);
          }
        } catch (error) {
          console.warn(`聚焦城市失败 [${newCity}]:`, error);
        }
      },
    );

    onMounted(async () => {
      // 优先尝试加载真实的中国地图
      try {
        await initRealChinaMap();
      } catch (error) {
        console.error("加载真实地图失败，回退到简化版本:", error);
        // 如果真实地图加载失败，回退到简化版本
        await initMapWithoutGeoData();
      }
    });

    onBeforeUnmount(() => {
      if (resizeHandler) {
        window.removeEventListener("resize", resizeHandler);
        resizeHandler = null;
      }
      if (chartInstance.value) {
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
              text: "还没有心愿城市",
              subtext: "添加你想去的城市，它们将在地图上显示",
              left: "center",
              top: "middle",
              textStyle: {
                color: "#91A8D0",
                fontSize: 20,
                fontWeight: "bold",
              },
              subtextStyle: {
                color: "#6b7280",
                fontSize: 14,
              },
            },
            backgroundColor: "transparent",
            graphic: {
              type: "image",
              style: {
                image:
                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiM5MUE4RDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMmwtNS41IDlIOS41bDIuNS00IDIuNSA0SDE3TDEyIDJ6bTAgMTBsLTUuNSA5aDN2LTRoNXY0aDNMMTIgMTJ6Ii8+PC9zdmc+",
                width: 64,
                height: 64,
                opacity: 0.3,
              },
              left: "center",
              top: "35%",
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
          const hash1 = item.cityName
            .split("")
            .reduce((a, b) => a + b.charCodeAt(0), 0);
          const hash2 = item.cityCode ? parseInt(item.cityCode) : hash1;

          const isVisited = item.ever_visited === true;
          const isHighlighted = props.highlightedCity === item.cityName;

          return {
            name: item.cityName,
            value: [
              70 + (hash1 % 70), // 经度范围 70-140
              15 + (hash2 % 40), // 纬度范围 15-55
              item.cityName,
            ],
            itemStyle: {
              color: isHighlighted
                ? "#6366f1"
                : isVisited
                  ? "#f59e0b"
                  : "#F7CAC9",
              borderColor: isHighlighted
                ? "#f7cac9"
                : isVisited
                  ? "#d97706"
                  : "#91A8D0",
              borderWidth: isHighlighted ? 3 : 2,
              shadowColor: isHighlighted
                ? "rgba(99, 102, 241, 0.4)"
                : isVisited
                  ? "rgba(245, 158, 11, 0.3)"
                  : "rgba(145, 168, 208, 0.3)",
              shadowBlur: isHighlighted ? 12 : 8,
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
      loadingMessage,
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
  background: linear-gradient(
    135deg,
    rgba(248, 250, 252, 0.98) 0%,
    rgba(255, 255, 255, 0.95) 100%
  );
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  border-radius: 16px;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  max-width: 280px;
  text-align: center;
}

.loading-spinner {
  position: relative;
  width: 64px;
  height: 64px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-radius: 50%;
  animation: spin 2s linear infinite;
}

.spinner-ring:nth-child(1) {
  border-top-color: #91a8d0;
  animation-delay: 0s;
}

.spinner-ring:nth-child(2) {
  border-right-color: #f7cac9;
  animation-delay: 0.4s;
  width: 80%;
  height: 80%;
  top: 10%;
  left: 10%;
}

.spinner-ring:nth-child(3) {
  border-bottom-color: #6366f1;
  animation-delay: 0.8s;
  width: 60%;
  height: 60%;
  top: 20%;
  left: 20%;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  background: linear-gradient(135deg, #1f2937 0%, #91a8d0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.loading-text p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  animation: fadeInOut 2s ease-in-out infinite;
}

@keyframes fadeInOut {
  0%,
  100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
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

  .loading-content {
    gap: 20px;
    max-width: 240px;
  }

  .loading-spinner {
    width: 48px;
    height: 48px;
  }

  .loading-text h4 {
    font-size: 16px;
  }

  .loading-text p {
    font-size: 13px;
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

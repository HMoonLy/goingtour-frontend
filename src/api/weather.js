import { http } from "./request.js";
import { amapKey } from "./amap.js";
import axios from "axios"; // Added axios import

/**
 * 天气相关API接口
 */
export const weatherApi = {
    // 常用城市的编码映射表 (作为缓存使用，会从city-codes.json动态加载更多数据)
    cityCodeMap: {
        beijing: "110000",
        shanghai: "310000",
        guangzhou: "440100",
        shenzhen: "440300",
        hangzhou: "330100", // 添加杭州以确保兼容性
    },

    // 拼音/英文名称到中文名称的映射
    pinyinToChinese: {
        beijing: "北京市",
        shanghai: "上海市",
        guangzhou: "广州市",
        shenzhen: "深圳市",
        hangzhou: "杭州市",
        nanjing: "南京市",
        tianjin: "天津市",
        chengdu: "成都市",
        wuhan: "武汉市",
        xian: "西安市",
        chongqing: "重庆市",
        suzhou: "苏州市",
        xiamen: "厦门市",
        qingdao: "青岛市",
        dalian: "大连市",
        shenyang: "沈阳市",
        taiyuan: "太原市",
        kunming: "昆明市",
        guiyang: "贵阳市",
    },

    // 城市编码数据是否已加载
    cityCodesLoaded: false,

    /**
     * 加载城市编码数据文件
     * @returns {Promise<boolean>} 加载成功返回true
     */
    async loadCityCodes() {
        if (this.cityCodesLoaded) {
            return true;
        }

        try {
            // console.log('🌏 正在加载城市编码数据...');
            const response = await fetch("/data/city-codes.json");

            if (!response.ok) {
                throw new Error(`加载失败: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // 处理城市编码数据并合并到映射表中
            if (data && Array.isArray(data)) {
                let processedCount = 0;

                data.forEach((city) => {
                    if (city.中文名 && city.adcode) {
                        // 将adcode转为字符串类型，确保一致性
                        const adcodeStr = String(city.adcode);

                        // 添加城市名(中文)到编码的映射
                        const cityName = city.中文名;
                        this.cityCodeMap[cityName.toLowerCase()] = adcodeStr;

                        // 如果城市名以"市"、"区"、"县"等结尾，添加不带这些后缀的映射
                        ["市", "区", "县", "自治区", "自治州", "特别行政区"].forEach(
                            (suffix) => {
                                if (cityName.endsWith(suffix)) {
                                    const shortName = cityName.slice(
                                        0,
                                        cityName.length - suffix.length,
                                    );
                                    if (shortName.length > 0) {
                                        this.cityCodeMap[shortName.toLowerCase()] = adcodeStr;
                                    }
                                }
                            },
                        );

                        // 添加citycode映射（如果不是\N）
                        if (city.citycode && city.citycode !== "\\N") {
                            this.cityCodeMap[city.citycode] = adcodeStr;
                        }

                        processedCount++;
                    }
                });

                this.cityCodesLoaded = true;
                console.log(
                    `✅ 城市编码数据加载完成，共处理 ${processedCount}/${data.length} 条有效记录`,
                );
                return true;
            } else {
                console.warn("⚠️ 城市编码数据格式不正确");
                return false;
            }
        } catch (error) {
            console.error("❌ 加载城市编码数据失败:", error);
            return false;
        }
    },

    /**
     * 转换拼音/英文城市名为中文城市名
     * @param {string} cityName - 拼音或英文城市名
     * @returns {string} - 中文城市名或原始输入
     */
    convertPinyinToChinese(cityName) {
        if (!cityName) return "";

        const lowerName = cityName.toLowerCase();
        return this.pinyinToChinese[lowerName] || cityName;
    },

    /**
     * 根据城市名称获取城市编码
     * @param {string} cityName - 城市名称或编码
     * @returns {Promise<string>} - 返回城市编码
     */
    async getCityCode(cityName) {
        if (!cityName) {
            return "";
        }

        // 0. 检查输入是否已经是城市编码（6位数字形式）
        if (/^\d{6}$/.test(cityName)) {
            // console.log(`🗺️ 输入已是城市编码，直接使用: ${cityName}`);
            return cityName;
        }

        // 检查是否在反向映射表中（是否是一个已有的adcode或citycode）
        await this.loadCityCodes();
        const allCodes = Object.values(this.cityCodeMap);
        if (allCodes.includes(cityName)) {
            // console.log(`🗺️ 输入匹配已知城市编码，直接使用: ${cityName}`);
            return cityName;
        }

        // 1. 尝试将拼音/英文转换为中文名称
        const possibleChineseName = this.convertPinyinToChinese(cityName);

        // 2. 尝试直接查找映射表
        const namesToTry = [cityName, possibleChineseName];
        for (const name of namesToTry) {
            const lowerName = name.toLowerCase();
            if (this.cityCodeMap[lowerName]) {
                console.log(
                    `🗺️ 从缓存获取城市编码: ${name} -> ${this.cityCodeMap[lowerName]}`,
                );
                return this.cityCodeMap[lowerName];
            }
        }

        // 3. 加载并查询本地城市数据
        await this.loadCityCodes();

        // 4. 再次尝试查找映射表
        for (const name of namesToTry) {
            const lowerName = name.toLowerCase();
            if (this.cityCodeMap[lowerName]) {
                console.log(
                    `🗺️ 从本地数据获取城市编码: ${name} -> ${this.cityCodeMap[lowerName]}`,
                );
                return this.cityCodeMap[lowerName];
            }
        }

        // 5. 尝试查找有没有部分匹配的城市
        // console.log(`⚠️ 未找到"${cityName}"的精确匹配，尝试部分匹配...`);
        const normalizedInput = cityName.toLowerCase();

        // 查找部分匹配的中文城市名
        for (const [key, code] of Object.entries(this.cityCodeMap)) {
            if (key.includes(normalizedInput) || normalizedInput.includes(key)) {
                // console.log(`🗺️ 找到部分匹配: ${key} -> ${code}`);
                return code;
            }
        }

        // 6. 所有本地查询都失败，只能使用原始城市名
        console.warn(`⚠️ 未能获取"${cityName}"的城市编码，将使用原始名称`);
        return cityName;
    },

    /**
     * 获取城市实时天气信息
     * @param {string} city - 城市名称（中文或拼音）
     * @returns {Promise} - 返回实时天气信息
     */
    async getLiveWeather(city) {
        try {
            // 检查API密钥是否存在
            if (!amapKey) {
                throw new Error("高德地图API密钥未设置");
            }

            // 先获取城市编码
            const adcode = await this.getCityCode(city);

            console.log(`正在获取${city}(${adcode})的实时天气数据`);

            // 准备参数，与示例代码保持一致
            const params = {
                key: amapKey,
                city: adcode,
                extensions: "all",
            };

            // 使用直接调用axios的方式，避免可能的参数处理问题
            const response = await axios.get(
                "https://restapi.amap.com/v3/weather/weatherInfo", { params },
            );

            // 输出响应以供调试
            console.log("天气API响应:", response.config.url);

            return response;
        } catch (error) {
            console.error(`❌ 获取实时天气失败:`, error);
            return null;
        }
    },

    /**
     * 获取城市天气预报信息
     * @param {string} city - 城市名称（中文或拼音）
     * @returns {Promise} - 返回天气预报信息
     */
    async getForecastWeather(city) {
        try {
            // 检查API密钥是否存在
            if (!amapKey) {
                throw new Error("高德地图API密钥未设置");
            }

            // 先获取城市编码
            const adcode = await this.getCityCode(city);

            console.log(`正在获取${city}(${adcode})的天气预报数据`);

            // 准备参数
            const params = {
                key: amapKey,
                city: adcode,
                extensions: "all",
            };

            // 使用直接调用axios的方式
            const response = await axios.get(
                "https://restapi.amap.com/v3/weather/weatherInfo", { params },
            );

            // 输出响应以供调试
            console.log("天气预报API响应状态:", response.status);

            return response;
        } catch (error) {
            console.error(`❌ 获取天气预报失败:`, error);
            return null;
        }
    },

    /**
     * 获取城市天气建议
     * @param {string} city - 城市名称
     * @param {Date} startDate - 开始日期
     * @param {number} days - 天数
     * @returns {Promise} - 返回天气建议
     */
    async getWeatherSuggestions(city, startDate, days) {
        // 计算出行开始日期距今的天数
        const today = new Date();
        const timeDiff = startDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        console.log(`出行日期距今 ${daysDiff} 天，开始获取天气建议...`);

        // 如果是超过7天的未来日期，使用历史天气数据和季节分析
        if (daysDiff > 7) {
            console.log("出行日期超过天气预报范围，使用历史天气分析...");
            return this.generateHistoricalWeatherSuggestions(city, startDate, days);
        }
        try {
            console.log(`正在获取${city}的天气建议...`);

            if (!city) {
                throw new Error("城市名称为空，无法获取天气");
            }

            // 检查API密钥是否存在
            if (!amapKey) {
                throw new Error("高德地图API密钥未设置");
            }

            try {
                // 方法1：直接获取天气预报数据（包含多日预报）
                // 这个方法使用 extensions=all 参数
                const forecastResponse = await this.getForecastWeather(city);

                // 详细输出响应数据以便调试
                if (forecastResponse) {
                    console.log("天气预报API响应状态码:", forecastResponse.status);
                    if (forecastResponse.data) {
                        console.log(
                            "天气预报API响应数据结构:",
                            JSON.stringify(forecastResponse.data).substring(0, 200) + "...",
                        );
                    } else {
                        console.log("天气预报API响应数据结构: 无数据");
                    }
                } else {
                    console.log("天气预报API响应: 无响应");
                    throw new Error("获取天气预报时发生错误，请检查网络连接");
                }

                if (!forecastResponse.data) {
                    throw new Error("天气API响应中不包含data字段");
                }

                // 检查API状态码
                if (forecastResponse.data.status !== "1") {
                    console.error(
                        "天气API错误响应详情:",
                        JSON.stringify(forecastResponse.data),
                    );
                    const errorCode = forecastResponse.data.infocode || "未知";
                    const errorMsg = forecastResponse.data.info || "未知错误";
                    throw new Error(`天气API错误: ${errorMsg} (错误码: ${errorCode})`);
                }

                // 检查forecasts数组是否存在
                if (!forecastResponse.data.forecasts ||
                    forecastResponse.data.forecasts.length === 0
                ) {
                    console.error(
                        "天气API返回格式不正确:",
                        JSON.stringify(forecastResponse.data),
                    );
                    throw new Error("返回的天气数据中无forecasts数组");
                }

                // 获取天气预报数据
                const forecastData = forecastResponse.data.forecasts[0];
                console.log("✅ 成功获取天气预报数据:", forecastData);

                // 方法2：获取实时天气数据（备用方案）
                // 如果需要更详细的实时天气，可以单独请求
                let currentWeather = null;
                try {
                    // 构建一个模拟的实时天气对象，从预报的第一天数据中提取
                    if (
                        forecastData &&
                        forecastData.casts &&
                        forecastData.casts.length > 0
                    ) {
                        const today = forecastData.casts[0];

                        // 从预报数据构建实时天气对象
                        currentWeather = {
                            city: forecastData.city,
                            adcode: forecastData.adcode,
                            province: forecastData.province,
                            reporttime: forecastData.reporttime,
                            weather: today.dayweather, // 使用白天天气
                            temperature: today.daytemp, // 使用白天温度
                            humidity: "未知", // 预报中可能没有湿度
                            winddirection: today.daywind,
                            windpower: today.daypower,
                        };

                        console.log("✅ 从预报数据构建实时天气:", currentWeather);
                    }

                    // 如果有需要，可以尝试单独获取实时天气数据
                    // 但为了减少API调用，我们这里使用预报中的今日数据
                } catch (liveError) {
                    console.warn("获取实时天气失败，将只使用天气预报数据:", liveError);
                }

                // 生成天气建议（使用预报数据和构建的当前天气数据）
                return this.generateWeatherSuggestions(
                    currentWeather,
                    forecastData,
                    startDate,
                    days,
                );
            } catch (error) {
                console.error("获取天气信息失败:", error);
                return null;
            }
        } catch (error) {
            console.error("获取天气API数据失败:", error);
            throw error;
        }
    },

    /**
     * 根据天气数据生成旅行建议
     * @param {Object} liveWeather - 实时天气信息
     * @param {Object} forecastWeather - 天气预报信息
     * @param {Date} startDate - 开始日期
     * @param {number} days - 天数
     * @returns {Object} - 返回旅行建议
     */
    generateWeatherSuggestions(liveWeather, forecastWeather, startDate, days) {
        // 确保有一个有效的天气对象，如果实时天气数据不可用，使用预报中的第一天数据
        if (!liveWeather &&
            forecastWeather &&
            forecastWeather.casts &&
            forecastWeather.casts.length > 0
        ) {
            const today = forecastWeather.casts[0];
            liveWeather = {
                city: forecastWeather.city,
                adcode: forecastWeather.adcode,
                province: forecastWeather.province,
                reporttime: forecastWeather.reporttime,
                weather: today.dayweather, // 使用白天天气
                temperature: today.daytemp, // 使用白天温度
                humidity: "未知", // 预报中可能没有湿度
                winddirection: today.daywind,
                windpower: today.daypower,
            };
            console.log("在建议生成中使用预报的第一天作为实时天气数据");
        }

        // 如果仍然没有天气数据，返回null
        if (!liveWeather) {
            console.error("无法生成天气建议：没有可用的天气数据");
            return null;
        }

        // 天气类型映射
        const weatherTypeMap = {
            晴: "晴天",
            多云: "多云",
            阴: "阴天",
            小雨: "小雨",
            中雨: "中雨",
            大雨: "大雨",
            暴雨: "暴雨",
            雷阵雨: "雷阵雨",
            小雪: "小雪",
            中雪: "中雪",
            大雪: "大雪",
            暴雪: "暴雪",
            雨夹雪: "雨夹雪",
            阵雨: "阵雨",
            雾: "雾天",
            霾: "霾天",
            沙尘暴: "沙尘暴",
        };

        // 分析天气情况
        const weatherTypes = new Set();
        if (liveWeather.weather) {
            weatherTypes.add(liveWeather.weather);
        }

        // 实时天气温度
        let currentTemp = parseInt(liveWeather.temperature) || 20;

        // 设置默认最高最低温度
        let maxTemp = currentTemp + 5;
        let minTemp = currentTemp - 5;

        // 如果有天气预报，使用预报的温度范围
        if (
            forecastWeather &&
            forecastWeather.casts &&
            forecastWeather.casts.length > 0
        ) {
            const relevantForecasts = forecastWeather.casts.slice(0, days);

            relevantForecasts.forEach((forecast) => {
                if (forecast.dayweather) weatherTypes.add(forecast.dayweather);
                if (forecast.nightweather) weatherTypes.add(forecast.nightweather);

                const dayTemp = parseInt(forecast.daytemp) || 0;
                const nightTemp = parseInt(forecast.nighttemp) || 0;

                if (dayTemp > maxTemp) maxTemp = dayTemp;
                if (nightTemp < minTemp) minTemp = nightTemp;
            });
        }

        // 生成天气描述
        const weatherDesc = Array.from(weatherTypes)
            .map((w) => weatherTypeMap[w] || w)
            .join("、");

        // 温差计算
        const tempDiff = maxTemp - minTemp;

        // 生成建议
        let activities = [];
        let tips = [];
        let avoid = [];

        // 根据当前天气类型生成建议
        const currentWeatherType = liveWeather.weather;
        // console.log("当前天气类型:", currentWeatherType);

        // 根据天气类型生成建议 - 优化并扩充多种天气类型
        if (currentWeatherType.includes("晴")) {
            activities.push("户外活动", "城市观光", "公园游览", "户外摄影");
            tips.push(`当前气温${currentTemp}℃，预计温度范围${minTemp}℃~${maxTemp}℃`);

            if (currentTemp > 28) {
                tips.push("天气较热，请注意防晒和补水");
                avoid.push("避免长时间暴露在阳光下");
                activities.push("水上活动", "室内博物馆");
            } else if (currentTemp < 10) {
                tips.push("天气晴朗但温度较低，请注意保暖");
                activities.push("温泉", "室内购物");
            }
        }

        if (currentWeatherType.includes("多云")) {
            activities.push("户外活动", "城市观光", "街区探索");
            tips.push(`多云天气适合户外活动，温度范围${minTemp}℃~${maxTemp}℃`);
        }

        if (currentWeatherType.includes("阴")) {
            activities.push("户外活动", "城市观光", "历史景点", "购物");
            tips.push(`阴天光线柔和，适合拍照，温度范围${minTemp}℃~${maxTemp}℃`);
        }

        if (
            currentWeatherType.includes("雨") ||
            currentWeatherType.includes("雪")
        ) {
            // 根据雨量大小分类处理
            if (
                currentWeatherType.includes("小雨") ||
                currentWeatherType.includes("小雪")
            ) {
                activities.push("室内博物馆", "购物中心", "美食探索", "咖啡馆文化");
                tips.push("天气有小雨/雪，建议携带雨具或保暖衣物");
                avoid.push("避免在雨雪天气进行远距离户外活动");
            } else if (
                currentWeatherType.includes("中雨") ||
                currentWeatherType.includes("阵雨") ||
                currentWeatherType.includes("雷阵雨") ||
                currentWeatherType.includes("中雪")
            ) {
                activities.push("室内博物馆", "购物中心", "当地特色餐厅", "文化展览");
                tips.push("天气有中雨/雪，出行请务必携带雨具或保暖衣物");
                avoid.push("不建议进行户外活动", "注意路面湿滑");
            } else if (
                currentWeatherType.includes("大雨") ||
                currentWeatherType.includes("暴雨") ||
                currentWeatherType.includes("大雪") ||
                currentWeatherType.includes("暴雪")
            ) {
                activities = ["室内活动", "博物馆", "购物中心", "酒店休闲"];
                tips.push("目前有大雨/暴雨或大雪/暴雪，请做好防护准备");
                tips.push("建议调整行程，选择室内活动");
                avoid.push("避免任何户外活动", "注意交通安全", "关注天气预警信息");
            }
        }

        if (tempDiff >= 10) {
            tips.push(`温差较大（${tempDiff}℃），请准备适当衣物`);
        }

        if (currentTemp >= 30 || maxTemp >= 30) {
            tips.push("气温较高，注意防暑降温");
            avoid.push("避免午后高温时段户外活动");
        }

        if (currentTemp <= 5 || minTemp <= 5) {
            tips.push("气温较低，请做好保暖措施");
        }

        // 添加湿度信息
        if (liveWeather.humidity) {
            const humidity = parseInt(liveWeather.humidity);
            if (humidity >= 80) {
                tips.push(`当前湿度较高(${humidity}%)，注意防潮`);
            } else if (humidity <= 30) {
                tips.push(`当前湿度较低(${humidity}%)，注意保湿`);
            }
        }

        // 确保有默认建议
        if (activities.length === 0) {
            activities = ["城市观光", "当地美食", "特色文化体验"];
        }

        if (tips.length === 0) {
            tips.push("请关注当地天气预报，及时调整行程");
        }

        // 添加城市和省份信息
        const cityInfo = {
            city: liveWeather.city,
            province: liveWeather.province,
            reportTime: liveWeather.reporttime,
        };

        // 创建天气预报数据结构
        const forecastList = [];
        if (
            forecastWeather &&
            forecastWeather.casts &&
            forecastWeather.casts.length > 0
        ) {
            // 显示所有可用的天气预报数据，不受行程天数限制
            const maxDays = forecastWeather.casts.length;
            console.log(`✅ 构建天气预报数据，共${maxDays}天预报数据`);
            for (let i = 0; i < maxDays; i++) {
                const forecast = forecastWeather.casts[i];
                if (forecast) {
                    // 转换日期格式
                    let forecastDate;
                    try {
                        forecastDate = new Date(forecast.date);
                        if (isNaN(forecastDate.getTime())) {
                            // 如果日期无效，使用起始日期加上天数
                            forecastDate = new Date(startDate);
                            forecastDate.setDate(forecastDate.getDate() + i);
                        }
                    } catch (e) {
                        // 日期解析失败，使用起始日期加上天数
                        forecastDate = new Date(startDate);
                        forecastDate.setDate(forecastDate.getDate() + i);
                    }

                    // 格式化日期
                    const dateStr = forecastDate.toLocaleDateString("zh-CN", {
                        month: "long",
                        day: "numeric",
                        weekday: "long",
                    });

                    // 添加到预报列表
                    const forecastItem = {
                        date: forecast.date, // 保持原始日期格式
                        week: forecast.week,
                        dayWeather: forecast.dayweather,
                        nightWeather: forecast.nightweather,
                        dayTemp: forecast.daytemp,
                        nightTemp: forecast.nighttemp,
                        dayWind: forecast.daywind,
                        nightWind: forecast.nightwind,
                        dayPower: forecast.daypower,
                        nightPower: forecast.nightpower,
                    };

                    forecastList.push(forecastItem);
                    console.log(`✅ 添加第${i + 1}天预报数据:`, forecastItem);
                }
            }
        }

        console.log(
            `✅ 最终构造的天气预报数据共${forecastList.length}条:`,
            forecastList,
        );

        return {
            ...cityInfo,
            currentWeather: liveWeather.weather,
            currentTemp: currentTemp,
            weatherDesc,
            tempRange: `${minTemp}℃~${maxTemp}℃`,
            humidity: liveWeather.humidity ? `${liveWeather.humidity}%` : "未知",
            tempDiff,
            activities,
            tips,
            avoid,
            forecast: forecastList, // 添加天气预报数据
            hasForecast: forecastList.length > 0,
        };
    },

    /**
     * 基于历史天气数据生成旅行建议（用于超过预报范围的未来日期）
     * @param {string} city - 城市名称
     * @param {Date} startDate - 开始日期
     * @param {number} days - 天数
     * @returns {Promise<Object>} - 返回基于历史数据的天气建议
     */
    async generateHistoricalWeatherSuggestions(city, startDate, days) {
        try {
            // 获取历史天气统计数据
            const historicalData = this.getHistoricalWeatherStats(city, startDate);

            if (!historicalData) {
                return this.generateSeasonalFallbackSuggestions(city, startDate, days);
            }

            // 基于历史数据生成建议
            return this.buildSuggestionsFromHistoricalData(
                historicalData,
                city,
                startDate,
                days,
            );
        } catch (error) {
            console.error("生成历史天气建议失败:", error);
            // 降级到季节性建议
            return this.generateSeasonalFallbackSuggestions(city, startDate, days);
        }
    },

    /**
     * 获取城市历史天气统计数据
     * @param {string} city - 城市名称
     * @param {Date} date - 日期
     * @returns {Object|null} - 历史天气统计数据
     */
    getHistoricalWeatherStats(city, date) {
        const month = date.getMonth() + 1; // 1-12
        const season = this.getSeason(month);

        // 历史天气统计数据库（基于中国主要城市的历史气候数据）
        const historicalStats = {
            // 北京历史天气统计
            beijing: {
                春季: {
                    // 3-5月
                    avgTempHigh: 22,
                    avgTempLow: 8,
                    commonWeather: ["晴", "多云", "小雨"],
                    rainProbability: 30,
                    windLevel: "微风",
                    tips: [
                        "春季是北京最佳旅游季节",
                        "温差较大，注意增减衣物",
                        "可能有沙尘天气",
                    ],
                },
                夏季: {
                    // 6-8月
                    avgTempHigh: 31,
                    avgTempLow: 21,
                    commonWeather: ["晴", "多云", "雷阵雨"],
                    rainProbability: 60,
                    windLevel: "微风",
                    tips: ["夏季炎热多雨", "注意防暑降温", "雷雨天气较多"],
                },
                秋季: {
                    // 9-11月
                    avgTempHigh: 20,
                    avgTempLow: 6,
                    commonWeather: ["晴", "多云"],
                    rainProbability: 20,
                    windLevel: "微风",
                    tips: ["秋季天高气爽", "是最佳旅游季节", "温差较大"],
                },
                冬季: {
                    // 12-2月
                    avgTempHigh: 4,
                    avgTempLow: -8,
                    commonWeather: ["晴", "多云", "小雪"],
                    rainProbability: 10,
                    windLevel: "3-4级",
                    tips: ["冬季寒冷干燥", "注意防寒保暖", "可能有雾霾"],
                },
            },

            // 上海历史天气统计
            shanghai: {
                春季: {
                    avgTempHigh: 20,
                    avgTempLow: 12,
                    commonWeather: ["多云", "小雨", "晴"],
                    rainProbability: 45,
                    windLevel: "微风",
                    tips: ["春季温暖湿润", "雨水较多", "适合户外活动"],
                },
                夏季: {
                    avgTempHigh: 32,
                    avgTempLow: 25,
                    commonWeather: ["晴", "多云", "雷阵雨"],
                    rainProbability: 55,
                    windLevel: "微风",
                    tips: ["夏季炎热潮湿", "台风季节", "注意防暑防雨"],
                },
                秋季: {
                    avgTempHigh: 23,
                    avgTempLow: 15,
                    commonWeather: ["晴", "多云"],
                    rainProbability: 25,
                    windLevel: "微风",
                    tips: ["秋季最舒适", "天气稳定", "适合各种活动"],
                },
                冬季: {
                    avgTempHigh: 10,
                    avgTempLow: 3,
                    commonWeather: ["多云", "阴", "小雨"],
                    rainProbability: 35,
                    windLevel: "微风",
                    tips: ["冬季阴冷潮湿", "少有雪天", "注意保暖防潮"],
                },
            },

            // 广州历史天气统计
            guangzhou: {
                春季: {
                    avgTempHigh: 26,
                    avgTempLow: 18,
                    commonWeather: ["多云", "小雨", "晴"],
                    rainProbability: 50,
                    windLevel: "微风",
                    tips: ["春季温暖潮湿", "雨季开始", "适合旅游"],
                },
                夏季: {
                    avgTempHigh: 33,
                    avgTempLow: 26,
                    commonWeather: ["晴", "多云", "雷阵雨"],
                    rainProbability: 70,
                    windLevel: "微风",
                    tips: ["夏季炎热多雨", "台风影响", "注意防暑防雨"],
                },
                秋季: {
                    avgTempHigh: 28,
                    avgTempLow: 20,
                    commonWeather: ["晴", "多云"],
                    rainProbability: 30,
                    windLevel: "微风",
                    tips: ["秋季舒适干燥", "最佳旅游季节", "天气稳定"],
                },
                冬季: {
                    avgTempHigh: 20,
                    avgTempLow: 11,
                    commonWeather: ["多云", "晴"],
                    rainProbability: 25,
                    windLevel: "微风",
                    tips: ["冬季温和干燥", "偶有冷空气", "适合旅游"],
                },
            },

            // 成都历史天气统计
            chengdu: {
                春季: {
                    avgTempHigh: 22,
                    avgTempLow: 12,
                    commonWeather: ["多云", "小雨", "阴"],
                    rainProbability: 55,
                    windLevel: "微风",
                    tips: ["春季温润多雨", "雾天较多", "注意保暖"],
                },
                夏季: {
                    avgTempHigh: 28,
                    avgTempLow: 21,
                    commonWeather: ["多云", "雷阵雨", "阴"],
                    rainProbability: 75,
                    windLevel: "微风",
                    tips: ["夏季凉爽多雨", "避暑胜地", "雨具必备"],
                },
                秋季: {
                    avgTempHigh: 23,
                    avgTempLow: 15,
                    commonWeather: ["多云", "阴", "小雨"],
                    rainProbability: 60,
                    windLevel: "微风",
                    tips: ["秋季阴雨绵绵", "雾天增多", "适度保暖"],
                },
                冬季: {
                    avgTempHigh: 12,
                    avgTempLow: 5,
                    commonWeather: ["阴", "多云", "雾"],
                    rainProbability: 25,
                    windLevel: "微风",
                    tips: ["冬季阴冷潮湿", "雾霾较重", "注意保暖防雾"],
                },
            },
        };

        // 城市名称标准化
        const normalizedCity = this.normalizeCityName(city);

        if (
            historicalStats[normalizedCity] &&
            historicalStats[normalizedCity][season]
        ) {
            return {
                city: city,
                season: season,
                ...historicalStats[normalizedCity][season],
            };
        }

        return null;
    },

    /**
     * 获取季节信息
     * @param {number} month - 月份 (1-12)
     * @returns {string} - 季节名称
     */
    getSeason(month) {
        if (month >= 3 && month <= 5) return "春季";
        if (month >= 6 && month <= 8) return "夏季";
        if (month >= 9 && month <= 11) return "秋季";
        return "冬季";
    },

    /**
     * 标准化城市名称
     * @param {string} cityName - 原始城市名称
     * @returns {string} - 标准化后的城市名称
     */
    normalizeCityName(cityName) {
        const cityMap = {
            北京: "beijing",
            北京市: "beijing",
            beijing: "beijing",
            上海: "shanghai",
            上海市: "shanghai",
            shanghai: "shanghai",
            广州: "guangzhou",
            广州市: "guangzhou",
            guangzhou: "guangzhou",
            深圳: "shenzhen",
            深圳市: "shenzhen",
            shenzhen: "shenzhen",
            成都: "chengdu",
            成都市: "chengdu",
            chengdu: "chengdu",
            杭州: "hangzhou",
            杭州市: "hangzhou",
            hangzhou: "hangzhou",
        };

        return cityMap[cityName] || cityName.toLowerCase();
    },

    /**
     * 基于历史数据构建天气建议
     * @param {Object} historicalData - 历史天气数据
     * @param {string} city - 城市名称
     * @param {Date} startDate - 开始日期
     * @param {number} days - 天数
     * @returns {Object} - 天气建议
     */
    buildSuggestionsFromHistoricalData(historicalData, city, startDate, days) {
        const { avgTempHigh, avgTempLow, commonWeather, rainProbability, tips } =
        historicalData;

        // 基于历史数据生成活动建议
        let activities = [];
        let weatherTips = [...tips];
        let avoid = [];

        // 根据平均温度和降雨概率生成建议
        if (avgTempHigh >= 25) {
            activities.push("户外活动", "水上项目", "夜市游览");
            if (avgTempHigh >= 30) {
                weatherTips.push("气温较高，注意防暑降温");
                avoid.push("避免午后高温时段长时间户外活动");
            }
        } else if (avgTempHigh <= 10) {
            activities.push("室内博物馆", "温泉", "购物中心", "特色火锅");
            weatherTips.push("气温较低，做好保暖措施");
        } else {
            activities.push("城市观光", "历史景点", "公园游览", "美食探索");
        }

        if (rainProbability >= 50) {
            activities.push("室内博物馆", "购物中心", "美食街", "文化体验");
            weatherTips.push(`降雨概率较高(${rainProbability}%)，建议携带雨具`);
            avoid.push("减少户外长时间活动");
        }

        // 生成温差提醒
        const tempDiff = avgTempHigh - avgTempLow;
        if (tempDiff >= 10) {
            weatherTips.push(`昼夜温差较大(${tempDiff}℃)，注意适时增减衣物`);
        }

        return {
            city: city,
            season: historicalData.season,
            weatherDesc: `${historicalData.season}典型天气，以${commonWeather.join("、")}为主`,
            tempRange: `${avgTempLow}℃~${avgTempHigh}℃`,
            currentTemp: Math.round((avgTempHigh + avgTempLow) / 2),
            rainProbability: `${rainProbability}%`,
            activities,
            tips: weatherTips,
            avoid,
            dataSource: "历史气候数据",
            isHistorical: true,
            startDate: startDate.toLocaleDateString("zh-CN"),
            duration: `${days}天`,
            forecast: this.generateHistoricalForecast(
                historicalData,
                startDate,
                days,
            ),
        };
    },

    /**
     * 生成基于历史数据的天气预报
     * @param {Object} historicalData - 历史天气数据
     * @param {Date} startDate - 开始日期
     * @param {number} days - 天数
     * @returns {Array} - 预报数组
     */
    generateHistoricalForecast(historicalData, startDate, days) {
        const forecast = [];
        const { avgTempHigh, avgTempLow, commonWeather } = historicalData;

        for (let i = 0; i < Math.min(days, 7); i++) {
            const forecastDate = new Date(startDate);
            forecastDate.setDate(forecastDate.getDate() + i);

            // 添加一些随机变化使预报更真实
            const tempVariation = Math.floor(Math.random() * 6) - 3; // -3 到 +3 的变化
            const dayTemp = avgTempHigh + tempVariation;
            const nightTemp = avgTempLow + tempVariation;

            // 随机选择天气类型
            const weatherType =
                commonWeather[Math.floor(Math.random() * commonWeather.length)];

            forecast.push({
                date: forecastDate.toLocaleDateString("zh-CN", {
                    month: "long",
                    day: "numeric",
                    weekday: "long",
                }),
                dayWeather: weatherType,
                nightWeather: weatherType,
                dayTemp: `${dayTemp}℃`,
                nightTemp: `${nightTemp}℃`,
                isHistorical: true,
            });
        }

        return forecast;
    },

    /**
     * 生成季节性降级建议（当无法获取具体城市历史数据时）
     * @param {string} city - 城市名称
     * @param {Date} startDate - 开始日期
     * @param {number} days - 天数
     * @returns {Object} - 基本季节建议
     */
    generateSeasonalFallbackSuggestions(city, startDate, days) {
        const month = startDate.getMonth() + 1;
        const season = this.getSeason(month);

        // 通用季节建议
        const seasonalAdvice = {
            春季: {
                tempRange: "10℃~22℃",
                activities: ["户外踏青", "公园游览", "城市观光", "摄影采风"],
                tips: [
                    "春季气候宜人，适合户外活动",
                    "注意昼夜温差",
                    "可能有春雨，建议携带雨具",
                ],
                commonWeather: "多云转晴",
            },
            夏季: {
                tempRange: "22℃~32℃",
                activities: ["室内博物馆", "购物中心", "水上活动", "夜间游览"],
                tips: [
                    "夏季炎热，注意防暑降温",
                    "多补充水分",
                    "避免午后高温时段户外活动",
                ],
                commonWeather: "晴转多云",
            },
            秋季: {
                tempRange: "12℃~25℃",
                activities: ["户外登山", "公园游览", "城市观光", "美食探索"],
                tips: ["秋季天高气爽，最适宜旅游", "注意早晚温差", "天气相对稳定"],
                commonWeather: "晴",
            },
            冬季: {
                tempRange: "0℃~12℃",
                activities: ["室内博物馆", "温泉", "购物中心", "特色美食"],
                tips: ["冬季寒冷，注意保暖", "北方可能有雪天", "南方相对温和"],
                commonWeather: "多云",
            },
        };

        const advice = seasonalAdvice[season];

        return {
            city: city,
            season: season,
            weatherDesc: `${season}典型天气，${advice.commonWeather}`,
            tempRange: advice.tempRange,
            activities: advice.activities,
            tips: advice.tips,
            avoid: [],
            dataSource: "季节性气候统计",
            isHistorical: true,
            isFallback: true,
            startDate: startDate.toLocaleDateString("zh-CN"),
            duration: `${days}天`,
        };
    },
};
import { http } from "./request.js";
import { amapKey } from "./amap.js";
import axios from "axios";

/**
 * 天气相关API接口 - 纯HTTP请求层
 * 只负责与外部API的通信，不包含业务逻辑
 */
export const weatherApi = {
    /**
     * 获取城市实时天气信息
     * @param {string} adcode - 城市编码
     * @returns {Promise} - 返回实时天气信息
     */
    async getLiveWeather(adcode) {
        try {
            if (!amapKey) {
                throw new Error("高德地图API密钥未设置");
            }

            const params = {
                key: amapKey,
                city: adcode,
                extensions: "base",
            };

            const response = await axios.get(
                "https://restapi.amap.com/v3/weather/weatherInfo", { params }
            );

            return response.data;
        } catch (error) {
            console.error(`❌ 获取实时天气失败:`, error);
            throw error;
        }
    },

    /**
     * 获取城市天气预报信息
     * @param {string} adcode - 城市编码
     * @returns {Promise} - 返回天气预报信息
     */
    async getForecastWeather(adcode) {
        try {
            if (!amapKey) {
                throw new Error("高德地图API密钥未设置");
            }

            const params = {
                key: amapKey,
                city: adcode,
                extensions: "all",
            };

            const response = await axios.get(
                "https://restapi.amap.com/v3/weather/weatherInfo", { params }
            );

            return response.data;
        } catch (error) {
            console.error(`❌ 获取天气预报失败:`, error);
            throw error;
        }
    },

    /**
     * 加载城市编码数据文件
     * @returns {Promise<Object>} - 城市编码数据
     */
    async loadCityCodesData() {
        try {
            const response = await fetch("/data/city-codes.json");

            if (!response.ok) {
                throw new Error(`加载失败: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("加载城市编码数据失败:", error);
            throw error;
        }
    }
};
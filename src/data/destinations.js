// 推荐目的地静态数据（可按需扩充/替换图片）
// 说明：封面图片请放在 public/images/destinations/ 下，命名可自定义

export const hotRegions = [{
        label: "国内热门",
        cities: [
            { name: "北京市", adcode: "110000", cover: "/images/destinations/beijing.jpg" },
            { name: "上海市", adcode: "310000", cover: "/images/destinations/shanghai.jpg" },
            { name: "杭州市", adcode: "330100", cover: "/images/destinations/hangzhou.jpg" },
            { name: "成都市", adcode: "510100", cover: "/images/destinations/chengdu.jpg" },
            { name: "重庆市", adcode: "500000", cover: "/images/destinations/chongqing.jpg" },
            { name: "西安市", adcode: "610100", cover: "/images/destinations/xian.jpg" },
            { name: "南京市", adcode: "320100", cover: "/images/destinations/nanjing.jpg" },
            { name: "厦门市", adcode: "350200", cover: "/images/destinations/xiamen.jpg" },
            { name: "三亚市", adcode: "460200", cover: "/images/destinations/sanya.jpg" },
            { name: "丽江市", adcode: "530700", cover: "/images/destinations/lijiang.jpg" },
            { name: "桂林市", adcode: "450300", cover: "/images/destinations/guilin.jpg" },
            { name: "青岛市", adcode: "370200", cover: "/images/destinations/qingdao.jpg" }
        ]
    },
    {
        label: "华东",
        cities: [
            { name: "苏州市", adcode: "320500", cover: "/images/destinations/suzhou.jpg" },
            { name: "杭州市", adcode: "330100", cover: "/images/destinations/hangzhou.jpg" },
            { name: "南京市", adcode: "320100", cover: "/images/destinations/nanjing.jpg" },
            { name: "黄山市", adcode: "341000", cover: "/images/destinations/huangshan.jpg" },
            { name: "青岛市", adcode: "370200", cover: "/images/destinations/qingdao.jpg" }
        ]
    },
    {
        label: "华南",
        cities: [
            { name: "广州市", adcode: "440100", cover: "/images/destinations/guangzhou.jpg" },
            { name: "深圳市", adcode: "440300", cover: "/images/destinations/shenzhen.jpg" },
            { name: "厦门市", adcode: "350200", cover: "/images/destinations/xiamen.jpg" },
            { name: "三亚市", adcode: "460200", cover: "/images/destinations/sanya.jpg" }
        ]
    },
    {
        label: "西南",
        cities: [
            { name: "成都市", adcode: "510100", cover: "/images/destinations/chengdu.jpg" },
            { name: "重庆市", adcode: "500000", cover: "/images/destinations/chongqing.jpg" },
            { name: "昆明市", adcode: "530100", cover: "/images/destinations/kunming.jpg" },
            { name: "丽江市", adcode: "530700", cover: "/images/destinations/lijiang.jpg" }
        ]
    },
    {
        label: "西北",
        cities: [
            { name: "西安市", adcode: "610100", cover: "/images/destinations/xian.jpg" },
            { name: "兰州市", adcode: "620100", cover: "/images/destinations/lanzhou.jpg" },
            { name: "银川市", adcode: "640100", cover: "/images/destinations/yinchuan.jpg" }
        ]
    },
    {
        label: "东北",
        cities: [
            { name: "哈尔滨市", adcode: "230100", cover: "/images/destinations/haerbin.jpg" },
            { name: "长春市", adcode: "220100", cover: "/images/destinations/changchun.jpg" },
            { name: "大连市", adcode: "210200", cover: "/images/destinations/dalian.jpg" }
        ]
    }
];

export const seasonalByMonth = {
    1: ["哈尔滨市", "三亚市", "北京市"],
    2: ["哈尔滨市", "三亚市", "厦门市"],
    3: ["杭州市", "厦门市", "桂林市"],
    4: ["杭州市", "苏州市", "黄山市"],
    5: ["青岛市", "南京市", "成都市"],
    6: ["青岛市", "广州市", "厦门市"],
    7: ["青岛市", "大连市", "昆明市"],
    8: ["大连市", "丽江市", "三亚市"],
    9: ["西安市", "成都市", "南京市"],
    10: ["北京市", "西安市", "桂林市"],
    11: ["北京市", "杭州市", "厦门市"],
    12: ["哈尔滨市", "三亚市", "成都市"]
};

export const themeGroups = {
    "自然风光": [
        { name: "黄山市", adcode: "341000", cover: "/images/destinations/huangshan.jpg" },
        { name: "桂林市", adcode: "450300", cover: "/images/destinations/guilin.jpg" },
        { name: "九寨沟县", adcode: "513225", cover: "/images/destinations/jiuzhaigou.jpg" },
        { name: "张家界市", adcode: "430800", cover: "/images/destinations/zhangjiajie.jpg" }
    ],
    "海岛度假": [
        { name: "三亚市", adcode: "460200", cover: "/images/destinations/sanya.jpg" },
        { name: "厦门市", adcode: "350200", cover: "/images/destinations/xiamen.jpg" }
    ],
    "历史古城": [
        { name: "西安市", adcode: "610100", cover: "/images/destinations/xian.jpg" },
        { name: "南京市", adcode: "320100", cover: "/images/destinations/nanjing.jpg" },
        { name: "北京市", adcode: "110000", cover: "/images/destinations/beijing.jpg" }
    ],
    "美食之旅": [
        { name: "成都市", adcode: "510100", cover: "/images/destinations/chengdu.jpg" },
        { name: "广州市", adcode: "440100", cover: "/images/destinations/guangzhou.jpg" },
        { name: "重庆市", adcode: "500000", cover: "/images/destinations/chongqing.jpg" }
    ]
};

export function findCity(name) {
    for (const group of hotRegions) {
        const c = group.cities.find((x) => x.name === name);
        if (c) return c;
    }
    for (const theme of Object.values(themeGroups)) {
        const c = theme.find((x) => x.name === name);
        if (c) return c;
    }
    return null;
}
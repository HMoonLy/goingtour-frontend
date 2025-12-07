// 推荐目的地静态数据（可按需扩充/替换图片）
// 说明：封面图片请放在 public/images/destinations/ 下，命名可自定义

export const hotRegions = [
  {
    label: "国内热门",
    cities: [
      {
        name: "北京市",
        adcode: "110000",
        cover: "/images/destinations/beijing.jpg",
        description: "千年古都，现代与传统的完美融合",
        tags: ["历史文化", "美食购物", "皇城风韵"],
      },
      {
        name: "上海市",
        adcode: "310000",
        cover: "/images/destinations/shanghai.jpg",
        description: "东方巴黎，国际化大都市",
        tags: ["时尚购物", "外滩夜景", "摩登都市"],
      },
      {
        name: "杭州市",
        adcode: "330100",
        cover: "/images/destinations/hangzhou.jpg",
        description: "人间天堂，诗意江南水乡",
        tags: ["西湖美景", "江南古韵", "茶香文化"],
      },
      {
        name: "成都市",
        adcode: "510100",
        cover: "/images/destinations/chengdu.jpg",
        description: "天府之国，美食与熊猫的故乡",
        tags: ["巴蜀美食", "大熊猫", "慢生活"],
      },
      {
        name: "重庆市",
        adcode: "500000",
        cover: "/images/destinations/chongqing.jpg",
        description: "山城雾都，火辣的巴渝风情",
        tags: ["火锅之都", "山城夜景", "魔幻8D"],
      },
      {
        name: "西安市",
        adcode: "610100",
        cover: "/images/destinations/xian.jpg",
        description: "十三朝古都，丝路起点",
        tags: ["兵马俑", "古城墙", "汉唐遗风"],
      },
      {
        name: "三亚市",
        adcode: "460200",
        cover: "/images/destinations/sanya.jpg",
        description: "热带天堂，椰风海韵",
        tags: ["阳光沙滩", "热带风情", "度假胜地"],
      },
      {
        name: "厦门市",
        adcode: "350200",
        cover: "/images/destinations/xiamen.jpg",
        description: "鹭岛风光，文艺清新",
        tags: ["鼓浪屿", "海上花园", "闽南文化"],
      },
      {
        name: "丽江市",
        adcode: "530700",
        cover: "/images/destinations/lijiang.jpg",
        description: "艳遇之都，纳西古韵",
        tags: ["古城文化", "雪山美景", "民族风情"],
      },
      {
        name: "桂林市",
        adcode: "450300",
        cover: "/images/destinations/guilin.jpg",
        description: "山水甲天下，漓江画廊",
        tags: ["山水风光", "漓江竹筏", "溶洞奇观"],
      },
      // 为当季推荐添加的额外城市
      {
        name: "哈尔滨市",
        adcode: "230100",
        cover: "/images/destinations/haerbin.jpg",
      },
      {
        name: "拉萨市",
        adcode: "540100",
        cover: "/images/destinations/lasa.jpg",
      },
      {
        name: "苏州市",
        adcode: "320500",
        cover: "/images/destinations/suzhou.jpg",
      },
      {
        name: "黄山市",
        adcode: "341000",
        cover: "/images/destinations/huangshan.jpg",
      },
      {
        name: "张家界市",
        adcode: "430800",
        cover: "/images/destinations/zhangjiajie.jpg",
      },
      {
        name: "青岛市",
        adcode: "370200",
        cover: "/images/destinations/qingdao.jpg",
      },
      {
        name: "南京市",
        adcode: "320100",
        cover: "/images/destinations/nanjing.jpg",
      },
      {
        name: "广州市",
        adcode: "440100",
        cover: "/images/destinations/guangzhou.jpg",
      },
      {
        name: "大连市",
        adcode: "210200",
        cover: "/images/destinations/dalian.jpg",
      },
      {
        name: "昆明市",
        adcode: "530100",
        cover: "/images/destinations/kunming.jpg",
      },
      {
        name: "九寨沟县",
        adcode: "513225",
        cover: "/images/destinations/jiuzhaigou.jpg",
      },
      {
        name: "深圳市",
        adcode: "440300",
        cover: "/images/destinations/shenzhen.jpg",
      },
      // 新增城市（按城市名排序）
      {
        name: "承德市",
        adcode: "130800",
        cover: "/images/destinations/chengde.jpg",
      },
      {
        name: "大理市",
        adcode: "532901",
        cover: "/images/destinations/dali.jpg",
      },
      {
        name: "洛阳市",
        adcode: "410300",
        cover: "/images/destinations/luoyang.jpg",
      },
      {
        name: "贵阳市",
        adcode: "520100",
        cover: "/images/destinations/guiyang.jpg",
      },
      {
        name: "长白山",
        adcode: "220600",
        cover: "/images/destinations/changbaishan.jpg",
      },
      {
        name: "青海湖",
        adcode: "632801",
        cover: "/images/destinations/qinghaihu.jpg",
      },
      {
        name: "呼伦贝尔",
        adcode: "150700",
        cover: "/images/destinations/hulunbeier.jpg",
      },
      {
        name: "长春市",
        adcode: "220100",
        cover: "/images/destinations/changchun.jpg",
      },
      {
        name: "银川市",
        adcode: "640100",
        cover: "/images/destinations/yinchuan.jpg",
      },
      {
        name: "秦皇岛市",
        adcode: "130300",
        cover: "/images/destinations/qinhuangdao.jpg",
      },
      {
        name: "烟台市",
        adcode: "370600",
        cover: "/images/destinations/yantai.jpg",
      },
      {
        name: "珠海市",
        adcode: "440400",
        cover: "/images/destinations/zhuhai.jpg",
      },
      {
        name: "稻城市",
        adcode: "513337",
        cover: "/images/destinations/daocheng.jpg",
      },
    ],
  },
];

export const seasonalByMonth = {
  // 冬季 - 南方避寒 + 北方看雪
  1: [
    "哈尔滨市",
    "三亚市",
    "昆明市",
    "深圳市",
    "广州市",
    "长春市",
    "银川市",
    "珠海市",
  ], // 1月：冰雪节 + 避寒游
  2: [
    "三亚市",
    "厦门市",
    "拉萨市",
    "大理市",
    "桂林市",
    "昆明市",
    "珠海市",
    "贵阳市",
  ], // 2月：春节避寒 + 拉萨冬日

  // 春季 - 赏花踏青
  3: [
    "杭州市",
    "苏州市",
    "黄山市",
    "南京市",
    "桂林市",
    "洛阳市",
    "青岛市",
    "烟台市",
  ], // 3月：江南春色 + 赏花
  4: [
    "西安市",
    "洛阳市",
    "青岛市",
    "重庆市",
    "成都市",
    "大连市",
    "承德市",
    "烟台市",
  ], // 4月：古都春光 + 西部 + 海滨
  5: [
    "丽江市",
    "大理市",
    "张家界市",
    "九寨沟县",
    "稻城市",
    "拉萨市",
    "昆明市",
    "贵阳市",
  ], // 5月：高原春季 + 山水

  // 夏季 - 避暑胜地
  6: [
    "青岛市",
    "大连市",
    "承德市",
    "呼伦贝尔",
    "长春市",
    "哈尔滨市",
    "烟台市",
    "秦皇岛市",
  ], // 6月：海滨 + 草原避暑
  7: [
    "拉萨市",
    "青海湖",
    "呼伦贝尔",
    "长白山",
    "贵阳市",
    "承德市",
    "银川市",
    "昆明市",
  ], // 7月：高原 + 草原 + 山区
  8: [
    "承德市",
    "秦皇岛市",
    "烟台市",
    "昆明市",
    "银川市",
    "大连市",
    "青岛市",
    "长春市",
  ], // 8月：北方避暑城市

  // 秋季 - 赏秋登高
  9: [
    "北京市",
    "西安市",
    "南京市",
    "苏州市",
    "杭州市",
    "洛阳市",
    "承德市",
    "长春市",
  ], // 9月：古都秋韵
  10: [
    "九寨沟县",
    "黄山市",
    "张家界市",
    "桂林市",
    "丽江市",
    "稻城市",
    "北京市",
    "西安市",
  ], // 10月：山水秋色 + 古都
  11: [
    "厦门市",
    "深圳市",
    "广州市",
    "三亚市",
    "珠海市",
    "昆明市",
    "大理市",
    "桂林市",
  ], // 11月：南方温暖

  // 冬季 - 避寒 + 冰雪
  12: [
    "三亚市",
    "哈尔滨市",
    "厦门市",
    "昆明市",
    "北京市",
    "深圳市",
    "长春市",
    "广州市",
  ], // 12月：避寒 + 冰雪 + 年末游
};

export function findCity(name) {
  for (const group of hotRegions) {
    const c = group.cities.find((x) => x.name === name);
    if (c) return c;
  }
  return null;
}

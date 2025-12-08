// POI标签和数据处理工具函数

// 提取餐厅招牌菜
export const extractSignatureDishes = (restaurant) => {
  if (
    !restaurant ||
    !restaurant.tag ||
    typeof restaurant.tag !== "string"
  ) {
    return restaurant.tags || [];
  }

  const dishes = [];
  const tagContent = restaurant.tag;
  
  // 支持多种分隔符
  const separators = [",", "，", "、", ";", "；", "|"];
  let tagTokens = [tagContent];
  
  // 找到合适的分隔符并分割
  for (const separator of separators) {
    if (tagContent.includes(separator)) {
      tagTokens = tagContent.split(separator);
      break;
    }
  }

  // 过滤掉明显的非菜品标签
  const excludeKeywords = [
    "餐饮服务", "中餐厅", "外国餐厅", "快餐厅", "咖啡厅", 
    "茶艺馆", "酒吧", "商务服务", "生活服务", "环境", "价格", 
    "停车", "位置", "交通", "商圈", "商场", "广场", "设施", 
    "装修", "氛围", "音乐", "包间", "营业时间", "电话", "地址"
  ];

  tagTokens.forEach((token) => {
    const trimmedToken = token.trim();
    
    // 基本过滤：长度合理，不为空
    if (trimmedToken.length > 0 && trimmedToken.length <= 20) {
      // 检查是否包含排除关键词
      const shouldExclude = excludeKeywords.some(keyword => 
        trimmedToken.includes(keyword)
      );
      
      if (!shouldExclude) {
        dishes.push(trimmedToken);
      }
    }
  });

  return [...new Set(dishes)]; // 去重
};

// 通用提取标签
export const extractTags = (poi) => {
  const tags = [];
  
  // 处理type字段 - 过滤掉通用的服务分类
  if (poi.type && typeof poi.type === 'string') {
    const typeSegments = poi.type.split(';').filter(Boolean).filter(token => {
      const trimmed = token.trim();
      // 过滤掉通用的餐饮服务分类
      const excludeTypes = [
        "餐饮服务", "中餐厅", "外国餐厅", "快餐厅", "咖啡厅", 
        "茶艺馆", "酒吧", "食品", "商务服务", "生活服务"
      ];
      return !excludeTypes.some(exclude => trimmed.includes(exclude));
    });
    tags.push(...typeSegments);
  }
  
  // 处理tag字段 - 只提取推荐菜品相关内容
  if (poi.tag && typeof poi.tag === 'string') {
    // 如果是餐厅类型，尝试提取招牌菜
    if (poi.type && (poi.type.includes('餐饮') || poi.type.includes('餐厅'))) {
        const dishTags = extractSignatureDishes(poi);
        tags.push(...dishTags);
    } else {
        // 其他类型直接添加tag内容（简单分割）
        tags.push(...poi.tag.split(/[,，;；、|]/).filter(t => t.trim()));
    }
  }
  
  // 从business_area提取
  if (poi.business_area && typeof poi.business_area === 'string') {
    tags.push(poi.business_area);
  }
  
  // 去重并过滤空值，确保tag是字符串
  return [...new Set(tags)].filter(tag => tag && typeof tag === 'string' && tag.trim().length > 0);
};

// 提取景点标签
export const extractAttractionTags = (attraction) => {
  return extractTags(attraction);
};

// 提取酒店标签
export const extractHotelTags = (hotel) => {
  return extractTags(hotel);
};


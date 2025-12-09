import { computed } from 'vue'

export function usePoiData(poi) {
  const getRating = () => {
    let rating = null
    // 高德API数据格式
    if (poi.biz_ext?.rating && poi.biz_ext.rating > 0) {
      rating = Number(poi.biz_ext.rating)
    }
    // 原有格式
    else if (poi.poi?.rating && poi.poi.rating > 0) {
      rating = Number(poi.poi.rating)
    }
    else if (poi.rating && poi.rating > 0) {
      rating = Number(poi.rating)
    }
    
    return rating ? Number(rating.toFixed(1)) : null
  }

  const getCost = () => {
    // 高德API数据格式
    if (poi.biz_ext?.cost && poi.biz_ext.cost !== '0.00') {
      return poi.biz_ext.cost
    }
    // 原有格式
    if (poi.cost) {
      return poi.cost
    }
    return null
  }

  const getImages = () => {
    // 高德API数据格式 - photos字段
    if (poi.photos && Array.isArray(poi.photos)) {
      return poi.photos.map(photo => ({
        url: photo.url || photo,
        alt: photo.title || poi.name
      }))
    }
    
    // 优先使用POI的images
    if (poi.poi?.images && Array.isArray(poi.poi.images)) {
      return poi.poi.images
    }
    
    // 使用基本images
    if (poi.images && Array.isArray(poi.images)) {
      return poi.images
    }
    
    return []
  }

  const getAddress = () => {
    // 高德API数据格式
    if (poi.address) {
      return poi.address
    }
    // 原有格式
    if (poi.poi?.address) {
      return poi.poi.address
    }
    if (poi.location && typeof poi.location === 'string' && !poi.location.includes(',')) {
       // Sometimes location field might be misused as address if not coordinates
       return poi.location
    }
    return null
  }

  const getTelephone = () => {
    // 高德API数据格式
    if (poi.tel) {
      return poi.tel
    }
    // 原有格式
    if (poi.poi?.tel) {
      return poi.poi.tel
    }
    return null
  }

  const getBusinessArea = () => {
    // 高德API数据格式
    if (poi.business_area) {
      return poi.business_area
    }
    // 原有格式
    if (poi.poi?.businessArea) {
      return poi.poi.businessArea
    }
    return null
  }

  const getDistrict = () => {
    // 高德API数据格式
    if (poi.adname) {
      return poi.adname
    }
    // 原有格式
    if (poi.poi?.district) {
      return poi.poi.district
    }
    return null
  }

  const getWebsite = () => {
    // 高德API数据格式
    if (poi.website && Array.isArray(poi.website) && poi.website.length > 0) {
      return poi.website[0]
    }
    if (poi.website && typeof poi.website === 'string') {
      return poi.website
    }
    // 原有格式
    if (poi.poi?.website) {
      return poi.poi.website
    }
    return null
  }

  const getTags = () => {
    const tags = []
    
    // 高德API数据格式 - tag字段（逗号分隔）
    if (poi.tag && typeof poi.tag === 'string') {
      tags.push(...poi.tag.split(',').filter(tag => tag.trim()))
    }
    
    // 原有格式
    if (poi.tags && Array.isArray(poi.tags)) {
      tags.push(...poi.tags)
    }
    
    return tags
  }

  const getOpenTime = () => {
    // 高德API数据格式
    if (poi.opentime) {
      return poi.opentime
    }
    // 原有格式
    if (poi.openTime) {
      return poi.openTime
    }
    if (poi.poi?.openTime) {
      return poi.poi.openTime
    }
    return null
  }

  const getCoordinates = () => {
    // 高德API数据格式 - location字段（经度,纬度）
    if (poi.location && typeof poi.location === 'string' && poi.location.includes(',')) {
      const coords = poi.location.split(',')
      if (coords.length >= 2) {
        return [parseFloat(coords[0]), parseFloat(coords[1])]
      }
    }
    
    // 原有格式
    if (poi.coordinates && Array.isArray(poi.coordinates)) {
      return poi.coordinates
    }
    if (poi.poi?.coordinates && Array.isArray(poi.poi.coordinates)) {
      return poi.poi.coordinates
    }
    
    return null
  }

  const getDescription = () => {
    if (poi.poi?.description) {
      return poi.poi.description
    }
    if (poi.description) {
      return poi.description
    }
    return null
  }
  
  return {
    getRating,
    getCost,
    getImages,
    getAddress,
    getTelephone,
    getBusinessArea,
    getDistrict,
    getWebsite,
    getTags,
    getOpenTime,
    getCoordinates,
    getDescription
  }
}


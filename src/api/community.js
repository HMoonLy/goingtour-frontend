import { http } from "./request.js";

/**
 * 社区/广场模块 API
 */
export const communityApi = {
  // ========== 帖子相关 ==========

  /**
   * 发布帖子
   * @param {Object} data 
   * {
   *   tripId: number,
   *   title: string,
   *   content: string,
   *   rating: number, // 1.0 - 5.0
   *   tags: string[],
   *   coverImage: string // 可选
   *   tripSummary: string // 行程摘要
   * }
   */
  publishPost(data) {
    return http.post('/community/posts', data);
  },

  /**
   * 获取广场帖子列表
   * @param {Object} params
   * {
   *   page: number,
   *   pageSize: number,
   *   sort: 'latest' | 'hot',
   *   tag: string
   * }
   */
  getPosts(params) {
    return http.get('/community/posts', params);
  },

  /**
   * 获取帖子详情
   * @param {number} id 帖子ID
   */
  getPostDetail(id) {
    return http.get(`/community/posts/${id}`);
  },

  /**
   * 删除帖子
   * @param {number} id 帖子ID
   */
  deletePost(id) {
    return http.delete(`/community/posts/${id}`);
  },

  // ========== 交互相关 ==========

  /**
   * 帖子交互（点赞/收藏）
   * @param {number} id 帖子ID
   * @param {string} type 'like' | 'collect'
   * @param {string} action 'add' | 'remove'
   */
  interact(id, type, action) {
    return http.post(`/community/posts/${id}/interact`, { type, action });
  },

  /**
   * 复制/Fork行程
   * @param {number} id 帖子ID
   */
  forkTrip(id) {
    return http.post(`/community/posts/${id}/fork`);
  },

  // ========== 评论相关 (预留) ==========

  /**
   * 获取评论列表
   * @param {number} postId 帖子ID
   * @param {Object} params { page, pageSize }
   */
  getComments(postId, params) {
    return http.get(`/community/posts/${postId}/comments`, params);
  },

  /**
   * 发表评论
   * @param {number} postId 帖子ID
   * @param {Object} data { content, parentId }
   */
  addComment(postId, data) {
    return http.post(`/community/posts/${postId}/comments`, data);
  }
};


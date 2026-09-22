import http from './http'

const BASE = '/boards'

export default {
  // 게시판 마스터
  getBoards() {
    return http.get(BASE)
  },
  getBoard(bbsId) {
    return http.get(`${BASE}/${bbsId}`)
  },

  // 게시글
  getPostList(bbsId, page = 1, pageSize = 10, searchType = '', searchKeyword = '') {
    return http.get(`${BASE}/${bbsId}/posts`, {
      params: { page, pageSize, searchType: searchType || undefined, searchKeyword: searchKeyword || undefined },
    })
  },
  getPost(bbsId, postId) {
    return http.get(`${BASE}/${bbsId}/posts/${postId}`)
  },
  createPost(bbsId, payload) {
    return http.post(`${BASE}/${bbsId}/posts`, payload)
  },
  updatePost(bbsId, postId, payload) {
    return http.put(`${BASE}/${bbsId}/posts/${postId}`, payload)
  },
  deletePost(bbsId, postId) {
    return http.delete(`${BASE}/${bbsId}/posts/${postId}`)
  },
  likePost(bbsId, postId) {
    return http.post(`${BASE}/${bbsId}/posts/${postId}/like`)
  },
  createReply(bbsId, postId, payload) {
    return http.post(`${BASE}/${bbsId}/posts/${postId}/reply`, payload)
  },

  // 댓글
  getComments(bbsId, postId) {
    return http.get(`${BASE}/${bbsId}/posts/${postId}/comments`)
  },
  createComment(bbsId, postId, payload) {
    return http.post(`${BASE}/${bbsId}/posts/${postId}/comments`, payload)
  },
  updateComment(bbsId, commentId, payload) {
    return http.put(`${BASE}/${bbsId}/comments/${commentId}`, payload)
  },
  deleteComment(bbsId, commentId) {
    return http.delete(`${BASE}/${bbsId}/comments/${commentId}`)
  },

  // 첨부파일
  uploadFiles(bbsId, formData) {
    return http.post(`${BASE}/${bbsId}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    })
  },
  getFiles(bbsId, atchFileGrpId) {
    return http.get(`${BASE}/${bbsId}/files`, { params: { atchFileGrpId } })
  },
  deleteFile(bbsId, atchFileGrpId, fileSeq) {
    return http.delete(`${BASE}/${bbsId}/files`, { params: { atchFileGrpId, fileSeq } })
  },
  downloadFile(bbsId, atchFileGrpId, fileSeq) {
    return http.get(`${BASE}/${bbsId}/files/${atchFileGrpId}/${fileSeq}/download`, {
      responseType: 'blob',
      timeout: 120000,
    })
  },
}

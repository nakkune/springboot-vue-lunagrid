package com.example.portal.service;

import com.example.portal.dto.BoardCommentRequest;
import com.example.portal.dto.BoardCommentResponse;
import com.example.portal.dto.BoardPostRequest;
import com.example.portal.dto.BoardPostResponse;
import com.example.portal.dto.PagedResponse;
import com.example.portal.entity.BoardComment;
import com.example.portal.entity.BoardMaster;
import com.example.portal.entity.BoardPost;
import com.example.portal.exception.BusinessException;
import com.example.portal.mapper.AttachFileMapper;
import com.example.portal.mapper.BoardCommentMapper;
import com.example.portal.mapper.BoardMasterMapper;
import com.example.portal.mapper.BoardPostMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardMasterMapper boardMasterMapper;
    private final BoardPostMapper boardPostMapper;
    private final BoardCommentMapper boardCommentMapper;
    private final AttachFileMapper attachFileMapper;
    private final AttachFileService attachFileService;

    // =====================================================================
    // 게시판 마스터
    // =====================================================================

    /** 활성 게시판 목록 */
    @Transactional(readOnly = true)
    public List<BoardMaster> getActiveBoards() {
        return boardMasterMapper.selectActive();
    }

    /** 게시판 상세 */
    @Transactional(readOnly = true)
    public BoardMaster getBoard(String bbsId) {
        BoardMaster board = boardMasterMapper.selectByBbsId(bbsId);
        if (board == null) {
            throw new BusinessException(HttpStatus.NOT_FOUND, "게시판을 찾을 수 없습니다.");
        }
        return board;
    }

    // =====================================================================
    // 게시글
    // =====================================================================

    /** 게시글 목록 (페이징 + 검색) */
    @Transactional(readOnly = true)
    public PagedResponse<BoardPostResponse> getPostList(String bbsId, int page, int pageSize,
                                                         String searchType, String searchKeyword) {
        getBoard(bbsId);

        int offset = (page - 1) * pageSize;
        List<BoardPost> posts = boardPostMapper.selectPostList(bbsId, offset, pageSize, searchType, searchKeyword);
        int totalItems = boardPostMapper.countPostList(bbsId, searchType, searchKeyword);

        List<BoardPostResponse> items = posts.stream()
                .map(BoardPostResponse::new)
                .collect(Collectors.toList());

        return new PagedResponse<>(items, page, pageSize, totalItems);
    }

    /** 게시글 상세 조회 (+ 조회수 증가) */
    @Transactional
    public BoardPostResponse getPost(Long postId, String currentUserId) {
        BoardPost post = boardPostMapper.selectByPostId(postId);
        if (post == null || "Y".equals(post.getDelYn())) {
            throw new BusinessException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다.");
        }

        // 조회수 증가 (같은 세션/IP 중복 방지는 서비스 레이어에서 처리 가능)
        boardPostMapper.incrementViewCnt(postId);
        post.setViewCnt(post.getViewCnt() + 1);

        BoardPostResponse resp = BoardPostResponse.detail(post, currentUserId);
        resp.setFiles(attachFileService.getByGrpId(post.getAtchFileGrpId()));
        return resp;
    }

    /** 새 원글 등록 */
    @Transactional
    public BoardPostResponse createPost(String bbsId, BoardPostRequest request,
                                         String userNm, String userId, String clientIp) {
        getBoard(bbsId); // 게시판 존재 여부 확인

        BoardPost post = new BoardPost();
        post.setBbsId(bbsId);
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setCategoryCd(request.getCategoryCd());
        post.setNoticeYn(request.getNoticeYn() != null ? request.getNoticeYn() : "N");
        post.setSecretYn(request.getSecretYn() != null ? request.getSecretYn() : "N");
        post.setSecretPwd(request.getSecretPwd());
        post.setAtchFileGrpId(request.getAtchFileGrpId());
        post.setRegUserNm(userNm);
        post.setRegUserId(userId);
        post.setRegIp(clientIp);

        boardPostMapper.insertPost(post);

        // 등록된 글의 ID를 시퀀스에서 가져와서 설정
        // MyBatis CURRVAL을 사용하므로 별도 조회 필요
        // 원글의 GROUP_NO는 자기 자신의 POST_ID
        return new BoardPostResponse(post);
    }

    /** 답글 등록 */
    @Transactional
    public BoardPostResponse createReply(String bbsId, Long upperPostId, BoardPostRequest request,
                                          String userNm, String userId, String clientIp) {
        BoardPost upperPost = boardPostMapper.selectByPostId(upperPostId);
        if (upperPost == null || "Y".equals(upperPost.getDelYn())) {
            throw new BusinessException(HttpStatus.NOT_FOUND, "원글을 찾을 수 없습니다.");
        }

        // 그룹 내 최대 sortOrd + 1
        Integer maxSortOrd = boardPostMapper.selectMaxSortOrd(upperPost.getGroupNo());
        int newSortOrd = (maxSortOrd != null ? maxSortOrd : 0) + 1;

        BoardPost reply = new BoardPost();
        reply.setBbsId(bbsId);
        reply.setTitle(request.getTitle());
        reply.setContent(request.getContent());
        reply.setGroupNo(upperPost.getGroupNo());
        reply.setDepthNo(upperPost.getDepthNo() + 1);
        reply.setSortOrd(newSortOrd);
        reply.setCategoryCd(request.getCategoryCd());
        reply.setSecretYn(request.getSecretYn() != null ? request.getSecretYn() : "N");
        reply.setSecretPwd(request.getSecretPwd());
        reply.setRegUserNm(userNm);
        reply.setRegUserId(userId);
        reply.setRegIp(clientIp);

        boardPostMapper.insertReply(reply);

        return new BoardPostResponse(reply);
    }

    /** 게시글 수정 */
    @Transactional
    public BoardPostResponse updatePost(Long postId, BoardPostRequest request, String userId) {
        BoardPost existing = boardPostMapper.selectByPostId(postId);
        if (existing == null || "Y".equals(existing.getDelYn())) {
            throw new BusinessException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다.");
        }
        if (!userId.equals(existing.getRegUserId())) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "수정 권한이 없습니다.");
        }

        existing.setTitle(request.getTitle());
        existing.setContent(request.getContent());
        existing.setCategoryCd(request.getCategoryCd());
        existing.setNoticeYn(request.getNoticeYn() != null ? request.getNoticeYn() : "N");
        existing.setSecretYn(request.getSecretYn() != null ? request.getSecretYn() : "N");
        existing.setSecretPwd(request.getSecretPwd());
        existing.setAtchFileGrpId(request.getAtchFileGrpId());
        existing.setModUserId(userId);

        boardPostMapper.updatePost(existing);

        return BoardPostResponse.detail(existing, userId);
    }

    /** 게시글 삭제 (Soft Delete) */
    @Transactional
    public void deletePost(Long postId, String userId) {
        BoardPost existing = boardPostMapper.selectByPostId(postId);
        if (existing == null || "Y".equals(existing.getDelYn())) {
            throw new BusinessException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다.");
        }
        if (!userId.equals(existing.getRegUserId())) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "삭제 권한이 없습니다.");
        }

        boardPostMapper.deletePost(postId, userId);

        // 첨부파일이 있으면 함께 삭제
        if (existing.getAtchFileGrpId() != null) {
            attachFileMapper.deleteByGrpId(existing.getAtchFileGrpId());
        }
    }

    /** 좋아요 증가 */
    @Transactional
    public void likePost(Long postId) {
        BoardPost existing = boardPostMapper.selectByPostId(postId);
        if (existing == null || "Y".equals(existing.getDelYn())) {
            throw new BusinessException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다.");
        }
        boardPostMapper.incrementLikeCnt(postId);
    }

    // =====================================================================
    // 댓글
    // =====================================================================

    /** 댓글 목록 조회 */
    @Transactional(readOnly = true)
    public List<BoardCommentResponse> getComments(Long postId, String currentUserId) {
        List<BoardComment> comments = boardCommentMapper.selectByPostId(postId);
        return comments.stream()
                .map(c -> new BoardCommentResponse(c, currentUserId))
                .collect(Collectors.toList());
    }

    /** 댓글 등록 */
    @Transactional
    public BoardCommentResponse createComment(Long postId, BoardCommentRequest request,
                                               String userNm, String userId, String clientIp) {
        BoardPost post = boardPostMapper.selectByPostId(postId);
        if (post == null || "Y".equals(post.getDelYn())) {
            throw new BusinessException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다.");
        }

        BoardComment comment = new BoardComment();
        comment.setPostId(postId);
        comment.setContent(request.getContent());
        comment.setSecretYn(request.getSecretYn() != null ? request.getSecretYn() : "N");
        comment.setUpperCommentId(request.getUpperCommentId());
        comment.setRegUserNm(userNm);
        comment.setRegUserId(userId);
        comment.setRegIp(clientIp);

        boardCommentMapper.insertComment(comment);

        // 댓글 수 업데이트 (비정규화)
        boardPostMapper.updateCommentCnt(postId);

        return new BoardCommentResponse(comment, userId);
    }

    /** 댓글 수정 */
    @Transactional
    public BoardCommentResponse updateComment(Long commentId, BoardCommentRequest request, String userId) {
        BoardComment existing = boardCommentMapper.selectByCommentId(commentId);
        if (existing == null || "Y".equals(existing.getDelYn())) {
            throw new BusinessException(HttpStatus.NOT_FOUND, "댓글을 찾을 수 없습니다.");
        }
        if (!userId.equals(existing.getRegUserId())) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "수정 권한이 없습니다.");
        }

        existing.setContent(request.getContent());
        existing.setModUserId(userId);

        boardCommentMapper.updateComment(existing);

        return new BoardCommentResponse(existing, userId);
    }

    /** 댓글 삭제 (Soft Delete) */
    @Transactional
    public void deleteComment(Long commentId, String userId) {
        BoardComment existing = boardCommentMapper.selectByCommentId(commentId);
        if (existing == null || "Y".equals(existing.getDelYn())) {
            throw new BusinessException(HttpStatus.NOT_FOUND, "댓글을 찾을 수 없습니다.");
        }

        boardCommentMapper.deleteComment(commentId);

        // 댓글 수 업데이트 (비정규화)
        boardPostMapper.updateCommentCnt(existing.getPostId());
    }
}

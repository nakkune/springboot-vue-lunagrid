package com.example.portal.controller;

import com.example.portal.dto.BoardCommentRequest;
import com.example.portal.dto.BoardCommentResponse;
import com.example.portal.dto.BoardPostRequest;
import com.example.portal.dto.BoardPostResponse;
import com.example.portal.dto.PagedResponse;
import com.example.portal.entity.BoardMaster;
import com.example.portal.service.BoardService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 게시판 REST API
 *
 * GET    /api/boards                     - 활성 게시판 목록
 * GET    /api/boards/{bbsId}             - 게시판 상세
 * GET    /api/boards/{bbsId}/posts       - 게시글 목록 (페이징)
 * POST   /api/boards/{bbsId}/posts       - 게시글 등록
 * GET    /api/boards/{bbsId}/posts/{id}  - 게시글 상세
 * PUT    /api/boards/{bbsId}/posts/{id}  - 게시글 수정
 * DELETE /api/boards/{bbsId}/posts/{id}  - 게시글 삭제
 * POST   /api/boards/{bbsId}/posts/{id}/like - 좋아요
 * POST   /api/boards/{bbsId}/posts/{id}/reply - 답글 등록
 *
 * GET    /api/boards/{bbsId}/posts/{id}/comments  - 댓글 목록
 * POST   /api/boards/{bbsId}/posts/{id}/comments  - 댓글 등록
 * PUT    /api/boards/{bbsId}/comments/{commentId} - 댓글 수정
 * DELETE /api/boards/{bbsId}/comments/{commentId} - 댓글 삭제
 */
@Slf4j
@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    // =====================================================================
    // 게시판 마스터
    // =====================================================================

    @GetMapping
    public ResponseEntity<List<BoardMaster>> getActiveBoards() {
        return ResponseEntity.ok(boardService.getActiveBoards());
    }

    @GetMapping("/{bbsId}")
    public ResponseEntity<BoardMaster> getBoard(@PathVariable String bbsId) {
        return ResponseEntity.ok(boardService.getBoard(bbsId));
    }

    // =====================================================================
    // 게시글
    // =====================================================================

    @GetMapping("/{bbsId}/posts")
    public ResponseEntity<PagedResponse<BoardPostResponse>> getPostList(
            @PathVariable String bbsId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String searchType,
            @RequestParam(required = false) String searchKeyword) {
        return ResponseEntity.ok(boardService.getPostList(bbsId, page, pageSize, searchType, searchKeyword));
    }

    @GetMapping("/{bbsId}/posts/{postId}")
    public ResponseEntity<BoardPostResponse> getPost(
            @PathVariable String bbsId,
            @PathVariable Long postId,
            Authentication authentication) {
        return ResponseEntity.ok(boardService.getPost(postId, authentication.getName()));
    }

    @PostMapping("/{bbsId}/posts")
    public ResponseEntity<BoardPostResponse> createPost(
            @PathVariable String bbsId,
            @Valid @RequestBody BoardPostRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest) {
        String clientIp = getClientIp(httpRequest);
        BoardPostResponse created = boardService.createPost(
                bbsId, request,
                authentication.getName(), authentication.getName(), clientIp);
        return ResponseEntity.status(201).body(created);
    }

    @PutMapping("/{bbsId}/posts/{postId}")
    public ResponseEntity<BoardPostResponse> updatePost(
            @PathVariable String bbsId,
            @PathVariable Long postId,
            @Valid @RequestBody BoardPostRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(boardService.updatePost(postId, request, authentication.getName()));
    }

    @DeleteMapping("/{bbsId}/posts/{postId}")
    public ResponseEntity<Void> deletePost(
            @PathVariable String bbsId,
            @PathVariable Long postId,
            Authentication authentication) {
        boardService.deletePost(postId, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{bbsId}/posts/{postId}/like")
    public ResponseEntity<Map<String, String>> likePost(
            @PathVariable String bbsId,
            @PathVariable Long postId) {
        boardService.likePost(postId);
        return ResponseEntity.ok(Map.of("message", "좋아요가 반영되었습니다."));
    }

    @PostMapping("/{bbsId}/posts/{postId}/reply")
    public ResponseEntity<BoardPostResponse> createReply(
            @PathVariable String bbsId,
            @PathVariable Long postId,
            @Valid @RequestBody BoardPostRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest) {
        String clientIp = getClientIp(httpRequest);
        BoardPostResponse created = boardService.createReply(
                bbsId, postId, request,
                authentication.getName(), authentication.getName(), clientIp);
        return ResponseEntity.status(201).body(created);
    }

    // =====================================================================
    // 댓글
    // =====================================================================

    @GetMapping("/{bbsId}/posts/{postId}/comments")
    public ResponseEntity<List<BoardCommentResponse>> getComments(
            @PathVariable String bbsId,
            @PathVariable Long postId,
            Authentication authentication) {
        return ResponseEntity.ok(boardService.getComments(postId, authentication.getName()));
    }

    @PostMapping("/{bbsId}/posts/{postId}/comments")
    public ResponseEntity<BoardCommentResponse> createComment(
            @PathVariable String bbsId,
            @PathVariable Long postId,
            @Valid @RequestBody BoardCommentRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest) {
        String clientIp = getClientIp(httpRequest);
        BoardCommentResponse created = boardService.createComment(
                postId, request,
                authentication.getName(), authentication.getName(), clientIp);
        return ResponseEntity.status(201).body(created);
    }

    @PutMapping("/{bbsId}/comments/{commentId}")
    public ResponseEntity<BoardCommentResponse> updateComment(
            @PathVariable String bbsId,
            @PathVariable Long commentId,
            @Valid @RequestBody BoardCommentRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(boardService.updateComment(commentId, request, authentication.getName()));
    }

    @DeleteMapping("/{bbsId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String bbsId,
            @PathVariable Long commentId,
            Authentication authentication) {
        boardService.deleteComment(commentId, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    // =====================================================================
    // 유틸
    // =====================================================================

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // X-Forwarded-For가 여러 개일 경우 첫 번째 IP
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}

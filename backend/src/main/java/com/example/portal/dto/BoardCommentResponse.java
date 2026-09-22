package com.example.portal.dto;

import com.example.portal.entity.BoardComment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/** 댓글 응답 DTO */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardCommentResponse {

    private Long commentId;
    private Long postId;
    private Long upperCommentId;
    private String content;
    private String secretYn;
    private String regUserNm;
    private String regDt;
    private String modDt;
    private boolean ownerYn;

    public BoardCommentResponse(BoardComment comment, String currentUserId) {
        this.commentId = comment.getCommentId();
        this.postId = comment.getPostId();
        this.upperCommentId = comment.getUpperCommentId();
        this.content = comment.getContent();
        this.secretYn = comment.getSecretYn();
        this.regUserNm = comment.getRegUserNm();
        this.regDt = formatDt(comment.getRegDt());
        this.modDt = formatDt(comment.getModDt());
        this.ownerYn = currentUserId != null && currentUserId.equals(comment.getRegUserId());
    }

    private String formatDt(LocalDateTime dt) {
        if (dt == null) return null;
        return dt.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
    }
}

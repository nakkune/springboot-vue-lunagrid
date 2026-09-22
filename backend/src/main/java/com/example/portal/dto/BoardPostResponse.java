package com.example.portal.dto;

import com.example.portal.entity.BoardPost;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/** 게시글 응답 DTO (목록/상세 공용) */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardPostResponse {

    private Long postId;
    private String bbsId;
    private String title;
    private String content;

    private Long groupNo;
    private Integer depthNo;
    private Integer sortOrd;

    private String categoryCd;
    private String noticeYn;
    private String secretYn;

    private Long viewCnt;
    private Long likeCnt;
    private Integer commentCnt;

    private String regUserNm;
    private String regDt;
    private String modDt;

    private String atchFileGrpId;
    private String fileYn;
    private List<AttachFileResponse> files;

    private boolean ownerYn;

    /** 목록용 (content 미포함) */
    public BoardPostResponse(BoardPost post) {
        this.postId = post.getPostId();
        this.bbsId = post.getBbsId();
        this.title = post.getTitle();
        this.groupNo = post.getGroupNo();
        this.depthNo = post.getDepthNo();
        this.sortOrd = post.getSortOrd();
        this.categoryCd = post.getCategoryCd();
        this.noticeYn = post.getNoticeYn();
        this.secretYn = post.getSecretYn();
        this.viewCnt = post.getViewCnt();
        this.likeCnt = post.getLikeCnt();
        this.commentCnt = post.getCommentCnt();
        this.regUserNm = post.getRegUserNm();
        this.regDt = formatDt(post.getRegDt());
        this.modDt = formatDt(post.getModDt());
        this.atchFileGrpId = post.getAtchFileGrpId();
        this.fileYn = post.getFileYn();
    }

    /** 상세용 (content 포함) */
    public static BoardPostResponse detail(BoardPost post, String currentUserId) {
        BoardPostResponse resp = new BoardPostResponse(post);
        resp.setContent(post.getContent());
        resp.setOwnerYn(currentUserId != null && currentUserId.equals(post.getRegUserId()));
        return resp;
    }

    private String formatDt(LocalDateTime dt) {
        if (dt == null) return null;
        return dt.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
    }
}

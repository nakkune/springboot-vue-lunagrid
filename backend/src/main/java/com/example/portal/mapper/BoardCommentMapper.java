package com.example.portal.mapper;

import com.example.portal.entity.BoardComment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface BoardCommentMapper {

    /** 게시글 댓글 목록 조회 */
    List<BoardComment> selectByPostId(@Param("postId") Long postId);

    /** 댓글 상세 조회 */
    BoardComment selectByCommentId(@Param("commentId") Long commentId);

    /** 댓글 등록 */
    int insertComment(BoardComment comment);

    /** 댓글 수정 */
    int updateComment(BoardComment comment);

    /** 댓글 Soft Delete */
    int deleteComment(@Param("commentId") Long commentId);

    /** 게시글의 댓글 건수 */
    int countByPostId(@Param("postId") Long postId);
}

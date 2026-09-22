package com.example.portal.mapper;

import com.example.portal.entity.BoardPost;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface BoardPostMapper {

    /** 목록 조회 (공지 우선, 페이징, 검색) */
    List<BoardPost> selectPostList(
            @Param("bbsId") String bbsId,
            @Param("offset") int offset,
            @Param("pageSize") int pageSize,
            @Param("searchType") String searchType,
            @Param("searchKeyword") String searchKeyword);

    /** 목록 조회용 전체 건수 */
    int countPostList(@Param("bbsId") String bbsId,
                      @Param("searchType") String searchType,
                      @Param("searchKeyword") String searchKeyword);

    /** 상세 조회 */
    BoardPost selectByPostId(@Param("postId") Long postId);

    /** 원글 등록 (시퀀스 사용) */
    int insertPost(BoardPost post);

    /** 답글 등록 */
    int insertReply(BoardPost post);

    /** 게시글 수정 */
    int updatePost(BoardPost post);

    /** Soft Delete */
    int deletePost(@Param("postId") Long postId, @Param("delUserId") String delUserId);

    /** 조회수 증가 */
    int incrementViewCnt(@Param("postId") Long postId);

    /** 좋아요 증가 */
    int incrementLikeCnt(@Param("postId") Long postId);

    /** 댓글 수 업데이트 (비정규화) */
    int updateCommentCnt(@Param("postId") Long postId);

    /** 그룹 내 최대 sortOrd 조회 */
    Integer selectMaxSortOrd(@Param("groupNo") Long groupNo);
}

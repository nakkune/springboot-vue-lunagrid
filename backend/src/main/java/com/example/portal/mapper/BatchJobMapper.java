package com.example.portal.mapper;

import com.example.portal.entity.BatchJob;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface BatchJobMapper {

    List<BatchJob> selectAll();

    BatchJob selectByJobId(@Param("jobId") String jobId);

    int countByJobId(@Param("jobId") String jobId);

    int insertBatchJob(BatchJob batchJob);

    /** 동적 UPDATE (null 필드는 제외, MOD_DT 는 항상 SYSDATE) */
    int updateBatchJob(BatchJob batchJob);

    int deleteBatchJob(@Param("jobId") String jobId);
}

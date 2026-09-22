package com.example.portal.service;

import com.example.portal.dto.CommonCodeBatchRequest;
import com.example.portal.entity.CommonDetailCode;
import com.example.portal.entity.CommonGroupCode;
import com.example.portal.exception.BusinessException;
import com.example.portal.mapper.CommonCodeMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommonCodeService {

    private final CommonCodeMapper commonCodeMapper;

    // =========================================================================
    // 1. 공통 그룹 코드 (TB_COM_GRP_CD)
    // =========================================================================

    /** 그룹 코드 목록 조회 */
    @Transactional(readOnly = true)
    public List<CommonGroupCode> getGroupCodes(String grpCd, String grpNm, String useYn) {
        return commonCodeMapper.selectGroupCodes(grpCd, grpNm, useYn);
    }

    /** 단일 그룹 코드 조회 */
    @Transactional(readOnly = true)
    public CommonGroupCode getGroupCode(String grpCd) {
        return commonCodeMapper.selectGroupCodeByCd(grpCd);
    }

    /**
     * 그룹 코드 일괄 저장 (신규 등록, 수정, 삭제)
     * [핵심 요구사항] 삭제 시 해당 그룹 코드에 속한 공통 상세 코드가 먼저 삭제된 후 공통 그룹 코드가 삭제됨.
     */
    @Transactional
    public void saveGroupCodes(CommonCodeBatchRequest<CommonGroupCode> batchRequest, String userId) {
        if (batchRequest == null) return;

        // 1. 삭제 처리 (공통 상세 코드 선행 삭제 -> 공통 그룹 코드 삭제)
        if (batchRequest.getDeleted() != null) {
            for (CommonGroupCode item : batchRequest.getDeleted()) {
                if (StringUtils.hasText(item.getGrpCd())) {
                    deleteGroupCodeWithDetails(item.getGrpCd());
                }
            }
        }

        // 2. 신규 등록 처리
        if (batchRequest.getCreated() != null) {
            for (CommonGroupCode item : batchRequest.getCreated()) {
                if (!StringUtils.hasText(item.getGrpCd())) {
                    throw new BusinessException(HttpStatus.BAD_REQUEST, "그룹 코드는 필수 입력 항목입니다.");
                }
                if (!StringUtils.hasText(item.getGrpCdNm()) && StringUtils.hasText(item.getGrpNm())) {
                    item.setGrpCdNm(item.getGrpNm());
                }
                if (!StringUtils.hasText(item.getGrpCdDesc()) && StringUtils.hasText(item.getGrpDesc())) {
                    item.setGrpCdDesc(item.getGrpDesc());
                }
                if (!StringUtils.hasText(item.getGrpCdNm())) {
                    throw new BusinessException(HttpStatus.BAD_REQUEST, "그룹 코드명은 필수 입력 항목입니다.");
                }
                if (commonCodeMapper.countGroupCodeByCd(item.getGrpCd()) > 0) {
                    throw new BusinessException(HttpStatus.CONFLICT, "이미 존재하는 그룹 코드입니다: " + item.getGrpCd());
                }
                if (!StringUtils.hasText(item.getSysDivCd())) {
                    item.setSysDivCd("COM");
                }
                if (!StringUtils.hasText(item.getUseYn())) {
                    item.setUseYn("Y");
                }
                item.setRegUserId(StringUtils.hasText(userId) ? userId : "admin");
                commonCodeMapper.insertGroupCode(item);
            }
        }

        // 3. 수정 처리
        if (batchRequest.getUpdated() != null) {
            for (CommonGroupCode item : batchRequest.getUpdated()) {
                if (!StringUtils.hasText(item.getGrpCd())) {
                    throw new BusinessException(HttpStatus.BAD_REQUEST, "그룹 코드는 필수 입력 항목입니다.");
                }
                if (!StringUtils.hasText(item.getGrpCdNm()) && StringUtils.hasText(item.getGrpNm())) {
                    item.setGrpCdNm(item.getGrpNm());
                }
                if (!StringUtils.hasText(item.getGrpCdDesc()) && StringUtils.hasText(item.getGrpDesc())) {
                    item.setGrpCdDesc(item.getGrpDesc());
                }
                if (!StringUtils.hasText(item.getGrpCdNm())) {
                    throw new BusinessException(HttpStatus.BAD_REQUEST, "그룹 코드명은 필수 입력 항목입니다.");
                }
                item.setModUserId(StringUtils.hasText(userId) ? userId : "admin");
                commonCodeMapper.updateGroupCode(item);
            }
        }
    }

    /**
     * 단일 그룹 코드 및 하위 상세 코드 연계 삭제
     * [핵심 요구사항] 공통 상세 코드가 먼저 삭제된 후 공통 그룹 코드가 삭제됨.
     */
    @Transactional
    public void deleteGroupCodeWithDetails(String grpCd) {
        log.info("공통 그룹 코드 및 하위 상세 코드 삭제 시작: grpCd={}", grpCd);
        // 1단계: 하위 상세 코드 선행 삭제
        int deletedDetails = commonCodeMapper.deleteDetailsByGrpCd(grpCd);
        log.info("하위 상세 코드 선행 삭제 완료: grpCd={}, 삭제건수={}", grpCd, deletedDetails);

        // 2단계: 그룹 코드 삭제
        commonCodeMapper.deleteGroupCode(grpCd);
        log.info("공통 그룹 코드 삭제 완료: grpCd={}", grpCd);
    }

    // =========================================================================
    // 2. 공통 상세 코드 (TB_COM_DTL_CD)
    // =========================================================================

    /** 특정 그룹의 상세 코드 목록 조회 */
    @Transactional(readOnly = true)
    public List<CommonDetailCode> getDetailCodes(String grpCd, String useYn) {
        if (!StringUtils.hasText(grpCd)) {
            return List.of();
        }
        return commonCodeMapper.selectDetailCodes(grpCd, useYn);
    }

    /**
     * 상세 코드 일괄 저장 (신규 등록, 수정, 삭제)
     */
    @Transactional
    public void saveDetailCodes(CommonCodeBatchRequest<CommonDetailCode> batchRequest, String userId) {
        if (batchRequest == null) return;

        // 1. 삭제 처리
        if (batchRequest.getDeleted() != null) {
            for (CommonDetailCode item : batchRequest.getDeleted()) {
                if (StringUtils.hasText(item.getGrpCd()) && StringUtils.hasText(item.getDtlCd())) {
                    commonCodeMapper.deleteDetailCode(item.getGrpCd(), item.getDtlCd());
                }
            }
        }

        // 2. 신규 등록 처리
        if (batchRequest.getCreated() != null) {
            for (CommonDetailCode item : batchRequest.getCreated()) {
                if (!StringUtils.hasText(item.getGrpCd())) {
                    throw new BusinessException(HttpStatus.BAD_REQUEST, "상세 코드의 상위 그룹 코드는 필수입니다.");
                }
                if (!StringUtils.hasText(item.getDtlCd())) {
                    throw new BusinessException(HttpStatus.BAD_REQUEST, "상세 코드는 필수 입력 항목입니다.");
                }
                if (!StringUtils.hasText(item.getDtlCdNm()) && StringUtils.hasText(item.getDtlNm())) {
                    item.setDtlCdNm(item.getDtlNm());
                }
                if (!StringUtils.hasText(item.getDtlCdDesc()) && StringUtils.hasText(item.getDtlDesc())) {
                    item.setDtlCdDesc(item.getDtlDesc());
                }
                if (!StringUtils.hasText(item.getAttrVal1()) && StringUtils.hasText(item.getAttr1())) {
                    item.setAttrVal1(item.getAttr1());
                }
                if (!StringUtils.hasText(item.getAttrVal2()) && StringUtils.hasText(item.getAttr2())) {
                    item.setAttrVal2(item.getAttr2());
                }
                if (!StringUtils.hasText(item.getAttrVal3()) && StringUtils.hasText(item.getAttr3())) {
                    item.setAttrVal3(item.getAttr3());
                }
                if (!StringUtils.hasText(item.getDtlCdNm())) {
                    throw new BusinessException(HttpStatus.BAD_REQUEST, "상세 코드명은 필수 입력 항목입니다.");
                }
                if (commonCodeMapper.countDetailCodeByPk(item.getGrpCd(), item.getDtlCd()) > 0) {
                    throw new BusinessException(HttpStatus.CONFLICT, "이미 존재하는 상세 코드입니다: " + item.getDtlCd());
                }
                if (!StringUtils.hasText(item.getUseYn())) {
                    item.setUseYn("Y");
                }
                if (item.getSortOrd() == null) {
                    item.setSortOrd(1);
                }
                item.setRegUserId(StringUtils.hasText(userId) ? userId : "admin");
                commonCodeMapper.insertDetailCode(item);
            }
        }

        // 3. 수정 처리
        if (batchRequest.getUpdated() != null) {
            for (CommonDetailCode item : batchRequest.getUpdated()) {
                if (!StringUtils.hasText(item.getGrpCd()) || !StringUtils.hasText(item.getDtlCd())) {
                    throw new BusinessException(HttpStatus.BAD_REQUEST, "그룹 코드와 상세 코드는 필수 항목입니다.");
                }
                if (!StringUtils.hasText(item.getDtlCdNm()) && StringUtils.hasText(item.getDtlNm())) {
                    item.setDtlCdNm(item.getDtlNm());
                }
                if (!StringUtils.hasText(item.getDtlCdDesc()) && StringUtils.hasText(item.getDtlDesc())) {
                    item.setDtlCdDesc(item.getDtlDesc());
                }
                if (!StringUtils.hasText(item.getAttrVal1()) && StringUtils.hasText(item.getAttr1())) {
                    item.setAttrVal1(item.getAttr1());
                }
                if (!StringUtils.hasText(item.getAttrVal2()) && StringUtils.hasText(item.getAttr2())) {
                    item.setAttrVal2(item.getAttr2());
                }
                if (!StringUtils.hasText(item.getAttrVal3()) && StringUtils.hasText(item.getAttr3())) {
                    item.setAttrVal3(item.getAttr3());
                }
                if (!StringUtils.hasText(item.getDtlCdNm())) {
                    throw new BusinessException(HttpStatus.BAD_REQUEST, "상세 코드명은 필수 입력 항목입니다.");
                }
                item.setModUserId(StringUtils.hasText(userId) ? userId : "admin");
                commonCodeMapper.updateDetailCode(item);
            }
        }
    }
}

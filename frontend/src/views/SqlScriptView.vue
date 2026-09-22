<template>
  <div class="sql-script-container">
    <div class="page-header header-row">
      <div>
        <h2>SQL 스크립트</h2>
        <p>테이블 생성에 필요한 SQL 스크립트입니다. 복사하여 DB에서 실행하세요.</p>
      </div>
      <div class="toolbar">
        <el-button type="primary" :icon="CopyDocument" @click="copyAll">전체 복사</el-button>
      </div>
    </div>

    <el-card shadow="never" :body-style="{ padding: '16px' }">
      <div class="script-section" v-for="(section, idx) in scripts" :key="idx">
        <div class="section-header">
          <span class="section-title">{{ section.title }}</span>
          <el-button link type="primary" size="small" :icon="CopyDocument" @click="copyText(section.sql)">복사</el-button>
        </div>
        <pre class="sql-block"><code>{{ section.sql }}</code></pre>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { CopyDocument } from '@element-plus/icons-vue'

const scripts = [
  {
    title: '배치 작업 테이블 (TB_COM_BATCH_JOB)',
    sql: `CREATE TABLE TB_COM_BATCH_JOB (
    JOB_ID          VARCHAR2(30)    PRIMARY KEY,
    JOB_NM          VARCHAR2(100)   NOT NULL,
    JOB_DESC        VARCHAR2(500),
    CRON_EXPR       VARCHAR2(100),
    JOB_TYPE        VARCHAR2(20)    DEFAULT 'CRON',
    JOB_PARAMS      VARCHAR2(2000),
    STATUS          VARCHAR2(20)    DEFAULT 'IDLE',
    USE_YN          CHAR(1)         DEFAULT 'Y',
    LAST_RUN_DT     TIMESTAMP,
    LAST_RUN_RESULT VARCHAR2(10),
    REG_USER_ID     VARCHAR2(50),
    REG_DT          TIMESTAMP       DEFAULT SYSDATE,
    MOD_USER_ID     VARCHAR2(50),
    MOD_DT          TIMESTAMP
);`,
  },
  {
    title: '메뉴 로그 시퀀스 (SEQ_TB_COM_MENU_LOG)',
    sql: `CREATE SEQUENCE SEQ_TB_COM_MENU_LOG START WITH 1 INCREMENT BY 1 NOCACHE;`,
  },
  {
    title: '메뉴 로그 테이블 (TB_COM_MENU_LOG)',
    sql: `CREATE TABLE TB_COM_MENU_LOG (
    LOG_SEQ     NUMBER          PRIMARY KEY,
    USER_ID     VARCHAR2(50)    NOT NULL,
    USER_NM     VARCHAR2(100),
    MENU_ID     VARCHAR2(30),
    MENU_NM     VARCHAR2(100),
    MENU_URL    VARCHAR2(200),
    CLICK_DT    TIMESTAMP       DEFAULT SYSDATE,
    USER_IP     VARCHAR2(50)
);`,
  },
  {
    title: '메뉴 로그 인덱스',
    sql: `CREATE INDEX IDX_MENU_LOG_USER ON TB_COM_MENU_LOG(USER_ID);
CREATE INDEX IDX_MENU_LOG_DT ON TB_COM_MENU_LOG(CLICK_DT);`,
  },
  {
    title: '공통 그룹 코드 테이블 (TB_COM_GRP_CD)',
    sql: `CREATE TABLE TB_COM_GRP_CD (
    GRP_CD          VARCHAR2(30)    PRIMARY KEY,
    GRP_CD_NM       VARCHAR2(100)   NOT NULL,
    GRP_CD_DESC     VARCHAR2(500),
    SYS_DIV_CD      VARCHAR2(20)    DEFAULT 'COM',
    USE_YN          CHAR(1)         DEFAULT 'Y' NOT NULL,
    REG_USER_ID     VARCHAR2(50),
    REG_DT          TIMESTAMP       DEFAULT SYSDATE,
    MOD_USER_ID     VARCHAR2(50),
    MOD_DT          TIMESTAMP
);`,
  },
  {
    title: '공통 상세 코드 테이블 (TB_COM_DTL_CD)',
    sql: `CREATE TABLE TB_COM_DTL_CD (
    GRP_CD          VARCHAR2(30)    NOT NULL,
    DTL_CD          VARCHAR2(30)    NOT NULL,
    DTL_NM          VARCHAR2(100)   NOT NULL,
    DTL_DESC        VARCHAR2(500),
    SORT_ORD        NUMBER          DEFAULT 1,
    USE_YN          CHAR(1)         DEFAULT 'Y' NOT NULL,
    ATTR1           VARCHAR2(100),
    ATTR2           VARCHAR2(100),
    ATTR3           VARCHAR2(100),
    REG_USER_ID     VARCHAR2(50),
    REG_DT          TIMESTAMP       DEFAULT SYSDATE,
    MOD_USER_ID     VARCHAR2(50),
    MOD_DT          TIMESTAMP,
    CONSTRAINT PK_TB_COM_DTL_CD PRIMARY KEY (GRP_CD, DTL_CD)
);`,
  },
]

const allSql = scripts.map((s) => s.sql).join('\n\n')

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('클립보드에 복사되었습니다.')
  })
}

function copyAll() {
  copyText(allSql)
}
</script>

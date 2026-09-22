# Frontend CSS Styling Rules

## 핵심 규칙 1: 공통 CSS 파일 중앙 관리
- `frontend/` 내의 모든 Vue 컴포넌트(`*.vue`)에는 `<style>` 또는 `<style scoped>` 블록을 작성하지 마십시오.
- 모든 CSS 스타일은 반드시 `frontend/src/styles/common.css`에 모아서 작성해야 합니다.
- 스타일 간섭 및 충돌을 방지하기 위해 각 뷰/다이얼로그의 루트 컨테이너 클래스를 프리픽스로 사용하여 네임스페이스를 격리하십시오.
- 표준 CSS 문법을 준수하며, Vue 전용 `:deep()` 문법을 사용하지 마십시오.

## 핵심 규칙 2: 화면 목록/리스트는 루나그리드(LunaGrid) 적용
- 화면에서 데이터 목록/리스트(테이블)를 구현할 때는 `<el-table>` 대신 **루나그리드(`luna-lib-grid.min.js`, `window.LunaGrid`, `window.LunaDataAdapter`)**를 적용하여 개발하십시오.
- 상세 구현 표준은 `.agents/skills/lunagrid/SKILL.md` 스킬을 따르십시오.
- 편집 트리거는 더블 클릭(`editTrigger: 'dblclick'`)을 기본으로 적용하고, 컴포넌트 언마운트 시 `grid = null; adapter = null;`로 참조를 해제하고 컨테이너(`innerHTML = ''`)를 정리합니다. (루나그리드에는 destroy 메서드가 없습니다.)
- 전역 변수 충돌 방지를 위해 `window.LunaValueType`, `window.LunaRowState`, `window.LunaGridView`, `window.LunaTreeView` 등 **Luna 접두어가 붙은 식별자** 또는 `LunaGrid.ValueType`, `LunaGrid.RowState` 네임스페이스를 사용하십시오.

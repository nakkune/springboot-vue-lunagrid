/**
 * LunaLib - Enterprise Grade High-Performance Data Grid & Tree Library
 * Version: 3.0.0 (Enterprise Architecture Edition)
 * 
 * 10년차 시니어 풀스택 개발자 및 UI/UX 디자이너 관점의 상용 그리드 풀스택 엔진:
 * 
 * 1. LunaDataAdapter & GridView 듀얼 아키텍처 지원
 * 2. 3대 컨트롤 바: No. 인디케이터(Indicator), C/U/D 상태바(StateBar), 체크바(CheckBar)
 * 3. 고급 렌더러(Column Renderers): Progress Bar, Status Badge, Star Rating, Avatar/Image, Interactive Switch, Sparkline SVG Chart, Custom HTML
 * 4. 정교한 인라인 에디터(Column Editors): DatePicker, NumberSpin, AutoComplete, TextArea, Select, LookupTree(대분류-소분류 계층 연계)
 * 5. 드래그 앤 드롭 행 그룹핑 패널 (Row Grouping & Multi-level Accordion & Group Subtotals)
 * 6. 셀 블록 범위 드래그 선택 & 엑셀 상호 연동 (Ctrl+C 복사 & Ctrl+V 실시간 일괄 붙여넣기)
 * 7. 좌측/우측 열 틀고정 (Sticky Fixed Columns: fixedColCount, fixedRightColCount)
 * 8. 엑셀 스타일 고유값 체크박스 필터 팝오버 (Excel-style Multi-Check Filter)
 * 9. 다중 컬럼 정렬 (Multi-Column Sorting with Shift+Click)
 * 10. 키보드 풀 내비게이션 (방향키, Tab, Enter, Esc, F2, Spacebar)
 * 11. 통계 요약행 (Summary Footer: SUM, AVG, COUNT, MIN, MAX) & CSV/JSON Export
 * 
 * @author Senior Fullstack Developer & Senior UI/UX Designer
 */

(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else {
    const LunaLib = factory();
    global.LunaLib = LunaLib;
    global.LunaGrid = LunaLib.Grid;
    global.LunaDataAdapter = LunaLib.LunaDataAdapter;
    global.TreeLunaDataAdapter = LunaLib.TreeLunaDataAdapter;

    // Luna 네임스페이스가 적용된 안전한 전역 식별자 (이름 충돌 방지)
    global.LunaGridView = LunaLib.LunaGridView;
    global.LunaTreeView = LunaLib.LunaTreeView;
    global.LunaValueType = LunaLib.LunaValueType;
    global.LunaRowState = LunaLib.LunaRowState;
    global.LunaValidationLevel = LunaLib.LunaValidationLevel;
    global.LunaGridLocaleManager = LunaLib.LunaGridLocaleManager;

    global.LunaGrid = global.LunaGrid || LunaLib;
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  // LunaGrid ValueType 표준 상수
  const ValueType = Object.freeze({
    TEXT: 'text',
    NUMBER: 'number',
    DATETIME: 'datetime',
    BOOLEAN: 'boolean',
    OBJECT: 'object'
  });

  // LunaGrid 공식 RowState 상수 정의
  const RowState = Object.freeze({
    NONE: 'none',
    CREATED: 'created',
    UPDATED: 'updated',
    DELETED: 'deleted',
    CREATE_AND_DELETED: 'createAndDeleted'
  });

  // LunaGrid 공식 ValidationLevel 표준 상수 정의
  // LunaGrid Architecture Specification Standard
  const ValidationLevel = Object.freeze({
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
    IGNORE: 'ignore'
  });

  // ValidationLevel 가중치 (심각도 비교: 클수록 더 심각한 에러)
  const ValidationLevelWeight = Object.freeze({
    error: 40,
    warning: 30,
    info: 20,
    ignore: 10
  });

  // =========================================================================
  // LunaGrid Locale & Messages 표준 다국어 사전 (LunaGridLocale)
  // LunaGrid Architecture Specification Standard
  // =========================================================================
  const DEFAULT_LOCALES = {
    ko: {
      locale: 'ko',
      currency: 'KRW',
      currencySymbol: '₩',
      messages: {
        displayEmptyMessage: '표시할 데이터가 없습니다.',
        groupPanelPlaceholder: '이곳으로 열 머리글을 끌어다 놓으면 해당 열을 기준으로 그룹화됩니다.',
        filterAll: '(전체 선택)',
        filterApply: '적용',
        filterClear: '필터 해제',
        filterSearchPlaceholder: '값 검색...',
        filterNoMatch: '일치하는 항목이 없습니다.',
        addRow: '행 추가',
        deleteSelected: '선택 삭제',
        saveChanges: '변경 저장',
        exportCsv: 'CSV 내보내기',
        exportJson: 'JSON 내보내기',
        totalCount: '전체',
        items: '건',
        showingItems: '표시',
        pagingFirst: '첫 페이지',
        pagingPrev: '이전',
        pagingNext: '다음',
        pagingLast: '마지막 페이지',
        validationError: '유효성 검사를 통과하지 못했습니다.',
        copySuccess: '선택한 셀이 클립보드에 복사되었습니다.',
        pasteSuccess: '데이터가 성공적으로 붙여넣기 되었습니다.',
        undoToast: '실행 취소(Undo) 완료',
        redoToast: '다시 실행(Redo) 완료'
      },
      numberFormats: {
        currency: { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 },
        decimal2: { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 },
        percent: { style: 'percent', maximumFractionDigits: 1 }
      }
    },
    'en-US': {
      locale: 'en-US',
      currency: 'USD',
      currencySymbol: '$',
      messages: {
        displayEmptyMessage: 'There is no data to display.',
        groupPanelPlaceholder: 'Drag a column header here to group by that column.',
        filterAll: '(Select All)',
        filterApply: 'Apply',
        filterClear: 'Clear',
        filterSearchPlaceholder: 'Search values...',
        filterNoMatch: 'No matching items found.',
        addRow: 'Add Row',
        deleteSelected: 'Delete Selected',
        saveChanges: 'Save Changes',
        exportCsv: 'Export to CSV',
        exportJson: 'Export to JSON',
        totalCount: 'Total',
        items: 'items',
        showingItems: 'displayed',
        pagingFirst: 'First Page',
        pagingPrev: 'Prev',
        pagingNext: 'Next',
        pagingLast: 'Last Page',
        validationError: 'Data validation failed.',
        copySuccess: 'Selected cells copied to clipboard.',
        pasteSuccess: 'Data pasted successfully.',
        undoToast: 'Undo completed',
        redoToast: 'Redo completed'
      },
      numberFormats: {
        currency: { style: 'currency', currency: 'USD', minimumFractionDigits: 2 },
        decimal2: { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 },
        percent: { style: 'percent', maximumFractionDigits: 1 }
      }
    },
    en: {
      locale: 'en-US',
      currency: 'USD',
      currencySymbol: '$',
      messages: {
        displayEmptyMessage: 'There is no data to display.',
        groupPanelPlaceholder: 'Drag a column header here to group by that column.',
        filterAll: '(Select All)',
        filterApply: 'Apply',
        filterClear: 'Clear',
        filterSearchPlaceholder: 'Search values...',
        filterNoMatch: 'No matching items found.',
        addRow: 'Add Row',
        deleteSelected: 'Delete Selected',
        saveChanges: 'Save Changes',
        exportCsv: 'Export to CSV',
        exportJson: 'Export to JSON',
        totalCount: 'Total',
        items: 'items',
        showingItems: 'displayed',
        pagingFirst: 'First Page',
        pagingPrev: 'Prev',
        pagingNext: 'Next',
        pagingLast: 'Last Page',
        validationError: 'Data validation failed.',
        copySuccess: 'Selected cells copied to clipboard.',
        pasteSuccess: 'Data pasted successfully.',
        undoToast: 'Undo completed',
        redoToast: 'Redo completed'
      },
      numberFormats: {
        currency: { style: 'currency', currency: 'USD', minimumFractionDigits: 2 },
        decimal2: { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 },
        percent: { style: 'percent', maximumFractionDigits: 1 }
      }
    },
    ja: {
      locale: 'ja-JP',
      currency: 'JPY',
      currencySymbol: '¥',
      messages: {
        displayEmptyMessage: '表示するデータがありません。',
        groupPanelPlaceholder: '列ヘッダーをここにドラッグしてグループ化します。',
        filterAll: '(すべて選択)',
        filterApply: '適用',
        filterClear: 'クリア',
        filterSearchPlaceholder: '値を検索...',
        filterNoMatch: '一致する項目がありません。',
        addRow: '行追加',
        deleteSelected: '選択削除',
        saveChanges: '変更保存',
        exportCsv: 'CSVエクスポート',
        exportJson: 'JSONエクスポート',
        totalCount: '合計',
        items: '件',
        showingItems: '表示',
        pagingFirst: '最初',
        pagingPrev: '前へ',
        pagingNext: '次へ',
        pagingLast: '最後',
        validationError: '検証に失敗しました。',
        copySuccess: '選択したセルがクリップボードにコピーされました。',
        pasteSuccess: 'データが正常に貼り付けられました。',
        undoToast: '元に戻す(Undo)完了',
        redoToast: 'やり直し(Redo)完了'
      },
      numberFormats: {
        currency: { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 },
        decimal2: { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 },
        percent: { style: 'percent', maximumFractionDigits: 1 }
      }
    },
    zh: {
      locale: 'zh-CN',
      currency: 'CNY',
      currencySymbol: '¥',
      messages: {
        displayEmptyMessage: '没有可显示的数据。',
        groupPanelPlaceholder: '将列标题拖至此处以按该列分组。',
        filterAll: '(全选)',
        filterApply: '应用',
        filterClear: '清除',
        filterSearchPlaceholder: '搜索值...',
        filterNoMatch: '未找到匹配项。',
        addRow: '添加行',
        deleteSelected: '删除选中',
        saveChanges: '保存修改',
        exportCsv: '导出 CSV',
        exportJson: '导出 JSON',
        totalCount: '共',
        items: '条',
        showingItems: '显示',
        pagingFirst: '首页',
        pagingPrev: '上一页',
        pagingNext: '下一页',
        pagingLast: '末页',
        validationError: '数据验证失败。',
        copySuccess: '已成功复制到剪贴板。',
        pasteSuccess: '数据已成功粘贴。',
        undoToast: '撤销(Undo)完成',
        redoToast: '重做(Redo)完成'
      },
      numberFormats: {
        currency: { style: 'currency', currency: 'CNY', minimumFractionDigits: 2 },
        decimal2: { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 },
        percent: { style: 'percent', maximumFractionDigits: 1 }
      }
    }
  };

  const LunaGridLocaleManager = {
    _currentLocale: 'ko',
    _locales: Object.assign({}, DEFAULT_LOCALES),

    setLocale(localeConfig) {
      if (typeof localeConfig === 'string') {
        if (this._locales[localeConfig]) {
          this._currentLocale = localeConfig;
        } else {
          console.warn(`[LunaGridLocale] Unknown locale code: ${localeConfig}`);
        }
      } else if (typeof localeConfig === 'object' && localeConfig !== null) {
        const code = localeConfig.locale || 'custom';
        const base = this._locales[code] || this._locales['en'] || this._locales['ko'];
        this._locales[code] = {
          locale: code,
          currency: localeConfig.currency || base.currency || 'KRW',
          currencySymbol: localeConfig.currencySymbol || base.currencySymbol || '₩',
          messages: Object.assign({}, base.messages || {}, localeConfig.messages || {}),
          numberFormats: Object.assign({}, base.numberFormats || {}, localeConfig.numberFormats || {})
        };
        this._currentLocale = code;
      }
    },

    getLocale(code = null) {
      const target = code || this._currentLocale;
      return this._locales[target] || this._locales['ko'];
    },

    registerLocale(code, localeObj) {
      if (code && typeof localeObj === 'object') {
        this._locales[code] = Object.assign({}, this._locales['en'] || {}, localeObj);
      }
    }
  };

  // =========================================================================
  // 1. LunaDataAdapter (엔터프라이즈 Data Adapter)
  // =========================================================================
  class LunaDataAdapter {
    constructor() {
      this.fields = [];
      this.rows = [];
      this.originalRows = [];
      this.deletedRows = [];
      this.rowStates = new Map(); // id -> 'none' | 'created' | 'updated' | 'deleted' | 'createAndDeleted'
      this.listeners = [];
      this._idCounter = 1;
      this.options = {
        checkStates: true, // 행 상태 관리 활성화 (기본값 true)
        checkDiff: true,
        restoreMode: 'auto',
        undoable: true,    // LunaGrid Undo/Redo 지원 (기본값 true)
        maxUndoCount: 50   // 최대 히스토리 스택 개수
      };
      this.undoStack = [];
      this.redoStack = [];
      this.undoing = false;
      this.redoing = false;
    }

    /**
     * LunaDataAdapter 옵션 설정 (setOptions)
     */
    setOptions(options = {}) {
      Object.assign(this.options, options);
    }

    getOptions() {
      return Object.assign({}, this.options);
    }

    /**
     * 커맨드 스택에 Undo/Redo 액션 기록
     */
    _pushCommand(cmd) {
      if (!this.options.undoable || this.undoing || this.redoing) return;
      this.undoStack.push(cmd);
      if (this.undoStack.length > (this.options.maxUndoCount || 50)) {
        this.undoStack.shift();
      }
      this.redoStack = [];
      this._emit('commandStackChanged', { undoable: this.canUndo(), redoable: this.canRedo() });
    }

    /**
     * 이전 변경 사항 되돌리기 (Undo)
     */
    undo() {
      if (!this.canUndo()) return false;
      const cmd = this.undoStack.pop();
      if (!cmd) return false;

      this.undoing = true;
      try {
        if (typeof cmd.undo === 'function') cmd.undo();
        this.redoStack.push(cmd);
      } finally {
        this.undoing = false;
      }

      this._emit('commandStackChanged', { undoable: this.canUndo(), redoable: this.canRedo() });
      this._emit('undo', cmd);
      return true;
    }

    /**
     * 되돌린 작업 다시 실행 (Redo)
     */
    redo() {
      if (!this.canRedo()) return false;
      const cmd = this.redoStack.pop();
      if (!cmd) return false;

      this.redoing = true;
      try {
        if (typeof cmd.redo === 'function') cmd.redo();
        this.undoStack.push(cmd);
      } finally {
        this.redoing = false;
      }

      this._emit('commandStackChanged', { undoable: this.canUndo(), redoable: this.canRedo() });
      this._emit('redo', cmd);
      return true;
    }

    /**
     * Undo 가능 여부 확인 (canUndo)
     */
    canUndo() {
      return this.options.undoable && this.undoStack.length > 0;
    }

    /**
     * Redo 가능 여부 확인 (canRedo)
     */
    canRedo() {
      return this.options.undoable && this.redoStack.length > 0;
    }

    /**
     * Undo/Redo 커맨드 스택 초기화 (clearCommandStack)
     */
    clearCommandStack() {
      this.undoStack = [];
      this.redoStack = [];
      this._emit('commandStackChanged', { undoable: false, redoable: false });
    }

    setFields(fields = []) {
      this.fields = fields.map(f => {
        if (typeof f === 'string') return { fieldName: f, dataType: ValueType.TEXT, valueType: ValueType.TEXT };
        const dType = f.dataType || f.valueType || ValueType.TEXT;
        return Object.assign({}, f, { dataType: dType, valueType: dType });
      });
      this._emit('fieldsChanged', this.fields);
    }

    addField(field = {}) {
      const fieldObj = typeof field === 'string' ? { fieldName: field, valueType: 'text' } : Object.assign({}, field);
      this.fields.push(fieldObj);
      this._emit('fieldAdded', fieldObj);
      return fieldObj;
    }

    getFields() {
      return [...this.fields];
    }

    /**
     * 전체 데이터셋 주입 또는 특정 시작 인덱스부터의 부분 주입 (setRows)
     * @param {Array<Object>} data - 행 데이터 배열
     * @param {number} [startRow=0] - 시작 인덱스 (0-based)
     */
    setRows(data = [], startRow = 0) {
      if (startRow === 0 && (!this.rowCount || this.rowCount === data.length)) {
        this.rows = JSON.parse(JSON.stringify(data));
        this.deletedRows = [];
        this.rowStates.clear();
        this.rows.forEach(r => {
          if (r.id === undefined) r.id = `row_${this._idCounter++}`;
          this.rowStates.set(String(r.id), 'none');
        });
        this.originalRows = JSON.parse(JSON.stringify(this.rows));

        this._emit('rowCountChanged', this.rows.length);
        this._emit('dataLoadCompleted', this.rows);
        this._emit('dataLoadComplated', this.rows); // LunaGrid 공식 오타 호환
        this._emit('dataLoaded', this.rows);
        this._emit('dataChanged', this.rows);
      } else {
        // 특정 시작 위치부터 부분 업데이트 (Lazy Loading 청크 반영)
        data.forEach((r, offset) => {
          const targetIdx = startRow + offset;
          const newRow = Object.assign({}, r);
          if (newRow.id === undefined) newRow.id = `row_${this._idCounter++}`;
          delete newRow._isLazyPlaceholder;
          this.rows[targetIdx] = newRow;
          this.rowStates.set(String(newRow.id), 'none');
        });

        this._emit('rowCountChanged', this.rows.length);
        this._emit('dataLoadCompleted', this.rows);
        this._emit('dataLoadComplated', this.rows);
        this._emit('dataLoaded', this.rows);
        this._emit('dataChanged', this.rows);
      }
    }

    /**
     * 대용량 가상 행 개수 사전 할당 (setRowCount - Lazy Loading 전용)
     * @param {number} totalCount - 전체 행 개수
     * @param {Object} [defaultValues={}] - 가상 플레이스홀더 기본값
     */
    setRowCount(totalCount = 0, defaultValues = {}) {
      this.rowCount = totalCount;
      this.rows = [];
      this.deletedRows = [];
      this.rowStates.clear();

      for (let i = 0; i < totalCount; i++) {
        const placeholder = Object.assign({ id: `lazy_${i + 1}`, _isLazyPlaceholder: true }, defaultValues);
        this.rows.push(placeholder);
        this.rowStates.set(String(placeholder.id), 'none');
      }

      this._emit('rowCountChanged', this.rows.length);
      this._emit('dataLoadCompleted', this.rows);
      this._emit('dataLoadComplated', this.rows);
      this._emit('dataLoaded', this.rows);
      this._emit('dataChanged', this.rows);
    }

    addRow(rowData = {}, position = 'top') {
      const targetIdx = (position === 'bottom' || position === 'append') ? this.rows.length : 0;
      if (!this._emit('rowInserting', targetIdx, rowData)) return null;

      const newRow = Object.assign({}, rowData);
      if (newRow.id === undefined) newRow.id = `NEW_${this._idCounter++}`;
      newRow._isNew = true;
      newRow._isDirty = true;
      const rowIdStr = String(newRow.id);

      if (position === 'bottom' || position === 'append') {
        this.rows.push(newRow);
      } else {
        this.rows.unshift(newRow);
      }

      this.rowStates.set(rowIdStr, RowState.CREATED);

      // Undo/Redo 기록
      this._pushCommand({
        type: 'add',
        undo: () => {
          const curIdx = this.rows.indexOf(newRow);
          if (curIdx !== -1) {
            this.rows.splice(curIdx, 1);
            this.rowStates.delete(rowIdStr);
            this._emit('rowDeleted', [newRow]);
          }
        },
        redo: () => {
          if (position === 'bottom' || position === 'append') this.rows.push(newRow);
          else this.rows.unshift(newRow);
          this.rowStates.set(rowIdStr, RowState.CREATED);
          this._emit('rowAdded', newRow);
        }
      });

      this._emit('rowInserted', targetIdx, newRow);
      this._emit('rowCountChanged', this.rows.length);
      this._emit('rowAdded', newRow);
      this._emit('dataChanged', this.rows);
      return newRow;
    }

    /**
     * 특정 인덱스 위치에 신규 행 삽입 (insertRow)
     * @param {number} index - 삽입할 인덱스 (0-based)
     * @param {Object} rowData - 삽입할 행 데이터
     */
    insertRow(index, rowData = {}) {
      const targetIdx = Math.max(0, Math.min(index, this.rows.length));
      if (!this._emit('rowInserting', targetIdx, rowData)) return null;

      const newRow = Object.assign({}, rowData);
      if (newRow.id === undefined) {
        const maxNumId = this.rows.reduce((max, r) => {
          const num = Number(r.id);
          return (!isNaN(num) && num > max) ? num : max;
        }, 100);
        newRow.id = maxNumId + 1;
      }
      newRow._isNew = true;
      newRow._isDirty = true;
      const rowIdStr = String(newRow.id);

      this.rows.splice(targetIdx, 0, newRow);

      this.rowStates.set(rowIdStr, RowState.CREATED);

      // Undo/Redo 기록
      this._pushCommand({
        type: 'insert',
        undo: () => {
          const curIdx = this.rows.indexOf(newRow);
          if (curIdx !== -1) {
            this.rows.splice(curIdx, 1);
            this.rowStates.delete(rowIdStr);
            this._emit('rowDeleted', [newRow]);
          }
        },
        redo: () => {
          this.rows.splice(targetIdx, 0, newRow);
          this.rowStates.set(rowIdStr, RowState.CREATED);
          this._emit('rowAdded', newRow);
        }
      });

      this._emit('rowInserted', targetIdx, newRow);
      this._emit('rowCountChanged', this.rows.length);
      this._emit('rowAdded', newRow);
      this._emit('dataChanged', this.rows);
      return newRow;
    }

    /**
     * 여러 행 일괄 추가 (addRows)
     */
    addRows(rowArray = [], position = 'bottom') {
      if (!Array.isArray(rowArray)) return [];
      const created = [];
      rowArray.forEach(data => {
        const newRow = this.addRow(data, position);
        if (newRow) created.push(newRow);
      });
      return created;
    }

    /**
     * 특정 인덱스 위치에 여러 행 일괄 삽입 (insertRows)
     */
    insertRows(index, rowArray = []) {
      if (!Array.isArray(rowArray)) return [];
      const created = [];
      rowArray.forEach((data, offset) => {
        const newRow = this.insertRow(index + offset, data);
        if (newRow) created.push(newRow);
      });
      return created;
    }

    /**
     * 특정 행 삭제 (removeRow)
     * LunaGrid softDeleting 및 deleteCreated 옵션 완벽 지원
     * @param {string|number} rowIdOrIndex - 삭제할 행 ID 또는 0-based 행 인덱스
     */
    removeRow(rowIdOrIndex) {
      const { row: targetRow, index: idx } = this._resolveRowAndIndex(rowIdOrIndex);
      if (!targetRow || idx === -1) return;

      if (!this._emit('rowDeleting', idx, targetRow)) return null;

      const deleted = this.rows.splice(idx, 1)[0];
      const rowIdStr = String(deleted.id);
      const isSoftDeleting = this.options.softDeleting !== false;
      const isDeleteCreated = this.options.deleteCreated !== false;
      const origState = this.rowStates.get(rowIdStr);

      if (!deleted._isNew) {
        if (isSoftDeleting) {
          this.deletedRows.push(deleted);
          this.rowStates.set(rowIdStr, RowState.DELETED);
        } else {
          this.rowStates.delete(rowIdStr);
        }
      } else {
        // 새로 추가되었던 행을 삭제하는 경우
        if (isDeleteCreated) {
          this.rowStates.delete(rowIdStr);
        } else if (isSoftDeleting) {
          this.deletedRows.push(deleted);
          this.rowStates.set(rowIdStr, RowState.CREATE_AND_DELETED);
        }
      }

      // Undo/Redo 기록
      this._pushCommand({
        type: 'remove',
        undo: () => {
          this.rows.splice(idx, 0, deleted);
          const delIdx = this.deletedRows.indexOf(deleted);
          if (delIdx !== -1) this.deletedRows.splice(delIdx, 1);
          if (origState) this.rowStates.set(rowIdStr, origState);
          else this.rowStates.delete(rowIdStr);
          this._emit('rowAdded', deleted);
        },
        redo: () => {
          this.removeRow(rowIdStr);
        }
      });

      this._emit('rowDeleted', idx, deleted);
      this._emit('rowCountChanged', this.rows.length);
      this._emit('dataChanged', this.rows);
      return deleted;
    }

    /**
     * 여러 행 일괄 삭제 (removeRows)
     * @param {Array<string|number>} rowArray - 행 ID 또는 인덱스 배열
     */
    removeRows(rowArray = []) {
      if (!Array.isArray(rowArray)) return [];
      const deletedList = [];
      rowArray.forEach(idOrIdx => {
        const deleted = this.removeRow(idOrIdx);
        if (deleted) deletedList.push(deleted);
      });
      return deletedList;
    }

    /**
     * 전체 행 일괄 삭제/초기화 (clearRows)
     */
    clearRows() {
      this.rows.forEach(r => {
        if (!r._isNew) {
          this.deletedRows.push(r);
          this.rowStates.set(String(r.id), RowState.DELETED);
        }
      });
      this.rows = [];
      this._emit('dataLoaded', []);
    }

    _resolveRowAndIndex(rowIdOrIndex) {
      if (rowIdOrIndex === undefined || rowIdOrIndex === null) return { row: null, index: -1 };

      // 1. 객체인 경우
      if (typeof rowIdOrIndex === 'object' && rowIdOrIndex !== null) {
        let idx = this.rows.indexOf(rowIdOrIndex);
        if (idx !== -1) return { row: this.rows[idx], index: idx };

        // id 프로퍼티로 일치 행 탐색
        if (rowIdOrIndex.id !== undefined && rowIdOrIndex.id !== null) {
          idx = this.rows.findIndex(r => String(r.id) === String(rowIdOrIndex.id));
          if (idx !== -1) return { row: this.rows[idx], index: idx };
        }

        // _rowKey 프로퍼티로 탐색
        if (rowIdOrIndex._rowKey !== undefined) {
          idx = this.rows.findIndex(r => String(r._rowKey) === String(rowIdOrIndex._rowKey));
          if (idx !== -1) return { row: this.rows[idx], index: idx };
        }

        // 내용(key-value) 일치 탐색
        const keys = Object.keys(rowIdOrIndex).filter(k => !k.startsWith('_'));
        if (keys.length > 0) {
          idx = this.rows.findIndex(r => keys.every(k => String(r[k] ?? '') === String(rowIdOrIndex[k] ?? '')));
          if (idx !== -1) return { row: this.rows[idx], index: idx };
        }

        return { row: null, index: -1 };
      }

      // 2. 숫자 인덱스(0-based number)가 범위 내이면 인덱스 우선 매핑
      if (typeof rowIdOrIndex === 'number' && rowIdOrIndex >= 0 && rowIdOrIndex < this.rows.length) {
        return { row: this.rows[rowIdOrIndex], index: rowIdOrIndex };
      }

      // 3. ID 문자열 일치 행 탐색
      const idx = this.rows.findIndex(r => String(r.id) === String(rowIdOrIndex));
      if (idx !== -1) return { row: this.rows[idx], index: idx };

      return { row: null, index: -1 };
    }

    /**
     * 행 데이터 수정 (updateRow)
     * LunaGrid restoreMode: 'auto' (원본 데이터로 복귀 시 'none'으로 자동 원복) 지원
     * @param {string|number} rowIdOrIndex - 행 ID 또는 0-based 인덱스
     * @param {Object} updatedValues - 수정할 필드 객체
     */
    updateRow(rowIdOrIndex, updatedValues = {}) {
      const { row, index: targetIdx } = this._resolveRowAndIndex(rowIdOrIndex);
      if (!row) return;

      if (!this._emit('rowUpdating', targetIdx, updatedValues)) return null;

      // checkDiff 옵션: 실질적인 값 변경 여부 확인
      let hasChanged = false;
      Object.keys(updatedValues).forEach(k => {
        if (String(row[k]) !== String(updatedValues[k])) {
          hasChanged = true;
        }
      });

      if (!hasChanged && this.options.checkDiff !== false) return row;

      // 이전 값 복사 (Undo용)
      const prevValues = {};
      Object.keys(updatedValues).forEach(k => {
        prevValues[k] = row[k];
      });
      const prevState = this.rowStates.get(String(row.id));

      Object.assign(row, updatedValues);

      // restoreMode: 'auto' - 원래 원본 데이터와 동일해졌는지 확인하여 'none'으로 복원
      if (!row._isNew) {
        const origRow = this.originalRows.find(orig => String(orig.id) === String(row.id));
        let isIdenticalToOriginal = false;
        if (origRow && this.options.restoreMode === 'auto') {
          const fields = this.fields.length > 0 ? this.fields.map(f => f.fieldName) : Object.keys(origRow);
          isIdenticalToOriginal = fields.every(fn => String(row[fn] ?? '') === String(origRow[fn] ?? ''));
        }

        if (isIdenticalToOriginal) {
          row._isDirty = false;
          this.rowStates.set(String(row.id), RowState.NONE);
        } else {
          row._isDirty = true;
          this.rowStates.set(String(row.id), RowState.UPDATED);
        }
      } else {
        row._isDirty = true;
      }

      // Undo/Redo 기록
      this._pushCommand({
        type: 'update',
        undo: () => {
          Object.assign(row, prevValues);
          if (prevState) this.rowStates.set(String(row.id), prevState);
          this._emit('rowUpdated', row);
        },
        redo: () => {
          this.updateRow(String(row.id), updatedValues);
        }
      });

      this._emit('rowUpdated', targetIdx, row);
      this._emit('dataChanged', this.rows);
      return row;
    }

    /**
     * 특정 인덱스부터 여러 행 데이터 일괄 수정 (updateRows)
     * @param {number} startIndex - 시작 행 인덱스
     * @param {Array<Object>} rowsArray - 수정할 행 객체 배열
     */
    updateRows(startIndex = 0, rowsArray = []) {
      if (!Array.isArray(rowsArray)) return [];
      const updatedList = [];
      rowsArray.forEach((vals, offset) => {
        const targetIdx = startIndex + offset;
        const res = this.updateRow(targetIdx, vals);
        if (res) updatedList.push(res);
      });
      return updatedList;
    }

    /**
     * 필드 계산 엔진 (valueExpression / valueCallback / Subtypes)
     * LunaGrid Calculated Field 완벽 지원
     */
    calculateFieldValue(fieldDef, row, rowIndex = 0) {
      if (!row || !fieldDef) return undefined;
      const fieldNames = this.fields.map(f => f.fieldName);
      const values = fieldNames.map(fn => row[fn]);

      // 1. valueCallback (우선순위 최고)
      if (typeof fieldDef.valueCallback === 'function') {
        return fieldDef.valueCallback(this, rowIndex, fieldDef.fieldName, fieldNames, values, row);
      }

      // 2. valueExpression (LunaGrid 수식 표현식)
      if (fieldDef.valueExpression && typeof fieldDef.valueExpression === 'string') {
        try {
          const expr = fieldDef.valueExpression;
          const mergedData = Object.assign({}, row);
          const keys = Object.keys(mergedData);
          const vals = Object.values(mergedData);
          const fn = new Function(...keys, 'values', 'row', `
            try {
              return (${expr});
            } catch(e) {
              return undefined;
            }
          `);
          return fn(...vals, values, row);
        } catch (e) {
          console.warn('[LunaGrid] valueExpression eval error:', e);
          return undefined;
        }
      }

      // 3. Subtypes 파생 필드 연산 (left, right, mid, percent, rate 등)
      if (fieldDef.subType || fieldDef.baseField) {
        const baseVal = fieldDef.baseField ? row[fieldDef.baseField] : row[fieldDef.fieldName];
        if (fieldDef.subType === 'left' && fieldDef.length) return String(baseVal ?? '').slice(0, fieldDef.length);
        if (fieldDef.subType === 'right' && fieldDef.length) return String(baseVal ?? '').slice(-fieldDef.length);
        if (fieldDef.subType === 'mid' && fieldDef.start !== undefined) return String(baseVal ?? '').substr(fieldDef.start, fieldDef.length);
        if (fieldDef.subType === 'percent' || fieldDef.subType === 'rate') return (Number(baseVal) || 0) * (fieldDef.rate || 0.1);
      }

      return row[fieldDef.fieldName];
    }

    /**
     * 단일 셀 값 수정 (setValue)
     */
    setValue(rowIdOrIndex, fieldName, value) {
      // 계산 필드는 Read-Only (수정 불가)
      const fieldDef = this.fields.find(f => f.fieldName === fieldName);
      if (fieldDef && (fieldDef.valueExpression || fieldDef.valueCallback)) {
        console.warn(`[LunaGrid] '${fieldName}' 필드는 계산 필드(Calculated Field)이므로 setValue로 수정할 수 없습니다.`);
        return undefined;
      }
      return this.updateRow(rowIdOrIndex, { [fieldName]: value });
    }

    /**
     * 단일 셀 값 조회 (getValue) - 계산 필드 및 Dot Notation 지원
     */
    getValue(rowIdOrIndex, fieldName) {
      const { row, index: rIdx } = this._resolveRowAndIndex(rowIdOrIndex);
      if (!row) return undefined;

      const fieldDef = this.fields.find(f => f.fieldName === fieldName);
      if (fieldDef && (fieldDef.valueExpression || fieldDef.valueCallback || fieldDef.subType || fieldDef.baseField)) {
        return this.calculateFieldValue(fieldDef, row, rIdx);
      }
      if (fieldName && fieldName.includes('.')) {
        return fieldName.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), row);
      }
      return row[fieldName];
    }

    /**
     * 단일 행 JSON 조회 (계산 필드 포함)
     */
    getJsonRow(rowIdOrIndex) {
      const { row, index: rIdx } = this._resolveRowAndIndex(rowIdOrIndex);
      if (!row) return null;

      const result = Object.assign({}, row);
      this.fields.forEach(f => {
        if (f.valueExpression || f.valueCallback || f.subType || f.baseField) {
          result[f.fieldName] = this.calculateFieldValue(f, row, rIdx);
        }
      });
      return result;
    }

    /**
     * 여러 행 JSON 조회 (계산 필드 포함)
     */
    getJsonRows(start = 0, count = -1) {
      const end = count === -1 ? this.rows.length : Math.min(start + count, this.rows.length);
      const list = [];
      for (let i = start; i < end; i++) {
        list.push(this.getJsonRow(i));
      }
      return list;
    }

    /**
     * 특정 행을 새 위치로 이동 (moveRow)
     */
    moveRow(row, newRow) {
      if (row < 0 || row >= this.rows.length || newRow < 0 || newRow >= this.rows.length || row === newRow) {
        return false;
      }
      if (typeof this.onRowMoving === 'function') {
        const canMove = this.onRowMoving(this, row, newRow);
        if (canMove === false) return false;
      }
      const movedItem = this.rows.splice(row, 1)[0];
      this.rows.splice(newRow, 0, movedItem);

      if (typeof this.onRowMoved === 'function') {
        this.onRowMoved(this, row, newRow);
      }
      this._emit('rowMoved', { row, newRow, item: movedItem });
      this._emit('dataChanged', this.rows);
      return true;
    }

    /**
     * 여러 행을 새 위치로 일괄 이동 (moveRows)
     */
    moveRows(row, count, newRow) {
      if (row < 0 || count <= 0 || row + count > this.rows.length || newRow < 0 || newRow > this.rows.length) {
        return false;
      }
      if (typeof this.onRowsMoving === 'function') {
        const canMove = this.onRowsMoving(this, row, count, newRow);
        if (canMove === false) return false;
      }
      const movedItems = this.rows.splice(row, count);
      const adjustedTarget = newRow > row ? newRow - count : newRow;
      this.rows.splice(adjustedTarget, 0, ...movedItems);

      if (typeof this.onRowsMoved === 'function') {
        this.onRowsMoved(this, row, count, newRow);
      }
      this._emit('rowsMoved', { row, count, newRow, items: movedItems });
      this._emit('dataChanged', this.rows);
      return true;
    }

    /**
     * 단일 행 여러 필드 일괄 설정 (setValues)
     * @param {string|number} rowIdOrIndex - 행 ID 또는 인덱스
     * @param {Object} values - 설정할 필드 객체
     * @param {boolean} [strict=false] - true 설정 시 values에 포함되지 않은 기존 필드는 삭제/초기화
     */
    setValues(rowIdOrIndex, values = {}, strict = false) {
      if (strict) {
        return this.updateStrictRow(rowIdOrIndex, values);
      }
      return this.updateRow(rowIdOrIndex, values);
    }

    /**
     * 엄격 모드로 행 데이터 전체 교체 (updateStrictRow)
     */
    updateStrictRow(rowIdOrIndex, values = {}) {
      let row;
      if (typeof rowIdOrIndex === 'number' && rowIdOrIndex >= 0 && rowIdOrIndex < this.rows.length) {
        row = this.rows[rowIdOrIndex];
      } else {
        row = this.rows.find(r => String(r.id) === String(rowIdOrIndex));
      }
      if (!row) return;

      const rowId = row.id;
      const isNew = row._isNew;
      // 기존 필드 클리어 후 새 값만 주입
      const cleaned = { id: rowId, _isNew: isNew, _isDirty: true };
      Object.assign(cleaned, values);

      const idx = this.rows.indexOf(row);
      this.rows[idx] = cleaned;
      if (!isNew) {
        this.rowStates.set(String(rowId), 'updated');
      }
      this._emit('rowUpdated', cleaned);
      return cleaned;
    }

    /**
     * JSON 데이터를 다양한 모드로 적재 (fillJsonData)
     * LunaGrid fillJsonData (set, append, insert, update 모드 및 start, count 옵션 지원)
     * @param {Array<Object>} jsonData - JSON 데이터 배열
     * @param {Object} [options] - { fillMode: 'set'|'append'|'insert'|'update', start: 0, count: -1 }
     */
    fillJsonData(jsonData = [], options = {}) {
      const mode = options.fillMode || 'set';
      const start = options.start || 0;
      let targetData = Array.isArray(jsonData) ? jsonData : [];

      if (options.count > 0) {
        targetData = targetData.slice(0, options.count);
      }

      if (mode === 'set') {
        this.setRows(targetData);
      } else if (mode === 'append') {
        this.addRows(targetData, 'bottom');
      } else if (mode === 'insert') {
        this.insertRows(start, targetData);
      } else if (mode === 'update') {
        this.updateRows(start, targetData);
      }
    }

    /**
     * XML 데이터를 파싱하여 다양한 모드로 적재 (fillXmlData)
     * LunaGrid fillXmlData (rootElement, rowElement, fillMode 지원)
     * @param {string|XMLDocument} xmlData - XML 문자열 또는 DOM 객체
     * @param {Object} [options] - { rootElement: string, rowElement: string, fillMode: string, count: number, start: number }
     */
    fillXmlData(xmlData, options = {}) {
      if (!xmlData) return;
      let xmlDoc = xmlData;

      if (typeof xmlData === 'string') {
        const parser = new DOMParser();
        xmlDoc = parser.parseFromString(xmlData, 'application/xml');
      }

      const rowTag = options.rowElement || 'row';
      let rowNodes = xmlDoc.getElementsByTagName(rowTag);

      // rowTag로 못 찾았을 경우 root의 자식 노드들 탐색
      if (rowNodes.length === 0 && options.rootElement) {
        const root = xmlDoc.getElementsByTagName(options.rootElement)[0];
        if (root) rowNodes = root.children;
      }

      const rows = [];
      for (let i = 0; i < rowNodes.length; i++) {
        const node = rowNodes[i];
        const rowObj = {};
        for (let j = 0; j < node.children.length; j++) {
          const child = node.children[j];
          rowObj[child.tagName] = child.textContent;
        }
        // 속성(Attribute)도 포함
        for (let a = 0; a < node.attributes.length; a++) {
          const attr = node.attributes[a];
          rowObj[attr.name] = attr.value;
        }
        rows.push(rowObj);
      }

      this.fillJsonData(rows, options);
      return rows;
    }

    /**
     * CSV 텍스트 데이터를 고속 파싱하여 다양한 모드로 적재 (fillCsvData)
     * LunaGrid fillCsvData (start, count, delimiter, fillMode, quoted 지원)
     * @param {string} csvText - CSV 원본 텍스트
     * @param {Object} [options] - { start: 0, count: -1, delimiter: ',', fillMode: 'set', header: false }
     */
    fillCsvData(csvText, options = {}) {
      if (!csvText || typeof csvText !== 'string') return [];
      const delimiter = options.delimiter || ',';
      const fillMode = options.fillMode || 'set';
      const start = typeof options.start === 'number' ? options.start : 0;
      const count = typeof options.count === 'number' ? options.count : -1;

      // CSV 줄바꿈 및 따옴표 정밀 파싱
      const lines = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
      const parsedRows = [];
      const fieldNames = this.fields.length > 0 ? this.fields.map(f => f.fieldName) : [];

      let lineIdx = 0;
      // 첫 행이 헤더인 경우
      let headerLineOffset = 0;
      if (options.header === true && lines.length > 0 && fieldNames.length === 0) {
        const hCols = lines[0].split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
        this.setFields(hCols.map(fn => ({ fieldName: fn })));
        headerLineOffset = 1;
      }

      const totalLines = lines.length;
      const endLine = count === -1 ? totalLines : Math.min(start + headerLineOffset + count, totalLines);

      for (let i = start + headerLineOffset; i < endLine; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // CSV 셀 분할 (따옴표 내부 쉼표 보호)
        let cells = [];
        if (line.includes('"')) {
          const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
          let match;
          while ((match = regex.exec(line)) !== null && match.index < line.length) {
            let val = match[1] ?? '';
            if (val.startsWith('"') && val.endsWith('"')) {
              val = val.slice(1, -1).replace(/""/g, '"');
            }
            cells.push(val.trim());
          }
        } else {
          cells = line.split(delimiter).map(c => c.trim());
        }

        const rowObj = {};
        const curFields = this.fields.map(f => f.fieldName);
        curFields.forEach((fn, fIdx) => {
          rowObj[fn] = cells[fIdx] !== undefined ? cells[fIdx] : '';
        });
        parsedRows.push(rowObj);
      }

      this.fillJsonData(parsedRows, { fillMode, start: 0, count: -1 });
      return parsedRows;
    }

    /**
     * 대용량 데이터 로드 및 성능 벤치마크 측정 엔진 (loadBulkData)
     * 브라우저 UI 블로킹 없이 비동기 청크 분할 고속 로드
     * @param {Array<Object>|string} data - 대용량 데이터 배열 또는 CSV/JSON
     * @param {Object} [options] - { chunkSize: 5000, onProgress: fn, fillMode: 'set' }
     */
    async loadBulkData(data, options = {}) {
      const startTime = performance.now();
      const chunkSize = options.chunkSize || 5000;
      const onProgress = typeof options.onProgress === 'function' ? options.onProgress : null;
      let rows = [];

      if (typeof data === 'string') {
        if (data.trim().startsWith('[') || data.trim().startsWith('{')) {
          rows = JSON.parse(data);
        } else {
          rows = this.fillCsvData(data, Object.assign({}, options, { fillMode: 'none' })) || [];
        }
      } else if (Array.isArray(data)) {
        rows = data;
      }

      const totalRows = rows.length;
      const fillMode = options.fillMode || 'set';

      if (fillMode === 'set') {
        this.clearRows();
      }

      // 청크 단위 비동기 적재
      for (let i = 0; i < totalRows; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        this.addRows(chunk, 'bottom');

        if (onProgress) {
          const percent = Math.min(100, Math.round(((i + chunk.length) / totalRows) * 100));
          onProgress({ loaded: i + chunk.length, total: totalRows, percent });
        }

        // 브라우저 렌더링 프레임 양보 (Microtask/RAF)
        if (i + chunkSize < totalRows) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }

      const endTime = performance.now();
      const elapsedMs = Math.round(endTime - startTime);

      return {
        totalRows,
        elapsedTimeMs: elapsedMs,
        rowsPerSecond: Math.round((totalRows / (elapsedMs || 1)) * 1000)
      };
    }

    /**
     * 대용량 테스트 목업 데이터 고속 생성기 (generateLargeData)
     * @param {number} count - 생성할 행 개수 (예: 10000, 50000, 100000)
     * @param {Array<Object>} [fieldDefs] - 커스텀 필드 명세
     */
    generateLargeData(count = 10000, fieldDefs = null) {
      const depts = ['경영기획팀', 'IT개발팀', '디자인팀', '영업1팀', '글로벌사업부', '마케팅본부', '품질관리팀'];
      const roles = ['사원', '대리', '과장', '차장', '부장', '팀장', '이사'];
      const cities = ['서울', '성남', '부산', '대구', '인천', '대전', '광주'];
      const names = ['김민수', '이서연', '박도윤', '최지우', '정예준', '강하은', '조건우', '윤수아', '장시우', '임지아'];

      const result = new Array(count);
      for (let i = 0; i < count; i++) {
        const idNum = 100001 + i;
        result[i] = {
          id: idNum,
          empNo: `EMP-${idNum}`,
          name: names[i % names.length] + `_${(i % 100) + 1}`,
          dept: depts[i % depts.length],
          role: roles[i % roles.length],
          city: cities[i % cities.length],
          salary: 35000000 + ((i * 123456) % 65000000),
          bonus: 1000000 + ((i * 54321) % 15000000),
          score: 50 + (i % 51),
          startDate: `202${(i % 5) + 1}-0${(i % 9) + 1}-15`,
          status: i % 10 === 0 ? '휴직' : (i % 7 === 0 ? '퇴사' : '재직')
        };
      }
      return result;
    }

    /**
     * 원격 URL 또는 비동기 소스로부터 JSON / XML 데이터를 가져와 적재 (loadData)
     * @param {Object} options - { type: 'json'|'xml'|'csv', url: string, method: 'GET'|'POST', params: Object, fillMode: string, count: number, start: number }
     */
    async loadData(options = {}) {
      const url = typeof options === 'string' ? options : options.url;
      if (!url) return;

      const type = (options.type || (url.endsWith('.xml') ? 'xml' : (url.endsWith('.csv') ? 'csv' : 'json'))).toLowerCase();
      const method = (options.method || 'GET').toUpperCase();
      const fetchOpts = { method };
      if (method === 'POST' && options.params) {
        fetchOpts.headers = { 'Content-Type': 'application/json' };
        fetchOpts.body = JSON.stringify(options.params);
      }

      try {
        const response = await fetch(url, fetchOpts);
        if (type === 'xml') {
          const xmlText = await response.text();
          return this.fillXmlData(xmlText, options);
        } else if (type === 'csv') {
          const csvText = await response.text();
          return this.fillCsvData(csvText, options);
        } else {
          const data = await response.json();
          const jsonRows = Array.isArray(data) ? data : (data.rows || data.data || data.items || []);
          this.fillJsonData(jsonRows, options);
          return jsonRows;
        }
      } catch (err) {
        console.error('[LunaGrid] loadData 실패:', err);
        throw err;
      }
    }

    /**
     * 단일 행 전체 필드 값 조회 (getValues)
     */
    getValues(rowIdOrIndex) {
      let row;
      if (typeof rowIdOrIndex === 'number' && rowIdOrIndex >= 0 && rowIdOrIndex < this.rows.length) {
        row = this.rows[rowIdOrIndex];
      } else {
        row = this.rows.find(r => String(r.id) === String(rowIdOrIndex));
      }
      return row ? this._cleanRow(row) : null;
    }

    /**
     * 전체 행 개수 반환 (getRowCount)
     * @returns {number}
     */
    getRowCount() {
      return this.rows ? this.rows.length : 0;
    }

    getRows(startRow = 0, endRow = -1) {
      const end = endRow === -1 ? this.rows.length : Math.min(endRow + 1, this.rows.length);
      const sliced = this.rows.slice(startRow, end);
      return sliced.map(r => this._cleanRow(r));
    }

    /**
     * 특정 필드(컬럼)의 값들만 1차원 배열로 추출 (getFieldValues)
     * @param {string} fieldName - 필드명
     * @param {number} [startRow=0] - 시작 인덱스
     * @param {number} [endRow=-1] - 종료 인덱스
     */
    getFieldValues(fieldName, startRow = 0, endRow = -1) {
      const rows = this.getRows(startRow, endRow);
      return rows.map(r => r[fieldName]);
    }

    /**
     * 특정 필드의 중복 없는 고유값 목록 추출 (getDistinctValues)
     * @param {string} fieldName - 필드명
     * @param {number} [maxCount=-1] - 최대 추출 개수
     */
    getDistinctValues(fieldName, maxCount = -1) {
      const allVals = this.getFieldValues(fieldName);
      const distinctSet = new Set(allVals.filter(v => v !== undefined && v !== null && v !== ''));
      const distinctList = Array.from(distinctSet);
      return maxCount > 0 ? distinctList.slice(0, maxCount) : distinctList;
    }

    getRowState(rowIdOrIndex) {
      if (rowIdOrIndex === undefined || rowIdOrIndex === null) return 'none';
      if (typeof rowIdOrIndex === 'object' && rowIdOrIndex !== null) {
        return this.rowStates.get(String(rowIdOrIndex.id)) || (rowIdOrIndex._isNew ? 'created' : (rowIdOrIndex._isDirty ? 'updated' : 'none'));
      }
      const directState = this.rowStates.get(String(rowIdOrIndex));
      if (directState) return directState;
      if (typeof rowIdOrIndex === 'number' && rowIdOrIndex >= 0 && rowIdOrIndex < this.rows.length) {
        return this.rowStates.get(String(this.rows[rowIdOrIndex].id)) || 'none';
      }
      return 'none';
    }

    _cleanRow(row) {
      if (!row) return null;
      const copy = Object.assign({}, row);
      delete copy._isNew;
      delete copy._isDirty;
      delete copy._dirtyFields;
      delete copy._isLazyPlaceholder;
      return copy;
    }

    getStateRows(state) {
      const s = String(state || '').toLowerCase();
      if (s === 'created') return this.rows.filter(r => this.getRowState(r.id) === 'created').map(r => this._cleanRow(r));
      if (s === 'updated') return this.rows.filter(r => this.getRowState(r.id) === 'updated').map(r => this._cleanRow(r));
      if (s === 'deleted') return (this.deletedRows || []).map(r => this._cleanRow(r));
      if (s === 'createanddeleted') return (this.deletedRows || []).filter(r => this.rowStates.get(String(r.id)) === RowState.CREATE_AND_DELETED).map(r => this._cleanRow(r));
      return [];
    }

    getAllStateRows() {
      return {
        created: this.getStateRows('created'),
        updated: this.getStateRows('updated'),
        deleted: this.getStateRows('deleted')
      };
    }

    commit() {
      this.rows.forEach(r => {
        delete r._isNew;
        delete r._isDirty;
        delete r._dirtyFields;
        this.rowStates.set(String(r.id), 'none');
      });
      this.deletedRows = [];
      this.originalRows = JSON.parse(JSON.stringify(this.rows));
      this._emit('dataCommitted');
    }

    /**
     * 전체 데이터 롤백 (rollback)
     * 직전 commit 시점 또는 최초 로드 시점으로 모든 C/U/D 변경 사항 원상 복구
     */
    rollback() {
      this.setRows(this.originalRows);
      this._emit('dataRollback');
    }

    /**
     * 특정 단일 행에 대한 롤백 (rollbackRow)
     * @param {string|number} rowIdOrIndex - 대상 행 ID 또는 0-based 행 인덱스
     */
    rollbackRow(rowIdOrIndex) {
      let targetRow;
      let rIdx = -1;
      if (typeof rowIdOrIndex === 'number' && rowIdOrIndex >= 0 && rowIdOrIndex < this.rows.length) {
        rIdx = rowIdOrIndex;
        targetRow = this.rows[rIdx];
      } else {
        rIdx = this.rows.findIndex(r => String(r.id) === String(rowIdOrIndex));
        if (rIdx !== -1) targetRow = this.rows[rIdx];
      }

      // 1. 삭제된 행 복원 시도
      const deletedIdx = this.deletedRows.findIndex(r => String(r.id) === String(rowIdOrIndex));
      if (deletedIdx !== -1) {
        const restored = this.deletedRows.splice(deletedIdx, 1)[0];
        delete restored._isDirty;
        this.rows.push(restored);
        this.rowStates.set(String(restored.id), 'none');
        this._emit('rowUpdated', restored);
        return restored;
      }

      if (!targetRow) return null;
      const rowIdStr = String(targetRow.id);
      const state = this.getRowState(targetRow.id);

      // 2. 새로 추가된(created) 행 -> 제거
      if (state === 'created' || targetRow._isNew) {
        this.rows.splice(rIdx, 1);
        this.rowStates.delete(rowIdStr);
        this._emit('rowDeleted', [targetRow]);
        return targetRow;
      }

      // 3. 수정된(updated) 행 -> originalRows 원본 값으로 복구
      if (state === 'updated' || targetRow._isDirty) {
        const orig = this.originalRows.find(r => String(r.id) === rowIdStr);
        if (orig) {
          const restored = JSON.parse(JSON.stringify(orig));
          delete restored._isDirty;
          delete restored._dirtyFields;
          this.rows[rIdx] = restored;
          this.rowStates.set(rowIdStr, 'none');
          this._emit('rowUpdated', restored);
          return restored;
        }
      }

      return targetRow;
    }

    /**
     * LunaDataAdapter 데이터 검색 (searchData / searchDataRow)
     * LunaGrid searchData (fields, values, startIndex, wrap, caseSensitive, partialMatch, allFields 지원)
     * @param {Object} options - 검색 옵션
     * @returns {number[]} 매칭된 dataRow 인덱스 배열 (없으면 [])
     */
    searchData(options = {}) {
      if (!this.rows || this.rows.length === 0) return [];
      const fields = Array.isArray(options.fields) ? options.fields : (options.fields ? [options.fields] : []);
      const values = Array.isArray(options.values) ? options.values : (options.values !== undefined ? [options.values] : []);
      if (fields.length === 0 || values.length === 0) return [];

      const total = this.rows.length;
      const start = options.startIndex !== undefined ? Math.max(0, Math.min(options.startIndex, total - 1)) : 0;
      const wrap = options.wrap !== false;
      const caseSensitive = options.caseSensitive === true;
      const partialMatch = options.partialMatch !== false;
      const allFields = options.allFields !== false;
      const isBackward = options.direction === 'backward';

      const matchCell = (cell, target) => {
        if (cell === undefined || cell === null) return false;
        let sCell = String(cell);
        let sTarget = String(target);
        if (!caseSensitive) {
          sCell = sCell.toLowerCase();
          sTarget = sTarget.toLowerCase();
        }
        return partialMatch ? sCell.includes(sTarget) : sCell === sTarget;
      };

      const matchRow = (row) => {
        const results = fields.map((field, idx) => {
          const targetVal = values[idx] !== undefined ? values[idx] : values[0];
          return matchCell(row[field], targetVal);
        });
        return allFields ? results.every(Boolean) : results.some(Boolean);
      };

      const indices = [];
      const checkRange = (from, to, step) => {
        for (let i = from; step > 0 ? i <= to : i >= to; i += step) {
          if (matchRow(this.rows[i])) indices.push(i);
        }
      };

      if (!isBackward) {
        checkRange(start, total - 1, 1);
        if (wrap && start > 0) checkRange(0, start - 1, 1);
      } else {
        checkRange(start, 0, -1);
        if (wrap && start < total - 1) checkRange(total - 1, start + 1, -1);
      }
      return indices;
    }

    /**
     * 행 단위 검색 – 첫 번째 매치 인덱스를 반환
     */
    searchDataRow(options = {}) {
      const arr = this.searchData(options);
      return arr.length ? arr[0] : -1;
    }

    /**
     * 롤백 가능한 변경 내역이 존재하는지 확인 (canRollback)
     */
    canRollback() {
      const hasDirty = Array.from(this.rowStates.values()).some(s => s !== 'none');
      return hasDirty || this.deletedRows.length > 0;
    }

    /**
     * 현재 상태 스냅샷 저장 (saveStates)
     */
    saveStates() {
      this._stateSnapshot = {
        rows: JSON.parse(JSON.stringify(this.rows)),
        deletedRows: JSON.parse(JSON.stringify(this.deletedRows)),
        rowStates: new Map(this.rowStates)
      };
    }

    /**
     * 특정 행의 상태(RowState)를 가져옴 (getRowState)
     * @param {number|string|Object} row - 행 인덱스, 행 ID 또는 행 객체
     * @returns {'none'|'created'|'updated'|'deleted'|'createAndDeleted'}
     */
    getRowState(row) {
      if (!this.options.checkStates) return RowState.NONE;
      if (row === undefined || row === null) return RowState.NONE;

      // 1. row가 객체인 경우
      if (typeof row === 'object' && row !== null) {
        const strId = String(row.id !== undefined ? row.id : (row._rowKey !== undefined ? row._rowKey : ''));
        if (strId && this.rowStates.has(strId)) return this.rowStates.get(strId);
        return row._isNew ? RowState.CREATED : (row._isDirty ? RowState.UPDATED : RowState.NONE);
      }

      // 2. rowStates Map에 ID로 직접 존재하는 경우 (예: ID 201 또는 '201')
      const directState = this.rowStates.get(String(row));
      if (directState) return directState;

      // 3. 0-based 행 인덱스인 경우
      if (typeof row === 'number' && row >= 0 && row < this.rows.length) {
        const rowObj = this.rows[row];
        if (rowObj && rowObj.id !== undefined) {
          const s = this.rowStates.get(String(rowObj.id));
          if (s) return s;
        }
      }

      // 4. deletedRows 확인
      if (this.deletedRows) {
        if (typeof row === 'number' && this.deletedRows[row]) {
          const s = this.rowStates.get(String(this.deletedRows[row].id));
          if (s) return s;
        }
      }

      return RowState.NONE;
    }

    /**
     * 특정 행의 상태(RowState)를 임의로 변경 (setRowState)
     * @param {number|string} row - 행 인덱스 또는 ID
     * @param {'none'|'created'|'updated'|'deleted'|'createAndDeleted'} state - 변경할 상태
     * @param {boolean} [force=false] - 강제 변경 여부
     */
    setRowState(row, state, force = false) {
      let targetRow;
      if (typeof row === 'number' && row >= 0 && row < this.rows.length) {
        targetRow = this.rows[row];
      } else {
        targetRow = this.rows.find(r => String(r.id) === String(row));
      }

      if (!targetRow) return;
      const rowIdStr = String(targetRow.id);
      const prevState = this.rowStates.get(rowIdStr) || RowState.NONE;

      if (!force) {
        // created 행은 값이 변경되어도 updated로 변경되지 않음
        if (prevState === RowState.CREATED && state === RowState.UPDATED) {
          return;
        }
        // created 상태에서 삭제 시 createAndDeleted 로 전이
        if (prevState === RowState.CREATED && state === RowState.DELETED) {
          state = RowState.CREATE_AND_DELETED;
        }
      }

      this.rowStates.set(rowIdStr, state);
      if (state === RowState.NONE) {
        targetRow._isNew = false;
        targetRow._isDirty = false;
        targetRow._isDeleted = false;
      } else if (state === RowState.CREATED) {
        targetRow._isNew = true;
        targetRow._isDirty = true;
        targetRow._isDeleted = false;
      } else if (state === RowState.UPDATED) {
        targetRow._isDirty = true;
        targetRow._isDeleted = false;
      } else if (state === RowState.DELETED || state === RowState.CREATE_AND_DELETED) {
        targetRow._isDeleted = true;
      }

      this._emit('rowStateChanged', { row: targetRow, rowId: rowIdStr, state, prevState });
    }

    /**
     * 여러 행의 상태를 배열로 가져옴 (getRowStates)
     * @param {Array<number|string>} rows - 행 인덱스 배열
     */
    getRowStates(rows = []) {
      if (!Array.isArray(rows)) return [];
      return rows.map(r => this.getRowState(r));
    }

    /**
     * 여러 행의 상태를 일괄 변경 (setRowStates)
     * @param {Array<number|string>} rows - 행 인덱스 배열
     * @param {'none'|'created'|'updated'|'deleted'|'createAndDeleted'} state - 변경할 상태
     * @param {boolean} [force=false]
     */
    setRowStates(rows = [], state, force = false) {
      if (!Array.isArray(rows)) return;
      rows.forEach(r => this.setRowState(r, state, force));
    }

    /**
     * 상태별 행 인덱스 번호 목록 반환 (getStateRowIndices)
     * @param {'created'|'updated'|'deleted'|'all'|'allDirty'} state
     * @returns {Array<number>}
     */
    getStateRowIndices(state = 'allDirty') {
      const resultIndices = [];
      const targetState = String(state).toLowerCase();

      this.rows.forEach((row, idx) => {
        const s = this.getRowState(row);
        if (targetState === 'all' || targetState === 'alldirty') {
          if (s !== RowState.NONE && s !== 'none') resultIndices.push(idx);
        } else if (s === state || s.toLowerCase() === targetState) {
          resultIndices.push(idx);
        }
      });

      return resultIndices;
    }

    /**
     * 모든 행 상태를 'none'으로 초기화 (clearRowStates)
     * @param {boolean} [deleteRows=false] - deleted 상태의 행들을 영구 제거할지 여부
     */
    clearRowStates(deleteRows = false) {
      this.rowStates.clear();
      this.rows.forEach(r => {
        r._isNew = false;
        r._isDirty = false;
        this.rowStates.set(String(r.id), RowState.NONE);
      });
      if (deleteRows) {
        this.deletedRows = [];
      }
      this._emit('rowStatesCleared');
    }

    /**
     * 저장된 상태 스냅샷으로 복원 (restoreStates)
     */
    restoreStates() {
      if (!this._stateSnapshot) return;
      this.rows = JSON.parse(JSON.stringify(this._stateSnapshot.rows));
      this.deletedRows = JSON.parse(JSON.stringify(this._stateSnapshot.deletedRows));
      this.rowStates = new Map(this._stateSnapshot.rowStates);
      this._emit('statesRestored');
    }

    on(event, callback) {
      if (typeof callback === 'function') {
        this.listeners.push({ event, callback });
      }
      return this;
    }

    off(event, callback) {
      if (!callback) {
        this.listeners = this.listeners.filter(l => l.event !== event && l.event !== `on${event.charAt(0).toUpperCase() + event.slice(1)}`);
      } else {
        this.listeners = this.listeners.filter(l => !((l.event === event || l.event === `on${event.charAt(0).toUpperCase() + event.slice(1)}`) && l.callback === callback));
      }
      return this;
    }

    emit(event, ...args) {
      return this._emit(event, ...args);
    }

    _emit(event, ...args) {
      let cancel = false;
      const propHandlerName = event.startsWith('on') ? event : `on${event.charAt(0).toUpperCase() + event.slice(1)}`;
      if (typeof this[propHandlerName] === 'function') {
        try {
          const res = this[propHandlerName](this, ...args);
          if (res === false) cancel = true;
        } catch (e) {
          console.error(`[LunaDataAdapter ${propHandlerName} error]`, e);
        }
      }

      const matched = this.listeners.filter(l => l.event === event || l.event === propHandlerName);
      for (const l of matched) {
        try {
          const res = l.callback(this, ...args);
          if (res === false) cancel = true;
        } catch (e) {
          try {
            const res = l.callback(...args);
            if (res === false) cancel = true;
          } catch (e2) {
            console.error(`[LunaDataAdapter event '${event}' error]`, e);
          }
        }
      }

      return !cancel;
    }

    _cleanRow(row) {
      const copy = Object.assign({}, row);
      delete copy._isNew;
      delete copy._isDirty;
      delete copy._dirtyFields;
      return copy;
    }
  }

  // =========================================================================
  // 1-2. TreeLunaDataAdapter (LunaGrid TreeLunaDataAdapter - 계층 트리 데이터 모델)
  // =========================================================================
  class TreeLunaDataAdapter extends LunaDataAdapter {
    constructor(options = {}) {
      super(options);
      this.treeRoots = [];         // 최상위 루트 노드 ID 목록
      this.nodeMap = new Map();     // nodeId -> TreeNode
      this.expandedNodes = new Set(); // 펼쳐진 node ID Set
      this.treeOptions = Object.assign({
        expandWhenSetData: true,
        iconField: 'icon',
        lineVisible: true
      }, options.treeOptions || {});
    }

    /**
     * 계층형 트리 데이터 적재 (setRows / setTreeData)
     * LunaGrid setRows (rows, treeField, needSorting, childrenField, iconField) 완벽 지원
     * @param {Array<Object>|Array<Array<any>>} data - 2D Array, 중첩 Array 또는 계층 JSON 배열
     * @param {string|number} [treeField] - 2D 플랫 배열일 때 트리 계층 경로 필드명 또는 인덱스 (예: 'treePath', 0)
     * @param {boolean} [needSorting=false] - treeField 기준 정렬 필요 여부
     * @param {string|number} [childrenField] - 자식 행들이 위치한 필드명 또는 컬럼 인덱스
     * @param {string|number} [iconField] - 아이콘 필드명 또는 인덱스
     */
    setRows(data = [], treeField = null, needSorting = false, childrenField = null, iconField = null) {
      this.clearRows();
      this.nodeMap.clear();
      this.treeRoots = [];
      this.expandedNodes.clear();

      if (!Array.isArray(data) || data.length === 0) {
        this.rows = [];
        this._emit('dataChanged', this.rows);
        return;
      }

      const fieldNames = this.fields.map(f => f.fieldName || f.name || f.key);
      let seq = 1;

      // 1. treeField 기반의 플랫 2D Array / Flat Object 배열인 경우 (예: '001', '001001' 또는 '1.1', '1.1.1' 경로 코드)
      const is2dArray = Array.isArray(data[0]);
      if (treeField !== null && treeField !== undefined && treeField !== '') {
        let rawItems = is2dArray ? data.map(arr => {
          const obj = {};
          fieldNames.forEach((fn, idx) => {
            if (arr[idx] !== undefined && !Array.isArray(arr[idx])) {
              obj[fn] = arr[idx];
            }
          });
          return obj;
        }) : JSON.parse(JSON.stringify(data));

        const tField = typeof treeField === 'number' && fieldNames[treeField] ? fieldNames[treeField] : treeField;

        // needSorting: true 시 트리 코드 순으로 정렬
        if (needSorting) {
          rawItems.sort((a, b) => String(a[tField] ?? '').localeCompare(String(b[tField] ?? '')));
        }

        // 경로 코드 기반 부모-자식 트리 노드 빌드
        const codeMap = new Map(); // pathCode -> node
        rawItems.forEach(item => {
          const code = String(item[tField] ?? '');
          const id = item.id !== undefined ? String(item.id) : `TNODE_${seq++}`;
          item.id = id;

          // 부모 경로 코드 탐색 (예: '001001' -> 부모 '001', '1.2.3' -> 부모 '1.2', '/A/B' -> 부모 '/A')
          let parentCode = null;
          let level = 0;

          if (code.includes('.')) {
            const parts = code.split('.');
            level = parts.length - 1;
            if (parts.length > 1) parentCode = parts.slice(0, -1).join('.');
          } else if (code.includes('/')) {
            const parts = code.replace(/^\//, '').split('/');
            level = parts.length - 1;
            if (parts.length > 1) parentCode = '/' + parts.slice(0, -1).join('/');
          } else if (code.length >= 2) {
            // 고정 길이 코드 (예: 2자리 또는 3자리 단위 분할)
            const step = (code.length % 3 === 0) ? 3 : 2;
            level = Math.floor(code.length / step) - 1;
            if (code.length > step) parentCode = code.slice(0, -step);
          }

          const parentNode = parentCode ? codeMap.get(parentCode) : null;
          const node = {
            id,
            row: item,
            parentId: parentNode ? parentNode.id : null,
            children: [],
            level,
            hasChildren: false,
            isExpanded: this.treeOptions.expandWhenSetData !== false
          };

          codeMap.set(code, node);
          this.nodeMap.set(id, node);
          if (node.isExpanded) this.expandedNodes.add(id);

          if (parentNode) {
            parentNode.children.push(node.id);
            parentNode.hasChildren = true;
          } else {
            this.treeRoots.push(node.id);
          }
        });

        this._rebuildFlatRows();
        return;
      }

      // 2. 중첩 계층형 Array 또는 계층 JSON 빌드 엔진 (childrenField, iconField 지원)
      const buildNodeFromArrayOrObject = (item, parentId = null, level = 0) => {
        let rowObj = {};
        let children = [];

        if (Array.isArray(item)) {
          // 2D Array 데이터 매핑
          let childArr = null;
          let fCount = 0;

          item.forEach((val, idx) => {
            if (Array.isArray(val)) {
              childArr = val; // 자식 행들의 배열
            } else if (typeof childrenField === 'number' && idx === childrenField) {
              childArr = val;
            } else {
              const fn = fieldNames[fCount] || `col_${fCount}`;
              rowObj[fn] = val;
              fCount++;
            }
          });

          if (childArr && Array.isArray(childArr)) {
            children = childArr;
          }
        } else if (typeof item === 'object' && item !== null) {
          rowObj = Object.assign({}, item);
          const cField = childrenField || (item.rows ? 'rows' : 'children');
          children = item[cField] || [];
        }

        const id = rowObj.id !== undefined ? String(rowObj.id) : `TNODE_${seq++}`;
        rowObj.id = id;

        if (iconField) {
          const iField = typeof iconField === 'number' ? fieldNames[iconField] : iconField;
          if (rowObj[iField] !== undefined) rowObj.icon = rowObj[iField];
        }

        const hasChildren = children.length > 0 || item.hasChildren === true;
        const node = {
          id,
          row: rowObj,
          parentId: parentId ? String(parentId) : null,
          children: [],
          level,
          hasChildren,
          isExpanded: this.treeOptions.expandWhenSetData !== false
        };

        this.nodeMap.set(node.id, node);
        if (node.isExpanded) this.expandedNodes.add(node.id);

        if (children.length > 0) {
          children.forEach(child => {
            const childNode = buildNodeFromArrayOrObject(child, node.id, level + 1);
            node.children.push(childNode.id);
          });
        }

        return node;
      };

      data.forEach(item => {
        const rootNode = buildNodeFromArrayOrObject(item, null, 0);
        this.treeRoots.push(rootNode.id);
      });

      this._rebuildFlatRows();
    }

    /**
     * 계층 트리 JSON 객체 데이터 적재 (setObjectRows)
     * LunaGrid setObjectRows (json, rowsProp, childrenProp, iconProp) 완벽 지원
     * @param {Object|Array} json - 계층 트리 구조를 가진 JSON 객체 또는 배열
     * @param {string} [rowsProp] - 루트 행 목록이 담긴 속성명 (예: 'rows', 'items', 'data')
     * @param {string} [childrenProp='children'] - 자식 노드 배열 속성명
     * @param {string} [iconProp] - 아이콘 속성명
     */
    setObjectRows(json = [], rowsProp = null, childrenProp = 'children', iconProp = null) {
      let rootItems = [];
      if (Array.isArray(json)) {
        rootItems = json;
      } else if (typeof json === 'object' && json !== null) {
        if (rowsProp && Array.isArray(json[rowsProp])) {
          rootItems = json[rowsProp];
        } else if (Array.isArray(json.rows)) {
          rootItems = json.rows;
        } else if (Array.isArray(json.items)) {
          rootItems = json.items;
        } else if (Array.isArray(json.data)) {
          rootItems = json.data;
        } else if (Array.isArray(json.children)) {
          rootItems = json.children;
        } else {
          rootItems = [json];
        }
      }

      this.setRows(rootItems, null, false, childrenProp, iconProp);
    }

    /**
     * 중첩 계층형 트리 JSON 데이터 적재 (setNestedRows)
     * @param {Array<Object>} json - 중첩 자식 객체 배열
     * @param {string} [childrenProp='children'] - 자식 배열 속성명
     * @param {string} [iconProp] - 아이콘 속성명
     */
    setNestedRows(json = [], childrenProp = 'children', iconProp = null) {
      this.setObjectRows(json, null, childrenProp, iconProp);
    }

    /**
     * 트리 JSON 데이터를 다양한 모드로 적재 (fillJsonData)
     * @param {Array<Object>|Object} jsonData - 트리 JSON 데이터
     * @param {Object} [options] - { fillMode: string, rowsProp: string, childrenProp: string, iconProp: string, treeField: string, needSorting: boolean }
     */
    fillJsonData(jsonData = [], options = {}) {
      const rowsProp = options.rowsProp || options.rootElement || options.root;
      const childrenProp = options.childrenProp || options.childrenField || (options.children || 'children');
      const iconProp = options.iconProp || options.iconField;
      const treeField = options.treeField;
      const needSorting = options.needSorting === true;

      if (treeField) {
        this.setRows(jsonData, treeField, needSorting, childrenProp, iconProp);
      } else {
        this.setObjectRows(jsonData, rowsProp, childrenProp, iconProp);
      }
    }

    /**
     * 계층형 트리 XML 데이터를 파싱하여 적재 (setXmlRows)
     * LunaGrid setXmlRows (xml, rowElement, childrenField, iconField) 완벽 지원
     * @param {string|XMLDocument} xml - XML 문자열 또는 DOM 객체
     * @param {string} [rowElement='row'] - 행을 나타내는 XML 태그명
     * @param {string} [childrenField] - 자식 노드들이 담긴 태그명 또는 속성명
     * @param {string} [iconField] - 아이콘 태그명 또는 속성명
     */
    setXmlRows(xml, rowElement = 'row', childrenField = null, iconField = null) {
      if (!xml) return;
      let xmlDoc = xml;
      if (typeof xml === 'string') {
        const parser = new DOMParser();
        xmlDoc = parser.parseFromString(xml, 'application/xml');
      }

      const rTag = rowElement || 'row';

      const parseXmlNode = (domNode) => {
        const rowObj = {};
        const childNodes = [];

        // 1. Attribute 파싱
        if (domNode.attributes) {
          for (let i = 0; i < domNode.attributes.length; i++) {
            const attr = domNode.attributes[i];
            rowObj[attr.name] = attr.value;
          }
        }

        // 2. Child Element 파싱
        if (domNode.children) {
          for (let i = 0; i < domNode.children.length; i++) {
            const child = domNode.children[i];
            const tagName = child.tagName;

            // 자식 row 노드인 경우
            if (tagName.toLowerCase() === rTag.toLowerCase()) {
              childNodes.push(parseXmlNode(child));
            } else if (childrenField && tagName.toLowerCase() === childrenField.toLowerCase()) {
              // <children> <row> ... </row> </children> 래퍼 형태인 경우
              for (let c = 0; c < child.children.length; c++) {
                if (child.children[c].tagName.toLowerCase() === rTag.toLowerCase()) {
                  childNodes.push(parseXmlNode(child.children[c]));
                }
              }
            } else {
              // 일반 데이터 필드 태그인 경우
              if (child.children.length === 0) {
                rowObj[tagName] = child.textContent;
              }
            }
          }
        }

        if (iconField) {
          if (rowObj[iconField] !== undefined) rowObj.icon = rowObj[iconField];
        }

        if (childNodes.length > 0) {
          rowObj.rows = childNodes;
        }

        return rowObj;
      };

      // 최상위 루트 row 노드들 추출
      const rootList = [];
      const rootEl = xmlDoc.documentElement;
      if (!rootEl) return;

      if (rootEl.tagName.toLowerCase() === rTag.toLowerCase()) {
        rootList.push(parseXmlNode(rootEl));
      } else {
        for (let i = 0; i < rootEl.children.length; i++) {
          const c = rootEl.children[i];
          if (c.tagName.toLowerCase() === rTag.toLowerCase()) {
            rootList.push(parseXmlNode(c));
          } else if (childrenField && c.tagName.toLowerCase() === childrenField.toLowerCase()) {
            for (let sub = 0; sub < c.children.length; sub++) {
              if (c.children[sub].tagName.toLowerCase() === rTag.toLowerCase()) {
                rootList.push(parseXmlNode(c.children[sub]));
              }
            }
          }
        }
      }

      this.setObjectRows(rootList, null, 'rows', iconField);
    }

    /**
     * 계층형 트리 XML 데이터 적재 (fillXmlData)
     * @param {string|XMLDocument} xmlData - XML 데이터
     * @param {Object} [options] - { rowElement: string, childrenField: string, iconField: string }
     */
    fillXmlData(xmlData, options = {}) {
      const rowElement = options.rowElement || options.rowTag || 'row';
      const childrenField = options.childrenField || options.childrenElement;
      const iconField = options.iconField || options.iconElement;
      this.setXmlRows(xmlData, rowElement, childrenField, iconField);
    }

    setTreeData(data = [], treeField = null, needSorting = false, childrenField = null, iconField = null) {
      this.setRows(data, treeField, needSorting, childrenField, iconField);
    }

    setTreeRows(data = [], treeField = null, needSorting = false, childrenField = 'children', iconField = null) {
      if (Array.isArray(data) && data.length > 0 && data[0] && data[0].children) {
        this.setObjectRows(data, null, childrenField, iconField);
      } else {
        this.setRows(data, treeField, needSorting, childrenField, iconField);
      }
    }

    _rebuildFlatRows() {
      const flatList = [];
      const traverse = (nodeId) => {
        const node = this.nodeMap.get(String(nodeId));
        if (!node) return;

        const flatRow = Object.assign({}, node.row, {
          __treeNodeId: node.id,
          __treeLevel: node.level,
          __treeHasChildren: node.children.length > 0 || node.hasChildren,
          __treeExpanded: this.expandedNodes.has(node.id),
          __treeParentId: node.parentId
        });
        flatList.push(flatRow);

        if (this.expandedNodes.has(node.id) && node.children.length > 0) {
          node.children.forEach(childId => traverse(childId));
        }
      };

      this.treeRoots.forEach(rootId => traverse(rootId));
      this.rows = flatList;
      this._emit('dataChanged', this.rows);
      this._emit('dataLoaded', this.rows);
      this._emit('rowCountChanged', this.rows.length);
    }

    /**
     * 특정 트리 노드 펼침 (expand)
     * LunaGrid expand(rowId, recursive, force) 완벽 지원
     * @param {string|number} rowId - 트리 노드 ID
     * @param {boolean} [recursive=false] - 하위 자식 노드 재귀 펼침 여부
     * @param {boolean} [force=false] - 상위 부모 노드들까지 강제 펼침 여부
     */
    expand(rowId, recursive = false, force = false) {
      const targetId = String(rowId);
      if (force) {
        const ancestors = this.getAncestors(targetId);
        ancestors.forEach(aId => this.expandedNodes.add(aId));
      }

      const expandNode = (id) => {
        const node = this.nodeMap.get(id);
        if (node) {
          this.expandedNodes.add(id);
          if (recursive && node.children.length > 0) {
            node.children.forEach(cId => expandNode(cId));
          }
        }
      };
      expandNode(targetId);
      this._rebuildFlatRows();
    }

    /**
     * 특정 트리 노드 접기 (collapse)
     * @param {string|number} rowId - 트리 노드 ID
     * @param {boolean} [recursive=false] - 하위 자식 노드 재귀 접기 여부
     */
    collapse(rowId, recursive = false) {
      const targetId = String(rowId);
      const collapseNode = (id) => {
        const node = this.nodeMap.get(id);
        if (node) {
          this.expandedNodes.delete(id);
          if (recursive && node.children.length > 0) {
            node.children.forEach(cId => collapseNode(cId));
          }
        }
      };
      collapseNode(targetId);
      this._rebuildFlatRows();
    }

    /**
     * 전체 트리 노드 펼침 (expandAll)
     * @param {number} [level] - 특정 깊이 레벨까지만 펼침 (예: level 0, 1)
     */
    expandAll(level = null) {
      this.expandedNodes.clear();
      this.nodeMap.forEach((node, id) => {
        if (level === null || level === undefined || node.level <= level) {
          this.expandedNodes.add(id);
        }
      });
      this._rebuildFlatRows();
    }

    /**
     * 전체 트리 노드 접기 (collapseAll)
     */
    collapseAll() {
      this.expandedNodes.clear();
      this._rebuildFlatRows();
    }

    /**
     * 노드 펼침 여부 확인 (isExpanded)
     * @param {string|number} rowId - 노드 ID
     * @returns {boolean}
     */
    isExpanded(rowId) {
      return this.expandedNodes.has(String(rowId));
    }

    /**
     * 특정 노드가 다른 노드의 하위 후손인지 검사 (isDescendantOf)
     */
    isDescendantOf(descendantId, ancestorId) {
      const ancestors = this.getAncestors(String(descendantId));
      return ancestors.includes(String(ancestorId));
    }

    getParent(rowId) {
      const node = this.nodeMap.get(String(rowId));
      return node ? node.parentId : null;
    }

    getChildren(rowId) {
      const node = this.nodeMap.get(String(rowId));
      return node ? [...node.children] : [];
    }

    /**
     * 특정 노드의 모든 자손 노드 ID 배열 반환 (getDescendants)
     * @param {string|number} rowId - 노드 ID
     * @param {number} [maxLevel] - 최대 탐색 깊이 레벨
     */
    getDescendants(rowId, maxLevel = null) {
      const list = [];
      const baseNode = this.nodeMap.get(String(rowId));
      const baseLevel = baseNode ? baseNode.level : 0;

      const collect = (id) => {
        const node = this.nodeMap.get(String(id));
        if (node && node.children.length > 0) {
          node.children.forEach(cId => {
            const childNode = this.nodeMap.get(String(cId));
            if (maxLevel === null || maxLevel === undefined || (childNode && childNode.level - baseLevel <= maxLevel)) {
              list.push(cId);
              collect(cId);
            }
          });
        }
      };
      collect(rowId);
      return list;
    }

    /**
     * 특정 노드의 모든 조상 노드 ID 배열 반환 (getAncestors)
     * @param {string|number} rowId - 노드 ID
     * @param {boolean} [includeRoot=false] - 최상위 루트 노드 포함 여부
     */
    getAncestors(rowId, includeRoot = false) {
      const list = [];
      let cur = this.getParent(rowId);
      while (cur) {
        list.push(cur);
        cur = this.getParent(cur);
      }
      return list;
    }

    /**
     * 특정 노드의 직속 자식 노드 개수 반환 (getChildCount)
     */
    getChildCount(rowId) {
      const node = this.nodeMap.get(String(rowId));
      return node ? node.children.length : 0;
    }

    /**
     * 특정 노드의 모든 자손 노드 개수 반환 (getDescendantCount)
     */
    getDescendantCount(rowId) {
      return this.getDescendants(rowId).length;
    }

    /**
     * 특정 노드의 트리 메타 정보 객체 반환 (getTreeItem)
     * @param {string|number} rowId - 노드 ID
     * @returns {Object|null}
     */
    getTreeItem(rowId) {
      const node = this.nodeMap.get(String(rowId));
      if (!node) return null;
      return {
        id: node.id,
        parentId: node.parentId,
        level: node.level,
        children: [...node.children],
        childCount: node.children.length,
        descendantCount: this.getDescendantCount(node.id),
        hasChildren: node.children.length > 0 || !!node.hasChildren,
        isExpanded: this.expandedNodes.has(node.id),
        isLeaf: node.children.length === 0 && !node.hasChildren,
        row: Object.assign({}, node.row)
      };
    }

    getLevel(rowId) {
      const node = this.nodeMap.get(String(rowId));
      return node ? node.level : 0;
    }

    isLeaf(rowId) {
      const node = this.nodeMap.get(String(rowId));
      return node ? node.children.length === 0 && !node.hasChildren : true;
    }

    getTreeRoots() {
      return [...this.treeRoots];
    }

    /**
     * 계층 트리 중첩 객체 배열 반환 (getTreeRows)
     * @param {string|number} [rootId] - 특정 루트 노드 하위만 조회할 경우 지정
     * @returns {Array<Object>|Object}
     */
    getTreeRows(rootId = null) {
      const buildTree = (id) => {
        const node = this.nodeMap.get(String(id));
        if (!node) return null;
        const res = Object.assign({}, node.row);
        delete res.__treeNodeId;
        delete res.__treeLevel;
        delete res.__treeHasChildren;
        delete res.__treeExpanded;
        delete res.__treeParentId;

        if (node.children.length > 0) {
          res.children = node.children.map(cId => buildTree(cId)).filter(Boolean);
        }
        return res;
      };

      if (rootId !== null && rootId !== undefined) {
        return buildTree(rootId);
      }
      return this.treeRoots.map(rId => buildTree(rId)).filter(Boolean);
    }

    /**
     * 특정 노드의 아이콘 인덱스 또는 값 반환 (getIconIndex)
     * @param {string|number} rowId - 노드 ID
     * @returns {*}
     */
    getIconIndex(rowId) {
      const node = this.nodeMap.get(String(rowId));
      if (!node) return null;
      const iconField = (this.treeOptions && this.treeOptions.iconField) || 'icon';
      return node.row[iconField] !== undefined ? node.row[iconField] : node.row.icon;
    }

    /**
     * 특정 노드의 아이콘 인덱스 또는 값 동적 변경 (setIconIndex)
     * @param {string|number} rowId - 노드 ID
     * @param {*} iconIndex - 변경할 아이콘 인덱스 또는 URL/이모지
     */
    setIconIndex(rowId, iconIndex) {
      const node = this.nodeMap.get(String(rowId));
      if (!node) return;
      const iconField = (this.treeOptions && this.treeOptions.iconField) || 'icon';
      node.row[iconField] = iconIndex;
      node.row.icon = iconIndex;
      this._rebuildFlatRows();
    }

    /**
     * 특정 노드가 펼쳐졌을 때의 아이콘 인덱스/값 반환 (getExpandedIconIndex)
     */
    getExpandedIconIndex(rowId) {
      const node = this.nodeMap.get(String(rowId));
      if (!node) return null;
      const f = (this.treeOptions && this.treeOptions.expandedIconField) || 'expandedIcon';
      return node.row[f] !== undefined ? node.row[f] : node.row.expandedIcon;
    }

    /**
     * 특정 노드가 펼쳐졌을 때의 아이콘 인덱스/값 설정 (setExpandedIconIndex)
     */
    setExpandedIconIndex(rowId, iconIndex) {
      const node = this.nodeMap.get(String(rowId));
      if (!node) return;
      const f = (this.treeOptions && this.treeOptions.expandedIconField) || 'expandedIcon';
      node.row[f] = iconIndex;
      node.row.expandedIcon = iconIndex;
      this._rebuildFlatRows();
    }

    /**
     * 특정 노드가 접혔을 때의 아이콘 인덱스/값 반환 (getCollapsedIconIndex)
     */
    getCollapsedIconIndex(rowId) {
      const node = this.nodeMap.get(String(rowId));
      if (!node) return null;
      const f = (this.treeOptions && this.treeOptions.collapsedIconField) || 'collapsedIcon';
      return node.row[f] !== undefined ? node.row[f] : node.row.collapsedIcon;
    }

    /**
     * 특정 노드가 접혔을 때의 아이콘 인덱스/값 설정 (setCollapsedIconIndex)
     */
    setCollapsedIconIndex(rowId, iconIndex) {
      const node = this.nodeMap.get(String(rowId));
      if (!node) return;
      const f = (this.treeOptions && this.treeOptions.collapsedIconField) || 'collapsedIcon';
      node.row[f] = iconIndex;
      node.row.collapsedIcon = iconIndex;
      this._rebuildFlatRows();
    }

    /**
     * 특정 부모 노드 아래에 단일 자식 행 삽입 (insertChildRow / insertChildNode)
     * LunaGrid insertChildRow(parentId, index, values, iconIndex, hasChildren) 완벽 지원
     * @param {string|number} parentId - 부모 노드 ID (최상위 루트인 경우 null 또는 undefined)
     * @param {number} [index=-1] - 삽입할 위치 (-1이면 맨 뒤 추가)
     * @param {Object|Array} values - 추가할 데이터 객체 또는 2D 배열 원소
     * @param {number|string} [iconIndex] - 아이콘 인덱스 또는 URL
     * @param {boolean} [hasChildren=false] - 추가된 자식 노드의 하위 자식 보유 여부 (Lazy Loading용)
     */
    insertChildRow(parentId, index = -1, values = {}, iconIndex = null, hasChildren = false) {
      const fieldNames = this.fields.map(f => f.fieldName || f.name || f.key);
      let rowObj = {};
      if (Array.isArray(values)) {
        fieldNames.forEach((fn, idx) => {
          if (values[idx] !== undefined) rowObj[fn] = values[idx];
        });
      } else if (typeof values === 'object' && values !== null) {
        rowObj = Object.assign({}, values);
      }

      const id = rowObj.id !== undefined ? String(rowObj.id) : `TNODE_LAZY_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      rowObj.id = id;
      if (iconIndex !== null && iconIndex !== undefined) {
        rowObj.icon = iconIndex;
      }

      const parentNode = parentId ? this.nodeMap.get(String(parentId)) : null;
      const level = parentNode ? parentNode.level + 1 : 0;

      const node = {
        id,
        row: rowObj,
        parentId: parentNode ? parentNode.id : null,
        children: [],
        level,
        hasChildren: !!hasChildren,
        isExpanded: this.treeOptions.expandWhenSetData !== false
      };

      this.nodeMap.set(id, node);

      if (parentNode) {
        parentNode.hasChildren = true;
        if (index >= 0 && index < parentNode.children.length) {
          parentNode.children.splice(index, 0, id);
        } else {
          parentNode.children.push(id);
        }
      } else {
        if (index >= 0 && index < this.treeRoots.length) {
          this.treeRoots.splice(index, 0, id);
        } else {
          this.treeRoots.push(id);
        }
      }

      this._rebuildFlatRows();
      return id;
    }

    /**
     * 특정 부모 노드에 비동기 로드된 자식 행 목록을 한 번에 설정 (setChildren / addChildRows)
     * @param {string|number} parentId - 부모 노드 ID
     * @param {Array<Object>|Array<Array<any>>} childrenRows - 추가할 자식 데이터 배열
     * @param {string|number} [iconField] - 아이콘 필드
     */
    setChildren(parentId, childrenRows = [], iconField = null) {
      const parentNode = parentId ? this.nodeMap.get(String(parentId)) : null;
      if (parentNode) {
        // 기존 자식 노드들 제거
        parentNode.children.forEach(cId => this.nodeMap.delete(cId));
        parentNode.children = [];
      }

      if (Array.isArray(childrenRows) && childrenRows.length > 0) {
        childrenRows.forEach(childItem => {
          const hasChild = childItem.hasChildren === true || childItem.hasChild === true || (Array.isArray(childItem.rows) && childItem.rows.length > 0) || (Array.isArray(childItem.children) && childItem.children.length > 0);
          this.insertChildRow(parentId, -1, childItem, childItem.icon || iconField, hasChild);
        });
      } else if (parentNode) {
        parentNode.hasChildren = false;
        this._rebuildFlatRows();
      }
    }

    addChildRows(parentId, childrenRows = [], iconField = null) {
      this.setChildren(parentId, childrenRows, iconField);
    }

    /**
     * 특정 노드의 자식 노드 보유 여부 설정 (setHasChildren)
     * Lazy Loading에서 아직 자식 데이터가 없어도 확장 버튼을 띄우기 위해 사용
     */
    setHasChildren(rowId, hasChildren = true) {
      const node = this.nodeMap.get(String(rowId));
      if (node) {
        node.hasChildren = !!hasChildren;
        node.row.hasChildren = !!hasChildren;
        this._rebuildFlatRows();
      }
    }

    /**
     * 특정 노드의 자식 노드 보유 여부 반환 (getHasChildren)
     */
    getHasChildren(rowId) {
      const node = this.nodeMap.get(String(rowId));
      return node ? (node.children.length > 0 || !!node.hasChildren) : false;
    }

    /**
     * 형제 노드 간의 순서 상하 이동 (moveRowSibling)
     * LunaGrid moveRowSibling(rowId, offset) 완벽 지원
     * @param {string|number} rowId - 이동할 노드 ID
     * @param {number} offset - 이동할 칸 수 (음수: 위로, 양수: 아래로)
     * @returns {boolean} 이동 성공 여부
     */
    moveRowSibling(rowId, offset) {
      if (!offset || offset === 0) return false;
      const targetId = String(rowId);
      const node = this.nodeMap.get(targetId);
      if (!node) return false;

      const parentNode = node.parentId ? this.nodeMap.get(node.parentId) : null;
      const siblingList = parentNode ? parentNode.children : this.treeRoots;
      const curIdx = siblingList.indexOf(targetId);
      if (curIdx === -1) return false;

      const newIdx = curIdx + offset;
      if (newIdx < 0 || newIdx >= siblingList.length) return false;

      // 위치 교환 및 이동
      siblingList.splice(curIdx, 1);
      siblingList.splice(newIdx, 0, targetId);

      this._rebuildFlatRows();
      return true;
    }

    /**
     * 노드의 부모 계층 변경 및 이동 (changeRowParent)
     * LunaGrid changeRowParent(rowId, newParentId, index) 완벽 지원
     * @param {string|number} rowId - 이동할 노드 ID
     * @param {string|number|null} newParentId - 새로운 부모 노드 ID (최상위 루트 이동 시 null 또는 -1)
     * @param {number} [index=-1] - 새 부모의 자식 목록 내 삽입 위치 (-1: 맨 뒤)
     * @returns {boolean} 변경 성공 여부
     */
    changeRowParent(rowId, newParentId, index = -1) {
      const targetId = String(rowId);
      const targetNode = this.nodeMap.get(targetId);
      if (!targetNode) return false;

      const validNewParentId = (newParentId !== null && newParentId !== undefined && newParentId !== -1 && newParentId !== '-1' && newParentId !== '') ? String(newParentId) : null;

      // 1. 자기 자신 또는 자신의 후손 노드로 이동 방지
      if (validNewParentId === targetId) return false;
      if (validNewParentId && this.isDescendantOf(validNewParentId, targetId)) {
        console.warn(`[TreeLunaDataAdapter] 자기 자신의 하위 후손 노드로 부모를 변경할 수 없습니다: ${targetId} -> ${validNewParentId}`);
        return false;
      }

      // 2. 기존 부모에서 제거
      const oldParentNode = targetNode.parentId ? this.nodeMap.get(targetNode.parentId) : null;
      const oldList = oldParentNode ? oldParentNode.children : this.treeRoots;
      const oldIdx = oldList.indexOf(targetId);
      if (oldIdx !== -1) oldList.splice(oldIdx, 1);
      if (oldParentNode) {
        oldParentNode.hasChildren = oldParentNode.children.length > 0;
      }

      // 3. 새 부모에 등록
      const newParentNode = validNewParentId ? this.nodeMap.get(validNewParentId) : null;
      targetNode.parentId = newParentNode ? newParentNode.id : null;
      if (targetNode.row) targetNode.row.parentId = targetNode.parentId;

      const newList = newParentNode ? newParentNode.children : this.treeRoots;
      if (newParentNode) newParentNode.hasChildren = true;

      if (index >= 0 && index < newList.length) {
        newList.splice(index, 0, targetId);
      } else {
        newList.push(targetId);
      }

      // 4. 레벨(depth) 재귀 갱신
      const updateLevels = (n, currentLevel) => {
        n.level = currentLevel;
        if (n.row) n.row.__treeLevel = currentLevel;
        n.children.forEach(cId => {
          const cNode = this.nodeMap.get(cId);
          if (cNode) updateLevels(cNode, currentLevel + 1);
        });
      };
      const newLevel = newParentNode ? newParentNode.level + 1 : 0;
      updateLevels(targetNode, newLevel);

      this._rebuildFlatRows();
      return true;
    }

    /**
     * 특정 노드의 하위 자식/자손 데이터 집계값 계산 및 반환 (getSummary)
     * LunaGrid getSummary(rowId, fieldName, summaryType, onlyLeafNodes) 완벽 지원
     * @param {string|number} rowId - 노드 ID (최상위 전체 집계 시 null 또는 -1)
     * @param {string} fieldName - 집계할 컬럼/필드명
     * @param {string} [summaryType='sum'] - 'sum', 'avg', 'count', 'max', 'min'
     * @param {boolean} [onlyLeafNodes=true] - 최하위 리프 노드들만 집계에 포함할지 여부
     * @returns {number}
     */
    getSummary(rowId, fieldName, summaryType = 'sum', onlyLeafNodes = true) {
      const type = String(summaryType || 'sum').toLowerCase();
      let targetNodeIds = [];

      if (rowId === null || rowId === undefined || rowId === -1 || rowId === '-1') {
        targetNodeIds = Array.from(this.nodeMap.keys());
      } else {
        targetNodeIds = this.getDescendants(String(rowId));
      }

      if (targetNodeIds.length === 0) {
        const selfNode = this.nodeMap.get(String(rowId));
        if (!selfNode) return 0;
        const val = parseFloat(selfNode.row[fieldName]);
        return isNaN(val) ? 0 : val;
      }

      const values = [];
      targetNodeIds.forEach(id => {
        const node = this.nodeMap.get(id);
        if (!node) return;
        if (onlyLeafNodes && node.children.length > 0) return; // 중간 부모 노드 중복 집계 방지

        const raw = node.row[fieldName];
        if (raw !== null && raw !== undefined && raw !== '') {
          const num = parseFloat(String(raw).replace(/,/g, ''));
          if (!isNaN(num)) values.push(num);
        }
      });

      if (type === 'count') return values.length;
      if (values.length === 0) return 0;

      if (type === 'sum') {
        return values.reduce((acc, v) => acc + v, 0);
      } else if (type === 'avg') {
        return values.reduce((acc, v) => acc + v, 0) / values.length;
      } else if (type === 'max') {
        return Math.max(...values);
      } else if (type === 'min') {
        return Math.min(...values);
      }
      return 0;
    }

    /**
     * 전체 또는 특정 하위 트리의 부모 노드들에 자식 집계값을 자동 롤업 계산 (calcSubnodeSummary)
     * LunaGrid 하위노드 계산 스펙 완벽 지원
     * @param {Object|Array<string>} calcConfigs - { amount: 'sum', headcount: 'sum', score: 'avg' } 또는 ['amount', 'headcount']
     * @param {string|number} [rootRowId] - 특정 노드 하위만 계산할 경우 지정
     */
    calcSubnodeSummary(calcConfigs, rootRowId = null) {
      if (!calcConfigs) return;

      const configs = {};
      if (Array.isArray(calcConfigs)) {
        calcConfigs.forEach(fn => configs[fn] = 'sum');
      } else if (typeof calcConfigs === 'object') {
        Object.assign(configs, calcConfigs);
      }

      // 후위 순회(Post-order Traversal)로 리프부터 부모로 상향식 롤업
      const processNode = (nodeId) => {
        const node = this.nodeMap.get(nodeId);
        if (!node) return;

        if (node.children.length > 0) {
          node.children.forEach(cId => processNode(cId));

          Object.keys(configs).forEach(fieldName => {
            const summaryType = configs[fieldName] || 'sum';
            const calcVal = this.getSummary(nodeId, fieldName, summaryType, true);
            node.row[fieldName] = calcVal;
          });
        }
      };

      if (rootRowId) {
        processNode(String(rootRowId));
      } else {
        this.treeRoots.forEach(rId => processNode(rId));
      }

      this._rebuildFlatRows();
    }

    /**
     * 특정 노드의 값이 변경되었을 때 상위 조상 노드들의 집계값 연쇄 갱신 (recalcParentNodes)
     * @param {string|number} rowId - 수정된 노드 ID
     * @param {Object|Array<string>} calcConfigs - 계산할 필드 및 집계 유형
     */
    recalcParentNodes(rowId, calcConfigs) {
      const ancestors = this.getAncestors(String(rowId));
      if (ancestors.length === 0) return;

      const configs = {};
      if (Array.isArray(calcConfigs)) {
        calcConfigs.forEach(fn => configs[fn] = 'sum');
      } else if (typeof calcConfigs === 'object') {
        Object.assign(configs, calcConfigs);
      }

      ancestors.forEach(aId => {
        const parentNode = this.nodeMap.get(aId);
        if (parentNode) {
          Object.keys(configs).forEach(fieldName => {
            const summaryType = configs[fieldName] || 'sum';
            parentNode.row[fieldName] = this.getSummary(aId, fieldName, summaryType, true);
          });
        }
      });

      this._rebuildFlatRows();
    }

    getRootCount() {
      return this.treeRoots.length;
    }

    getRoots() {
      return [...this.treeRoots];
    }
  }

  // =========================================================================
  // 2. LunaGrid (GridView & Main Grid Controller)
  // =========================================================================
  class LunaGrid {
    constructor(containerGrid, providerOrOptions = {}, maybeOptions = {}) {
      this.container = typeof containerGrid === 'string'
        ? document.querySelector(containerGrid)
        : containerGrid;

      if (!this.container) {
        throw new Error(`[LunaGrid] 지정된 컨테이너를 찾을 수 없습니다: ${containerGrid}`);
      }

      let rawOptions = {};
      let passedAdapter = null;

      if (providerOrOptions instanceof LunaDataAdapter || (providerOrOptions && typeof providerOrOptions.setRows === 'function')) {
        passedAdapter = providerOrOptions;
        rawOptions = Object.assign({}, maybeOptions || {});
      } else {
        rawOptions = Object.assign({}, providerOrOptions || {});
        if (rawOptions.dataAdapter) passedAdapter = rawOptions.dataAdapter;
      }

      // 1. 기본 옵션 설정 (Enterprise Default Options)
      this.options = Object.assign({
        title: 'Luna Enterprise Data Grid',
        columns: [],
        data: [],
        url: null,
        dataAdapter: null,

        pageable: true,
        pageSize: 10,
        pageSizeOptions: [5, 10, 20, 50, 100],
        showFooterPagingInfo: true,

        // 엔터프라이즈 3대 Bar 옵션
        indicator: { visible: true, width: '48px', label: 'No.' },
        stateBar: { visible: true, width: '34px', label: '상태' },
        checkBar: { visible: true, multiSelect: true },
        selectable: true,
        multiSelect: true,

        // 틀고정 (Fixed Columns & Fixed Rows)
        fixedColCount: 0,
        fixedRightColCount: 0,
        fixedRowCount: 0,
        fixedOptions: {
          colCount: 0,
          rightColCount: 0,
          rowCount: 0,
          exceptFromSorting: true,
          exceptFromFiltering: true
        },

        // 행 그룹핑 패널 (Row Grouping)
        enableGrouping: true,
        groupBy: [], // ['category', ...]

        // 범위 선택 및 클립보드 복사/붙여넣기 (LunaGrid copyOptions & pasteOptions)
        enableRangeSelection: true,
        enableClipboard: true,
        enableExcelPaste: true, // Ctrl+V 엑셀 붙여넣기
        copyOptions: {
          enabled: true,
          singleMode: false,
          lookupDisplay: true,
          copyFormatted: true
        },
        pasteOptions: {
          enabled: true,
          singleMode: false,
          checkReadOnly: true,
          selectBlockPaste: true,
          eventEachRow: true,
          commitEdit: true
        },

        // 다중 컬럼 정렬
        multiSort: true,

        // 기타 인터랙션
        rowKey: 'id',
        theme: 'default',
        height: 'auto',
        showSearch: true,
        showExport: true,
        showJsonExport: true,
        resizable: true,
        movableColumns: true,
        enableContextMenu: true,
        showSummary: false,
        summary: null,

        // 편집 및 커밋 옵션 (LunaGrid editOptions 호환)
        editable: true,
        editTrigger: 'click', // 'click' | 'dblclick'
        showAddRowBtn: false,
        showDeleteBtn: false,
        showSaveBtn: false,
        editOptions: {
          commitLevel: 'info',      // 기본값: 'info' ('error' | 'warning' | 'info' | 'ignore')
          commitByCell: false,      // 셀 편집 완료 시 즉시 행 커밋 여부
          commitWhenLeave: true,    // 포커스 이탈 시 자동 커밋 여부
          commitWhenExitLast: false,// 마지막 셀에서 Tab/Enter 시 자동 커밋 여부
          updatable: true,
          insertable: true,
          appendable: true,
          deletable: true,
          readOnly: false,
          crossWhenExitFirst: false,
          crossWhenExitLast: false
        },
        validations: [], // 행 단위 유효성 검사 규칙 배열 (LunaGrid grid.setValidations)

        // 개인화 설정 (Personalization / Layout Persistence)
        personalization: {
          enabled: false,             // 활성화 시 자동 로드/저장
          storageKey: 'luna_grid_pref',
          storage: 'localStorage',    // 'localStorage' | 'sessionStorage'
          autoSave: true,             // 컬럼 이동, 리사이즈, 정렬, 필터, 그룹핑 변경 시 자동 저장
          autoLoad: true              // 그리드 초기화 시 이전 설정 자동 로드
        },

        // Callbacks
        onRowClick: null,
        onCellClick: null,
        onSelectionChange: null,
        onRangeSelectionChange: null,
        onDataLoaded: null,
        onCellEditStart: null,
        onCellEditEnd: null,
        onRowAdd: null,
        onRowDelete: null,
        onSave: null,
        onColumnResize: null,
        onColumnMove: null,
        onGroupChange: null,
        onSaveUserConfig: null,
        onLoadUserConfig: null
      }, rawOptions);

      // 컬럼 정의 정규화 (key, name, fieldName, label 상호 보완)
      if (Array.isArray(this.options.columns)) {
        this.options.columns = this.options.columns.map(col => {
          const colObj = Object.assign({}, col);
          if (!colObj.key && (colObj.fieldName || colObj.name)) {
            colObj.key = colObj.fieldName || colObj.name;
          }
          if (!colObj.name && (colObj.fieldName || colObj.key)) {
            colObj.name = colObj.fieldName || colObj.key;
          }
          if (!colObj.fieldName && (colObj.key || colObj.name)) {
            colObj.fieldName = colObj.key || colObj.name;
          }
          if (!colObj.label && (colObj.header && colObj.header.text)) {
            colObj.label = colObj.header.text;
          }
          if (colObj.type && !colObj.dataType) {
            colObj.dataType = colObj.type;
          }
          if (colObj.format && !colObj.displayFormat) {
            colObj.displayFormat = colObj.format;
          }
          if (colObj.format && !colObj.dateFormat && (colObj.dataType === 'datetime' || colObj.dataType === 'date')) {
            colObj.dateFormat = colObj.format;
          }
          return colObj;
        });
      }

      // 원본 컬럼 및 옵션 스냅샷 (초기화 reset용)
      this._originalColumns = JSON.parse(JSON.stringify(this.options.columns || []));
      this._originalOptions = {
        groupBy: [...(this.options.groupBy || [])],
        pageSize: this.options.pageSize || 10,
        theme: this.options.theme || 'dark',
        fixedColCount: this.options.fixedColCount || 0,
        fixedRightColCount: this.options.fixedRightColCount || 0,
        fixedRowCount: this.options.fixedRowCount || 0
      };

      // LunaGrid editOptions 및 rowValidations 인스턴스 초기화
      this.editOptions = Object.assign({
        commitLevel: 'info',
        commitByCell: false,
        commitWhenLeave: true,
        commitWhenExitLast: false,
        updatable: true,
        insertable: true,
        appendable: true,
        deletable: true,
        readOnly: false
      }, this.options.editOptions || {});
      this.rowValidations = Array.isArray(this.options.validations) ? [...this.options.validations] : [];

      // 2. Data Adapter (LunaDataAdapter) 연결
      if (passedAdapter) {
        this.dataAdapter = passedAdapter;
      } else if (this.options.dataAdapter instanceof LunaDataAdapter) {
        this.dataAdapter = this.options.dataAdapter;
      } else if (this.options.dataAdapter && typeof this.options.dataAdapter === 'object') {
        this.dataAdapter = this.options.dataAdapter;
      } else {
        this.dataAdapter = new LunaDataAdapter();
      }

      // 3. 내부 상태 관리
      this.currentData = [];
      this.filteredData = [];
      this.displayData = [];
      this.selectedRowKeys = new Set();
      this.columnFilters = {}; // { colKey: [values] or string }
      this.sortRules = []; // [{ key: 'colKey', dir: 'asc'|'desc' }]
      this.validationErrors = new Map();
      this.groupColumns = [...(this.options.groupBy || [])];
      this.collapsedGroups = new Set(); // Set of group keys

      // 셀 포커스 & 범위 선택 상태
      this.focusedCell = null; // { rowIndex, colKey, rowId }
      this.selectedRange = null; // { startRow, startCol, endRow, endCol }
      this.isDraggingRange = false;
      this.listeners = []; // GridView 이벤트 리스너 목록 [{ event, callback }]

      // LunaGrid Locale & Messages 다국어 설정 초기화
      this.localeConfig = this._resolveLocale(this.options.locale);

      this.pageSize = this.options.pageSize || 10;
      this.currentPage = 1;
      this.popupMenus = new Map(); // name -> [{ label, value, icon, callback }]
      if (this.options.popupMenus) {
        Object.keys(this.options.popupMenus).forEach(key => {
          this.popupMenus.set(key, this.options.popupMenus[key]);
        });
      }
      this._activePopupMenu = null;

      this.lookupTrees = new Map(); // id -> treeConfig
      if (this.options.lookupTrees) {
        if (Array.isArray(this.options.lookupTrees)) {
          this.options.lookupTrees.forEach(tree => {
            if (tree && tree.id) this.lookupTrees.set(tree.id, tree);
          });
        } else if (typeof this.options.lookupTrees === 'object') {
          Object.keys(this.options.lookupTrees).forEach(treeId => {
            this.lookupTrees.set(treeId, this.options.lookupTrees[treeId]);
          });
        }
      }

      // Custom Renderers Registry (LunaGrid 정식 registerCustomRenderer 엔진)
      this.customRenderers = new Map();

      // Display Options (FitStyle: none | even | evenFill | fill)
      this.displayOptions = Object.assign({
        fitStyle: 'none'
      }, this.options.displayOptions);

      // Sorting Options (enabled: true, style: 'exclusive' | 'inclusive' | 'reverse' | 'none')
      this.sortingOptions = Object.assign({
        enabled: true,
        style: 'inclusive',
        keepFocusedRow: true
      }, this.options.sortingOptions);

      // Filtering Options (enabled: true, clearWhenSearch: false)
      this.filteringOptions = Object.assign({
        enabled: true,
        clearWhenSearch: false
      }, this.options.filteringOptions);

      // FilterPanel Options (visible: false, height: 32, delay: 200)
      this.filterPanel = Object.assign({
        visible: false,
        height: 32,
        delay: 200
      }, this.options.filterPanel);

      // 행 드래그 앤 드롭 옵션 (Row Drag & Drop)
      this.rowDragOptions = Object.assign({
        enabled: false,
        enableFeedback: true,
        feedbackText: '${count}개 행 이동',
        enableDrop: true,
        enableMove: true
      }, this.options.rowDragOptions);

      // 페이징 옵션 (Paging)
      this.pagingOptions = Object.assign({
        enabled: this.options.pageable || false,
        size: this.options.pageSize || 10,
        page: 0,
        maxCount: 0
      }, this.options.pagingOptions || this.options.paging);
      this.options.pageable = this.pagingOptions.enabled;

      // 그룹 접기/펼치기 상태 관리 (Group Expand & Collapse)
      this.groupExpandStates = new Map();

      // 4. 초기화
      this._init();
    }

    _init() {
      this.container.classList.add('luna-grid-container');
      const initTheme = this.options.theme || 'default';
      this.container.setAttribute('data-theme', initTheme);

      this._buildLayout();
      this._bindGlobalEvents();

      // 개인화 자동 복원 (Auto-load Personalization)
      this._initPersonalization();

      // DataAdapter 이벤트 수신
      this.dataAdapter.on('dataLoadCompleted', (p) => {
        if (typeof this.onDataLoadCompleted === 'function') this.onDataLoadCompleted(this, p);
        if (typeof this.options.onDataLoadCompleted === 'function') this.options.onDataLoadCompleted(this, p);
        if (typeof this.onDataLoadComplated === 'function') this.onDataLoadComplated(this, p);
        if (typeof this.options.onDataLoadComplated === 'function') this.options.onDataLoadComplated(this, p);
        this._emit('dataLoadCompleted', p);
        this._emit('dataLoadComplated', p);
      });

      this.dataAdapter.on('dataLoaded', (p, rows) => {
        this.currentData = Array.isArray(this.dataAdapter.rows) ? [...this.dataAdapter.rows] : (Array.isArray(rows) ? [...rows] : (Array.isArray(p) ? [...p] : []));
        this.selectedRowKeys.clear();
        this.validationErrors.clear();
        this._applyFilterAndSort();
        if (typeof this.options.onDataLoaded === 'function') this.options.onDataLoaded(this.currentData);
      });

      this.dataAdapter.on('rowAdded', (p, newRow) => {
        this.currentData = Array.isArray(this.dataAdapter.rows) ? [...this.dataAdapter.rows] : [];
        this._applyFilterAndSort();
        const row = (p && p.id !== undefined) ? p : newRow;
        if (typeof this.options.onRowAdd === 'function') this.options.onRowAdd(row);
      });

      this.dataAdapter.on('rowDeleted', (p, deletedList) => {
        this.currentData = Array.isArray(this.dataAdapter.rows) ? [...this.dataAdapter.rows] : [];
        this._applyFilterAndSort();
        const list = Array.isArray(p) ? p : deletedList;
        if (typeof this.options.onRowDelete === 'function') this.options.onRowDelete(list);
      });

      this.dataAdapter.on('rowUpdated', () => {
        this.currentData = Array.isArray(this.dataAdapter.rows) ? [...this.dataAdapter.rows] : [];
        this._applyFilterAndSort();
      });

      this.dataAdapter.on('rowMoved', () => {
        this.currentData = Array.isArray(this.dataAdapter.rows) ? [...this.dataAdapter.rows] : [];
        this._applyFilterAndSort();
      });

      this.dataAdapter.on('rowsMoved', () => {
        this.currentData = Array.isArray(this.dataAdapter.rows) ? [...this.dataAdapter.rows] : [];
        this._applyFilterAndSort();
      });

      this.dataAdapter.on('dataChanged', (p, rows) => {
        this.currentData = Array.isArray(p) ? [...p] : (Array.isArray(rows) ? [...rows] : (Array.isArray(this.dataAdapter.rows) ? [...this.dataAdapter.rows] : []));
        this._applyFilterAndSort();
      });

      this.dataAdapter.on('rowStatesCleared', () => {
        this.currentData = Array.isArray(this.dataAdapter.rows) ? [...this.dataAdapter.rows] : [];
        this._applyFilterAndSort();
        this._renderBody();
      });

      this.dataAdapter.on('rowStateChanged', () => {
        this._renderBody();
      });

      this.dataAdapter.on('dataCommitted', () => {
        this.currentData = Array.isArray(this.dataAdapter.rows) ? [...this.dataAdapter.rows] : [];
        this._applyFilterAndSort();
        this._renderBody();
        this.showToast('✅ 모든 변경사항이 성공적으로 저장/확정되었습니다.');
      });

      this.dataAdapter.on('dataRollback', () => {
        this.currentData = Array.isArray(this.dataAdapter.rows) ? [...this.dataAdapter.rows] : [];
        this._applyFilterAndSort();
        this._renderBody();
        this.showToast('🔄 모든 변경사항이 초기 상태로 복구되었습니다.');
      });

      // 데이터 초기 로딩
      if (this.options.url) {
        this.fetchData();
      } else if (Array.isArray(this.options.data) && this.options.data.length > 0) {
        this.loadData(this.options.data);
      } else if (this.dataAdapter && Array.isArray(this.dataAdapter.rows) && this.dataAdapter.rows.length > 0) {
        this.currentData = [...this.dataAdapter.rows];
        this._applyFilterAndSort();
      } else {
        this._applyFilterAndSort();
      }
    }

    _buildLayout() {
      this.container.innerHTML = '';

      // 1. 상단 툴바
      this.toolbarEl = document.createElement('div');
      this.toolbarEl.className = 'luna-grid-toolbar';
      this._renderToolbar();

      // 2. 그룹핑 패널 (Row Grouping Panel)
      this.groupPanelEl = document.createElement('div');
      this.groupPanelEl.className = 'luna-group-panel';
      this._renderGroupPanel();

      // 3. 메인 테이블 래퍼
      this.wrapperEl = document.createElement('div');
      this.wrapperEl.className = 'luna-grid-wrapper';
      if (this.options.height && this.options.height !== 'auto') {
        const hVal = typeof this.options.height === 'number' ? this.options.height + 'px' : this.options.height;
        this.container.style.height = hVal;
      }

      this.tableEl = document.createElement('table');
      this.tableEl.className = 'luna-table';

      this.colgroupEl = document.createElement('colgroup');
      this.theadEl = document.createElement('thead');
      this.tbodyEl = document.createElement('tbody');
      this.tfootEl = document.createElement('tfoot');

      this.tableEl.appendChild(this.colgroupEl);
      this.tableEl.appendChild(this.theadEl);
      this.tableEl.appendChild(this.tbodyEl);
      this.tableEl.appendChild(this.tfootEl);
      this.wrapperEl.appendChild(this.tableEl);

      this._renderHeader();

      // 로딩 스피너
      this.loadingEl = document.createElement('div');
      this.loadingEl.className = 'luna-spinner-overlay';
      this.loadingEl.style.display = 'none';
      this.loadingEl.innerHTML = `<div class="luna-spinner"></div>`;
      this.wrapperEl.appendChild(this.loadingEl);

      // 4. 하단 푸터 (페이징 컨트롤)
      this.footerEl = document.createElement('div');
      this.footerEl.className = 'luna-grid-footer';

      this.container.appendChild(this.toolbarEl);
      if (this.options.enableGrouping) {
        this.container.appendChild(this.groupPanelEl);
      }
      this.container.appendChild(this.wrapperEl);
      this.container.appendChild(this.footerEl);
    }

    _renderToolbar() {
      const totalCount = this.filteredData ? this.filteredData.length : 0;
      const pageSize = Math.max(1, (this.pagingOptions && this.pagingOptions.enabled) ? this.pagingOptions.size : (this.pageSize || this.options.pageSize || 10));
      const curPage = Math.max(1, (this.pagingOptions && this.pagingOptions.enabled) ? (this.pagingOptions.page + 1) : (this.currentPage || 1));
      const startItem = totalCount === 0 ? 0 : (curPage - 1) * pageSize + 1;
      const endItem = Math.min(curPage * pageSize, totalCount);
      const pageSizeOptions = this.options.pageSizeOptions || [5, 10, 20, 50, 100];
      const pageSizeOptionsHtml = pageSizeOptions
        .map(size => `<option value="${size}" ${size === pageSize ? 'selected' : ''}>${size}</option>`)
        .join('');

      const totalLabel = this.getMessage('totalCount', '전체');
      const itemsLabel = this.getMessage('items', '건');
      const showingLabel = this.getMessage('showingItems', '표시');

      const infoHtml = `
        <div class="luna-grid-info luna-toolbar-grid-info">
          <span>Total <strong>${totalCount.toLocaleString()}</strong> (${startItem} - ${endItem})</span>
          <select class="luna-page-size-select">${pageSizeOptionsHtml}</select>
        </div>
      `;

      this.toolbarEl.innerHTML = `
        <div class="luna-grid-toolbar-left">
          <div class="luna-grid-toolbar-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
            <span>${this._escapeHtml(this.options.title)}</span>
          </div>
        </div>
        <div class="luna-grid-toolbar-right">
          <div class="luna-grid-toolbar-actions">
            ${this.options.showAddRowBtn ? `
              <button type="button" class="luna-btn luna-btn-success luna-add-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                <span>${this._escapeHtml(this.getMessage('addRow', '행 추가'))}</span>
              </button>
            ` : ''}
            ${this.options.showDeleteBtn ? `
              <button type="button" class="luna-btn luna-btn-danger luna-del-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                <span>${this._escapeHtml(this.getMessage('deleteSelected', '선택 삭제'))}</span>
              </button>
            ` : ''}
            ${this.options.showSaveBtn ? `
              <button type="button" class="luna-btn luna-btn-primary luna-save-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                <span>${this._escapeHtml(this.getMessage('saveChanges', '저장'))}</span>
              </button>
            ` : ''}
            ${this.options.showSearch ? `
              <div class="luna-search-input-wrapper">
                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" class="luna-search-input" placeholder="전체 검색..." value="${this._escapeHtml(this.searchQuery)}">
              </div>
            ` : ''}
            ${this.options.showExport ? `
              <button type="button" class="luna-btn luna-export-btn" title="Excel 호환 CSV 내보내기">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                <span>${this._escapeHtml(this.getMessage('exportCsv', 'CSV'))}</span>
              </button>
            ` : ''}
            ${this.options.showJsonExport ? `
              <button type="button" class="luna-btn luna-export-json-btn" title="JSON 파일 내보내기">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                <span>${this._escapeHtml(this.getMessage('exportJson', 'JSON'))}</span>
              </button>
            ` : ''}
          </div>
          ${this.options.pageable !== false ? infoHtml : ''}
        </div>
      `;
    }

    _renderGroupPanel() {
      if (!this.options.enableGrouping || !this.groupPanelEl) return;

      if (this.groupColumns.length === 0) {
        const placeholderText = this.getMessage('groupPanelPlaceholder', '이곳에 컬럼 헤더를 끌어다 놓으면 해당 컬럼을 기준으로 다단계 행 그룹핑이 적용됩니다.');
        this.groupPanelEl.innerHTML = `
          <div class="luna-group-panel-placeholder">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>${this._escapeHtml(placeholderText)}</span>
          </div>
        `;
      } else {
        const tagsHtml = this.groupColumns.map(colKey => {
          const col = this.options.columns.find(c => c.key === colKey) || { label: colKey };
          return `
            <span class="luna-group-tag" data-group-key="${colKey}">
              <span>${this._escapeHtml(col.label || colKey)}</span>
              <span class="luna-group-tag-remove" title="그룹 해제">&times;</span>
            </span>
          `;
        }).join('');

        this.groupPanelEl.innerHTML = `
          <span style="font-weight:600; font-size:12px; margin-right:4px;">📊 그룹핑 기준:</span>
          <div class="luna-group-tag-list">${tagsHtml}</div>
        `;
      }
    }

    _renderHeader() {
      const showIndicator = this.options.indicator && this.options.indicator.visible !== false;
      const showStateBar = this.options.stateBar && this.options.stateBar.visible !== false;
      const showCheckBar = this.options.selectable;
      const hasGroups = this.options.columns.some(col => !!col.group);

      // groupShowMode 및 접기/펼치기 상태에 따른 유효 표시 컬럼 필터링
      const visibleCols = this.options.columns.filter(col => {
        if (col.hidden || col.visible === false) return false;
        const grpName = col.group;
        if (!grpName) return true;

        const isExpanded = this.groupExpandStates.has(grpName) ? this.groupExpandStates.get(grpName) : true;
        const showMode = col.groupShowMode || 'always';

        if (showMode === 'expand') return isExpanded;
        if (showMode === 'collapse') return !isExpanded;
        return true; // 'always'
      });

      // 0. <colgroup> 동적 생성 & 갱신 (table-layout: fixed 및 2단 헤더 완벽 지원)
      if (!this.colgroupEl) {
        this.colgroupEl = document.createElement('colgroup');
        if (this.theadEl && this.theadEl.parentElement === this.tableEl) {
          this.tableEl.insertBefore(this.colgroupEl, this.theadEl);
        } else {
          this.tableEl.appendChild(this.colgroupEl);
        }
      }
      let colgroupHtml = '';
      if (showIndicator) colgroupHtml += '<col style="width: 42px; min-width: 42px;">';
      if (showStateBar) colgroupHtml += '<col style="width: 28px; min-width: 28px;">';
      const checkBarWidth = (this.options.checkBar && this.options.checkBar.width) ? (typeof this.options.checkBar.width === 'number' ? `${this.options.checkBar.width}px` : this.options.checkBar.width) : '48px';
      if (showCheckBar) colgroupHtml += `<col style="width: ${checkBarWidth}; min-width: ${checkBarWidth};">`;
      visibleCols.forEach(col => {
        const w = typeof col.width === 'number' ? `${col.width}px` : (col.width || '120px');
        colgroupHtml += `<col style="width: ${w}; min-width: ${w};">`;
      });
      this.colgroupEl.innerHTML = colgroupHtml;

      const headerOpts = this.options.header || {};
      const topHeight = (Array.isArray(headerOpts.itemHeights) && headerOpts.itemHeights[0]) || headerOpts.height || this.options.headerHeight;
      const subHeight = (Array.isArray(headerOpts.itemHeights) && headerOpts.itemHeights[1]) || headerOpts.height || this.options.headerHeight;
      const minH = headerOpts.minHeight ? `min-height:${typeof headerOpts.minHeight === 'number' ? headerOpts.minHeight + 'px' : headerOpts.minHeight};` : '';

      const topTrStyle = topHeight ? `style="height:${typeof topHeight === 'number' ? topHeight + 'px' : topHeight}; ${minH}"` : (minH ? `style="${minH}"` : '');
      const subTrStyle = subHeight ? `style="height:${typeof subHeight === 'number' ? subHeight + 'px' : subHeight}; ${minH}"` : (minH ? `style="${minH}"` : '');

      let topRowHtml = `<tr class="luna-header-main-row" ${topTrStyle}>`;
      let subRowHtml = `<tr class="luna-header-sub-row" ${subTrStyle}>`;

      // 1. Indicator
      if (showIndicator) {
        const indLabel = this.options.indicator.label || 'No.';
        const rowSpan = hasGroups ? 'rowspan="2"' : '';
        topRowHtml += `<th class="luna-indicator-cell" ${rowSpan}>${indLabel}</th>`;
      }

      // 2. StateBar
      if (showStateBar) {
        const stateLabel = this.options.stateBar.label || '상태';
        const rowSpan = hasGroups ? 'rowspan="2"' : '';
        topRowHtml += `<th class="luna-statebar-cell" ${rowSpan} title="행 상태 (C:신규, U:수정)">${stateLabel}</th>`;
      }

      // 3. CheckBar
      if (showCheckBar) {
        const rowSpan = hasGroups ? 'rowspan="2"' : '';
        const selectAllHtml = this.options.multiSelect ? '<input type="checkbox" class="luna-checkbox luna-select-all">' : '';
        topRowHtml += `<th class="luna-checkbox-cell" ${rowSpan}>${selectAllHtml}</th>`;
      }

      if (!hasGroups) {
        visibleCols.forEach((col, colIndex) => {
          topRowHtml += this._buildHeaderThHtml(col, colIndex, visibleCols);
        });
        topRowHtml += '</tr>';
        this.theadEl.innerHTML = topRowHtml + this._buildHeaderSummaryRowHtml(visibleCols) + this._buildFilterPanelRowHtml(visibleCols);
      } else {
        const groupsMap = [];
        let currentGroup = null;

        visibleCols.forEach((col, colIndex) => {
          const groupName = col.group || null;
          if (groupName) {
            if (currentGroup && currentGroup.name === groupName) {
              currentGroup.cols.push({ col, colIndex });
            } else {
              currentGroup = { name: groupName, cols: [{ col, colIndex }] };
              groupsMap.push(currentGroup);
            }
          } else {
            currentGroup = null;
            groupsMap.push({ name: null, cols: [{ col, colIndex }] });
          }
        });

        groupsMap.forEach(grp => {
          if (grp.name) {
            const grpLabel = this._getGroupLabel(grp.name);
            const grpTooltip = this._getGroupTooltip(grp.name);
            const isExpanded = this.groupExpandStates.has(grp.name) ? this.groupExpandStates.get(grp.name) : true;
            const expandIcon = `<span class="luna-group-expander" data-group-expander="${this._escapeHtml(grp.name)}" style="cursor:pointer; margin-right:4px; font-size:11px; opacity:0.8;">${isExpanded ? '▾' : '▸'}</span>`;

            // Group Header HTML Template 처리 (options.groupTemplates 맵 지원)
            let grpLabelHtml = `<span class="luna-header-group-text">${this._escapeHtml(grpLabel)}</span>`;
            if (this.options.groupTemplates && this.options.groupTemplates[grp.name]) {
              const tpl = this.options.groupTemplates[grp.name];
              if (typeof tpl === 'function') {
                grpLabelHtml = tpl(this, grpLabel, grp.cols.map(c => c.col));
              } else if (typeof tpl === 'string') {
                grpLabelHtml = tpl.replace(/\$\{groupName\}/g, this._escapeHtml(grpLabel));
              }
            }

            topRowHtml += `
              <th colspan="${grp.cols.length}" class="luna-header-group" data-group-name="${this._escapeHtml(grp.name)}">
                <div style="display:inline-flex; align-items:center; justify-content:center; width:100%;">
                  ${expandIcon}
                  ${grpLabelHtml}
                </div>
                <div class="luna-header-tooltip">${this._escapeHtml(grpTooltip)}</div>
              </th>
            `;
            grp.cols.forEach(({ col, colIndex }) => {
              subRowHtml += this._buildHeaderThHtml(col, colIndex, visibleCols);
            });
          } else {
            const { col, colIndex } = grp.cols[0];
            topRowHtml += this._buildHeaderThHtml(col, colIndex, visibleCols, 'rowspan="2"');
          }
        });

        topRowHtml += '</tr>';
        subRowHtml += '</tr>';
        this.theadEl.innerHTML = topRowHtml + subRowHtml + this._buildHeaderSummaryRowHtml(visibleCols) + this._buildFilterPanelRowHtml(visibleCols);
      }

      this._initColumnResizing();
      this._initColumnReordering();
      this._initHeaderCheckboxes();
    }

    _getColumnLabel(col) {
      if (!col) return '';
      const loc = (this.localeConfig && (this.localeConfig.locale || this.localeConfig.code)) || LunaGridLocaleManager._currentLocale || 'ko';
      const shortLoc = loc.split('-')[0].toLowerCase();
      const colKey = col.key || col.name;

      if (col.labels && typeof col.labels === 'object') {
        if (col.labels[loc]) return col.labels[loc];
        if (col.labels[shortLoc]) return col.labels[shortLoc];
      }

      if (this.options.locales) {
        const locObj = this.options.locales[loc] || this.options.locales[shortLoc];
        if (locObj && locObj.columns && locObj.columns[colKey]) {
          return locObj.columns[colKey];
        }
      }

      const header = col.header || {};
      return header.text || col.label || colKey;
    }

    _getGroupLabel(groupName) {
      if (!groupName) return '';
      const loc = (this.localeConfig && (this.localeConfig.locale || this.localeConfig.code)) || LunaGridLocaleManager._currentLocale || 'ko';
      const shortLoc = loc.split('-')[0].toLowerCase();

      if (this.options.groupLabels && this.options.groupLabels[groupName]) {
        const gLabels = this.options.groupLabels[groupName];
        if (typeof gLabels === 'object') {
          if (gLabels[loc]) return gLabels[loc];
          if (gLabels[shortLoc]) return gLabels[shortLoc];
        }
      }

      if (this.options.locales) {
        const locObj = this.options.locales[loc] || this.options.locales[shortLoc];
        if (locObj && locObj.groups && locObj.groups[groupName]) {
          return locObj.groups[groupName];
        }
      }

      return groupName;
    }

    _getColumnTooltip(col) {
      if (!col) return '';
      const loc = (this.localeConfig && (this.localeConfig.locale || this.localeConfig.code)) || LunaGridLocaleManager._currentLocale || 'ko';
      const shortLoc = loc.split('-')[0].toLowerCase();
      const colKey = col.key || col.name;

      if (col.headerTooltips && typeof col.headerTooltips === 'object') {
        if (col.headerTooltips[loc]) return col.headerTooltips[loc];
        if (col.headerTooltips[shortLoc]) return col.headerTooltips[shortLoc];
      }

      if (this.options.locales) {
        const locObj = this.options.locales[loc] || this.options.locales[shortLoc];
        if (locObj && locObj.columnTooltips && locObj.columnTooltips[colKey]) {
          return locObj.columnTooltips[colKey];
        }
      }

      return col.headerTooltip || (col.header && col.header.tooltip) || '';
    }

    _getGroupTooltip(groupName) {
      if (!groupName) return '';
      const loc = (this.localeConfig && (this.localeConfig.locale || this.localeConfig.code)) || LunaGridLocaleManager._currentLocale || 'ko';
      const shortLoc = loc.split('-')[0].toLowerCase();

      if (this.options.groupTooltips && this.options.groupTooltips[groupName]) {
        const gTooltip = this.options.groupTooltips[groupName];
        if (typeof gTooltip === 'object') {
          if (gTooltip[loc]) return gTooltip[loc];
          if (gTooltip[shortLoc]) return gTooltip[shortLoc];
        } else if (typeof gTooltip === 'string') {
          return gTooltip;
        }
      }

      if (this.options.locales) {
        const locObj = this.options.locales[loc] || this.options.locales[shortLoc];
        if (locObj && locObj.groupTooltips && locObj.groupTooltips[groupName]) {
          return locObj.groupTooltips[groupName];
        }
      }

      return groupName;
    }

    _initHeaderCheckboxes() {
      const chks = this.theadEl.querySelectorAll('.luna-header-col-chk');
      chks.forEach(chk => {
        chk.addEventListener('click', (e) => {
          e.stopPropagation();
          const colKey = chk.getAttribute('data-col-key');
          const isChecked = chk.checked;
          const col = this.options.columns.find(c => c.key === colKey || c.name === colKey);
          if (col) {
            if (!col.header) col.header = {};
            col.header.checked = isChecked;

            // checkExclusive 배타적 선택 제어
            if (isChecked && (col.header.checkExclusive || col.checkExclusive)) {
              this.options.columns.forEach(otherCol => {
                if (otherCol !== col && otherCol.header) {
                  otherCol.header.checked = false;
                }
              });
              this._renderHeader();
            }

            // 이벤트 콜백 호출
            if (typeof this.options.onColumnHeaderCheckClick === 'function') {
              this.options.onColumnHeaderCheckClick(this, col, isChecked);
            }
          }
        });
      });
    }

    _buildHeaderThHtml(col, colIndex, visibleCols, extraAttr = '') {
      const colKey = col.key || col.name;
      const header = col.header || {};
      const labelText = this._getColumnLabel(col);
      const effectiveWidth = typeof col.width === 'number' ? `${col.width}px` : (col.width || '120px');
      const widthStyle = `width: ${effectiveWidth}; min-width: ${effectiveWidth};`;
      const alignStyle = header.align || col.align ? `text-align: ${header.align || col.align};` : '';

      // Fixed Columns (틀고정) 처리
      let fixedClass = '';
      if (colIndex < (this.options.fixedColCount || 0) || col.pinned === 'left') {
        fixedClass = 'pinned-left';
        if (colIndex === (this.options.fixedColCount || 0) - 1) fixedClass += ' pinned-last-left';
      }

      // 다중 정렬 아이콘 & 배지
      const sortRuleIdx = this.sortRules.findIndex(r => r.key === colKey || r.key === col.fieldName);
      const isSorted = sortRuleIdx !== -1;
      let activeSortClass = '';
      let sortOrderBadge = '';
      if (isSorted) {
        const rule = this.sortRules[sortRuleIdx];
        activeSortClass = rule.dir === 'asc' ? 'sort-asc' : 'sort-desc';
        if (this.sortRules.length > 1) {
          sortOrderBadge = `<span class="luna-sort-order">${sortRuleIdx + 1}</span>`;
        }
      }

      let sortIcon = '';
      const isGridSortEnabled = this.options.enableSort !== false && this.options.sortable !== false && (!this.sortingOptions || (this.sortingOptions.enabled !== false && this.sortingOptions.style !== 'none'));
      const isColSortable = isGridSortEnabled && col.sortable !== false;
      if (isColSortable) {
        sortIcon = `
          <span class="luna-sort-icon">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-8 8h16l-8-8z"/></svg>
          </span>
          ${sortOrderBadge}
        `;
      }

      // 필터 아이콘
      let filterIcon = '';
      const isGridFilterEnabled = this.options.enableFilter !== false && this.options.filterable !== false && (!this.filteringOptions || this.filteringOptions.enabled !== false);
      const isFilterable = isGridFilterEnabled && col.autoFilter !== false && col.filterable !== false;
      if (isFilterable) {
        const hasFilter = !!this.columnFilters[colKey];
        filterIcon = `
          <span class="luna-filter-icon ${hasFilter ? 'active' : ''}" data-filter-col="${colKey}" title="자동 필터링">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
          </span>
        `;
      }

      // Header Checkbox
      const checkLoc = header.checkLocation || col.checkLocation || (header.checked !== undefined || col.checked !== undefined ? 'left' : 'none');
      const isChecked = header.checked === true || col.checked === true;
      const isExclusive = header.checkExclusive === true || col.checkExclusive === true;
      const chkInputHtml = checkLoc !== 'none' ? `<input type="${isExclusive ? 'radio' : 'checkbox'}" class="luna-header-col-chk" name="${isExclusive ? 'luna_hdr_radio' : ''}" data-col-key="${colKey}" ${isChecked ? 'checked' : ''} style="cursor:pointer; vertical-align:middle; margin:0 3px;">` : '';

      // Header Template / TemplateCallback
      let labelHtml = '';
      if (typeof header.templateCallback === 'function') {
        labelHtml = header.templateCallback(this, col);
      } else if (header.template) {
        labelHtml = header.template
          .replace(/\$\{headerText\}/g, this._escapeHtml(labelText))
          .replace(/\$\{columnName\}/g, this._escapeHtml(colKey))
          .replace(/\$\{fieldName\}/g, this._escapeHtml(colKey));
        labelHtml = labelHtml.replace(/\*/g, '<span class="luna-header-required" style="color:#ef4444; font-weight:bold; margin-left:2px;">*</span>');
      } else {
        const escapedLabel = this._escapeHtml(labelText);
        const formattedLabel = escapedLabel.replace(/\*/g, '<span class="luna-header-required" style="color:#ef4444; font-weight:bold; margin-left:2px;">*</span>');
        labelHtml = `<span class="luna-header-text" style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1;">${formattedLabel}</span>`;
      }

      let contentHtml = labelHtml;
      if (checkLoc === 'left') contentHtml = `${chkInputHtml}${contentHtml}`;
      else if (checkLoc === 'right') contentHtml = `${contentHtml}${chkInputHtml}`;

      const resizerHtml = this.options.resizable !== false ? `<div class="luna-col-resizer" data-resizer-col="${colKey}"></div>` : '';
      const headerTooltipText = this._getColumnTooltip(col);
      const headerTooltipHtml = headerTooltipText ? `<div class="luna-header-tooltip">${this._escapeHtml(headerTooltipText)}</div>` : '';

      return `
        <th class="luna-header-cell ${isColSortable ? 'sortable' : ''} ${activeSortClass} ${fixedClass}" 
            data-col-key="${colKey}" 
            data-col-index="${colIndex}" 
            style="${widthStyle} ${alignStyle}" 
            ${extraAttr}>
          <div class="luna-header-cell-inner" style="display:flex; align-items:center; justify-content:space-between; width:100%; overflow:hidden;">
            ${contentHtml}
            <div class="luna-header-tools" style="display:inline-flex; align-items:center; gap:3px; flex-shrink:0; margin-left:3px;">
              ${sortIcon}
              ${filterIcon}
            </div>
          </div>
          ${headerTooltipHtml}
          ${resizerHtml}
        </th>
      `;
    }

    _buildFilterPanelRowHtml(visibleCols) {
      if (!this.filterPanel || !this.filterPanel.visible) return '';

      const showIndicator = this.options.indicator && this.options.indicator.visible !== false;
      const showStateBar = this.options.stateBar && this.options.stateBar.visible !== false;
      const showCheckBar = this.options.selectable;

      let panelHtml = '<tr class="luna-filter-panel-row">';
      if (showIndicator) panelHtml += '<th class="luna-meta-th luna-filter-panel-meta"></th>';
      if (showStateBar) panelHtml += '<th class="luna-meta-th luna-filter-panel-meta"></th>';
      if (showCheckBar) panelHtml += '<th class="luna-meta-th luna-filter-panel-meta"></th>';

      visibleCols.forEach((col) => {
        let currentFilterVal = '';
        const currentRule = this.columnFilters[col.key || col.name];
        if (typeof currentRule === 'string') currentFilterVal = currentRule;
        else if (Array.isArray(currentRule) && currentRule.length === 1 && typeof currentRule[0] === 'string') currentFilterVal = currentRule[0];

        panelHtml += `
          <th class="luna-filter-panel-cell" data-col-key="${col.key || col.name}">
            <div class="luna-filter-panel-input-wrap">
              <input type="text" class="luna-filter-panel-input" data-filter-col="${col.key || col.name}" 
                     placeholder="필터 입력..." value="${this._escapeHtml(currentFilterVal)}">
            </div>
          </th>
        `;
      });

      panelHtml += '</tr>';
      return panelHtml;
    }

    /**
     * 상단 요약 표시 행 빌더 (_buildHeaderSummaryRowHtml)
     * LunaGrid Header Summary (sum, avg, count, min, max, customSummary, template 지원)
     */
    _buildHeaderSummaryRowHtml(visibleCols) {
      const summaryOpts = this.options.headerSummary || this.options.headerSummaries || {};
      const hasColSummaries = this.options.columns.some(col => col.headerSummary || col.headerSummaries);

      if (summaryOpts.visible === false || (!summaryOpts.visible && !hasColSummaries)) return '';

      const showIndicator = this.options.indicator && this.options.indicator.visible !== false;
      const showStateBar = this.options.stateBar && this.options.stateBar.visible !== false;
      const showCheckBar = this.options.selectable;

      const summaryHeight = summaryOpts.height ? `height:${typeof summaryOpts.height === 'number' ? summaryOpts.height + 'px' : summaryOpts.height};` : '';
      const dataRows = this.filteredData || this.currentData || [];

      let rowHtml = `<tr class="luna-header-summary-row" style="${summaryHeight}">`;

      if (showIndicator) rowHtml += `<th class="luna-meta-th luna-header-summary-meta">요약</th>`;
      if (showStateBar) rowHtml += `<th class="luna-meta-th luna-header-summary-meta"></th>`;
      if (showCheckBar) rowHtml += `<th class="luna-meta-th luna-header-summary-meta"></th>`;

      visibleCols.forEach(col => {
        const colKey = col.key || col.name;
        const sumDef = col.headerSummary || (Array.isArray(col.headerSummaries) ? col.headerSummaries[0] : null) || {};
        const align = sumDef.align || col.align || (col.dataType === 'number' ? 'right' : 'left');

        let displayVal = '';
        let isHtmlTemplate = false;

        const numericVals = dataRows.map(r => Number(r[colKey])).filter(v => !isNaN(v));
        const sumVal = numericVals.reduce((acc, v) => acc + v, 0);
        const avgVal = numericVals.length > 0 ? (sumVal / numericVals.length) : 0;
        const minVal = numericVals.length > 0 ? Math.min(...numericVals) : 0;
        const maxVal = numericVals.length > 0 ? Math.max(...numericVals) : 0;
        const countVal = dataRows.length;

        if (sumDef.template) {
          isHtmlTemplate = true;
          let tpl = sumDef.template;
          const fmtSum = this._formatNumber(sumVal, sumDef.numberFormat || col.numberFormat || '#,##0');
          const fmtAvg = this._formatNumber(Math.round(avgVal * 100) / 100, sumDef.numberFormat || col.numberFormat || '#,##0.00');
          const fmtMin = this._formatNumber(minVal, sumDef.numberFormat || col.numberFormat || '#,##0');
          const fmtMax = this._formatNumber(maxVal, sumDef.numberFormat || col.numberFormat || '#,##0');

          tpl = tpl.replace(/\$\{sum\}/g, fmtSum)
            .replace(/\$\{avg\}/g, fmtAvg)
            .replace(/\$\{count\}/g, countVal)
            .replace(/\$\{min\}/g, fmtMin)
            .replace(/\$\{max\}/g, fmtMax)
            .replace(/\$\{value\}/g, fmtSum);
          displayVal = tpl;
        } else if (typeof sumDef.customSummary === 'function') {
          displayVal = sumDef.customSummary(this, colKey, dataRows);
        } else if (sumDef.expression) {
          const expr = String(sumDef.expression).toLowerCase().trim();
          if (expr === 'sum') displayVal = sumVal;
          else if (expr === 'avg' || expr === 'average') displayVal = Math.round(avgVal * 100) / 100;
          else if (expr === 'count') displayVal = countVal;
          else if (expr === 'min') displayVal = minVal;
          else if (expr === 'max') displayVal = maxVal;
        } else if (sumDef.text !== undefined) {
          displayVal = sumDef.text;
        }

        if (!isHtmlTemplate) {
          if (typeof displayVal === 'number' || (!isNaN(Number(displayVal)) && displayVal !== '')) {
            if (sumDef.numberFormat) {
              displayVal = this._formatNumber(Number(displayVal), sumDef.numberFormat);
            } else if (col.numberFormat) {
              displayVal = this._formatNumber(Number(displayVal), col.numberFormat);
            } else {
              displayVal = Number(displayVal).toLocaleString();
            }
          }
          if (sumDef.prefix && displayVal !== '') displayVal = `${sumDef.prefix}${displayVal}`;
          if (sumDef.suffix && displayVal !== '') displayVal = `${displayVal}${sumDef.suffix}`;
          displayVal = this._escapeHtml(String(displayVal));
        }

        rowHtml += `
          <th class="luna-header-summary-cell" data-col-key="${colKey}" style="text-align:${align}; font-weight:600;">
            ${displayVal}
          </th>
        `;
      });

      rowHtml += '</tr>';
      return rowHtml;
    }

    /**
     * 컬럼 풋터 요약행 렌더링 엔진 (_renderColumnFooters)
     * LunaGrid Column Footer (sum, avg, count, min, max, customSummary, numberFormat, prefix, suffix 지원)
     */
    _renderColumnFooters() {
      if (!this.tfootEl) return;
      const footerOpts = this.options.footer || {};
      const hasColumnFooters = this.options.columns.some(col => col.footer || col.footers);

      if (footerOpts.visible === false || (!footerOpts.visible && !hasColumnFooters)) {
        this.tfootEl.innerHTML = '';
        this.tfootEl.style.display = 'none';
        return;
      }

      this.tfootEl.style.display = '';
      const showIndicator = this.options.indicator && this.options.indicator.visible !== false;
      const showStateBar = this.options.stateBar && this.options.stateBar.visible !== false;
      const showCheckBar = this.options.selectable;

      const visibleCols = this.options.columns.filter(col => {
        if (col.hidden || col.visible === false) return false;
        const grpName = col.group;
        if (!grpName) return true;
        const isExpanded = this.groupExpandStates.has(grpName) ? this.groupExpandStates.get(grpName) : true;
        const showMode = col.groupShowMode || 'always';
        if (showMode === 'expand') return isExpanded;
        if (showMode === 'collapse') return !isExpanded;
        return true;
      });

      const footerCount = footerOpts.count || (this.options.columns.reduce((max, c) => Math.max(max, Array.isArray(c.footers) ? c.footers.length : 1), 1));
      const itemHeights = footerOpts.itemHeights || footerOpts.items || [];
      const dataRows = this.filteredData || this.currentData || [];
      const userSpans = footerOpts.userSpans || [];

      let allFootersHtml = '';

      for (let rIdx = 0; rIdx < footerCount; rIdx++) {
        const rowH = itemHeights[rIdx] || footerOpts.height;
        const footerHeight = rowH ? `height:${typeof rowH === 'number' ? rowH + 'px' : rowH};` : '';

        let footerRowHtml = `<tr class="luna-footer-row" data-footer-row="${rIdx}" style="${footerHeight}">`;

        const rowLabel = rIdx === 0 ? (footerOpts.text || '합계') : (rIdx === 1 ? '평균' : `요약${rIdx + 1}`);
        if (showIndicator) footerRowHtml += `<td class="luna-meta-td luna-footer-meta">${rowLabel}</td>`;
        if (showStateBar) footerRowHtml += `<td class="luna-meta-td luna-footer-meta"></td>`;
        if (showCheckBar) footerRowHtml += `<td class="luna-meta-td luna-footer-meta"></td>`;

        let colIdx = 0;
        while (colIdx < visibleCols.length) {
          const col = visibleCols[colIdx];
          const colKey = col.key || col.name;
          const footer = (Array.isArray(col.footers) ? col.footers[rIdx] : (rIdx === 0 ? col.footer : null)) || {};

          // userSpans 또는 col.footer.span 매칭 확인
          let spanCount = 1;
          let matchedUserSpan = (rIdx === 0) ? userSpans.find(us => us.column === colKey || us.colKey === colKey || us.name === colKey) : null;

          if (matchedUserSpan && matchedUserSpan.count > 1) {
            spanCount = Math.min(matchedUserSpan.count, visibleCols.length - colIdx);
          } else if (footer.span > 1) {
            spanCount = Math.min(footer.span, visibleCols.length - colIdx);
          }

          const align = (matchedUserSpan && matchedUserSpan.align) || footer.align || col.align || (col.dataType === 'number' ? 'right' : 'left');
          let displayVal = '';
          let isHtmlTemplate = false;

          const numericVals = dataRows.map(r => Number(r[colKey])).filter(v => !isNaN(v));
          const sumVal = numericVals.reduce((acc, v) => acc + v, 0);
          const avgVal = numericVals.length > 0 ? (sumVal / numericVals.length) : 0;
          const minVal = numericVals.length > 0 ? Math.min(...numericVals) : 0;
          const maxVal = numericVals.length > 0 ? Math.max(...numericVals) : 0;
          const countVal = dataRows.length;

          if (footer.template) {
            isHtmlTemplate = true;
            let tpl = footer.template;
            const fmtSum = this._formatNumber(sumVal, footer.numberFormat || col.numberFormat || '#,##0');
            const fmtAvg = this._formatNumber(Math.round(avgVal * 100) / 100, footer.numberFormat || col.numberFormat || '#,##0.00');
            const fmtMin = this._formatNumber(minVal, footer.numberFormat || col.numberFormat || '#,##0');
            const fmtMax = this._formatNumber(maxVal, footer.numberFormat || col.numberFormat || '#,##0');

            tpl = tpl.replace(/\$\{sum\}/g, fmtSum)
              .replace(/\$\{avg\}/g, fmtAvg)
              .replace(/\$\{count\}/g, countVal)
              .replace(/\$\{min\}/g, fmtMin)
              .replace(/\$\{max\}/g, fmtMax)
              .replace(/\$\{value\}/g, fmtSum);
            displayVal = tpl;
          } else if (matchedUserSpan && matchedUserSpan.text !== undefined) {
            displayVal = matchedUserSpan.text;
          } else if (typeof footer.customSummary === 'function') {
            displayVal = footer.customSummary(this, colKey, dataRows, rIdx);
          } else if (footer.expression) {
            const expr = String(footer.expression).toLowerCase().trim();
            if (expr === 'sum') displayVal = sumVal;
            else if (expr === 'avg' || expr === 'average') displayVal = Math.round(avgVal * 100) / 100;
            else if (expr === 'count') displayVal = countVal;
            else if (expr === 'min') displayVal = minVal;
            else if (expr === 'max') displayVal = maxVal;
          } else if (footer.text !== undefined) {
            displayVal = footer.text;
          }

          if (!isHtmlTemplate) {
            if (footer.formatter === 'currency' || (col.formatter === 'currency' && footer.expression === 'sum')) {
              displayVal = this.formatCurrency(displayVal);
            } else if (footer.format && typeof footer.format === 'string') {
              const num = Number(displayVal);
              if (!isNaN(num)) {
                if (footer.format.includes('#,##0')) {
                  displayVal = footer.format.replace('#,##0', num.toLocaleString());
                } else if (footer.format.includes('0.0%')) {
                  displayVal = footer.format.replace('0.0%', num.toFixed(1) + '%');
                } else if (footer.format.includes('0%')) {
                  displayVal = footer.format.replace('0%', Math.round(num) + '%');
                } else if (footer.format.includes('0')) {
                  displayVal = footer.format.replace('0', num.toLocaleString());
                } else {
                  displayVal = `${footer.format} ${num.toLocaleString()}`;
                }
              }
            } else if (typeof displayVal === 'number' || (!isNaN(Number(displayVal)) && displayVal !== '')) {
              if (footer.numberFormat) {
                displayVal = this._formatNumber(Number(displayVal), footer.numberFormat);
              } else if (col.numberFormat) {
                displayVal = this._formatNumber(Number(displayVal), col.numberFormat);
              } else {
                displayVal = Number(displayVal).toLocaleString();
              }
            }
            if (footer.prefix && displayVal !== '') displayVal = `${footer.prefix}${displayVal}`;
            if (footer.suffix && displayVal !== '') displayVal = `${displayVal}${footer.suffix}`;
            displayVal = this._escapeHtml(String(displayVal));
          }

          const colSpanAttr = spanCount > 1 ? `colspan="${spanCount}"` : '';

          footerRowHtml += `
            <td class="luna-footer-cell" data-col-key="${colKey}" data-footer-row="${rIdx}" ${colSpanAttr} style="text-align:${align}; font-weight:600;">
              ${displayVal}
            </td>
          `;

          colIdx += spanCount;
        }

        footerRowHtml += '</tr>';
        allFootersHtml += footerRowHtml;
      }

      this.tfootEl.innerHTML = allFootersHtml;
    }

    _initColumnResizing() {
      const isGlobalResizable = (this.displayOptions && this.displayOptions.columnResizable !== false) && (this.options.resizable !== false);
      if (!isGlobalResizable) return;

      const resizers = this.theadEl.querySelectorAll('.luna-col-resizer');
      resizers.forEach(resizer => {
        const colKey = resizer.getAttribute('data-resizer-col');
        const col = this.options.columns.find(c => c.key === colKey || c.name === colKey);
        if (col && col.resizable === false) {
          resizer.remove();
          return;
        }

        resizer.addEventListener('mousedown', (e) => {
          e.stopPropagation();
          e.preventDefault();
          const th = resizer.closest('th');
          const startX = e.pageX;
          const startWidth = th.offsetWidth;
          const minW = parseInt(col && col.minWidth, 10) || 40;
          const maxW = parseInt(col && col.maxWidth, 10) || 2000;

          const onMouseMove = (moveEvent) => {
            let currentWidth = startWidth + (moveEvent.pageX - startX);
            currentWidth = Math.max(minW, Math.min(currentWidth, maxW));
            this._emit('columnResizing', colKey, currentWidth);
            this.setColumnProperty(colKey, 'width', `${currentWidth}px`);
            if (typeof this.options.onColumnResize === 'function') {
              this.options.onColumnResize(this, colKey, currentWidth);
            }
            this._triggerAutoSavePersonalization();
          };

          const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            const finalWidth = th.offsetWidth;
            this._emit('columnResized', colKey, finalWidth);
          };

          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
        });
      });
    }

    _initColumnReordering() {
      const isGlobalMovable = (this.displayOptions && this.displayOptions.columnMovable !== false) && (this.options.movableColumns !== false);
      if (!isGlobalMovable) return;

      const thList = this.theadEl.querySelectorAll('th[data-col-key]');
      thList.forEach(th => {
        const colKey = th.getAttribute('data-col-key');
        const col = this.options.columns.find(c => c.key === colKey || c.name === colKey);
        if (col && col.movable === false) {
          th.removeAttribute('draggable');
          return;
        }

        th.setAttribute('draggable', 'true');

        th.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', colKey);
          th.classList.add('luna-col-dragging');
        });

        th.addEventListener('dragend', () => {
          th.classList.remove('luna-col-dragging');
          thList.forEach(t => t.classList.remove('luna-drag-over-left', 'luna-drag-over-right'));
        });

        th.addEventListener('dragover', (e) => {
          e.preventDefault();
          const rect = th.getBoundingClientRect();
          const isLeft = e.clientX < rect.left + rect.width / 2;
          th.classList.toggle('luna-drag-over-left', isLeft);
          th.classList.toggle('luna-drag-over-right', !isLeft);
        });

        th.addEventListener('dragleave', () => {
          th.classList.remove('luna-drag-over-left', 'luna-drag-over-right');
        });

        th.addEventListener('drop', (e) => {
          e.preventDefault();
          th.classList.remove('luna-drag-over-left', 'luna-drag-over-right');
          const draggedKey = e.dataTransfer.getData('text/plain');
          if (!draggedKey || draggedKey === colKey) return;

          const fromIdx = this.options.columns.findIndex(c => c.key === draggedKey || c.name === draggedKey);
          const toIdx = this.options.columns.findIndex(c => c.key === colKey || c.name === colKey);
          if (fromIdx === -1 || toIdx === -1) return;

          // onColumnMoving 이벤트 발생 (false 반환 시 컬럼 이동 취소)
          if (!this._emit('columnMoving', draggedKey, fromIdx, toIdx)) return;

          const movedCol = this.options.columns.splice(fromIdx, 1)[0];
          this.options.columns.splice(toIdx, 0, movedCol);

          this._renderHeader();
          this._renderBody();
          this._renderFooter();

          if (typeof this.options.onColumnMove === 'function') {
            this.options.onColumnMove(this, draggedKey, fromIdx, toIdx);
          }
          this._emit('columnMoved', draggedKey, fromIdx, toIdx);
          this._triggerAutoSavePersonalization();
        });
      });
    }

    _calculateFittedColumnWidths(visibleCols) {
      const fitStyle = (this.displayOptions && this.displayOptions.fitStyle) || this.options.fitStyle || 'none';
      if (fitStyle === 'none') return {};

      const containerWidth = this.tableContainer ? this.tableContainer.clientWidth : (this.container ? this.container.clientWidth : 900);
      let nonColWidth = 0;
      if (this.options.indicator && this.options.indicator.visible !== false) nonColWidth += 48;
      if (this.options.stateBar && this.options.stateBar.visible !== false) nonColWidth += 34;
      if (this.options.selectable) nonColWidth += 40;

      const availableWidth = Math.max(containerWidth - nonColWidth - 10, 200);
      const parsedWidths = visibleCols.map(c => {
        let w = parseInt(c.width, 10);
        return isNaN(w) ? 120 : w;
      });
      const totalColWidth = parsedWidths.reduce((a, b) => a + b, 0);
      const fittedWidths = {};

      if (fitStyle === 'even') {
        if (totalColWidth < availableWidth && totalColWidth > 0) {
          const ratio = availableWidth / totalColWidth;
          visibleCols.forEach((col, idx) => {
            fittedWidths[col.key || col.name] = `${Math.floor(parsedWidths[idx] * ratio)}px`;
          });
        }
      } else if (fitStyle === 'evenFill') {
        if (totalColWidth > 0) {
          const ratio = availableWidth / totalColWidth;
          visibleCols.forEach((col, idx) => {
            fittedWidths[col.key || col.name] = `${Math.floor(parsedWidths[idx] * ratio)}px`;
          });
        }
      } else if (fitStyle === 'fill') {
        if (totalColWidth < availableWidth) {
          const fillCols = visibleCols.filter(c => Number(c.fillWidth) > 0);
          if (fillCols.length > 0) {
            const fixedColsWidth = visibleCols
              .filter(c => !(Number(c.fillWidth) > 0))
              .reduce((sum, c) => sum + (parseInt(c.width, 10) || 120), 0);
            const remainingSpace = Math.max(availableWidth - fixedColsWidth, 0);
            const totalFillWeight = fillCols.reduce((sum, c) => sum + Number(c.fillWidth), 0);

            fillCols.forEach(col => {
              const allocated = Math.floor(remainingSpace * (Number(col.fillWidth) / totalFillWeight));
              fittedWidths[col.key || col.name] = `${allocated}px`;
            });
          }
        }
      }

      return fittedWidths;
    }

    _renderBody() {
      if (this.isLoading) return;

      const showIndicator = this.options.indicator && this.options.indicator.visible !== false;
      const showStateBar = this.options.stateBar && this.options.stateBar.visible !== false;
      const showCheckBar = this.options.selectable;
      const visibleCols = this.options.columns.filter(c => !c.hidden);
      const totalMetaCols = (showIndicator ? 1 : 0) + (showStateBar ? 1 : 0) + (showCheckBar ? 1 : 0);
      const totalColsCount = visibleCols.length + totalMetaCols;

      if (this.displayData.length === 0) {
        const emptyMsg = (this.options.displayOptions && this.options.displayOptions.emptyMessage) ||
          this.getMessage('displayEmptyMessage', '조회된 데이터가 없습니다.');
        this.tbodyEl.innerHTML = `
          <tr>
            <td colspan="${totalColsCount}">
              <div class="luna-grid-empty">${this._escapeHtml(emptyMsg)}</div>
            </td>
          </tr>
        `;
        this._renderSummaryRow();
        return;
      }

      let html = '';
      // 행 그룹핑이 활성화된 경우 계층 렌더링
      if (this.groupColumns.length > 0) {
        html = this._renderGroupedRows(visibleCols, totalMetaCols, totalColsCount);
      } else {
        // 셀 병합(Cell Merging) 계산
        this._calculateCellMergeSpans(visibleCols);

        // 일반 플랫 행 렌더링
        this.displayData.forEach((row, displayIndex) => {
          html += this._buildRowHtml(row, displayIndex, displayIndex, visibleCols, showIndicator, showStateBar, showCheckBar);
        });
      }

      this.tbodyEl.innerHTML = html;
      this._updateSelectAllCheckbox();
      this._renderSummaryRow();
      this._renderFooter();
      this._updateRangeSelectionUi();
      this._syncGridHeight();
    }

    _toggleSelectAll(checked) {
      if (checked) {
        this.displayData.forEach((row, idx) => {
          this.selectedRowKeys.add(this._getRowId(row, idx));
        });
      } else {
        this.selectedRowKeys.clear();
      }
      this._renderBody();
      if (typeof this.options.onSelectionChanged === 'function') {
        this.options.onSelectionChanged(this.getSelectedRows());
      }
    }

    _toggleRowSelect(rowId, checked, tr) {
      if (checked) {
        if (!this.options.multiSelect) {
          this.selectedRowKeys.clear();
          if (this.tbodyEl) {
            this.tbodyEl.querySelectorAll('tr.selected').forEach(r => r.classList.remove('selected'));
            this.tbodyEl.querySelectorAll('input.luna-row-select').forEach(cb => { cb.checked = false; });
          }
        }
        this.selectedRowKeys.add(rowId);
        if (tr) {
          tr.classList.add('selected');
          const cb = tr.querySelector('input.luna-row-select');
          if (cb) cb.checked = true;
        }
      } else {
        this.selectedRowKeys.delete(rowId);
        if (tr) {
          tr.classList.remove('selected');
          const cb = tr.querySelector('input.luna-row-select');
          if (cb) cb.checked = false;
        }
      }
      this._updateSelectAllCheckbox();
      if (typeof this.options.onSelectionChanged === 'function') {
        this.options.onSelectionChanged(this.getSelectedRows());
      }
    }

    _updateSelectAllCheckbox() {
      if (!this.theadEl) return;
      const selectAllCb = this.theadEl.querySelector('.luna-select-all');
      if (!selectAllCb) return;
      if (this.displayData.length === 0) {
        selectAllCb.checked = false;
        selectAllCb.indeterminate = false;
        return;
      }
      const selectedCount = this.displayData.filter((r, idx) => this.selectedRowKeys.has(this._getRowId(r, idx))).length;
      if (selectedCount === 0) {
        selectAllCb.checked = false;
        selectAllCb.indeterminate = false;
      } else if (selectedCount === this.displayData.length) {
        selectAllCb.checked = true;
        selectAllCb.indeterminate = false;
      } else {
        selectAllCb.checked = false;
        selectAllCb.indeterminate = true;
      }
    }

    /**
     * 행 높이 및 콘텐츠 수에 따른 그리드 높이 자동 동기화 엔진 (_syncGridHeight)
     * LunaGrid syncGridHeight ('always' | 'never' | 'auto') 지원
     */
    _syncGridHeight() {
      if (!this.wrapperEl) return;
      const dispOpts = this.options.displayOptions || {};
      const syncMode = dispOpts.syncGridHeight || this.options.syncGridHeight;

      if (syncMode === 'always' || this.options.height === 'auto') {
        this.container.style.height = 'auto';
        this.wrapperEl.style.height = 'auto';
        this.wrapperEl.style.maxHeight = 'none';
        this.wrapperEl.style.overflowY = 'visible';
      } else if (syncMode === 'auto') {
        this.wrapperEl.style.height = 'auto';
        if (dispOpts.maxHeight) {
          this.wrapperEl.style.maxHeight = typeof dispOpts.maxHeight === 'number' ? dispOpts.maxHeight + 'px' : dispOpts.maxHeight;
        }
        this.wrapperEl.style.overflowY = 'auto';
      } else if (syncMode === 'never' || (this.options.height && this.options.height !== 'auto')) {
        const hVal = typeof this.options.height === 'number' ? this.options.height + 'px' : this.options.height;
        this.container.style.height = hVal;
        this.wrapperEl.style.height = '';
        this.wrapperEl.style.overflowY = 'auto';
      } else {
        this.wrapperEl.style.height = '';
        this.wrapperEl.style.overflowY = 'auto';
      }
    }

    /**
     * 행 그룹핑(Row Grouping) 계층형 렌더링 엔진 (_renderGroupedRows)
     * LunaGrid Row Group (headerHeight, footerHeight, summaryHeight, collapse/expand 지원)
     */
    _renderGroupedRows(visibleCols, totalMetaCols, totalColsCount) {
      const rowGroupOpts = this.options.rowGroup || {};
      const headerH = rowGroupOpts.headerHeight ? `height:${typeof rowGroupOpts.headerHeight === 'number' ? rowGroupOpts.headerHeight + 'px' : rowGroupOpts.headerHeight};` : '';
      const footerH = (rowGroupOpts.footerHeight || rowGroupOpts.summaryHeight) ? `height:${typeof (rowGroupOpts.footerHeight || rowGroupOpts.summaryHeight) === 'number' ? (rowGroupOpts.footerHeight || rowGroupOpts.summaryHeight) + 'px' : (rowGroupOpts.footerHeight || rowGroupOpts.summaryHeight)};` : '';
      const showIndicator = this.options.indicator && this.options.indicator.visible !== false;
      const showStateBar = this.options.stateBar && this.options.stateBar.visible !== false;
      const showCheckBar = this.options.selectable;

      // 데이터 그룹핑
      const groups = new Map();
      this.displayData.forEach((row, idx) => {
        const grpKey = this.groupColumns.map(col => String(row[col] ?? '')).join(' / ');
        if (!groups.has(grpKey)) groups.set(grpKey, []);
        groups.get(grpKey).push({ row, originalIndex: idx });
      });

      const isMergeMode = rowGroupOpts.mergeMode === true;
      let groupedHtml = '';
      let globalRowCounter = 0;

      // mergeMode: true일 때 셀 병합 정보 사전 등록
      if (isMergeMode) {
        this.mergeSpansMap = new Map();
        groups.forEach((items) => {
          const firstRowIdx = items[0].originalIndex;
          const groupSpan = items.length;
          if (groupSpan > 1) {
            this.groupColumns.forEach(grpColKey => {
              this.mergeSpansMap.set(`${firstRowIdx}_${grpColKey}`, { span: groupSpan, hidden: false });
              for (let h = 1; h < groupSpan; h++) {
                this.mergeSpansMap.set(`${firstRowIdx + h}_${grpColKey}`, { span: 1, hidden: true });
              }
            });
          }
        });
      }

      groups.forEach((items, grpKey) => {
        const isCollapsed = this.collapsedGroups.has(grpKey);
        const expandIcon = isCollapsed ? '▸' : '▾';

        // 1. 그룹 헤더 행 (mergeMode가 아닐 때만 렌더링)
        if (!isMergeMode) {
          groupedHtml += `
            <tr class="luna-group-header-row" data-group-key="${this._escapeHtml(grpKey)}" style="${headerH} cursor:pointer; background:var(--luna-bg-header, #1e293b); font-weight:600;">
              <td colspan="${totalColsCount}" style="padding: 8px 12px;">
                <span class="luna-group-toggle" style="margin-right:6px; font-size:12px;">${expandIcon}</span>
                <span style="color:var(--luna-text-accent, #38bdf8);">${this._escapeHtml(grpKey)}</span>
                <span class="luna-badge luna-badge-info luna-badge-sm" style="margin-left:8px;">${items.length}건</span>
              </td>
            </tr>
          `;
        }

        // 2. 그룹 소속 일반 데이터 행들
        if (!isCollapsed || isMergeMode) {
          items.forEach(({ row, originalIndex }) => {
            groupedHtml += this._buildRowHtml(row, originalIndex, globalRowCounter, visibleCols, showIndicator, showStateBar, showCheckBar);
            globalRowCounter++;
          });

          // 3. 그룹 소계 / 푸터 행 (rowGroup.footerVisible 또는 summaryVisible 설정 시)
          if (rowGroupOpts.footerVisible !== false && (rowGroupOpts.summaryVisible || rowGroupOpts.footerVisible)) {
            groupedHtml += `<tr class="luna-group-footer-row" style="${footerH} background:var(--luna-bg-header, #1e293b); font-weight:600;">`;
            if (showIndicator) groupedHtml += `<td class="luna-meta-td luna-footer-meta">소계</td>`;
            if (showStateBar) groupedHtml += `<td class="luna-meta-td luna-footer-meta"></td>`;
            if (showCheckBar) groupedHtml += `<td class="luna-meta-td luna-footer-meta"></td>`;

            visibleCols.forEach(col => {
              const colKey = col.key || col.name;
              const numericVals = items.map(it => Number(it.row[colKey])).filter(v => !isNaN(v));
              let sumText = '';
              if (col.dataType === 'number' && numericVals.length > 0) {
                const subSum = numericVals.reduce((acc, v) => acc + v, 0);
                sumText = this._formatNumber(subSum, col.numberFormat || '#,##0');
              } else if (this.groupColumns.includes(colKey)) {
                sumText = isMergeMode ? `${grpKey} 소계` : '';
              }
              groupedHtml += `<td style="padding:6px 12px; text-align:${col.align || 'right'}; color:var(--luna-text-primary, #f8fafc); font-weight:600;">${sumText}</td>`;
            });
            groupedHtml += `</tr>`;
          }
        }
      });

      return groupedHtml;
    }

    _calculateCellMergeSpans(visibleCols) {
      this.mergeSpansMap = new Map();

      visibleCols.forEach((col, colIdx) => {
        const mergeRule = col.mergeRule;
        if (!mergeRule) return;

        const criteria = typeof mergeRule === 'object' ? mergeRule.criteria : mergeRule;
        const isFunc = typeof mergeRule === 'function';

        let startRowIdx = 0;
        while (startRowIdx < this.displayData.length) {
          let spanCount = 1;
          const startRow = this.displayData[startRowIdx];

          for (let nextRowIdx = startRowIdx + 1; nextRowIdx < this.displayData.length; nextRowIdx++) {
            const nextRow = this.displayData[nextRowIdx];
            let isMatch = false;

            if (isFunc) {
              isMatch = mergeRule(this.displayData[nextRowIdx - 1], nextRow, col.key, nextRowIdx);
            } else if (criteria === 'value' || criteria === true || !criteria) {
              isMatch = String(nextRow[col.key] ?? '') === String(startRow[col.key] ?? '');
            } else if (typeof criteria === 'string' && criteria.startsWith('row div')) {
              const divN = parseInt(criteria.replace('row div', '').trim(), 10) || 1;
              isMatch = Math.floor(nextRowIdx / divN) === Math.floor(startRowIdx / divN);
            } else if (typeof criteria === 'string' && (criteria.includes('prevvalues') || criteria.includes('values['))) {
              let prevColsMatch = true;
              for (let p = 0; p < colIdx; p++) {
                const prevColKey = visibleCols[p].key;
                if (String(nextRow[prevColKey] ?? '') !== String(startRow[prevColKey] ?? '')) {
                  prevColsMatch = false;
                  break;
                }
              }
              isMatch = prevColsMatch && (String(nextRow[col.key] ?? '') === String(startRow[col.key] ?? ''));
            } else {
              isMatch = String(nextRow[col.key] ?? '') === String(startRow[col.key] ?? '');
            }

            if (isMatch) {
              spanCount++;
            } else {
              break;
            }
          }

          if (spanCount > 1) {
            const mergedRowIndices = [];
            for (let r = 0; r < spanCount; r++) {
              mergedRowIndices.push(startRowIdx + r);
            }
            this.mergeSpansMap.set(`${startRowIdx}_${col.key}`, { span: spanCount, hidden: false, mergedRowIndices });
            for (let h = 1; h < spanCount; h++) {
              this.mergeSpansMap.set(`${startRowIdx + h}_${col.key}`, { span: 1, hidden: true, mergedRowIndices });
            }
            startRowIdx += spanCount;
          } else {
            startRowIdx++;
          }
        }
      });
    }
    /**
     * 셀 값 추출 엔진 (_getCellValue)
     * LunaGrid Object Type Field (Dot Notation), Subtypes (subType, baseField, valueCallback) 완벽 지원
     */
    /**
     * 셀 값 추출 엔진 (_getCellValue)
     * LunaGrid Object Type Field (Dot Notation), Calculated Field (valueExpression, valueCallback), Subtypes 완벽 지원
     */
    _getCellValue(row, col = {}) {
      if (!row) return '';
      const rowIndex = this.displayData.indexOf(row);

      // 0-1. Column 단위 커스텀 valueCallback 연산
      if (typeof col.valueCallback === 'function') {
        if (col.valueCallback.length <= 1) {
          return col.valueCallback(row);
        }
        return col.valueCallback(this.dataAdapter, rowIndex, col.key || col.fieldName || col.name, row);
      }

      // 0-2. Column 단위 수식 valueExpression 연산 (예: 'qty * unitPrice')
      if (typeof col.valueExpression === 'string' && col.valueExpression) {
        try {
          const fn = new Function('values', 'row', `with(values) { return (${col.valueExpression}); }`);
          const computed = fn(row, row);
          if (computed !== undefined && !isNaN(computed)) return computed;
        } catch (err) {
          // 계산 오류 시 무시하고 다음으로 진행
        }
      }

      const field = col.fieldName || col.name || col.key;
      if (!field) return '';

      // 1. DataAdapter 연계 계산 필드 및 값 조회
      if (this.dataAdapter && typeof this.dataAdapter.getValue === 'function') {
        const val = this.dataAdapter.getValue(row, field);
        if (val !== undefined) return val;
      }

      // 2. DataAdapter Subtypes 파생 필드 연산
      if (this.dataAdapter && Array.isArray(this.dataAdapter.fields)) {
        const fieldDef = this.dataAdapter.fields.find(f => f.fieldName === field);
        if (fieldDef && (fieldDef.subType || fieldDef.baseField)) {
          const baseVal = fieldDef.baseField ? row[fieldDef.baseField] : row[field];
          if (typeof fieldDef.valueCallback === 'function') {
            return fieldDef.valueCallback(this.dataAdapter, rowIndex, field, baseVal, row);
          }
          if (fieldDef.subType === 'left' && fieldDef.length) return String(baseVal ?? '').slice(0, fieldDef.length);
          if (fieldDef.subType === 'right' && fieldDef.length) return String(baseVal ?? '').slice(-fieldDef.length);
          if (fieldDef.subType === 'mid' && fieldDef.start !== undefined) return String(baseVal ?? '').substr(fieldDef.start, fieldDef.length);
          if (fieldDef.subType === 'percent' || fieldDef.subType === 'rate') return (Number(baseVal) || 0) * (fieldDef.rate || 0.1);
        }
      }

      // 3. 중첩 JSON 객체(Dot Notation 'company.name', 'addr.zip') 파싱
      if (field.includes('.')) {
        return field.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), row);
      }
      return row[field];
    }

    _getRowId(row, index) {
      if (!row) return index !== undefined ? String(index) : '0';
      if (row.id !== undefined && row.id !== null) return String(row.id);
      if (row.__treeNodeId !== undefined && row.__treeNodeId !== null) return String(row.__treeNodeId);
      if (row._rowKey !== undefined && row._rowKey !== null) return String(row._rowKey);
      if (index !== undefined && index !== null) return String(index);
      const idx = this.displayData.indexOf(row);
      return idx !== -1 ? String(idx) : String(Math.random());
    }

    _findRowById(rowId) {
      if (rowId === undefined || rowId === null) return null;
      const strId = String(rowId);
      let found = this.displayData.find((r, idx) => this._getRowId(r, idx) === strId);
      if (!found && this.currentData) {
        found = this.currentData.find((r, idx) => this._getRowId(r, idx) === strId);
      }
      return found || null;
    }

    _buildRowHtml(row, rowIndex, startNo, visibleCols, showIndicator, showStateBar, showCheckBar) {
      const rowId = this._getRowId(row, rowIndex);
      const isSelected = this.selectedRowKeys.has(rowId);
      const rowState = this.dataAdapter && typeof this.dataAdapter.getRowState === 'function' ? this.dataAdapter.getRowState(rowId) : RowState.NONE;
      const isDeleted = rowState === 'deleted' || rowState === 'createAndDeleted' || !!row._isDeleted;
      const isNew = !isDeleted && (rowState === 'created' || !!row._isNew);
      const isDirty = !isDeleted && (rowState === 'updated' || (!!row._isDirty && !isNew) || (row._dirtyFields && row._dirtyFields.size > 0 && !isNew));
      const rowErrors = this.validationErrors.get(rowId) || {};

      let rowClasses = [];
      if (isSelected) rowClasses.push('selected');
      if (isDeleted) rowClasses.push('luna-row-deleted');
      else if (isNew) rowClasses.push('luna-row-new');
      else if (isDirty) rowClasses.push('luna-row-updated');

      // Fixed Rows (행 고정)
      const fixedRows = this.options.fixedRowCount || (this.options.fixedOptions && this.options.fixedOptions.rowCount) || 0;
      if (rowIndex < fixedRows) {
        rowClasses.push('pinned-row');
        if (rowIndex === fixedRows - 1) rowClasses.push('pinned-last-row');
      }

      const dispOpts = this.options.displayOptions || {};
      const rHeight = this.options.rowHeight || dispOpts.rowHeight;
      const minRHeight = this.options.minRowHeight || dispOpts.minRowHeight;
      let styleAttr = '';
      if (rHeight) styleAttr += `height:${typeof rHeight === 'number' ? rHeight + 'px' : rHeight}; `;
      if (minRHeight) styleAttr += `min-height:${typeof minRHeight === 'number' ? minRHeight + 'px' : minRHeight}; `;

      const isDraggable = !!(this.rowDragOptions && this.rowDragOptions.enabled);
      const dragAttr = isDraggable ? 'draggable="true"' : '';

      let rowHtml = `<tr ${dragAttr} data-row-id="${rowId}" data-row-index="${rowIndex}" class="${rowClasses.join(' ')}" style="${styleAttr.trim()}">`;

      // 1. Indicator
      if (showIndicator) {
        const pageOffset = (this.pagingOptions && this.pagingOptions.enabled)
          ? (this.pagingOptions.page * this.pagingOptions.size)
          : ((this.options.pageable && this.currentPage > 0) ? (this.currentPage - 1) * this.pageSize : 0);
        
        // startNo 인자를 화면 표시 순번(displayIndex)으로 활용
        const displayIndex = (typeof startNo === 'number' && !isNaN(startNo)) ? startNo : 0;
        const rowNo = pageOffset + displayIndex + 1;
        const dragCursorStyle = isDraggable ? 'cursor:grab;' : '';
        rowHtml += `<td class="luna-indicator-cell" style="${dragCursorStyle}">${rowNo}</td>`;
      }

      // 2. StateBar (C, U, D)
      if (showStateBar) {
        let stateBadge = '';
        if (isDeleted) stateBadge = '<span class="luna-state-badge luna-state-d" title="삭제 대기">D</span>';
        else if (isNew) stateBadge = '<span class="luna-state-badge luna-state-c" title="신규 추가">C</span>';
        else if (isDirty) stateBadge = '<span class="luna-state-badge luna-state-u" title="수정됨">U</span>';
        rowHtml += `<td class="luna-statebar-cell">${stateBadge}</td>`;
      }

      // 3. CheckBar
      if (showCheckBar) {
        rowHtml += `<td class="luna-checkbox-cell"><input type="checkbox" class="luna-checkbox luna-row-select" ${isSelected ? 'checked' : ''}></td>`;
      }

      // 4. Data Cells
      let skipColsCount = 0;

      visibleCols.forEach((col, colIdx) => {
        if (skipColsCount > 0) {
          skipColsCount--;
          return;
        }

        // 셀 병합(Cell Merging)으로 숨겨지는 행 처리
        const spanInfo = this.mergeSpansMap ? this.mergeSpansMap.get(`${rowIndex}_${col.key}`) : null;
        if (spanInfo && spanInfo.hidden) {
          return;
        }

        const rawValue = this._getCellValue(row, col);

        // Layout Span Callback (동적 스팬 콜백)
        let dynamicColSpan = 1;
        let dynamicRowSpan = (spanInfo && spanInfo.span > 1) ? spanInfo.span : 1;

        const spanCallbackFn = col.spanCallback || this.options.spanCallback;
        if (typeof spanCallbackFn === 'function') {
          const spanRes = spanCallbackFn(this, col, row, rawValue, rowIndex);
          if (typeof spanRes === 'number' && spanRes > 1) {
            dynamicColSpan = spanRes;
            skipColsCount = spanRes - 1;
          } else if (typeof spanRes === 'object' && spanRes !== null) {
            const cSpan = spanRes.col || spanRes.colspan || spanRes.count || 1;
            const rSpan = spanRes.row || spanRes.rowspan || 1;
            if (cSpan > 1) {
              dynamicColSpan = cSpan;
              skipColsCount = cSpan - 1;
            }
            if (rSpan > 1) {
              dynamicRowSpan = rSpan;
            }
          }
        }

        const colSpanAttr = dynamicColSpan > 1 ? `colspan="${dynamicColSpan}"` : '';
        const rowSpanAttr = dynamicRowSpan > 1 ? `rowspan="${dynamicRowSpan}"` : '';

        let formattedValue = this._renderCellContent(col, rawValue, row);
        const isEditable = ((this.options.editable !== false && (col.editable === true || !!col.editor)) || this.options.editable === true) && (col.editable !== false) && !col.readOnly;
        const isCellDirty = row._dirtyFields && row._dirtyFields.has(col.key);
        const errorMsg = rowErrors[col.key];
        const isInvalid = !!errorMsg;

        // TreeView 계층 렌더링 (첫 번째 컬럼에 인덴트, expander 토글 아이콘, 폴더/파일 아이콘 추가)
        if (colIdx === 0 && (this.isTreeView || row.__treeNodeId !== undefined)) {
          const level = row.__treeLevel || 0;
          const hasChildren = !!row.__treeHasChildren;
          const isExpanded = !!row.__treeExpanded;
          const nodeId = row.__treeNodeId || rowId;
          const indentPx = level * 20;

          let expanderHtml = '';
          if (hasChildren) {
            const toggleIcon = isExpanded
              ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>'
              : '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M10 17l5-5-5-5v10z"/></svg>';
            expanderHtml = `<button type="button" class="luna-tree-expander ${isExpanded ? 'expanded' : 'collapsed'}" data-tree-node-id="${nodeId}">${toggleIcon}</button>`;
          } else {
            expanderHtml = `<span class="luna-tree-expander-space"></span>`;
          }

          let nodeIconHtml = '';
          const tOpts = this.treeOptions || (this.dataAdapter && this.dataAdapter.treeOptions) || {};
          const iconImages = tOpts.iconImages || [];
          const iconRoot = tOpts.iconImagesRoot || '';
          const iconW = parseInt(tOpts.iconWidth, 10) || 16;
          const iconH = parseInt(tOpts.iconHeight, 10) || 16;
          const iconMargin = parseInt(tOpts.iconMargin, 10) || 4;
          const iconField = tOpts.iconField || 'icon';
          const expandedIconField = tOpts.expandedIconField || 'expandedIcon';
          const collapsedIconField = tOpts.collapsedIconField || 'collapsedIcon';
          const iconMap = tOpts.iconMap || {};

          // 1. iconCallback 동적 콜백 함수 우선 처리
          let iconVal = undefined;
          if (typeof tOpts.iconCallback === 'function') {
            iconVal = tOpts.iconCallback(this, rowIndex, row, hasChildren, isExpanded);
          }

          // 2. 행(Row) 내의 상태별 전용 아이콘 필드 (expandedIconField / collapsedIconField)
          if (iconVal === undefined) {
            if (hasChildren) {
              if (isExpanded && (row[expandedIconField] !== undefined || row.expandedIcon !== undefined)) {
                iconVal = row[expandedIconField] !== undefined ? row[expandedIconField] : row.expandedIcon;
              } else if (!isExpanded && (row[collapsedIconField] !== undefined || row.collapsedIcon !== undefined)) {
                iconVal = row[collapsedIconField] !== undefined ? row[collapsedIconField] : row.collapsedIcon;
              }
            }
          }

          // 3. 기본 iconField 데이터 필드 참조
          if (iconVal === undefined) {
            iconVal = row[iconField] !== undefined ? row[iconField] : row.icon;
          }

          // 4. iconMap 매핑 처리 (예: { 'DEPT': 0, 'TEAM': 1 })
          if (iconVal !== undefined && iconMap[iconVal] !== undefined) {
            iconVal = iconMap[iconVal];
          }

          // 5. 기본 fallback 아이콘 결정 (expandedIcon, collapsedIcon, defaultIcon)
          if (iconVal === undefined || iconVal === null || iconVal === '') {
            if (hasChildren) {
              iconVal = isExpanded
                ? (tOpts.expandedIcon !== undefined ? tOpts.expandedIcon : '📂')
                : (tOpts.collapsedIcon !== undefined ? tOpts.collapsedIcon : '📁');
            } else {
              iconVal = tOpts.defaultIcon !== undefined ? tOpts.defaultIcon : '📄';
            }
          }

          // 6. 아이콘 값 렌더링 (숫자 인덱스, 이미지 URL, 이모지/텍스트)
          const imgMarginStyle = `margin-right:${iconMargin}px; vertical-align:middle; flex-shrink:0;`;
          if (typeof iconVal === 'number' && iconImages.length > 0) {
            const imgPath = iconImages[iconVal];
            if (imgPath) {
              const fullSrc = imgPath.startsWith('http') || imgPath.startsWith('data:') ? imgPath : `${iconRoot}${imgPath}`;
              nodeIconHtml = `<img class="luna-tree-icon-img" src="${this._escapeHtml(fullSrc)}" width="${iconW}" height="${iconH}" style="${imgMarginStyle}" alt="tree-icon" onerror="this.style.display='none'">`;
            }
          } else if (typeof iconVal === 'string' && (iconVal.startsWith('http') || iconVal.startsWith('./') || iconVal.startsWith('/') || iconVal.startsWith('data:') || iconVal.endsWith('.png') || iconVal.endsWith('.svg') || iconVal.endsWith('.jpg') || iconVal.endsWith('.gif'))) {
            const fullSrc = iconVal.startsWith('http') || iconVal.startsWith('data:') || iconVal.startsWith('/') ? iconVal : `${iconRoot}${iconVal}`;
            nodeIconHtml = `<img class="luna-tree-icon-img" src="${this._escapeHtml(fullSrc)}" width="${iconW}" height="${iconH}" style="${imgMarginStyle}" alt="tree-icon" onerror="this.style.display='none'">`;
          } else if (iconVal) {
            nodeIconHtml = `<span class="luna-tree-icon" style="margin-right:${iconMargin}px;">${this._escapeHtml(String(iconVal))}</span>`;
          }

          // 7. Tree Template (트리 노드 커스텀 템플릿 렌더링)
          let customTreeLabelHtml = null;
          const templateCallbackFn = col.templateCallback || col.treeTemplateCallback || tOpts.templateCallback || (tOpts.templateOptions && tOpts.templateOptions.callback);
          const templateStr = col.treeTemplate || col.template || tOpts.template || (tOpts.templateOptions && tOpts.templateOptions.template);

          if (typeof templateCallbackFn === 'function') {
            customTreeLabelHtml = templateCallbackFn(this, rowIndex, row, isExpanded, hasChildren);
          } else if (typeof templateStr === 'string' && templateStr) {
            // ${fieldName} 또는 {{fieldName}} 토큰 자동 치환
            customTreeLabelHtml = templateStr.replace(/\$\{(\w+)\}|\{\{(\w+)\}\}/g, (match, p1, p2) => {
              const fName = p1 || p2;
              return row[fName] !== undefined ? this._escapeHtml(String(row[fName])) : '';
            });
          }

          const treeLabelContent = customTreeLabelHtml !== null ? customTreeLabelHtml : formattedValue;

          formattedValue = `
            <div class="luna-tree-cell-wrap" style="padding-left: ${indentPx}px;">
              ${expanderHtml}
              ${nodeIconHtml}
              <span class="luna-tree-label">${treeLabelContent}</span>
            </div>
          `;
        }

        const errorLevel = rowErrors[`${col.key}_level`] || 'error';

        let cellClasses = [`align-${col.align || 'left'}`];
        if (isEditable) cellClasses.push('editable');
        if (isCellDirty) cellClasses.push('dirty');
        if (isInvalid) {
          if (errorLevel === 'warning') cellClasses.push('warning', 'luna-cell-warning');
          else if (errorLevel === 'info') cellClasses.push('info', 'luna-cell-info');
          else cellClasses.push('invalid', 'luna-cell-invalid');
        }
        if (dynamicRowSpan > 1 || dynamicColSpan > 1) cellClasses.push('luna-cell-merged');

        // equalBlank (같은 값의 셀 생략하기 - 병합이 아닐 때)
        if (col.equalBlank && rowIndex > 0 && !col.mergeRule && dynamicRowSpan === 1) {
          const prevRow = this.displayData[rowIndex - 1];
          if (prevRow && String(prevRow[col.key]) === String(rawValue)) {
            formattedValue = '';
            cellClasses.push('luna-blank-cell');
          }
        }

        // Fixed Columns
        if (colIdx < this.options.fixedColCount || col.pinned === 'left') {
          cellClasses.push('pinned-left');
          if (colIdx === this.options.fixedColCount - 1) cellClasses.push('pinned-last-left');
        } else if (colIdx >= visibleCols.length - this.options.fixedRightColCount || col.pinned === 'right') {
          cellClasses.push('pinned-right');
          if (colIdx === visibleCols.length - this.options.fixedRightColCount) cellClasses.push('pinned-first-right');
        }

        let tooltipText = '';
        if (typeof col.tooltipCallback === 'function') {
          tooltipText = col.tooltipCallback(this, row, col.key, rawValue);
        } else if (typeof this.options.onTooltip === 'function') {
          tooltipText = this.options.onTooltip(this, row, col.key, rawValue);
        } else if (typeof col.tooltip === 'string') {
          tooltipText = col.tooltip;
        } else if (col.tooltip === true && rawValue !== undefined && rawValue !== null) {
          tooltipText = String(rawValue);
        }

        const tooltipHtml = isInvalid
          ? `<div class="luna-error-tooltip luna-tooltip-${errorLevel}">${this._escapeHtml(errorMsg)}</div>`
          : (tooltipText ? `<div class="luna-cell-tooltip">${this._escapeHtml(tooltipText)}</div>` : '');

        const mergedRowsAttr = (spanInfo && spanInfo.mergedRowIndices) ? `data-merged-rows="${spanInfo.mergedRowIndices.join(',')}"` : '';

        rowHtml += `
          <td class="${cellClasses.join(' ')}" data-col-key="${col.key}" data-col-index="${colIdx}" ${colSpanAttr} ${rowSpanAttr} ${mergedRowsAttr}>
            ${formattedValue}
            ${tooltipHtml}
          </td>
        `;
      });

      rowHtml += '</tr>';
      return rowHtml;
    }

    /**
     * 불린 값 파싱 헬퍼 (_parseBoolean)
     * LunaGrid booleanFormat ('true:false', 'Y:N', '1:0', '예:아니오'), booleanTrue, booleanFalse 완벽 지원
     */
    _parseBoolean(val, col = {}) {
      if (val === undefined || val === null) return false;
      const fmt = col.booleanFormat || (col.renderer && col.renderer.booleanFormat);
      if (fmt && typeof fmt === 'string') {
        const parts = fmt.split(':');
        const trueStr = parts[0] ? parts[0].trim() : 'true';
        const falseStr = parts[1] ? parts[1].trim() : 'false';
        if (String(val) === trueStr) return true;
        if (String(val) === falseStr) return false;
      }
      if (col.booleanTrue !== undefined && String(val) === String(col.booleanTrue)) return true;
      if (col.booleanFalse !== undefined && String(val) === String(col.booleanFalse)) return false;

      return val === true || String(val).toLowerCase() === 'true' || val === 1 || val === '1' || val === 'Y' || val === 'y' || val === 'T' || val === 't' || val === '예';
    }

    /**
     * 불린 값 포맷팅 헬퍼 (_formatBoolean)
     */
    _formatBoolean(val, col = {}) {
      const isTrue = this._parseBoolean(val, col);
      const fmt = col.booleanFormat || (col.renderer && col.renderer.booleanFormat);
      if (fmt && typeof fmt === 'string') {
        const parts = fmt.split(':');
        const trueStr = parts[0] ? parts[0].trim() : 'true';
        const falseStr = parts[1] ? parts[1].trim() : 'false';
        return isTrue ? trueStr : falseStr;
      }
      if (col.booleanTrue !== undefined && col.booleanFalse !== undefined) {
        return isTrue ? col.booleanTrue : col.booleanFalse;
      }
      return isTrue ? 'true' : 'false';
    }

    /**
     * 날짜 포맷팅 헬퍼 (_formatDate)
     * LunaGrid datetimeFormat, dateFormat ('yyyy-MM-dd', 'yyyyMMdd', 'yyyy-MM-dd HH:mm:ss', 'yyyy년 MM월 dd일') 지원
     */
    _formatDate(dateVal, formatStr = 'yyyy-MM-dd') {
      if (dateVal === undefined || dateVal === null || dateVal === '') return '';
      let d = dateVal instanceof Date ? dateVal : new Date(dateVal);

      // '20260816' 형태 파싱
      if (isNaN(d.getTime()) && typeof dateVal === 'string' && dateVal.length === 8 && /^\d{8}$/.test(dateVal)) {
        d = new Date(`${dateVal.slice(0, 4)}-${dateVal.slice(4, 6)}-${dateVal.slice(6, 8)}`);
      }

      if (isNaN(d.getTime())) return String(dateVal);

      const yyyy = d.getFullYear();
      const MM = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const HH = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');

      return formatStr
        .replace(/yyyy/g, yyyy)
        .replace(/MM/g, MM)
        .replace(/dd/g, dd)
        .replace(/HH/g, HH)
        .replace(/mm/g, mm)
        .replace(/ss/g, ss);
    }

    /**
     * 숫자 포맷팅 헬퍼 (_formatNumber)
     */
    _formatNumber(numVal, formatStr = '#,##0') {
      if (numVal === undefined || numVal === null || numVal === '') return '';
      const num = Number(numVal);
      if (isNaN(num)) return String(numVal);

      if (formatStr.includes('.')) {
        const decimals = formatStr.split('.')[1].length;
        return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
      }
      return num.toLocaleString();
    }

    /**
     * 고급 렌더러(Column Renderers) 처리 엔진
     */
    _renderCellContent(col, rawValue, row) {
      // 0-0. Series Column (LunaGrid 정식 SeriesColumn 엔진: fieldNames 배열 / 콤마 / 범위 "f1..f4" 지원)
      if (col.type === 'series' || col.fieldNames) {
        let fieldList = [];
        if (Array.isArray(col.fieldNames)) {
          fieldList = col.fieldNames;
        } else if (typeof col.fieldNames === 'string') {
          if (col.fieldNames.includes('..')) {
            // 범위 지정: "fieldA..fieldB"
            const [startField, endField] = col.fieldNames.split('..').map(s => s.trim());
            const allFieldNames = (this.dataAdapter && this.dataAdapter.fields)
              ? this.dataAdapter.fields.map(f => typeof f === 'object' ? (f.fieldName || f.name || f.key) : f)
              : Object.keys(row || {});
            const startIdx = allFieldNames.indexOf(startField);
            const endIdx = allFieldNames.indexOf(endField);
            if (startIdx !== -1 && endIdx !== -1 && startIdx <= endIdx) {
              fieldList = allFieldNames.slice(startIdx, endIdx + 1);
            }
          } else {
            // 콤마 구분: "f1, f2, f3"
            fieldList = col.fieldNames.split(',').map(s => s.trim());
          }
        }

        if (fieldList.length > 0 && row) {
          rawValue = fieldList.map(fn => row[fn]);
        }
      }

      // 0. 리터럴 컬럼 (type: 'literal' 또는 col.value 지정)
      if (col.type === 'literal' || (col.value !== undefined && (rawValue === undefined || rawValue === null))) {
        let val = (col.value !== undefined) ? col.value : (rawValue !== undefined ? rawValue : '');
        if (typeof col.displayCallback === 'function') {
          return col.displayCallback(this, col.key || col.name, val, row);
        }
        if (typeof col.renderer === 'function') {
          return col.renderer(val, row, col);
        }
        return this._escapeHtml(String(val));
      }

      if (typeof col.renderer === 'function') {
        return col.renderer(rawValue, row, col);
      }

      const rendererType = typeof col.renderer === 'object' ? col.renderer.type : (col.renderer || 'text');

      // 0-1. Class 방식 커스텀 렌더러 (LunaGrid 정식 registerCustomRenderer 엔진)
      const customRendererDef = (this.customRenderers && this.customRenderers.get(rendererType)) || (LunaGrid.customRenderers && LunaGrid.customRenderers.get(rendererType));
      if (customRendererDef) {
        try {
          let customInstance = null;
          if (typeof customRendererDef === 'function') {
            try {
              customInstance = new customRendererDef();
            } catch (e) {
              customInstance = customRendererDef();
            }
          } else if (typeof customRendererDef === 'object') {
            customInstance = customRendererDef;
          }

          if (customInstance && typeof customInstance.render === 'function') {
            const cellInfo = { column: col, value: rawValue, dataRow: this.displayData.indexOf(row), itemIndex: this.displayData.indexOf(row), rowId: this._getRowId(row) };
            const renderResult = customInstance.render(this, cellInfo, col.width || 100, 30, row);
            if (typeof renderResult === 'string') return renderResult;
          }
        } catch (err) {
          console.warn('[LunaGrid] Custom renderer execution error:', err);
        }
      }

      // 1. Progress Bar / Bar 렌더러 및 Custom Bar (LunaGrid 정식 BarCellRenderer & 커스텀 바 엔진)
      if (rendererType === 'bar' || rendererType === 'progress' || rendererType === 'custombar' || rendererType === 'custom-bar') {
        const renderOpts = typeof col.renderer === 'object' ? col.renderer : {};
        const min = renderOpts.minimum !== undefined ? Number(renderOpts.minimum) : (renderOpts.min !== undefined ? Number(renderOpts.min) : (renderOpts.baseValue !== undefined ? -100 : 0));
        const max = renderOpts.maximum !== undefined ? Number(renderOpts.maximum) : (renderOpts.max !== undefined ? Number(renderOpts.max) : 100);
        const origin = renderOpts.origin || 'left'; // left | right | center | top | bottom
        const baseValue = renderOpts.baseValue !== undefined ? Number(renderOpts.baseValue) : (min < 0 && max > 0 ? 0 : null);
        const showLabel = renderOpts.showLabel !== false;
        const numVal = Number(rawValue) || 0;
        const barHeight = renderOpts.barWidth || renderOpts.barHeight || '6px';
        const heightStyle = typeof barHeight === 'number' ? barHeight + 'px' : barHeight;

        // 1-A. 기준값(baseValue: 0)을 중심으로 한 양방향(음수/양수) 센터 바 렌더링
        if (baseValue !== null) {
          const totalRange = max - min || 1;
          const zeroPct = Math.max(0, Math.min(100, ((baseValue - min) / totalRange) * 100));
          let barLeft = zeroPct;
          let barWidth = 0;
          let colorClass = 'bar-indigo';

          if (numVal >= baseValue) {
            // 양수: 기준선(zero)에서 오른쪽으로
            barWidth = Math.max(0, Math.min(100 - zeroPct, ((numVal - baseValue) / totalRange) * 100));
            barLeft = zeroPct;
            colorClass = renderOpts.positiveClass || 'bar-positive';
          } else {
            // 음수: 기준선(zero)에서 왼쪽으로
            barWidth = Math.max(0, Math.min(zeroPct, ((baseValue - numVal) / totalRange) * 100));
            barLeft = zeroPct - barWidth;
            colorClass = renderOpts.negativeClass || 'bar-negative';
          }

          const labelText = showLabel ? `<span class="luna-progress-text ${numVal < 0 ? 'text-neg' : 'text-pos'}">${numVal > 0 ? '+' : ''}${numVal}</span>` : '';
          const customBarColor = (numVal >= baseValue && renderOpts.positiveColor) ? `background: ${renderOpts.positiveColor} !important;` : ((numVal < baseValue && renderOpts.negativeColor) ? `background: ${renderOpts.negativeColor} !important;` : '');

          return `
            <div class="luna-renderer-progress luna-custom-bar-center">
              <div class="luna-progress-track luna-custom-bar-track" style="height: ${heightStyle}; position: relative;">
                <div class="luna-custom-bar-zeroline" style="left: ${zeroPct}%;"></div>
                <div class="luna-progress-bar ${colorClass}" style="position:absolute; left:${barLeft}%; width:${barWidth}%; ${customBarColor}"></div>
              </div>
              ${labelText}
            </div>
          `;
        }

        // 1-B. 일반 단방향 Bar 렌더링
        const pct = (max === min) ? 0 : Math.max(0, Math.min(100, Math.round(((numVal - min) / (max - min)) * 100)));

        let colorClass = 'bar-indigo';
        if (renderOpts.colorScheme === 'auto') {
          if (pct >= 80) colorClass = 'bar-success';
          else if (pct >= 40) colorClass = 'bar-indigo';
          else if (pct >= 20) colorClass = 'bar-warning';
          else colorClass = 'bar-danger';
        } else if (renderOpts.colorScheme) {
          colorClass = `bar-${renderOpts.colorScheme}`;
        }

        const customColor = renderOpts.barColor ? `background: ${renderOpts.barColor} !important;` : '';
        const customStyle = `width: ${pct}%; ${customColor}`;
        const labelText = showLabel ? `<span class="luna-progress-text">${numVal}%</span>` : '';

        // origin 방향 제어 (right: 오른쪽에서 왼쪽으로 채움)
        const trackDirection = origin === 'right' ? 'flex-direction: row-reverse;' : '';

        return `
          <div class="luna-renderer-progress" style="${trackDirection}">
            <div class="luna-progress-track" style="height: ${heightStyle};">
              <div class="luna-progress-bar ${colorClass}" style="${customStyle}"></div>
            </div>
            ${labelText}
          </div>
        `;
      }

      // 2. Status Badge / Pill 렌더러
      if (rendererType === 'badge') {
        const colorMap = (col.renderer && col.renderer.colorMap) || {
          '활성': 'success', '정상': 'success', '완료': 'success',
          '대기': 'warning', '진행중': 'info', '보류': 'warning',
          '중지': 'danger', '실패': 'danger', '에러': 'danger'
        };
        const badgeColor = colorMap[rawValue] || 'info';
        return `
          <span class="luna-badge luna-badge-${badgeColor}">
            <span class="luna-badge-dot"></span>
            ${this._escapeHtml(String(rawValue ?? ''))}
          </span>
        `;
      }

      // 3. Star Rating 렌더러
      if (rendererType === 'rating') {
        const rating = Math.min(5, Math.max(0, parseInt(rawValue, 10) || 0));
        let stars = '';
        for (let i = 1; i <= 5; i++) {
          const isFilled = i <= rating;
          stars += `
            <svg viewBox="0 0 24 24" class="${isFilled ? '' : 'star-empty'}" fill="currentColor">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
          `;
        }
        return `<div class="luna-rating" title="${rating}점">${stars}</div>`;
      }

      // 4-1. Image 렌더러 (LunaGrid 정식 ImageCellRenderer 엔진)
      if (rendererType === 'image') {
        const renderOpts = typeof col.renderer === 'object' ? col.renderer : {};
        let imgUrl = '';

        // 1) imageCallback 우선 평가
        if (typeof renderOpts.imageCallback === 'function') {
          imgUrl = renderOpts.imageCallback(this, { column: col, value: rawValue, row }, rawValue, row);
        }
        // 2) imageMap 매핑
        else if (renderOpts.imageMap && renderOpts.imageMap[rawValue] !== undefined) {
          imgUrl = renderOpts.imageMap[rawValue];
        }
        // 3) imageField 참조
        else if (renderOpts.imageField && row[renderOpts.imageField]) {
          imgUrl = row[renderOpts.imageField];
        }
        // 4) rawValue가 이미지 경로인 경우
        else if (typeof rawValue === 'string' && (rawValue.startsWith('http') || rawValue.startsWith('./') || rawValue.startsWith('/') || rawValue.startsWith('data:'))) {
          imgUrl = rawValue;
        }
        // 5) defaultImg / fallbackImg
        else if (renderOpts.defaultImg || renderOpts.fallbackImg) {
          imgUrl = renderOpts.defaultImg || renderOpts.fallbackImg;
        }

        const width = renderOpts.imageWidth ? (typeof renderOpts.imageWidth === 'number' ? `${renderOpts.imageWidth}px` : renderOpts.imageWidth) : 'auto';
        const height = renderOpts.imageHeight ? (typeof renderOpts.imageHeight === 'number' ? `${renderOpts.imageHeight}px` : renderOpts.imageHeight) : '28px';
        const fit = renderOpts.imageFit || renderOpts.contentFit || 'contain';
        const radius = renderOpts.borderRadius || '4px';

        if (imgUrl) {
          return `
            <div class="luna-cell-image-container" title="${this._escapeHtml(String(rawValue ?? ''))}">
              <img src="${imgUrl}" class="luna-cell-image" style="width:${width}; height:${height}; object-fit:${fit}; border-radius:${radius};" alt="img" onerror="this.style.display='none'">
            </div>
          `;
        } else {
          return `
            <div class="luna-cell-image-empty">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
          `;
        }
      }

      // 4-2. Avatar 렌더러 (원형 이니셜 아바타/프로필 사진 + 성명 텍스트 병기 렌더러)
      if (rendererType === 'avatar') {
        const renderOpts = typeof col.renderer === 'object' ? col.renderer : {};
        const textVal = (renderOpts.textField && row && row[renderOpts.textField] !== undefined)
          ? row[renderOpts.textField]
          : (rawValue !== undefined && rawValue !== null ? String(rawValue) : '');

        let imgUrl = null;
        if (renderOpts.imageField && row && row[renderOpts.imageField]) {
          imgUrl = row[renderOpts.imageField];
        } else if (typeof rawValue === 'string' && (rawValue.startsWith('http') || rawValue.startsWith('./') || rawValue.startsWith('/') || rawValue.startsWith('data:'))) {
          imgUrl = rawValue;
        } else if (renderOpts.defaultImg) {
          imgUrl = renderOpts.defaultImg;
        }

        const initial = textVal ? textVal.trim().charAt(0).toUpperCase() : 'U';

        // 성(initial)별 프리미엄 그라데이션 컬러 팔레트 (시니어 UI/UX 디자인)
        const avatarColors = [
          'linear-gradient(135deg, #6366f1, #4f46e5)',
          'linear-gradient(135deg, #3b82f6, #2563eb)',
          'linear-gradient(135deg, #06b6d4, #0891b2)',
          'linear-gradient(135deg, #10b981, #059669)',
          'linear-gradient(135deg, #f59e0b, #d97706)',
          'linear-gradient(135deg, #ec4899, #db2777)',
          'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          'linear-gradient(135deg, #14b8a6, #0d9488)'
        ];
        const colorIdx = initial.charCodeAt(0) % avatarColors.length;
        const bgGradient = avatarColors[colorIdx];

        let avatarEl = '';
        if (imgUrl) {
          avatarEl = `<img src="${this._escapeHtml(imgUrl)}" class="luna-cell-avatar" alt="${this._escapeHtml(textVal)}" onerror="this.style.display='none'">`;
        } else {
          avatarEl = `<div class="luna-cell-avatar" style="background: ${bgGradient}; flex-shrink: 0;">${this._escapeHtml(initial)}</div>`;
        }

        const showText = renderOpts.showText !== false;
        const nameTextEl = (showText && textVal)
          ? `<span class="luna-cell-avatar-name" style="font-weight: 500; color: inherit; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${this._escapeHtml(textVal)}</span>`
          : '';

        return `
          <div class="luna-cell-avatar-group">
            ${avatarEl}
            ${nameTextEl}
          </div>
        `;
      }

      // 5-1. Interactive Switch / Toggle 렌더러
      if (rendererType === 'switch' || rendererType === 'toggle') {
        const isChecked = this._parseBoolean(rawValue, col);
        return `
          <div class="luna-switch-container" data-switch-col="${col.key}">
            <div class="luna-switch-track ${isChecked ? 'active' : ''}">
              <div class="luna-switch-thumb"></div>
            </div>
          </div>
        `;
      }

      // 5-2. Check 렌더러 (LunaGrid 정식 CheckCellRenderer 엔진)
      if (rendererType === 'check' || rendererType === 'checkbox') {
        const renderOpts = typeof col.renderer === 'object' ? col.renderer : {};
        const trueValues = renderOpts.trueValues ? String(renderOpts.trueValues).split(',').map(s => s.trim().toLowerCase()) : ['true', 'y', '1', 'yes'];
        const falseValues = renderOpts.falseValues ? String(renderOpts.falseValues).split(',').map(s => s.trim().toLowerCase()) : ['false', 'n', '0', 'no'];
        const threeStates = renderOpts.threeStates === true;

        const valStr = String(rawValue ?? '').trim().toLowerCase();
        let isChecked = false;
        let isIndeterminate = false;

        if (trueValues.includes(valStr) || rawValue === true || rawValue === 1) {
          isChecked = true;
        } else if (falseValues.includes(valStr) || rawValue === false || rawValue === 0) {
          isChecked = false;
        } else if (threeStates && (rawValue === null || rawValue === undefined || rawValue === '')) {
          isIndeterminate = true;
        }

        const checkedAttr = isChecked ? 'checked' : '';
        const indetClass = isIndeterminate ? 'indeterminate' : '';

        return `
          <div class="luna-check-renderer-container" data-switch-col="${col.key}">
            <input type="checkbox" class="luna-checkbox ${indetClass}" ${checkedAttr} ${isIndeterminate ? 'data-indeterminate="true"' : ''} style="cursor:pointer; pointer-events:none;" />
          </div>
        `;
      }

      // 5-2. MultiCheck 렌더러 (LunaGrid 정식 MultiCheckCellRenderer)
      if (rendererType === 'multicheck') {
        const renderOpts = typeof col.renderer === 'object' ? col.renderer : {};
        const sep = renderOpts.separator || col.separator || ',';
        const isWrap = renderOpts.wrap !== false;
        const showAsBadge = renderOpts.showAsBadge !== false; // 기본 뱃지 스타일

        // 데이터 파싱 (배열 또는 콤마 구분자 문자열 지원)
        let selectedVals = [];
        if (Array.isArray(rawValue)) {
          selectedVals = rawValue.map(v => String(v).trim());
        } else if (rawValue !== undefined && rawValue !== null && rawValue !== '') {
          selectedVals = String(rawValue).split(sep).map(v => v.trim());
        }

        const values = renderOpts.values || col.values || [];
        const labels = renderOpts.labels || col.labels || values;

        // 매핑된 아이템 리스트 생성
        let itemsHtml = '';
        if (values.length > 0) {
          values.forEach((v, idx) => {
            const isChecked = selectedVals.includes(String(v));
            if (!isChecked && showAsBadge) return; // 뱃지 모드에서는 선택된 항목만 표기

            const labelText = labels[idx] !== undefined ? labels[idx] : v;
            if (showAsBadge) {
              itemsHtml += `
                <span class="luna-multicheck-badge-item">
                  <span class="luna-multicheck-dot"></span>
                  ${this._escapeHtml(String(labelText))}
                </span>
              `;
            } else {
              itemsHtml += `
                <label class="luna-multicheck-cb-item ${isChecked ? 'checked' : ''}">
                  <input type="checkbox" ${isChecked ? 'checked' : ''} disabled style="pointer-events:none;" />
                  <span>${this._escapeHtml(String(labelText))}</span>
                </label>
              `;
            }
          });
        } else {
          // values가 별도 정의되지 않은 경우 원본 선택값들을 뱃지로 출력
          selectedVals.forEach(v => {
            itemsHtml += `
              <span class="luna-multicheck-badge-item">
                <span class="luna-multicheck-dot"></span>
                ${this._escapeHtml(String(v))}
              </span>
            `;
          });
        }

        const wrapClass = isWrap ? 'wrap' : 'nowrap';
        return `
          <div class="luna-multicheck-container ${wrapClass}" title="${this._escapeHtml(String(rawValue ?? ''))}">
            ${itemsHtml || '<span class="luna-text-muted" style="font-size:11px; opacity:0.5;">-</span>'}
          </div>
        `;
      }

      // 5-3. Link 렌더러 (LunaGrid 정식 LinkCellRenderer 엔진)
      if (rendererType === 'link') {
        const renderOpts = typeof col.renderer === 'object' ? col.renderer : {};
        let linkUrl = '';

        // 1) urlCallback 우선 평가
        if (typeof renderOpts.urlCallback === 'function') {
          linkUrl = renderOpts.urlCallback(this, { column: col, value: rawValue, row }, rawValue, row);
        }
        // 2) urlField 참조
        else if (renderOpts.urlField && row[renderOpts.urlField]) {
          linkUrl = row[renderOpts.urlField];
        }
        // 3) baseUrl 결합
        else if (renderOpts.baseUrl && rawValue !== undefined && rawValue !== null) {
          linkUrl = `${renderOpts.baseUrl}${encodeURIComponent(String(rawValue))}`;
        }
        // 4) rawValue 자체가 URL인 경우
        else if (typeof rawValue === 'string' && (rawValue.startsWith('http') || rawValue.startsWith('mailto:') || rawValue.startsWith('tel:') || rawValue.startsWith('/'))) {
          linkUrl = rawValue;
        }
        // 5) 고정 url
        else if (renderOpts.url) {
          linkUrl = renderOpts.url;
        }

        const target = renderOpts.target || '_blank';
        const titleText = renderOpts.titleField && row[renderOpts.titleField] ? row[renderOpts.titleField] : (renderOpts.title || String(rawValue ?? ''));
        const showIcon = renderOpts.showIcon !== false;

        const displayText = this._escapeHtml(String(rawValue ?? ''));
        const extIconSvg = (showIcon && target === '_blank')
          ? `<svg class="luna-link-ext-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>`
          : '';

        if (!linkUrl) {
          return `<span class="luna-link-disabled">${displayText}</span>`;
        }

        return `
          <a href="${this._escapeHtml(linkUrl)}" target="${target}" rel="noopener noreferrer" class="luna-link-cell" title="${this._escapeHtml(titleText)}" onclick="event.stopPropagation();">
            <span class="luna-link-text">${displayText}</span>
            ${extIconSvg}
          </a>
        `;
      }

      // 5-4. HTML 렌더러 (LunaGrid 정식 HtmlCellRenderer 엔진)
      if (rendererType === 'html') {
        const renderOpts = typeof col.renderer === 'object' ? col.renderer : {};
        let htmlStr = '';

        // 1) callback 우선 평가
        if (typeof renderOpts.callback === 'function') {
          htmlStr = renderOpts.callback(this, { column: col, value: rawValue, row }, rawValue, row);
        }
        // 2) template 템플릿 엔진 치환 (${value}, ${fieldName}, ${row.key})
        else if (renderOpts.template) {
          htmlStr = renderOpts.template.replace(/\$\{(\w+)\}/g, (match, key) => {
            if (key === 'value') return rawValue !== undefined ? rawValue : '';
            return row[key] !== undefined ? row[key] : (row[col.key] !== undefined ? row[col.key] : '');
          });
        }
        // 3) rawValue 직접 HTML 출력
        else if (rawValue !== undefined && rawValue !== null) {
          htmlStr = String(rawValue);
        }

        return `<div class="luna-cell-html-container">${htmlStr}</div>`;
      }

      // 5-5. Barcode 렌더러 (LunaGrid 정식 Code128 / Code39 BarcodeCellRenderer 엔진)
      if (rendererType === 'barcode' || rendererType === 'code128' || rendererType === 'code39') {
        const renderOpts = typeof col.renderer === 'object' ? col.renderer : {};
        const codeText = rawValue !== undefined && rawValue !== null ? String(rawValue).trim() : '';
        if (!codeText) return '<span class="luna-barcode-empty">-</span>';

        const showLabel = renderOpts.showLabel !== false;
        const bHeight = parseInt(renderOpts.barHeight, 10) || 20;
        const bColor = renderOpts.color || 'currentColor';

        // Code39 인라인 SVG 바코드 패턴 엔진
        const code39Patterns = {
          '0': '000110100', '1': '100100001', '2': '001100001', '3': '101100000',
          '4': '000110001', '5': '100110000', '6': '001110000', '7': '000100101',
          '8': '100100100', '9': '001100100', 'A': '100001001', 'B': '001001001',
          'C': '101001000', 'D': '000011001', 'E': '100011000', 'F': '001011000',
          'G': '000001101', 'H': '100001100', 'I': '001001100', 'J': '000011100',
          'K': '100000011', 'L': '001000011', 'M': '101000010', 'N': '000010011',
          'O': '100010010', 'P': '001010010', 'Q': '000000111', 'R': '100000110',
          'S': '001000110', 'T': '000010110', 'U': '110000001', 'V': '011000001',
          'W': '111000000', 'X': '010010001', 'Y': '110010000', 'Z': '011010000',
          '-': '010000101', '.': '110000100', ' ': '011000100', '$': '010101000',
          '/': '010100010', '+': '010001010', '%': '000101010', '*': '010010100'
        };

        const upperText = `*${codeText.toUpperCase()}*`;
        let bars = '';
        let posX = 2;

        for (let i = 0; i < upperText.length; i++) {
          const char = upperText[i];
          const pattern = code39Patterns[char] || code39Patterns[' '];
          for (let p = 0; p < 9; p++) {
            const isBar = p % 2 === 0;
            const isWide = pattern[p] === '1';
            const width = isWide ? 2.2 : 1;
            if (isBar) {
              bars += `<rect x="${posX}" y="0" width="${width}" height="${bHeight}" fill="${bColor}" />`;
            }
            posX += width;
          }
          posX += 1.5; // 문자 간 갭
        }

        const totalWidth = posX + 2;

        return `
          <div class="luna-barcode-container" title="${this._escapeHtml(codeText)}">
            <svg class="luna-barcode-svg" viewBox="0 0 ${totalWidth} ${bHeight}" style="height:${bHeight}px; width:${totalWidth}px;">
              ${bars}
            </svg>
            ${showLabel ? `<span class="luna-barcode-label">${this._escapeHtml(codeText)}</span>` : ''}
          </div>
        `;
      }

      // 5-6. Image Buttons 렌더러 (LunaGrid 정식 ImageButtonsCellRenderer / Custom Image Buttons 엔진)
      if (rendererType === 'imagebuttons' || rendererType === 'imgbuttons' || rendererType === 'imageButtons') {
        const renderOpts = typeof col.renderer === 'object' ? col.renderer : {};
        let buttons = renderOpts.buttons || [];

        // buttonsCallback 동적 반환 지원
        if (typeof renderOpts.buttonsCallback === 'function') {
          buttons = renderOpts.buttonsCallback(this, { column: col, value: rawValue, row }, rawValue, row) || [];
        }

        const size = parseInt(renderOpts.imageWidth || renderOpts.buttonSize, 10) || 20;
        const rowId = this._getRowId(row);

        let btnsHtml = '';
        buttons.forEach((btn, bIdx) => {
          const btnName = btn.name || `btn_${bIdx}`;
          const tooltip = btn.tooltip || btn.text || btn.title || btnName;
          const icon = btn.icon || btn.image || btn.imageUrl;
          const customClass = btn.className || '';

          let iconHtml = '';
          if (icon && (icon.startsWith('http') || icon.startsWith('./') || icon.startsWith('/') || icon.startsWith('data:'))) {
            iconHtml = `<img src="${icon}" class="luna-img-btn-icon" width="${size}" height="${size}" alt="${btnName}">`;
          } else if (icon && icon.includes('<svg')) {
            iconHtml = icon;
          } else if (btn.text) {
            iconHtml = `<span class="luna-img-btn-text">${this._escapeHtml(btn.text)}</span>`;
          } else {
            iconHtml = `<span class="luna-img-btn-default">🔘</span>`;
          }

          btnsHtml += `
            <button type="button" class="luna-img-btn ${customClass}" data-btn-name="${btnName}" data-row-id="${rowId}" data-col-key="${col.key}" title="${this._escapeHtml(tooltip)}">
              ${iconHtml}
            </button>
          `;
        });

        return `
          <div class="luna-img-buttons-container" onclick="event.stopPropagation();">
            ${btnsHtml}
          </div>
        `;
      }

      // Boolean 타입 텍스트 렌더링 (booleanFormat 적용)
      if (col.dataType === 'boolean' || col.valueType === 'boolean' || col.booleanFormat) {
        return this._escapeHtml(this._formatBoolean(rawValue, col));
      }

      // 6. Sparkline / SparkArea 렌더러 (LunaGrid 정식 SparkLineRenderer 엔진)
      if (rendererType === 'sparkline' || rendererType === 'sparkarea') {
        const renderOpts = typeof col.renderer === 'object' ? col.renderer : {};
        const points = (Array.isArray(rawValue) ? rawValue : [10, 25, 15, 30, 45, 35, 55, 70]).map(Number);
        const width = parseInt(renderOpts.width, 10) || 90;
        const height = parseInt(renderOpts.height, 10) || 22;
        const minVal = renderOpts.minimum !== undefined ? Number(renderOpts.minimum) : Math.min(...points);
        const maxVal = renderOpts.maximum !== undefined ? Number(renderOpts.maximum) : Math.max(...points) || 1;
        const range = maxVal - minVal || 1;
        const lineColor = renderOpts.lineColor || '#38bdf8';
        const fillColor = renderOpts.fillColor || (rendererType === 'sparkarea' ? 'rgba(56, 189, 248, 0.2)' : 'none');
        const showMarkers = renderOpts.showMarkers !== false;

        const maxIdx = points.indexOf(Math.max(...points));
        const minIdx = points.indexOf(Math.min(...points));

        const coordsArr = points.map((val, idx) => {
          const x = points.length > 1 ? (idx / (points.length - 1)) * (width - 8) + 4 : width / 2;
          const y = height - ((val - minVal) / range) * (height - 8) - 4;
          return { x, y, val };
        });

        const pointsStr = coordsArr.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
        let areaPath = '';
        if (fillColor !== 'none') {
          areaPath = `<polygon points="4,${height - 2} ${pointsStr} ${width - 4},${height - 2}" fill="${fillColor}" />`;
        }

        let markers = '';
        if (showMarkers) {
          coordsArr.forEach((p, idx) => {
            let dotColor = lineColor;
            let radius = 1.5;
            if (idx === maxIdx && renderOpts.highColor) {
              dotColor = renderOpts.highColor;
              radius = 2.5;
            } else if (idx === minIdx && renderOpts.lowColor) {
              dotColor = renderOpts.lowColor;
              radius = 2.5;
            } else if (idx === coordsArr.length - 1 && renderOpts.lastColor) {
              dotColor = renderOpts.lastColor;
              radius = 2.5;
            }
            markers += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${radius}" fill="${dotColor}" />`;
          });
        }

        return `
          <svg class="luna-sparkline-svg" viewBox="0 0 ${width} ${height}" style="width:${width}px; height:${height}px;">
            ${areaPath}
            <polyline class="luna-sparkline-path" points="${pointsStr}" stroke="${lineColor}" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            ${markers}
          </svg>
        `;
      }

      // 6-1. Spark Column / Spark Bar 렌더러 (LunaGrid 정식 SparkColumn / SparkBar 엔진)
      if (rendererType === 'sparkcolumn' || rendererType === 'sparkbar') {
        const renderOpts = typeof col.renderer === 'object' ? col.renderer : {};
        const points = (Array.isArray(rawValue) ? rawValue : [10, 25, 15, 30, 45, 35, 55, 70]).map(Number);
        const width = parseInt(renderOpts.width, 10) || 90;
        const height = parseInt(renderOpts.height, 10) || 22;
        const minVal = renderOpts.minimum !== undefined ? Number(renderOpts.minimum) : Math.min(...points, 0);
        const maxVal = renderOpts.maximum !== undefined ? Number(renderOpts.maximum) : Math.max(...points, 1);
        const range = maxVal - minVal || 1;
        const barColor = renderOpts.barColor || '#38bdf8';
        const negColor = renderOpts.negativeColor || '#f87171';
        const highColor = renderOpts.highColor;
        const lowColor = renderOpts.lowColor;

        const maxIdx = points.indexOf(Math.max(...points));
        const minIdx = points.indexOf(Math.min(...points));

        const barCount = points.length;
        const slotWidth = width / (barCount || 1);
        const barW = Math.max(2, slotWidth - 2);

        let bars = '';
        points.forEach((val, idx) => {
          const clamped = Math.max(minVal, Math.min(maxVal, val));
          const h = Math.max(1.5, ((clamped - minVal) / range) * (height - 3));
          const x = idx * slotWidth + 1;
          const y = height - h - 1;

          let fill = val < 0 ? negColor : barColor;
          if (idx === maxIdx && highColor) fill = highColor;
          else if (idx === minIdx && lowColor) fill = lowColor;

          bars += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" fill="${fill}" rx="1" />`;
        });

        return `
          <svg class="luna-sparkcolumn-svg" viewBox="0 0 ${width} ${height}" style="width:${width}px; height:${height}px;">
            ${bars}
          </svg>
        `;
      }

      // 6-2. Spark Win/Loss 렌더러 (LunaGrid 정식 SparkWinLossRenderer 엔진: 승/패/무 시각화)
      if (rendererType === 'sparkwinloss' || rendererType === 'sparkwin/loss' || rendererType === 'winloss') {
        const renderOpts = typeof col.renderer === 'object' ? col.renderer : {};
        const points = (Array.isArray(rawValue) ? rawValue : [1, -1, 1, 0, 1, -1, 1, 1]).map(Number);
        const width = parseInt(renderOpts.width, 10) || 90;
        const height = parseInt(renderOpts.height, 10) || 22;
        const winColor = renderOpts.winColor || '#34d399';
        const lossColor = renderOpts.lossColor || '#f87171';
        const drawColor = renderOpts.drawColor || '#94a3b8';

        const midY = height / 2;
        const barH = (height / 2) - 2;
        const barCount = points.length;
        const slotWidth = width / (barCount || 1);
        const barW = Math.max(2, slotWidth - 2);

        let bars = '';
        points.forEach((val, idx) => {
          const x = idx * slotWidth + 1;
          if (val > 0) {
            // 승 (위쪽 막대)
            bars += `<rect x="${x.toFixed(1)}" y="${(midY - barH).toFixed(1)}" width="${barW.toFixed(1)}" height="${barH.toFixed(1)}" fill="${winColor}" rx="1" />`;
          } else if (val < 0) {
            // 패 (아래쪽 막대)
            bars += `<rect x="${x.toFixed(1)}" y="${midY.toFixed(1)}" width="${barW.toFixed(1)}" height="${barH.toFixed(1)}" fill="${lossColor}" rx="1" />`;
          } else {
            // 무승부 (중앙 얇은 라인)
            bars += `<rect x="${x.toFixed(1)}" y="${(midY - 1).toFixed(1)}" width="${barW.toFixed(1)}" height="2" fill="${drawColor}" rx="1" />`;
          }
        });

        return `
          <svg class="luna-sparkwinloss-svg" viewBox="0 0 ${width} ${height}" style="width:${width}px; height:${height}px;">
            <line x1="0" y1="${midY}" x2="${width}" y2="${midY}" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
            ${bars}
          </svg>
        `;
      }

      // 6-2. Actual-Target Bullet 렌더러 (LunaGrid 정식 ActualTargetBulletRenderer 엔진)
      if (rendererType === 'actualtargetbullet' || rendererType === 'actualtarget' || rendererType === 'actual-target') {
        const renderOpts = typeof col.renderer === 'object' ? col.renderer : {};
        const targetField = renderOpts.targetField || 'target';
        const actualField = renderOpts.actualField;

        const actualVal = Number(actualField && row[actualField] !== undefined ? row[actualField] : rawValue) || 0;
        const targetVal = Number(row[targetField] !== undefined ? row[targetField] : (renderOpts.target || 100)) || 100;

        const min = renderOpts.minimum !== undefined ? Number(renderOpts.minimum) : 0;
        const max = renderOpts.maximum !== undefined ? Number(renderOpts.maximum) : Math.max(actualVal, targetVal, 100);

        const range = max - min || 1;
        const actualPct = Math.max(0, Math.min(100, Math.round(((actualVal - min) / range) * 100)));
        const targetPct = Math.max(0, Math.min(100, Math.round(((targetVal - min) / range) * 100)));

        const isAchieved = actualVal >= targetVal;
        const actualColorClass = isAchieved ? 'bullet-achieved' : 'bullet-under';
        const showLabel = renderOpts.showLabel !== false;

        return `
          <div class="luna-actual-target-bullet-container" title="실적: ${actualVal} / 목표: ${targetVal} (${Math.round((actualVal / targetVal) * 100)}%)">
            <div class="luna-bullet-track">
              <!-- 실제 성과 바 (Actual Bar) -->
              <div class="luna-bullet-actual ${actualColorClass}" style="width: ${actualPct}%;"></div>
              <!-- 목표 기준선 마커 (Target Marker) -->
              <div class="luna-bullet-target-marker" style="left: ${targetPct}%;"></div>
            </div>
            ${showLabel ? `<span class="luna-bullet-label">${actualVal}/${targetVal}</span>` : ''}
          </div>
        `;
      }

      // 6-3. Actual-Target Text 렌더러 (LunaGrid 정식 ActualTargetTextRenderer 엔진)
      if (rendererType === 'actualtargettext') {
        const renderOpts = typeof col.renderer === 'object' ? col.renderer : {};
        const targetField = renderOpts.targetField || 'target';
        const actualField = renderOpts.actualField;

        const actualVal = Number(actualField && row[actualField] !== undefined ? row[actualField] : rawValue) || 0;
        const targetVal = Number(row[targetField] !== undefined ? row[targetField] : (renderOpts.target || 100)) || 100;
        const rate = targetVal ? Math.round((actualVal / targetVal) * 100) : 0;
        const isAchieved = actualVal >= targetVal;

        return `
          <div class="luna-actual-target-text-container ${isAchieved ? 'text-achieved' : 'text-under'}">
            <span class="luna-att-actual">${actualVal.toLocaleString()}</span>
            <span class="luna-att-slash">/</span>
            <span class="luna-att-target">${targetVal.toLocaleString()}</span>
            <span class="luna-att-rate">(${rate}%)</span>
          </div>
        `;
      }

      // 7. Signal Bar / Signal 렌더러 (LunaGrid 호환 신호 세기 계단식 렌더러)
      if (rendererType === 'signal' || rendererType === 'signalbar') {
        const renderOpts = typeof col.renderer === 'object' ? col.renderer : {};
        const barCount = Math.max(2, Math.min(10, parseInt(renderOpts.barCount, 10) || 5));
        const min = renderOpts.minimum !== undefined ? Number(renderOpts.minimum) : (renderOpts.min !== undefined ? Number(renderOpts.min) : 0);
        const max = renderOpts.maximum !== undefined ? Number(renderOpts.maximum) : (renderOpts.max !== undefined ? Number(renderOpts.max) : 100);
        const numVal = Number(rawValue);
        const validVal = isNaN(numVal) ? min : Math.max(min, Math.min(max, numVal));

        // 활성화할 바의 개수 (0 ~ barCount)
        const ratio = (max === min) ? 0 : (validVal - min) / (max - min);
        const activeBars = Math.round(ratio * barCount);

        // 색상 스킴 (auto | emerald | cyan | amber | rose | indigo)
        let colorScheme = renderOpts.colorScheme || 'auto';
        let activeColorClass = 'signal-cyan';
        if (colorScheme === 'auto') {
          const activeRatio = activeBars / barCount;
          if (activeRatio >= 0.8) activeColorClass = 'signal-emerald';
          else if (activeRatio >= 0.5) activeColorClass = 'signal-cyan';
          else if (activeRatio >= 0.3) activeColorClass = 'signal-amber';
          else activeColorClass = 'signal-rose';
        } else {
          activeColorClass = `signal-${colorScheme}`;
        }

        let barsHtml = '';
        for (let i = 1; i <= barCount; i++) {
          const heightPct = Math.round((i / barCount) * 100);
          const isActive = i <= activeBars;
          const barClass = isActive ? `active ${activeColorClass}` : 'inactive';
          barsHtml += `<div class="luna-signal-bar ${barClass}" style="height: ${heightPct}%;"></div>`;
        }

        const labelText = renderOpts.showLabel !== false ? `<span class="luna-signal-label">${isNaN(numVal) ? '-' : numVal}</span>` : '';

        return `
          <div class="luna-signal-container" title="신호 세기: ${activeBars}/${barCount}단계 (${rawValue})">
            <div class="luna-signal-track">
              ${barsHtml}
            </div>
            ${labelText}
          </div>
        `;
      }

      // 8. Shape 렌더러 (LunaGrid 호환 고성능 SVG 도형 렌더러)
      if (rendererType === 'shape') {
        const renderOpts = typeof col.renderer === 'object' ? col.renderer : {};
        let shapeName = renderOpts.shape || 'star';

        // 1. shapeCallback 우선 평가
        if (typeof renderOpts.shapeCallback === 'function') {
          shapeName = renderOpts.shapeCallback(this, { column: col, value: rawValue, row }, rawValue, row) || shapeName;
        } else if (renderOpts.shapeMap && renderOpts.shapeMap[rawValue] !== undefined) {
          shapeName = renderOpts.shapeMap[rawValue];
        }

        const size = parseInt(renderOpts.shapeSize, 10) || 15;
        const location = renderOpts.shapeLocation || (renderOpts.showLabel === false ? 'center' : 'left');
        const showLabel = renderOpts.showLabel !== false && location !== 'center';

        // 도형별 고화질 벡터 SVG 패스
        const shapeSvgMap = {
          'star': `<polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"/>`,
          'circle': `<circle cx="12" cy="12" r="8"/>`,
          'ellipse': `<ellipse cx="12" cy="12" rx="9" ry="6"/>`,
          'diamond': `<polygon points="12,2 22,12 12,22 2,12"/>`,
          'triangle': `<polygon points="12,4 22,20 2,20"/>`,
          'invertedtriangle': `<polygon points="12,20 22,4 2,4"/>`,
          'rectangle': `<rect x="4" y="4" width="16" height="16" rx="2"/>`,
          'square': `<rect x="4" y="4" width="16" height="16" rx="2"/>`,
          'plus': `<path d="M12 4v16M4 12h16" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none"/>`,
          'minus': `<line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none"/>`
        };

        // 기본 컬러 매핑 (고급 네온 톤)
        const defaultColorMap = {
          'star': '#fbbf24',            // 골드
          'circle': '#38bdf8',          // 스카이 블루
          'diamond': '#a855f7',         // 퍼플
          'triangle': '#34d399',        // 에메랄드 그린
          'invertedtriangle': '#f87171',// 로즈 레드
          'rectangle': '#818cf8',       // 인디고
          'square': '#818cf8',
          'plus': '#34d399',
          'minus': '#f87171'
        };

        const customColor = (renderOpts.colorMap && renderOpts.colorMap[shapeName]) ||
          (renderOpts.colorMap && renderOpts.colorMap[rawValue]) ||
          renderOpts.shapeColor ||
          defaultColorMap[shapeName] ||
          '#38bdf8';

        const svgContent = shapeSvgMap[shapeName] || shapeSvgMap['star'];
        const svgEl = `<svg class="luna-shape-svg" viewBox="0 0 24 24" width="${size}" height="${size}" style="color: ${customColor}; fill: ${customColor};">${svgContent}</svg>`;
        const labelEl = showLabel ? `<span class="luna-shape-label">${this._escapeHtml(String(rawValue ?? ''))}</span>` : '';

        if (location === 'right') {
          return `<div class="luna-shape-container luna-shape-right">${labelEl}${svgEl}</div>`;
        } else if (location === 'center' || !showLabel) {
          return `<div class="luna-shape-container luna-shape-center" title="${this._escapeHtml(String(rawValue ?? ''))}">${svgEl}</div>`;
        } else {
          return `<div class="luna-shape-container luna-shape-left">${svgEl}${labelEl}</div>`;
        }
      }

      // 9. Icon 렌더러 (LunaGrid 호환 텍스트 + 아이콘 결합 렌더러)
      if (rendererType === 'icon') {
        const renderOpts = typeof col.renderer === 'object' ? col.renderer : {};
        let iconUrl = '';

        // 1) iconCallback 우선 평가
        if (typeof renderOpts.iconCallback === 'function') {
          iconUrl = renderOpts.iconCallback(this, { column: col, value: rawValue, row }, rawValue, row);
        }
        // 2) iconMap 매핑
        else if (renderOpts.iconMap && renderOpts.iconMap[rawValue] !== undefined) {
          iconUrl = renderOpts.iconMap[rawValue];
        }
        // 3) iconField 데이터 필드 참조
        else if (renderOpts.iconField && row[renderOpts.iconField]) {
          iconUrl = row[renderOpts.iconField];
        }
        // 4) 직접 icon / defaultIcon
        else if (renderOpts.icon || renderOpts.defaultIcon) {
          iconUrl = renderOpts.icon || renderOpts.defaultIcon;
        }
        // 5) rawValue 자체가 이미지/아이콘 URL인 경우
        else if (typeof rawValue === 'string' && (rawValue.startsWith('http') || rawValue.startsWith('./') || rawValue.startsWith('data:') || rawValue.startsWith('/'))) {
          iconUrl = rawValue;
        }

        const width = parseInt(renderOpts.iconWidth, 10) || 16;
        const height = parseInt(renderOpts.iconHeight, 10) || 16;
        const location = renderOpts.iconLocation || 'left'; // left | right | center
        const showLabel = renderOpts.showLabel !== false && location !== 'center';

        let imgEl = '';
        if (iconUrl) {
          if (iconUrl.startsWith('data:image/svg+xml;utf8,<svg')) {
            const encodedSvg = 'data:image/svg+xml;utf8,' + encodeURIComponent(iconUrl.replace('data:image/svg+xml;utf8,', ''));
            imgEl = `<img src="${encodedSvg}" class="luna-cell-icon-img" width="${width}" height="${height}" alt="icon" onerror="this.style.display='none'">`;
          } else {
            imgEl = `<img src="${this._escapeHtml(iconUrl)}" class="luna-cell-icon-img" width="${width}" height="${height}" alt="icon" onerror="this.style.display='none'">`;
          }
        }
        const labelEl = showLabel ? `<span class="luna-cell-icon-label">${this._escapeHtml(String(rawValue ?? ''))}</span>` : '';

        if (location === 'right') {
          return `<div class="luna-icon-renderer-container luna-icon-right">${labelEl}${imgEl}</div>`;
        } else if (location === 'center' || !showLabel) {
          return `<div class="luna-icon-renderer-container luna-icon-center" title="${this._escapeHtml(String(rawValue ?? ''))}">${imgEl}</div>`;
        } else {
          return `<div class="luna-icon-renderer-container luna-icon-left">${imgEl}${labelEl}</div>`;
        }
      }

      // 10. Lookup 컬럼 (values/labels, lookupData, lookupSource, labelField, lookupTree)
      if (col.lookupTreeId && col.lookupDisplay !== false) {
        return this._getLookupLabel(col, rawValue, row);
      }

      if (col.lookupDisplay !== false) {
        // 7-1. values & labels 배열 매핑
        if (Array.isArray(col.values) && Array.isArray(col.labels)) {
          const valIdx = col.values.findIndex(v => String(v) === String(rawValue));
          if (valIdx !== -1 && col.labels[valIdx] !== undefined) {
            return this._escapeHtml(col.labels[valIdx]);
          }
        }
        // 7-2. lookupData 객체 맵
        if (col.lookupData && col.lookupData[rawValue] !== undefined) {
          return this._escapeHtml(col.lookupData[rawValue]);
        }
        // 7-3. lookupSource 배열
        if (Array.isArray(col.lookupSource)) {
          const item = col.lookupSource.find(s => String(s.value) === String(rawValue));
          if (item) return this._escapeHtml(item.label || item.text);
        }
        // 7-4. labelField 필드 매핑
        if (col.labelField && row && row[col.labelField] !== undefined) {
          return this._escapeHtml(String(row[col.labelField]));
        }

        // 7-5. multicheck / multiple 다중 선택 값 매핑 (배열 또는 구분자 문자열)
        const isMulti = (col.editor && (col.editor.type === 'multicheck' || col.editor.multiple)) || (col.renderer && col.renderer.type === 'multicheck');
        if (isMulti && rawValue !== undefined && rawValue !== null && rawValue !== '') {
          const sep = (col.editor && col.editor.itemSeparator) || ',';
          const valArr = Array.isArray(rawValue) ? rawValue : String(rawValue).split(sep).map(s => s.trim());
          const values = (col.editor && col.editor.values) || col.values || [];
          const labels = (col.editor && col.editor.labels) || col.labels || [];

          const labelArr = valArr.map(v => {
            const idx = values.findIndex(x => String(x) === String(v));
            return (idx !== -1 && labels[idx] !== undefined) ? labels[idx] : v;
          });

          if (col.renderer && col.renderer.showAsBadge) {
            return `<div class="luna-cell-tags">${labelArr.map(l => `<span class="luna-badge luna-badge-primary luna-badge-sm">${this._escapeHtml(l)}</span>`).join('')}</div>`;
          }
          return this._escapeHtml(labelArr.join(', '));
        }
      }

      // 8. 화면 표시값 변경 (displayCallback / formatter / displayFormat)
      let outputText = rawValue !== undefined && rawValue !== null ? String(rawValue) : '';

      if (typeof col.displayCallback === 'function') {
        const rowId = this._getRowId(row);
        const rowIndex = this.displayData.indexOf(row);
        outputText = col.displayCallback(this, { dataRow: rowIndex, itemIndex: rowIndex, rowId }, rawValue, row);
      } else if (typeof col.formatter === 'function') {
        outputText = col.formatter(rawValue, row, col);
      } else if (typeof col.displayFormatter === 'function') {
        outputText = col.displayFormatter(rawValue, row, col);
      } else if (col.formatter === 'currency' || col.format === 'currency' || col.dataType === 'currency' || col.type === 'currency') {
        outputText = this.formatCurrency(rawValue);
      } else if (col.formatter === 'percent' || col.format === 'percent') {
        const num = Number(rawValue);
        outputText = !isNaN(num) ? (num > 1 ? `${num.toFixed(1)} %` : `${(num * 100).toFixed(1)} %`) : String(rawValue ?? '');
      } else if (col.formatter === 'number') {
        outputText = this.formatNumber(rawValue);
      } else if (col.dataType === 'datetime' || col.valueType === 'datetime' || col.type === 'datetime' || col.dataType === 'date' || col.type === 'date' || col.dateFormat || col.datetimeFormat) {
        const dFmt = col.dateFormat || col.displayFormat || col.datetimeFormat || col.format || 'yyyy-MM-dd';
        outputText = this._escapeHtml(this._formatDate(rawValue, dFmt));
      } else if (col.displayFormat && typeof col.displayFormat === 'string') {
        // 간단한 숫자/날짜 템플릿 포맷팅
        if (col.dataType === 'number' || col.type === 'number' || typeof rawValue === 'number') {
          const num = Number(rawValue);
          if (!isNaN(num)) {
            if (col.displayFormat.includes('#,##0')) {
              outputText = col.displayFormat.replace('#,##0', num.toLocaleString());
            } else {
              outputText = this._formatNumber(num, col.displayFormat);
            }
          }
        }
      } else if (col.format && typeof col.format === 'string' && (col.dataType === 'number' || col.type === 'number' || typeof rawValue === 'number')) {
        outputText = this._formatNumber(rawValue, col.format);
      } else {
        outputText = this._escapeHtml(outputText);
      }

      // 8-1. PlaceHolder (빈 셀 안내 문구)
      const placeholderText = col.placeHolder || col.placeholder;
      if ((rawValue === undefined || rawValue === null || rawValue === '') && placeholderText) {
        outputText = `<span class="luna-cell-placeholder">${this._escapeHtml(placeholderText)}</span>`;
      }

      // 9. Cell Button (셀 버튼: action / popup & buttonVisibility: always / hover / active)
      if (col.button) {
        const btnType = col.button; // 'action' | 'popup'
        const btnVis = col.buttonVisibility || 'always'; // 'always' | 'hover' | 'active'
        const iconSvg = btnType === 'popup'
          ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>'
          : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/><circle cx="5" cy="12" r="1.5"/></svg>';

        return `
          <div class="luna-cell-button-container btn-visibility-${btnVis}">
            <span class="luna-cell-value-text">${outputText}</span>
            <button type="button" class="luna-cell-btn luna-cell-btn-${btnType}" data-cell-btn-col="${col.key}" title="${btnType}">
              ${iconSvg}
            </button>
          </div>
        `;
      }

      // 10. Text 렌더러 옵션 지원 (showTooltip / tooltipEllipsisOnly)
      if (typeof col.renderer === 'object' && col.renderer.showTooltip) {
        const rawStr = String(rawValue ?? '');
        return `
          <div class="luna-cell-text-wrap" title="${this._escapeHtml(rawStr)}">
            <span class="luna-cell-text-val">${outputText}</span>
            <span class="luna-cell-tooltip">${this._escapeHtml(rawStr)}</span>
          </div>
        `;
      }

      if (typeof outputText === 'string' && outputText.includes('\n')) {
        return `<div class="luna-cell-multiline" style="white-space: pre-line; line-height: 1.4;">${outputText}</div>`;
      }

      return outputText;
    }

    /**
     * 계층형 룩업 트리(LookupTree) 라벨 렌더링 (N단계 다단계 지원)
     */
    _getLookupLabel(col, rawValue, row) {
      const treeId = col.lookupTreeId || col.lookupSourceId;
      const tree = this.lookupTrees.get(treeId);
      if (!tree) return this._escapeHtml(String(rawValue ?? ''));

      // 1. flat keys-values 매핑 방식
      if (Array.isArray(tree.values) && Array.isArray(col.lookupKeyFields)) {
        const rowKeys = col.lookupKeyFields.map(f => row ? row[f] : undefined);
        const match = tree.values.find(v => {
          if (!Array.isArray(v.keys)) return false;
          return v.keys.every((k, idx) => String(k) === String(rowKeys[idx]));
        });
        if (match) return this._escapeHtml(match.text || match.label || match.value);
      }

      // 2. 계층형 nodes 매핑 방식 (tree.nodes: Array)
      if (Array.isArray(tree.nodes)) {
        const findNode = (nodes) => {
          for (let node of nodes) {
            if (String(node.id || node.value || node.key) === String(rawValue)) return node;
            if (node.children) {
              const res = findNode(node.children);
              if (res) return res;
            }
          }
          return null;
        };
        const node = findNode(tree.nodes);
        if (node) return this._escapeHtml(node.text || node.label || node.id || node.value);
      }

      // 3. 계층형 Key-Value 딕셔너리 트리 방식 (3단계 및 N단계 다단계 완벽 지원)
      if (typeof tree === 'object' && tree !== null) {
        const parentKey = col.lookupParentKey || col.parentKeyField;
        const lookupLevel = col.lookupLevel || (parentKey ? 2 : 1);

        if (lookupLevel === 1 || !parentKey) {
          // 1단계(대분류) 조회
          if (tree[rawValue] !== undefined) {
            const item = tree[rawValue];
            const label = (typeof item === 'object' && item !== null) ? (item.label || item.text || item.name || rawValue) : item;
            return this._escapeHtml(String(label));
          }
        } else {
          // 2단계 이상(하위 계층) 조회: row의 직속 부모 필드값을 참조하여 자식 탐색
          const parentVal = row ? row[parentKey] : null;

          const findNodeByParent = (nodeMap, targetParentKey) => {
            if (!nodeMap || typeof nodeMap !== 'object') return null;
            if (nodeMap[targetParentKey]) return nodeMap[targetParentKey];
            for (let k of Object.keys(nodeMap)) {
              const item = nodeMap[k];
              if (item && item.children && typeof item.children === 'object') {
                const res = findNodeByParent(item.children, targetParentKey);
                if (res) return res;
              }
            }
            return null;
          };

          if (parentVal) {
            const parentNode = findNodeByParent(tree, parentVal);
            if (parentNode && parentNode.children) {
              const children = parentNode.children;
              if (Array.isArray(children)) {
                const child = children.find(c => String(c.id || c.value || c.key) === String(rawValue));
                if (child) return this._escapeHtml(child.label || child.text || child.name || child.value);
              } else if (typeof children === 'object' && children[rawValue] !== undefined) {
                const child = children[rawValue];
                const label = (typeof child === 'object' && child !== null) ? (child.label || child.text || child.name || rawValue) : child;
                return this._escapeHtml(String(label));
              }
            }
          }

          // 부모 필드값이 없거나 매칭되지 않은 경우, 전체 트리 하위 자손 노드 재귀 검색 (fallback)
          const findInAnyDescendant = (nodeMap) => {
            if (!nodeMap || typeof nodeMap !== 'object') return null;
            if (nodeMap[rawValue] !== undefined) {
              const child = nodeMap[rawValue];
              return (typeof child === 'object' && child !== null) ? (child.label || child.text || child.name || rawValue) : child;
            }
            for (let k of Object.keys(nodeMap)) {
              const item = nodeMap[k];
              if (item && item.children && typeof item.children === 'object') {
                const res = findInAnyDescendant(item.children);
                if (res) return res;
              }
            }
            return null;
          };

          const matchedLabel = findInAnyDescendant(tree);
          if (matchedLabel !== null) return this._escapeHtml(String(matchedLabel));
        }
      }

      return this._escapeHtml(String(rawValue ?? ''));
    }

    /**
     * 계층형 룩업 트리(LookupTree) 다단계 연계 옵션 추출 (Cascading Select - N단계 지원)
     */
    _getLookupOptions(col, row) {
      const treeId = col.lookupTreeId || col.lookupSourceId;
      const tree = this.lookupTrees.get(treeId);
      if (!tree) return [];

      // 1. flat values 방식 (부모 키 필터링)
      if (Array.isArray(tree.values) && Array.isArray(col.lookupKeyFields)) {
        const currentFieldIdx = col.lookupKeyFields.indexOf(col.key);
        const parentKeys = col.lookupKeyFields.slice(0, currentFieldIdx).map(f => row ? row[f] : undefined);

        const filtered = tree.values.filter(v => {
          if (!Array.isArray(v.keys)) return false;
          return parentKeys.every((pk, pIdx) => String(pk) === String(v.keys[pIdx]));
        });

        const optMap = new Map();
        filtered.forEach(v => {
          const val = v.keys[currentFieldIdx];
          const text = v.text || v.label || val;
          if (val && !optMap.has(val)) {
            optMap.set(val, { value: val, label: text });
          }
        });
        return Array.from(optMap.values());
      }

      // 2. 계층형 nodes 방식 (tree.nodes: Array)
      if (Array.isArray(tree.nodes)) {
        const parentKey = col.lookupParentKey || col.parentKeyField;
        if (parentKey && row && row[parentKey]) {
          const parentVal = row[parentKey];
          const findParent = (nodes) => {
            for (let n of nodes) {
              if (String(n.id || n.value || n.key) === String(parentVal)) return n;
              if (n.children) {
                const res = findParent(n.children);
                if (res) return res;
              }
            }
            return null;
          };
          const parentNode = findParent(tree.nodes);
          if (parentNode && parentNode.children) {
            return parentNode.children.map(c => ({ value: c.id || c.value || c.key, label: c.text || c.label || c.name || c.value }));
          }
        }
        return tree.nodes.map(n => ({ value: n.id || n.value || n.key, label: n.text || n.label || n.name || n.value }));
      }

      // 3. 계층형 Key-Value 딕셔너리 트리 방식 (3단계 및 N단계 다단계 완벽 지원)
      if (typeof tree === 'object' && tree !== null) {
        const parentKey = col.lookupParentKey || col.parentKeyField;
        const lookupLevel = col.lookupLevel || (parentKey ? 2 : 1);

        if (lookupLevel === 1 || !parentKey) {
          // 1단계(대분류) 옵션 목록
          return Object.keys(tree).map(k => {
            const item = tree[k];
            const label = (typeof item === 'object' && item !== null) ? (item.label || item.text || item.name || k) : item;
            return { value: k, label: String(label) };
          });
        } else {
          // 2단계 이상: 부모 필드값에 해당하는 노드를 재귀적으로 찾아 그 자식 목록 반환
          const parentVal = row ? row[parentKey] : null;
          if (parentVal) {
            const findParentNode = (nodeMap, targetParentKey) => {
              if (!nodeMap || typeof nodeMap !== 'object') return null;
              if (nodeMap[targetParentKey]) return nodeMap[targetParentKey];
              for (let k of Object.keys(nodeMap)) {
                const item = nodeMap[k];
                if (item && item.children && typeof item.children === 'object') {
                  const res = findParentNode(item.children, targetParentKey);
                  if (res) return res;
                }
              }
              return null;
            };

            const parentNode = findParentNode(tree, parentVal);
            if (parentNode && parentNode.children) {
              const children = parentNode.children;
              if (Array.isArray(children)) {
                return children.map(c => ({ value: c.id || c.value || c.key, label: c.label || c.text || c.name || c.value }));
              } else if (typeof children === 'object') {
                return Object.keys(children).map(k => {
                  const child = children[k];
                  const label = (typeof child === 'object' && child !== null) ? (child.label || child.text || child.name || k) : child;
                  return { value: k, label: String(label) };
                });
              }
            }
          }
          // 부모 필드가 선택되지 않았을 경우 빈 목록 반환 (상위 분류 먼저 선택 유도)
          return [];
        }
      }

      return [];
    }



    _renderSummaryRow() {
      if (!this.options.showSummary && !this.options.summary) {
        this.tfootEl.innerHTML = '';
        return;
      }

      const summaryConfig = this.options.summary || {};
      const fieldsConfig = summaryConfig.fields || {};
      const totalLabel = summaryConfig.label || '합계 요약';
      const targetDataset = this.filteredData;

      const showIndicator = this.options.indicator && this.options.indicator.visible !== false;
      const showStateBar = this.options.stateBar && this.options.stateBar.visible !== false;
      const showCheckBar = this.options.selectable;

      let html = '<tr class="luna-summary-row">';

      if (showIndicator) html += `<td class="luna-indicator-cell"></td>`;
      if (showStateBar) html += `<td class="luna-statebar-cell"></td>`;
      if (showCheckBar) html += `<td class="luna-checkbox-cell"></td>`;

      let labelPlaced = false;

      this.options.columns.forEach((col, colIdx) => {
        if (col.hidden) return;

        const aggType = fieldsConfig[col.key];
        let pinnedClass = '';
        if (colIdx < this.options.fixedColCount) pinnedClass = 'pinned-left';
        else if (colIdx >= this.options.columns.filter(c => !c.hidden).length - this.options.fixedRightColCount) pinnedClass = 'pinned-right';

        let content = '';
        if (aggType) {
          let calculatedVal = this._computeAggregation(targetDataset, col.key, aggType);
          content = `<span class="luna-summary-label">${String(aggType).toUpperCase()}:</span>${calculatedVal}`;
        } else if (!labelPlaced) {
          content = `<strong>${this._escapeHtml(totalLabel)}</strong>`;
          labelPlaced = true;
        }

        html += `<td class="align-${col.align || 'left'} ${pinnedClass}">${content}</td>`;
      });

      html += '</tr>';
      this.tfootEl.innerHTML = html;
    }

    _computeAggregation(dataset, colKey, aggType) {
      if (dataset.length === 0) return '-';
      if (typeof aggType === 'function') return aggType(dataset, colKey);

      if (aggType === 'count') return `${dataset.length.toLocaleString()} 건`;

      const numbers = dataset.map(r => Number(r[colKey])).filter(n => !isNaN(n));
      if (numbers.length === 0) return '-';

      if (aggType === 'sum') {
        const sum = numbers.reduce((acc, v) => acc + v, 0);
        return Number(sum.toFixed(2)).toLocaleString();
      }
      if (aggType === 'avg') {
        const sum = numbers.reduce((acc, v) => acc + v, 0);
        return Number((sum / numbers.length).toFixed(1)).toLocaleString();
      }
      if (aggType === 'min') return Math.min(...numbers).toLocaleString();
      if (aggType === 'max') return Math.max(...numbers).toLocaleString();

      return '-';
    }

    _renderFooter() {
      // 1. 컬럼 요약행 (tfootEl) 렌더링
      this._renderColumnFooters();

      // 2. 하단 페이징 컨트롤 (footerEl) 렌더링
      if (!this.footerEl) return;
      if (!this.options.pageable) {
        this.footerEl.style.display = 'none';
        return;
      }
      this.footerEl.style.display = 'flex';

      const totalCount = this.filteredData ? this.filteredData.length : 0;
      const pageSize = Math.max(1, (this.pagingOptions && this.pagingOptions.enabled) ? this.pagingOptions.size : (this.pageSize || this.options.pageSize || 10));
      this.pageSize = pageSize;
      const curPage = Math.max(1, (this.pagingOptions && this.pagingOptions.enabled) ? (this.pagingOptions.page + 1) : (this.currentPage || 1));
      this.currentPage = curPage;

      const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
      const startItem = totalCount === 0 ? 0 : (curPage - 1) * pageSize + 1;
      const endItem = Math.min(curPage * pageSize, totalCount);

      const pageSizeOptions = this.options.pageSizeOptions || [5, 10, 20, 50, 100];
      const pageSizeOptionsHtml = pageSizeOptions
        .map(size => `<option value="${size}" ${size === pageSize ? 'selected' : ''}>${size}</option>`)
        .join('');

      const firstLabel = this.getMessage('pagingFirst', '첫 페이지');
      const prevLabel = this.getMessage('pagingPrev', '이전');
      const nextLabel = this.getMessage('pagingNext', '다음');
      const lastLabel = this.getMessage('pagingLast', '마지막 페이지');
      const totalLabel = this.getMessage('totalCount', '전체');
      const itemsLabel = this.getMessage('items', '건');
      const showingLabel = this.getMessage('showingItems', '표시');

      let paginationBtnsHtml = `
        <button class="luna-page-btn luna-page-first" ${curPage === 1 ? 'disabled' : ''} title="${this._escapeHtml(firstLabel)}">&laquo;</button>
        <button class="luna-page-btn luna-page-prev" ${curPage === 1 ? 'disabled' : ''} title="${this._escapeHtml(prevLabel)}">&lsaquo;</button>
      `;

      const maxDisplayPages = 5;
      let startPage = Math.max(1, curPage - Math.floor(maxDisplayPages / 2));
      let endPage = Math.min(totalPages, startPage + maxDisplayPages - 1);

      if (endPage - startPage + 1 < maxDisplayPages) {
        startPage = Math.max(1, endPage - maxDisplayPages + 1);
      }

      for (let p = startPage; p <= endPage; p++) {
        paginationBtnsHtml += `
          <button class="luna-page-btn luna-page-num ${p === curPage ? 'active' : ''}" data-page="${p}">
            ${p}
          </button>
        `;
      }

      paginationBtnsHtml += `
        <button class="luna-page-btn luna-page-next" ${curPage === totalPages ? 'disabled' : ''} title="${this._escapeHtml(nextLabel)}">&rsaquo;</button>
        <button class="luna-page-btn luna-page-last" ${curPage === totalPages ? 'disabled' : ''} title="${this._escapeHtml(lastLabel)}">&raquo;</button>
      `;

      const pagingAlign = (this.pagingOptions && (this.pagingOptions.align || this.pagingOptions.position)) || this.options.pagingAlign || this.options.paginationAlign || 'right';
      this.footerEl.setAttribute('data-paging-align', pagingAlign);

      const infoHtml = `
        <div class="luna-grid-info">
          <span>Total <strong>${totalCount.toLocaleString()}</strong> (${startItem} - ${endItem})</span>
          <select class="luna-page-size-select">${pageSizeOptionsHtml}</select>
        </div>
      `;
      const paginationHtml = `<div class="luna-pagination">${paginationBtnsHtml}</div>`;

      const showFooterInfo = this.options.showFooterPagingInfo !== false;
      if (showFooterInfo) {
        if (pagingAlign === 'center') {
          this.footerEl.innerHTML = `
            ${infoHtml}
            ${paginationHtml}
            <div class="luna-footer-spacer" style="display:flex; flex:1; justify-content:flex-end;"></div>
          `;
        } else if (pagingAlign === 'left') {
          this.footerEl.innerHTML = `
            ${paginationHtml}
            ${infoHtml}
          `;
        } else {
          this.footerEl.innerHTML = `
            ${infoHtml}
            ${paginationHtml}
          `;
        }
      } else {
        // 상단 툴바(JSON 내보내기 버튼 밑)에 전체 건수/10개씩 보기가 배치되었으므로 하단 푸터는 페이징 번호 버튼만 사용자 지정 정렬 위치로 깔끔하게 단독 렌더링
        let justifyStyle = 'flex-end';
        if (pagingAlign === 'center') justifyStyle = 'center';
        else if (pagingAlign === 'left') justifyStyle = 'flex-start';

        this.footerEl.style.justifyContent = justifyStyle;
        this.footerEl.innerHTML = paginationHtml;
      }
    }

    /**
     * [LunaGrid 100% 호환] 클릭 이벤트 메타데이터 객체(ClickData) 생성 헬퍼
     * LunaGrid Standard Architecture Specification
     * 
     * @param {MouseEvent} e - 네이티브 마우스 이벤트
     * @param {string} cellType - 'data' | 'header' | 'footer' | 'indicator' | 'checkBar' | 'stateBar' | 'groupHeader' | 'groupFooter' | 'empty'
     * @param {string} [colKey=null] - 컬럼 키/이름
     * @param {number} [itemIndex=-1] - 화면 뷰 상의 행 인덱스
     * @param {Object} [rowData=null] - 행 데이터 객체
     * @param {string} [subType=null] - 세부 타겟 유형 ('header' | 'summary' | 'groupSummary' | 'button' | 'treeExpander' | 'checkbox')
     * @returns {Object} ClickData
     */
    _buildClickData(e, cellType = 'data', colKey = null, itemIndex = -1, rowData = null, subType = null) {
      const col = colKey ? this.options.columns.find(c => c.key === colKey || c.name === colKey) : null;
      const fieldName = col ? (col.fieldName || col.key) : (colKey || '');
      const dataRow = (rowData && rowData.id !== undefined) ? (rowData.id || itemIndex) : itemIndex;
      const val = (rowData && colKey) ? rowData[colKey] : undefined;

      return {
        cellType: cellType || 'data',
        subType: subType || null,
        itemIndex: itemIndex,
        dataRow: dataRow,
        column: col ? (col.name || col.key) : (colKey || ''),
        fieldName: fieldName,
        value: val,
        target: e ? e.target : null,
        nativeEvent: e || null
      };
    }

    _bindGlobalEvents() {
      // 1. 헤더 이벤트 (다중 정렬 & 필터 & 전체선택 & onHeaderClicked)
      this.theadEl.addEventListener('click', (e) => {
        // 필터 팝오버 내부 클릭 시 헤더 정렬 등 상위 이벤트 무시
        if (e.target.closest('.luna-filter-popover')) {
          return;
        }

        const filterIcon = e.target.closest('.luna-filter-icon');
        if (filterIcon) {
          e.stopPropagation();
          const colKey = filterIcon.getAttribute('data-filter-col');
          this._openColumnFilterPopover(filterIcon, colKey);
          return;
        }

        const expander = e.target.closest('.luna-group-expander');
        if (expander) {
          e.stopPropagation();
          const grpName = expander.getAttribute('data-group-expander');
          this.toggleGroup(grpName);
          return;
        }

        const th = e.target.closest('th');
        if (th) {
          const colKey = th.getAttribute('data-col-key');
          const isResizer = e.target.classList.contains('luna-col-resizer');
          const isFilter = e.target.closest('.luna-filter-icon');

          if (!isResizer && !isFilter) {
            const clickData = this._buildClickData(e, 'header', colKey, -1, null, 'header');
            this._emit('headerClicked', colKey, clickData);
            this._emit('cellClicked', clickData);

            if (th.classList.contains('sortable')) {
              this.sort(colKey, null, e.shiftKey);
              this._triggerAutoSavePersonalization();
            }
          }
        }
      });

      this.theadEl.addEventListener('change', (e) => {
        if (e.target.classList.contains('luna-select-all')) {
          this._toggleSelectAll(e.target.checked);
        }
      });

      // 필터 패널 (FilterPanel) 실시간 인라인 필터 입력
      this.theadEl.addEventListener('input', (e) => {
        const input = e.target.closest('.luna-filter-panel-input');
        if (input) {
          const colKey = input.getAttribute('data-filter-col');
          const val = input.value.trim();
          clearTimeout(this._filterPanelTimer);
          this._filterPanelTimer = setTimeout(() => {
            if (val) {
              this.columnFilters[colKey] = val;
            } else {
              delete this.columnFilters[colKey];
            }
            this.currentPage = 1;
            this._applyFilterAndSort();
          }, this.filterPanel.delay || 200);
        }
      });

      // 2. 바디 인터랙션 (클릭, 더블클릭, 스위치 토글, 그룹 토글, 트리 토글)
      const editTrigger = this.options.editTrigger === 'click' ? 'click' : 'dblclick';

      this.tbodyEl.addEventListener('click', (e) => {
        // 트리 expander 접기/펼치기 토글
        const treeExpander = e.target.closest('.luna-tree-expander');
        if (treeExpander) {
          e.stopPropagation();
          const nodeId = treeExpander.getAttribute('data-tree-node-id');
          if (nodeId) {
            const isCurrentlyExpanded = this.isExpanded ? this.isExpanded(nodeId) : (this.dataAdapter && this.dataAdapter.isExpanded && this.dataAdapter.isExpanded(nodeId));
            if (isCurrentlyExpanded) {
              this.collapse(nodeId);
            } else {
              this.expand(nodeId);
            }
          }
          return;
        }

        // 그룹 행 접기/펼치기 토글
        const grpRow = e.target.closest('.luna-group-header-row');
        if (grpRow) {
          const grpName = grpRow.getAttribute('data-group-key') || grpRow.getAttribute('data-group-name');
          const clickData = this._buildClickData(e, 'groupHeader', null, -1, null, 'groupSummary');
          this._emit('cellClicked', clickData);

          if (this.collapsedGroups.has(grpName)) this.collapsedGroups.delete(grpName);
          else this.collapsedGroups.add(grpName);
          this._renderBody();
          return;
        }

        // 스위치 렌더러 원클릭 토글
        const switchContainer = e.target.closest('.luna-switch-container');
        if (switchContainer) {
          const td = switchContainer.closest('td');
          const tr = td.closest('tr');
          const rowId = tr.getAttribute('data-row-id');
          const colKey = switchContainer.getAttribute('data-switch-col');
          const row = this._findRowById(rowId);
          if (row) {
            const currentVal = row[colKey];
            const newVal = !(currentVal === true || currentVal === 'Y' || currentVal === 1 || currentVal === 'true');
            this.setCellValue(rowId, colKey, newVal);
          }
          return;
        }

        // 셀 버튼(Cell Button) & 팝업 메뉴(PopupMenu) 클릭 이벤트
        const cellBtn = e.target.closest('.luna-cell-btn');
        if (cellBtn) {
          e.stopPropagation();
          const td = cellBtn.closest('td');
          const tr = td.closest('tr');
          const rowId = tr.getAttribute('data-row-id');
          const colKey = cellBtn.getAttribute('data-cell-btn-col');
          const rowIndex = parseInt(tr.getAttribute('data-row-index'), 10);
          const row = this._findRowById(rowId);
          const col = this.options.columns.find(c => c.key === colKey);

          const clickData = this._buildClickData(e, 'data', colKey, rowIndex, row, 'button');

          // 팝업 메뉴 바인딩 확인
          const menuName = col && (col.popupMenu || (col.button === 'popup' && col.key));
          if (menuName && this.popupMenus.has(menuName)) {
            this._showCellPopupMenu(cellBtn, menuName, row, colKey);
            return;
          }

          if (col && typeof col.onCellButtonClicked === 'function') {
            col.onCellButtonClicked(this, row, colKey, col.button, clickData);
          } else if (typeof this.options.onCellButtonClicked === 'function') {
            this.options.onCellButtonClicked(this, row, colKey, col ? col.button : 'action', clickData);
          }
          this._emit('cellButtonClicked', row, colKey, col ? col.button : 'action', clickData);
          return;
        }

        // 인라인 에디터 내부 클릭 시 상위 행/셀 클릭 이벤트로 전파되어 에디터가 즉시 닫히는 현상 방지
        if (e.target.closest('.luna-inline-editor, .luna-multicheck-editor-container, .luna-multicheck-panel')) {
          return;
        }

        const tr = e.target.closest('tr');
        if (!tr || tr.querySelector('.luna-grid-empty')) return;

        const rowId = tr.getAttribute('data-row-id');
        const rowIndex = parseInt(tr.getAttribute('data-row-index'), 10);
        const rowData = this.displayData[rowIndex];

        if (e.target.classList.contains('luna-row-select')) {
          this._toggleRowSelect(rowId, e.target.checked, tr);
          const chkClickData = this._buildClickData(e, 'checkBar', null, rowIndex, rowData, 'checkbox');
          this._emit('itemChecked', rowIndex, e.target.checked);
          this._emit('cellClicked', chkClickData);
          return;
        }

        const td = e.target.closest('td');
        if (td && td.getAttribute('data-col-key')) {
          const colKey = td.getAttribute('data-col-key');
          this._setCellFocus(rowIndex, colKey, rowId);

          const clickData = this._buildClickData(e, 'data', colKey, rowIndex, rowData);

          // LunaGrid onCellClicked & onCellClick 이벤트 디스패치
          this._emit('cellClicked', clickData);
          if (typeof this.onCellClicked === 'function') {
            this.onCellClicked(this, clickData);
          }
          if (typeof this.options.onCellClick === 'function') {
            this.options.onCellClick(rowData ? rowData[colKey] : null, rowData, colKey, e);
          }
        }

        if (typeof this.options.onRowClick === 'function' && rowData) {
          this.options.onRowClick(rowData, e);
        }

        if (editTrigger === 'click' && td && td.classList.contains('editable')) {
          this._startCellEdit(td, rowId, td.getAttribute('data-col-key'));
        }
      });

      // 바디 더블클릭 이벤트 (onCellDblClicked)
      this.tbodyEl.addEventListener('dblclick', (e) => {
        const tr = e.target.closest('tr');
        if (!tr || tr.querySelector('.luna-grid-empty')) return;

        const rowId = tr.getAttribute('data-row-id');
        const rowIndex = parseInt(tr.getAttribute('data-row-index'), 10);
        const rowData = this.displayData[rowIndex];

        const td = e.target.closest('td');
        if (td && td.getAttribute('data-col-key')) {
          const colKey = td.getAttribute('data-col-key');
          const clickData = this._buildClickData(e, 'data', colKey, rowIndex, rowData);

          // LunaGrid onCellDblClicked & onCellDblClick 디스패치
          this._emit('cellDblClicked', clickData);
          if (typeof this.onCellDblClicked === 'function') {
            this.onCellDblClicked(this, clickData);
          }
          if (typeof this.options.onCellDblClick === 'function') {
            this.options.onCellDblClick(rowData ? rowData[colKey] : null, rowData, colKey, e);
          }

          if (editTrigger === 'dblclick' && td.classList.contains('editable')) {
            this._startCellEdit(td, rowId, colKey);
          }
        }
      });

      // 푸터 클릭 이벤트 (onFooterClicked & onCellClicked)
      if (this.tfootEl) {
        this.tfootEl.addEventListener('click', (e) => {
          const td = e.target.closest('td.luna-footer-cell');
          if (td) {
            const colKey = td.getAttribute('data-col-key');
            const clickData = this._buildClickData(e, 'footer', colKey, -1, null, 'summary');
            this._emit('footerClicked', colKey, clickData);
            this._emit('cellClicked', clickData);
            if (typeof this.onFooterClicked === 'function') {
              this.onFooterClicked(this, colKey, clickData);
            }
          }
        });
      }

      // 3. 셀 범위 드래그 선택 (Range Selection)
      if (this.options.enableRangeSelection) {
        this.tbodyEl.addEventListener('mousedown', (e) => {
          const td = e.target.closest('td[data-col-key]');
          if (!td || e.target.classList.contains('luna-checkbox') || e.target.closest('.luna-switch-container') || (editTrigger === 'click' && td.classList.contains('editable'))) return;

          const tr = td.closest('tr');
          const rIdx = parseInt(tr.getAttribute('data-row-index'), 10);
          const cIdx = parseInt(td.getAttribute('data-col-index'), 10);
          if (isNaN(rIdx) || isNaN(cIdx)) return;

          this.isDraggingRange = true;
          this.selectedRange = { startRow: rIdx, startCol: cIdx, endRow: rIdx, endCol: cIdx };
          this._updateRangeSelectionUi();
        });

        document.addEventListener('mousemove', (e) => {
          if (!this.isDraggingRange) return;
          const td = e.target.closest('td[data-col-key]');
          if (!td) return;

          const tr = td.closest('tr');
          const rIdx = parseInt(tr.getAttribute('data-row-index'), 10);
          const cIdx = parseInt(td.getAttribute('data-col-index'), 10);
          if (isNaN(rIdx) || isNaN(cIdx)) return;

          if (this.selectedRange.endRow !== rIdx || this.selectedRange.endCol !== cIdx) {
            this.selectedRange.endRow = rIdx;
            this.selectedRange.endCol = cIdx;
            this._updateRangeSelectionUi();
          }
        });

        document.addEventListener('mouseup', () => {
          if (this.isDraggingRange) {
            this.isDraggingRange = false;
            if (typeof this.options.onRangeSelectionChange === 'function') {
              this.options.onRangeSelectionChange(this.selectedRange);
            }
          }
        });
      }

      // 4. 그룹핑 패널 인터랙션
      if (this.groupPanelEl) {
        this.groupPanelEl.addEventListener('click', (e) => {
          const removeBtn = e.target.closest('.luna-group-tag-remove');
          if (removeBtn) {
            const tag = removeBtn.closest('.luna-group-tag');
            const grpKey = tag.getAttribute('data-group-key');
            this.groupColumns = this.groupColumns.filter(k => k !== grpKey);
            this._renderGroupPanel();
            this._renderBody();
            if (typeof this.options.onGroupChange === 'function') {
              this.options.onGroupChange(this.groupColumns);
            }
            this._triggerAutoSavePersonalization();
          }
        });

        this.groupPanelEl.addEventListener('dragover', (e) => {
          e.preventDefault();
          this.groupPanelEl.classList.add('drag-over');
        });

        this.groupPanelEl.addEventListener('dragleave', () => {
          this.groupPanelEl.classList.remove('drag-over');
        });

        this.groupPanelEl.addEventListener('drop', (e) => {
          e.preventDefault();
          this.groupPanelEl.classList.remove('drag-over');
          const colKey = e.dataTransfer.getData('text/plain');
          if (colKey && !this.groupColumns.includes(colKey)) {
            this.groupColumns.push(colKey);
            this._renderGroupPanel();
            this._renderBody();
            if (typeof this.options.onGroupChange === 'function') {
              this.options.onGroupChange(this.groupColumns);
            }
            this._triggerAutoSavePersonalization();
          }
        });
      }

      // 5. 키보드 풀 내비게이션 & 엑셀 복사/붙여넣기 & Undo/Redo 단축키 (Ctrl+Z / Ctrl+Y / Ctrl+C / Ctrl+V)
      document.addEventListener('keydown', (e) => {
        // Undo 단축키 (Ctrl+Z)
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey && !this.editingCell) {
          if (this.options.undoable !== false) {
            e.preventDefault();
            this.undo();
            return;
          }
        }

        // Redo 단축키 (Ctrl+Y 또는 Ctrl+Shift+Z)
        if ((((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
          ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && e.shiftKey)) && !this.editingCell) {
          if (this.options.undoable !== false) {
            e.preventDefault();
            this.redo();
            return;
          }
        }

        // 엑셀 붙여넣기 (Ctrl+V)
        if ((e.ctrlKey || e.metaKey) && e.key === 'v' && !this.editingCell) {
          if (this.options.enableExcelPaste) {
            this._handleClipboardPaste();
          }
          return;
        }

        // 엑셀 복사 (Ctrl+C)
        if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !window.getSelection().toString()) {
          if (this.options.enableClipboard) {
            e.preventDefault();
            this.copySelectedToClipboard();
          }
          return;
        }

        // 방향키 & Tab & Enter 내비게이션
        if (this.focusedCell && !this.editingCell) {
          if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'F2'].includes(e.key)) {
            this._handleKeyboardNav(e);
          }
        }
      });

      // 6. 툴바 및 푸터 이벤트
      if (this.toolbarEl) {
        const searchInput = this.toolbarEl.querySelector('.luna-search-input');
        if (searchInput) {
          let timer;
          searchInput.addEventListener('input', (e) => {
            clearTimeout(timer);
            timer = setTimeout(() => this.search(e.target.value), 200);
          });
        }

        const addBtn = this.toolbarEl.querySelector('.luna-add-btn');
        if (addBtn) addBtn.addEventListener('click', () => this.addRow());

        const delBtn = this.toolbarEl.querySelector('.luna-del-btn');
        if (delBtn) delBtn.addEventListener('click', () => this.deleteSelectedRows());

        const saveBtn = this.toolbarEl.querySelector('.luna-save-btn');
        if (saveBtn) saveBtn.addEventListener('click', () => this.commitChanges());

        const exportBtn = this.toolbarEl.querySelector('.luna-export-btn');
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportToCsv());

        const exportJsonBtn = this.toolbarEl.querySelector('.luna-export-json-btn');
        if (exportJsonBtn) exportJsonBtn.addEventListener('click', () => this.exportToJson());

        this.toolbarEl.addEventListener('change', (e) => {
          if (e.target.classList.contains('luna-page-size-select')) {
            this.setPageSize(parseInt(e.target.value, 10));
          }
        });
      }

      this.footerEl.addEventListener('click', (e) => {
        const btn = e.target.closest('.luna-page-btn');
        if (!btn || btn.disabled) return;

        const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
        if (btn.classList.contains('luna-page-first')) this.setPage(1);
        else if (btn.classList.contains('luna-page-prev')) this.setPage(this.currentPage - 1);
        else if (btn.classList.contains('luna-page-next')) this.setPage(this.currentPage + 1);
        else if (btn.classList.contains('luna-page-last')) this.setPage(totalPages);
        else if (btn.classList.contains('luna-page-num')) {
          this.setPage(parseInt(btn.getAttribute('data-page'), 10));
        }
      });

      this.footerEl.addEventListener('change', (e) => {
        if (e.target.classList.contains('luna-page-size-select')) {
          this.setPageSize(parseInt(e.target.value, 10));
        }
      });

      // 7. 우클릭 컨텍스트 메뉴
      if (this.options.enableContextMenu) {
        this.container.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          this._showContextMenu(e.pageX, e.pageY);
        });
      }

      // 8. 행 드래그 앤 드롭 (Row Drag & Drop) 엔진
      let draggedRowEl = null;
      let dragFeedbackEl = null;
      let dragInsertLineEl = null;

      this.tbodyEl.addEventListener('dragstart', (e) => {
        if (!this.rowDragOptions || !this.rowDragOptions.enabled) return;
        const tr = e.target.closest('tr[data-row-index]');
        if (!tr || tr.classList.contains('luna-group-header-row')) return;

        draggedRowEl = tr;
        const rIdx = parseInt(tr.getAttribute('data-row-index'), 10);
        e.dataTransfer.setData('text/plain', String(rIdx));
        e.dataTransfer.effectAllowed = 'move';
        tr.classList.add('luna-row-dragging');

        // 드래그 피드백 뱃지 툴팁 생성
        if (this.rowDragOptions.enableFeedback !== false) {
          const selectedCount = this.selectedRowKeys.size > 1 && this.selectedRowKeys.has(tr.getAttribute('data-row-id'))
            ? this.selectedRowKeys.size
            : 1;
          const template = this.rowDragOptions.feedbackText || '${count}개 행 이동';
          const feedbackMsg = template.replace('${count}', selectedCount);

          dragFeedbackEl = document.createElement('div');
          dragFeedbackEl.className = 'luna-drag-feedback-badge';
          dragFeedbackEl.textContent = `↕ ${feedbackMsg}`;
          document.body.appendChild(dragFeedbackEl);

          if (e.dataTransfer.setDragImage) {
            e.dataTransfer.setDragImage(dragFeedbackEl, 15, 15);
          }
        }
      });

      this.tbodyEl.addEventListener('dragover', (e) => {
        if (!this.rowDragOptions || !this.rowDragOptions.enabled || !draggedRowEl) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const tr = e.target.closest('tr[data-row-index]');
        if (!tr || tr === draggedRowEl) {
          if (dragInsertLineEl) dragInsertLineEl.remove();
          return;
        }

        const rect = tr.getBoundingClientRect();
        const isBelow = e.clientY > rect.top + rect.height / 2;

        if (!dragInsertLineEl) {
          dragInsertLineEl = document.createElement('div');
          dragInsertLineEl.className = 'luna-drag-insert-line';
          this.tbodyEl.appendChild(dragInsertLineEl);
        }

        dragInsertLineEl.style.width = `${tr.offsetWidth}px`;
        dragInsertLineEl.style.left = `${tr.offsetLeft}px`;
        dragInsertLineEl.style.top = `${isBelow ? tr.offsetTop + tr.offsetHeight : tr.offsetTop}px`;
        dragInsertLineEl.setAttribute('data-target-index', tr.getAttribute('data-row-index'));
        dragInsertLineEl.setAttribute('data-position', isBelow ? 'below' : 'above');
      });

      this.tbodyEl.addEventListener('dragleave', (e) => {
        if (!this.tbodyEl.contains(e.relatedTarget)) {
          if (dragInsertLineEl) dragInsertLineEl.remove();
        }
      });

      this.tbodyEl.addEventListener('drop', (e) => {
        if (!this.rowDragOptions || !this.rowDragOptions.enabled || !draggedRowEl) return;
        e.preventDefault();

        const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
        if (isNaN(fromIdx)) return;

        const tr = e.target.closest('tr[data-row-index]');
        if (tr && tr !== draggedRowEl && this.rowDragOptions.enableMove !== false) {
          let toIdx = parseInt(tr.getAttribute('data-row-index'), 10);
          const rect = tr.getBoundingClientRect();
          const isBelow = e.clientY > rect.top + rect.height / 2;
          if (isBelow && toIdx < fromIdx) toIdx++;
          else if (!isBelow && toIdx > fromIdx) toIdx--;

          if (this.dataAdapter && typeof this.dataAdapter.moveRow === 'function') {
            this.dataAdapter.moveRow(fromIdx, toIdx);
            this.showToast(`↕ 행이 ${fromIdx + 1}번에서 ${toIdx + 1}번 위치로 이동되었습니다.`);
          }
        }
      });

      this.tbodyEl.addEventListener('dragend', () => {
        if (draggedRowEl) {
          draggedRowEl.classList.remove('luna-row-dragging');
          draggedRowEl = null;
        }
        if (dragFeedbackEl) {
          dragFeedbackEl.remove();
          dragFeedbackEl = null;
        }
        if (dragInsertLineEl) {
          dragInsertLineEl.remove();
          dragInsertLineEl = null;
        }
      });

      // 9. [LunaGrid 100% 호환] 스크롤 이벤트 (Scroll Event Suite)
      // LunaGrid Architecture Specification Standard
      if (this.wrapperEl) {
        let lastTopIndex = -1;
        let lastLeftPos = -1;
        let isBottomTriggered = false;

        this.wrapperEl.addEventListener('scroll', () => {
          const scrollTop = this.wrapperEl.scrollTop;
          const scrollLeft = this.wrapperEl.scrollLeft;
          const scrollHeight = this.wrapperEl.scrollHeight;
          const clientHeight = this.wrapperEl.clientHeight;
          const scrollWidth = this.wrapperEl.scrollWidth;
          const clientWidth = this.wrapperEl.clientWidth;

          const rowHeight = (this.displayOptions && this.displayOptions.rowHeight) || this.options.rowHeight || 36;
          const currentTopIndex = Math.max(0, Math.floor(scrollTop / rowHeight));

          // 1. onTopIndexChanged (수직 스크롤 상단 행 변경 시)
          if (currentTopIndex !== lastTopIndex) {
            lastTopIndex = currentTopIndex;
            if (typeof this.onTopIndexChanged === 'function') {
              this.onTopIndexChanged(this, currentTopIndex);
            }
            if (typeof this.options.onTopIndexChanged === 'function') {
              this.options.onTopIndexChanged(this, currentTopIndex);
            }
            this._emit('topIndexChanged', currentTopIndex);
          }

          // 2. onLeftPosChanged (가로 스크롤 위치 변경 시)
          if (scrollLeft !== lastLeftPos) {
            lastLeftPos = scrollLeft;
            if (typeof this.onLeftPosChanged === 'function') {
              this.onLeftPosChanged(this, scrollLeft);
            }
            if (typeof this.options.onLeftPosChanged === 'function') {
              this.options.onLeftPosChanged(this, scrollLeft);
            }
            this._emit('leftPosChanged', scrollLeft);
          }

          // 3. onScrollToBottom (최하단 행 도달 시 - Lazy Loading & 무한 스크롤 연동)
          const isAtBottom = scrollHeight - (scrollTop + clientHeight) <= 15;
          if (isAtBottom) {
            if (!isBottomTriggered) {
              isBottomTriggered = true;
              if (typeof this.onScrollToBottom === 'function') {
                this.onScrollToBottom(this);
              }
              if (typeof this.options.onScrollToBottom === 'function') {
                this.options.onScrollToBottom(this);
              }
              this._emit('scrollToBottom');
            }
          } else {
            isBottomTriggered = false;
          }

          // 4. onScroll (전체 스크롤 메타데이터)
          const scrollInfo = {
            topIndex: currentTopIndex,
            leftPos: scrollLeft,
            scrollTop: scrollTop,
            scrollLeft: scrollLeft,
            maxScrollTop: Math.max(0, scrollHeight - clientHeight),
            maxScrollLeft: Math.max(0, scrollWidth - clientWidth),
            isBottom: isAtBottom,
            isTop: scrollTop <= 0
          };

          if (typeof this.onScroll === 'function') {
            this.onScroll(this, scrollInfo);
          }
          if (typeof this.options.onScroll === 'function') {
            this.options.onScroll(this, scrollInfo);
          }
          this._emit('scroll', scrollInfo);
        });
      }

      // 팝오버 / 메뉴 닫기
      document.addEventListener('click', (e) => {
        if (this._activeFilterPopover && !e.target.closest('.luna-filter-popover') && !e.target.closest('.luna-filter-icon')) {
          this._closeFilterPopover();
        }
        if (this._activeContextMenu && !e.target.closest('.luna-context-menu')) {
          this._closeContextMenu();
        }
      });
    }

    /**
     * [LunaGrid 100% 호환] 특정 인덱스의 행을 그리드 최상단으로 스크롤 이동 (setTopItem)
     * @param {number} itemIndex - 상단에 위치시킬 행 인덱스 (0-based)
     */
    setTopItem(itemIndex = 0) {
      if (!this.wrapperEl) return;
      const rowHeight = (this.displayOptions && this.displayOptions.rowHeight) || this.options.rowHeight || 36;
      const targetScrollTop = Math.max(0, itemIndex * rowHeight);
      this.wrapperEl.scrollTop = targetScrollTop;
    }

    /**
     * [LunaGrid 100% 호환] 현재 그리드 최상단에 표시되고 있는 행 인덱스 반환 (getTopItem)
     * @returns {number}
     */
    getTopItem() {
      if (!this.wrapperEl) return 0;
      const rowHeight = (this.displayOptions && this.displayOptions.rowHeight) || this.options.rowHeight || 36;
      return Math.max(0, Math.floor(this.wrapperEl.scrollTop / rowHeight));
    }

    /**
     * [LunaGrid 100% 호환] 그리드 가로 스크롤 위치 설정 (setLeftPos)
     * @param {number} pos - 픽셀 단위 가로 스크롤 위치
     */
    setLeftPos(pos = 0) {
      if (!this.wrapperEl) return;
      this.wrapperEl.scrollLeft = Math.max(0, parseInt(pos, 10) || 0);
    }

    /**
     * [LunaGrid 100% 호환] 현재 그리드 가로 스크롤 위치 반환 (getLeftPos)
     * @returns {number}
     */
    getLeftPos() {
      return this.wrapperEl ? this.wrapperEl.scrollLeft : 0;
    }

    /**
     * 특정 행으로 스크롤 이동 (scrollToRow)
     * @param {number|string} rowIndexOrId - 행 인덱스 또는 ID
     * @param {boolean} [smooth=false] - 부드러운 스크롤 여부
     */
    scrollToRow(rowIndexOrId, smooth = false) {
      if (!this.tbodyEl || !this.wrapperEl) return;
      let tr;
      if (typeof rowIndexOrId === 'number') {
        tr = this.tbodyEl.querySelector(`tr[data-row-index="${rowIndexOrId}"]`);
      } else {
        tr = this.tbodyEl.querySelector(`tr[data-row-id="${rowIndexOrId}"]`);
      }
      if (tr) {
        tr.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'nearest' });
      }
    }

    /**
     * 특정 컬럼으로 가로 스크롤 이동 (scrollToColumn)
     * @param {string} colKey - 컬럼 키 또는 이름
     * @param {boolean} [smooth=false]
     */
    scrollToColumn(colKey, smooth = false) {
      if (!this.theadEl || !this.wrapperEl) return;
      const th = this.theadEl.querySelector(`th[data-col-key="${colKey}"]`);
      if (th) {
        th.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', inline: 'nearest' });
      }
    }

    /**
     * 그리드 최하단으로 즉시 스크롤 (scrollToBottom)
     */
    scrollToBottom() {
      if (!this.wrapperEl) return;
      this.wrapperEl.scrollTop = this.wrapperEl.scrollHeight;
    }

    /**
     * 그리드 최상단으로 즉시 스크롤 (scrollToTop)
     */
    scrollToTop() {
      if (!this.wrapperEl) return;
      this.wrapperEl.scrollTop = 0;
    }

    /**
     * 그리드 스크롤 위치 조회 (getScrollPos)
     */
    getScrollPos() {
      if (!this.wrapperEl) return { scrollTop: 0, scrollLeft: 0, topIndex: 0, leftPos: 0 };
      const rowHeight = (this.displayOptions && this.displayOptions.rowHeight) || this.options.rowHeight || 36;
      return {
        scrollTop: this.wrapperEl.scrollTop,
        scrollLeft: this.wrapperEl.scrollLeft,
        topIndex: Math.floor(this.wrapperEl.scrollTop / rowHeight),
        leftPos: this.wrapperEl.scrollLeft,
        maxScrollTop: Math.max(0, this.wrapperEl.scrollHeight - this.wrapperEl.clientHeight),
        maxScrollLeft: Math.max(0, this.wrapperEl.scrollWidth - this.wrapperEl.clientWidth)
      };
    }

    /**
     * 그리드 스크롤 위치 설정 (setScrollPos)
     * @param {Object} options - { scrollTop, scrollLeft, topIndex, leftPos }
     */
    setScrollPos(options = {}) {
      if (!this.wrapperEl) return;
      const rowHeight = (this.displayOptions && this.displayOptions.rowHeight) || this.options.rowHeight || 36;
      if (options.topIndex !== undefined) {
        this.wrapperEl.scrollTop = options.topIndex * rowHeight;
      } else if (options.scrollTop !== undefined) {
        this.wrapperEl.scrollTop = options.scrollTop;
      }

      if (options.leftPos !== undefined) {
        this.wrapperEl.scrollLeft = options.leftPos;
      } else if (options.scrollLeft !== undefined) {
        this.wrapperEl.scrollLeft = options.scrollLeft;
      }
    }

    _updateRangeSelectionUi() {
      this.tbodyEl.querySelectorAll('td.cell-range-selected, td.cell-range-top, td.cell-range-bottom, td.cell-range-left, td.cell-range-right')
        .forEach(td => {
          td.classList.remove('cell-range-selected', 'cell-range-top', 'cell-range-bottom', 'cell-range-left', 'cell-range-right');
        });

      if (!this.selectedRange) return;

      const minRow = Math.min(this.selectedRange.startRow, this.selectedRange.endRow);
      const maxRow = Math.max(this.selectedRange.startRow, this.selectedRange.endRow);
      const minCol = Math.min(this.selectedRange.startCol, this.selectedRange.endCol);
      const maxCol = Math.max(this.selectedRange.startCol, this.selectedRange.endCol);

      for (let r = minRow; r <= maxRow; r++) {
        const tr = this.tbodyEl.querySelector(`tr[data-row-index="${r}"]`);
        if (!tr) continue;

        for (let c = minCol; c <= maxCol; c++) {
          const td = tr.querySelector(`td[data-col-index="${c}"]`);
          if (!td) continue;

          td.classList.add('cell-range-selected');
          if (r === minRow) td.classList.add('cell-range-top');
          if (r === maxRow) td.classList.add('cell-range-bottom');
          if (c === minCol) td.classList.add('cell-range-left');
          if (c === maxCol) td.classList.add('cell-range-right');
        }
      }
    }

    _handleKeyboardNav(e) {
      const visibleCols = this.options.columns.filter(c => !c.hidden);
      let { rowIndex, colKey, rowId } = this.focusedCell;
      let colIndex = visibleCols.findIndex(c => c.key === colKey);
      if (colIndex === -1) colIndex = 0;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        rowIndex = Math.max(0, rowIndex - 1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        rowIndex = Math.min(this.displayData.length - 1, rowIndex + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        colIndex = Math.max(0, colIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        colIndex = Math.min(visibleCols.length - 1, colIndex + 1);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        if (e.shiftKey) colIndex = Math.max(0, colIndex - 1);
        else colIndex = Math.min(visibleCols.length - 1, colIndex + 1);
      } else if (e.key === 'Enter' || e.key === 'F2') {
        e.preventDefault();
        const tr = this.tbodyEl.querySelector(`tr[data-row-index="${rowIndex}"]`);
        if (tr) {
          const td = tr.querySelector(`td[data-col-key="${colKey}"]`);
          if (td && td.classList.contains('editable')) {
            this._startCellEdit(td, tr.getAttribute('data-row-id'), colKey);
          }
        }
        return;
      }

      const nextColKey = visibleCols[colIndex].key;
      const targetRow = this.displayData[rowIndex];
      if (targetRow) {
        this._setCellFocus(rowIndex, nextColKey, this._getRowId(targetRow, rowIndex));
      }
    }

    /**
     * CopyOptions 설정 (setCopyOptions)
     */
    setCopyOptions(options = {}) {
      this.options.copyOptions = Object.assign(this.options.copyOptions || {}, options);
    }

    getCopyOptions() {
      return Object.assign({}, this.options.copyOptions);
    }

    /**
     * PasteOptions 설정 (setPasteOptions)
     */
    setPasteOptions(options = {}) {
      this.options.pasteOptions = Object.assign(this.options.pasteOptions || {}, options);
    }

    getPasteOptions() {
      return Object.assign({}, this.options.pasteOptions);
    }

    /**
     * 선택된 영역의 데이터를 클립보드에 TSV 형태로 복사 (copyToClipboard / copySelectedToClipboard)
     * LunaGrid copyOptions (singleMode, lookupDisplay, copyFormatted) 완벽 지원
     */
    async copySelectedToClipboard() {
      if (this.options.copyOptions && this.options.copyOptions.enabled === false) return;
      const copyOpts = this.options.copyOptions || {};
      const visibleCols = this.options.columns.filter(c => !c.hidden);
      let textToCopy = '';

      if (copyOpts.singleMode) {
        // 단일 셀만 복사
        if (this.focusedCell) {
          const row = this.displayData[this.focusedCell.rowIndex];
          if (row) {
            textToCopy = String(row[this.focusedCell.colKey] ?? '');
          }
        }
      } else if (this.selectedRange) {
        // 2D 범위 선택 영역 복사
        const minRow = Math.min(this.selectedRange.startRow, this.selectedRange.endRow);
        const maxRow = Math.max(this.selectedRange.startRow, this.selectedRange.endRow);
        const minCol = Math.min(this.selectedRange.startCol, this.selectedRange.endCol);
        const maxCol = Math.max(this.selectedRange.startCol, this.selectedRange.endCol);

        const lines = [];
        for (let r = minRow; r <= maxRow; r++) {
          const row = this.displayData[r];
          if (!row) continue;
          const rowVals = [];
          for (let c = minCol; c <= maxCol; c++) {
            const col = visibleCols[c];
            if (!col) continue;
            let val = row[col.key];
            if (copyOpts.lookupDisplay && col.lookupData && col.lookupData[val] !== undefined) {
              val = col.lookupData[val];
            }
            rowVals.push(val !== undefined && val !== null ? String(val) : '');
          }
          lines.push(rowVals.join('\t'));
        }
        textToCopy = lines.join('\r\n');
      } else if (this.focusedCell) {
        const row = this.displayData[this.focusedCell.rowIndex];
        if (row) textToCopy = String(row[this.focusedCell.colKey] ?? '');
      }

      if (textToCopy) {
        try {
          await navigator.clipboard.writeText(textToCopy);
          this.showToast('📋 선택된 영역이 클립보드에 복사되었습니다.');
        } catch (err) {
          console.warn('클립보드 복사 실패:', err);
        }
      }
    }

    copyToClipboard() {
      return this.copySelectedToClipboard();
    }

    /**
     * TSV/CSV 형식 텍스트 일괄 붙여넣기 (pasteText)
     * @param {string} text - 탭 또는 콤마로 구분된 텍스트
     */
    pasteText(text) {
      if (!text || typeof text !== 'string') return;
      const lines = text.trim().split(/\r?\n/).map(line => line.includes('\t') ? line.split('\t') : line.split(','));
      if (lines.length === 0) return;

      const visibleCols = this.options.columns.filter(c => !c.hidden);
      const startRowIdx = this.focusedCell ? this.focusedCell.rowIndex : 0;
      const startColKey = this.focusedCell ? this.focusedCell.colKey : (visibleCols[0] && visibleCols[0].key);
      let startColIdx = visibleCols.findIndex(c => c.key === startColKey || c.name === startColKey);
      if (startColIdx === -1) startColIdx = 0;

      lines.forEach((lineValues, lIdx) => {
        const targetRowIdx = startRowIdx + lIdx;
        let row = this.displayData[targetRowIdx];
        if (!row) {
          row = this.addRow({}, 'bottom');
        }
        const rowId = this._getRowId(row, targetRowIdx);

        lineValues.forEach((val, vIdx) => {
          const col = visibleCols[startColIdx + vIdx];
          if (!col) return;
          if (col.editable === false || col.readOnly) return;

          let parsedVal = String(val).trim();
          if (col.dataType === 'number' || col.editType === 'number' || col.type === 'number') {
            const num = Number(parsedVal.replace(/,/g, ''));
            if (!isNaN(num)) parsedVal = num;
          }
          this.setCellValue(rowId, col.key || col.name, parsedVal);
        });
      });

      this._renderBody();
      this.showToast(`📥 ${lines.length}행 데이터가 붙여넣기 되었습니다.`);
    }

    /**
     * 엑셀 클립보드 붙여넣기 (Ctrl+V) 실시간 파싱 및 반영
     * LunaGrid pasteOptions (singleMode, checkReadOnly, selectBlockPaste, commitEdit) 완벽 지원
     */
    async _handleClipboardPaste() {
      if (this.options.pasteOptions && this.options.pasteOptions.enabled === false) return;
      const pasteOpts = this.options.pasteOptions || {};
      const checkReadOnly = pasteOpts.checkReadOnly !== false;
      const isSingleMode = pasteOpts.singleMode === true;

      try {
        const text = await navigator.clipboard.readText();
        if (!text || !text.trim()) return;

        const lines = text.trim().split(/\r?\n/).map(line => line.split('\t'));
        if (lines.length === 0) return;

        const visibleCols = this.options.columns.filter(c => !c.hidden);
        const startRowIdx = this.focusedCell ? this.focusedCell.rowIndex : 0;
        const startColKey = this.focusedCell ? this.focusedCell.colKey : visibleCols[0].key;
        let startColIdx = visibleCols.findIndex(c => c.key === startColKey);
        if (startColIdx === -1) startColIdx = 0;

        if (isSingleMode) {
          // singleMode: 포커스된 셀 하나에만 첫 번째 값 붙여넣기
          const col = visibleCols[startColIdx];
          if (col && (!checkReadOnly || (col.editable !== false && !col.readOnly))) {
            const row = this.displayData[startRowIdx];
            if (row) {
              const rowId = this._getRowId(row, startRowIdx);
              this.setCellValue(rowId, col.key, lines[0][0]);
            }
          }
          return;
        }

        // 멀티 2D 표 붙여넣기
        let updatedCount = 0;
        lines.forEach((lineValues, lIdx) => {
          const targetRowIdx = startRowIdx + lIdx;
          let row = this.displayData[targetRowIdx];

          // 행이 모자라면 자동 추가
          if (!row) {
            row = this.addRow({}, 'bottom');
          }

          const rowId = this._getRowId(row, targetRowIdx);

          lineValues.forEach((val, vIdx) => {
            const col = visibleCols[startColIdx + vIdx];
            if (!col) return;

            // checkReadOnly 검사
            if (checkReadOnly && (col.editable === false || col.readOnly)) return;

            let parsedVal = val.trim();
            if (col.dataType === 'number' || col.editType === 'number') {
              if (parsedVal !== '') parsedVal = Number(parsedVal.replace(/,/g, ''));
            }
            this.setCellValue(rowId, col.key, parsedVal);
            updatedCount++;
          });
        });

        this.showToast(`📋 엑셀 데이터 ${lines.length}행이 성공적으로 붙여넣기 되었습니다.`);
      } catch (err) {
        console.warn('클립보드 붙여넣기 권한 없음 또는 오류:', err);
      }
    }

    // =========================================================================
    // 인라인 셀 에디터 (Advanced In-place Editors)
    // =========================================================================

    _startCellEdit(tdElement, rowId, colKey) {
      if (this.editingCell) {
        if (String(this.editingCell.rowId) === String(rowId) && this.editingCell.colKey === colKey) {
          // 이미 같은 셀 편집 중이면 인라인 에디터에 포커스만 재설정
          const existingInput = this.editingCell.tdElement ? this.editingCell.tdElement.querySelector('.luna-inline-editor, input, select, textarea') : null;
          if (existingInput) {
            existingInput.focus();
            if (typeof existingInput.select === 'function') existingInput.select();
          }
          return;
        }
        // 다른 셀로 전환 시: 전체 리렌더링(tbody innerHTML 파괴)을 방지하여 클릭 타겟 유지 (skipRender = true)
        this._endCellEdit(true, true);
      }

      // 대상 tdElement가 없거나 DOM에서 분리된 경우 안전하게 재조회
      if (!tdElement || !tdElement.isConnected) {
        const trList = this.tbodyEl ? Array.from(this.tbodyEl.querySelectorAll('tr')) : [];
        const currentTr = trList.find(tr => tr.getAttribute('data-row-id') === String(rowId));
        if (currentTr) {
          const currentTd = currentTr.querySelector(`td[data-col-key="${colKey}"]`);
          if (currentTd) tdElement = currentTd;
        }
      }

      if (!tdElement) return;

      const row = this._findRowById(rowId);
      if (!row) return;

      const rowState = this.dataAdapter && typeof this.dataAdapter.getRowState === 'function' ? this.dataAdapter.getRowState(rowId) : null;
      if (rowState === 'deleted' || rowState === 'createAndDeleted' || !!row._isDeleted) {
        return;
      }

      const colConfig = this.options.columns.find(c => c.key === colKey);
      if (!colConfig) return;
      if (colConfig.editable === false || colConfig.readOnly) return;

      const originalValue = row[colKey];
      const rowIndex = this.displayData.indexOf(row);
      const dataRow = row.id || row.__treeNodeId || rowIndex;

      // 1. onCellEditStart 이벤트 발생 (false 반환 시 편집 시작 취소)
      if (!this._emit('cellEditStart', originalValue, row, colKey, tdElement, rowIndex, dataRow)) {
        return;
      }

      // dataType 기반 기본 editType 자동 추론
      const editorOpts = colConfig.editor || {};
      const editorType = (editorOpts.type || colConfig.editType || '').toLowerCase();

      let editType = colConfig.editType;
      if (colConfig.editType) {
        editType = colConfig.editType;
      } else if (editorType === 'multicheck' || editorOpts.multiple || editorOpts.multiselect) {
        editType = 'multicheck';
      } else if (editorType === 'select' || editorType === 'dropdown' || editorType === 'list') {
        editType = 'select';
      } else if (editorType === 'autocomplete' || editorType === 'auto-complete' || editorType === 'search') {
        editType = 'autocomplete';
      } else if (editorType === 'textarea' || editorType === 'multiline') {
        editType = 'textarea';
      } else if (editorType === 'number' || editorType === 'numberspin' || editorType === 'number-spin' || editorType === 'spin') {
        editType = 'number';
      } else if (editorType === 'date' || editorType === 'datepicker' || editorType === 'date-picker' || editorType === 'datetime') {
        editType = 'date';
      } else if (colConfig.lookupTreeId || colConfig.lookupData || colConfig.values || colConfig.editOptions || editorOpts.options || editorOpts.values) {
        editType = 'select';
      } else {
        if (colConfig.dataType === 'number') editType = 'number';
        else if (colConfig.dataType === 'date' || colConfig.dataType === 'datetime') editType = 'date';
        else if (colConfig.dataType === 'boolean') editType = 'select';
        else editType = 'text';
      }

      const rect = tdElement.getBoundingClientRect();
      const cellH = Math.round(rect.height) || tdElement.offsetHeight || 38;

      this.editingCell = { rowId, colKey, tdElement, originalValue, colConfig, editType, cellH };
      tdElement.classList.add('editing');
      tdElement.style.padding = '0px';
      tdElement.style.margin = '0px';
      tdElement.style.height = cellH + 'px';
      tdElement.style.verticalAlign = 'top';
      tdElement.style.boxShadow = 'none';
      tdElement.innerHTML = '';

      let editorInput;

      if (editType === 'multicheck') {
        // 드롭다운 다중 선택 팝오버 컨테이너 생성
        const sep = editorOpts.itemSeparator || ',';
        const currentVals = Array.isArray(originalValue)
          ? originalValue.map(String)
          : (originalValue ? String(originalValue).split(sep).map(s => s.trim()) : []);
        const selectedSet = new Set(currentVals);

        let options = [];
        if (Array.isArray(editorOpts.values)) {
          options = editorOpts.values.map((v, idx) => ({ value: v, label: (editorOpts.labels && editorOpts.labels[idx]) || v }));
        } else if (Array.isArray(colConfig.values) && Array.isArray(colConfig.labels)) {
          options = colConfig.values.map((v, idx) => ({ value: v, label: colConfig.labels[idx] || v }));
        }

        editorInput = document.createElement('div');
        editorInput.className = 'luna-multicheck-editor-container';

        let itemsHtml = `
          <div class="luna-multicheck-panel">
            <div class="luna-multicheck-item">
              <input type="checkbox" id="mchk-all-${colKey}" class="luna-mchk-all" ${selectedSet.size === options.length ? 'checked' : ''}>
              <label for="mchk-all-${colKey}"><strong>(전체 선택)</strong></label>
            </div>
        `;

        options.forEach((opt, idx) => {
          const isChk = selectedSet.has(String(opt.value));
          itemsHtml += `
            <div class="luna-multicheck-item">
              <input type="checkbox" id="mchk-${colKey}-${idx}" class="luna-mchk-item" value="${this._escapeHtml(String(opt.value))}" ${isChk ? 'checked' : ''}>
              <label for="mchk-${colKey}-${idx}">${this._escapeHtml(String(opt.label))}</label>
            </div>
          `;
        });

        itemsHtml += `
            <div class="luna-multicheck-actions">
              <button type="button" class="luna-btn luna-btn-primary luna-btn-xs btn-mchk-apply">적용</button>
            </div>
          </div>
        `;

        editorInput.innerHTML = itemsHtml;

        // 전체 선택 토글 이벤트
        const chkAll = editorInput.querySelector('.luna-mchk-all');
        const itemChks = editorInput.querySelectorAll('.luna-mchk-item');
        if (chkAll) {
          chkAll.addEventListener('change', (e) => {
            itemChks.forEach(c => c.checked = e.target.checked);
          });
        }

        const applyBtn = editorInput.querySelector('.btn-mchk-apply');
        if (applyBtn) {
          applyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this._endCellEdit(true);
          });
        }
      } else if (editType === 'autocomplete') {
        editorInput = document.createElement('input');
        editorInput.type = 'text';
        editorInput.className = 'luna-inline-editor luna-editor-autocomplete';
        editorInput.value = originalValue ?? '';
        editorInput.placeholder = colConfig.placeHolder || colConfig.placeholder || editorOpts.placeHolder || '검색어 입력...';

        const datalistId = `luna-datalist-${colKey}-${Date.now()}`;
        const datalist = document.createElement('datalist');
        datalist.id = datalistId;
        const candidates = editorOpts.candidates || editorOpts.options || editorOpts.items || editorOpts.values || colConfig.values || [];
        candidates.forEach(cand => {
          const opt = document.createElement('option');
          opt.value = typeof cand === 'object' ? (cand.value || cand.label) : cand;
          datalist.appendChild(opt);
        });
        editorInput.setAttribute('list', datalistId);
        tdElement.appendChild(datalist);
      } else if (editType === 'select') {
        editorInput = document.createElement('select');
        editorInput.className = 'luna-inline-editor';

        let options = [];

        // 1. valuesCallback / labelsCallback 동적 콜백 평가
        const dynamicValues = typeof editorOpts.valuesCallback === 'function' ? editorOpts.valuesCallback(this, { row, colKey, originalValue, colConfig }) : (typeof colConfig.valuesCallback === 'function' ? colConfig.valuesCallback(this, { row, colKey, originalValue }) : null);
        const dynamicLabels = typeof editorOpts.labelsCallback === 'function' ? editorOpts.labelsCallback(this, { row, colKey, originalValue, colConfig }) : (typeof colConfig.labelsCallback === 'function' ? colConfig.labelsCallback(this, { row, colKey, originalValue }) : null);

        if (Array.isArray(dynamicValues)) {
          options = dynamicValues.map((v, idx) => ({ value: v, label: (dynamicLabels && dynamicLabels[idx]) || v }));
        } else if (colConfig.lookupTreeId) {
          options = this._getLookupOptions(colConfig, row);
        } else if (Array.isArray(editorOpts.options)) {
          options = editorOpts.options.map(opt => typeof opt === 'object' ? opt : { value: opt, label: opt });
        } else if (Array.isArray(editorOpts.values)) {
          options = editorOpts.values.map((v, idx) => ({ value: v, label: (editorOpts.labels && editorOpts.labels[idx]) || v }));
        } else if (Array.isArray(colConfig.options)) {
          options = colConfig.options.map(opt => typeof opt === 'object' ? opt : { value: opt, label: opt });
        } else if (Array.isArray(colConfig.values) && Array.isArray(colConfig.labels)) {
          options = colConfig.values.map((v, idx) => ({ value: v, label: colConfig.labels[idx] || v }));
        } else if (Array.isArray(colConfig.values)) {
          options = colConfig.values.map(v => ({ value: v, label: v }));
        } else if (colConfig.lookupData) {
          options = Object.keys(colConfig.lookupData).map(k => ({ value: k, label: colConfig.lookupData[k] }));
        } else if (Array.isArray(colConfig.lookupSource)) {
          options = colConfig.lookupSource;
        } else if (colConfig.editOptions) {
          options = colConfig.editOptions;
        } else if (colConfig.dataType === 'boolean') {
          options = [{ value: true, label: 'True (Y)' }, { value: false, label: 'False (N)' }];
        }

        if (!originalValue && originalValue !== false) {
          const defaultOpt = document.createElement('option');
          defaultOpt.value = '';
          defaultOpt.textContent = '-- 선택 --';
          editorInput.appendChild(defaultOpt);
        }

        options.forEach(opt => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const label = typeof opt === 'object' ? opt.label : opt;
          const optEl = document.createElement('option');
          optEl.value = val;
          optEl.textContent = label;
          if (String(val) === String(originalValue)) optEl.selected = true;
          editorInput.appendChild(optEl);
        });

        // commitOnSelect 설정 처리 (기본 true)
        if (editorOpts.commitOnSelect !== false) {
          editorInput.addEventListener('change', () => {
            setTimeout(() => {
              if (this.editingCell && this.editingCell.tdElement === tdElement) {
                this._endCellEdit(true);
              }
            }, 10);
          });
        }
      } else if (editType === 'textarea' || (colConfig.editor && colConfig.editor.type === 'multiline')) {
        editorInput = document.createElement('textarea');
        editorInput.className = 'luna-inline-editor luna-editor-textarea';
        editorInput.rows = (colConfig.editor && colConfig.editor.rows) || 3;
        editorInput.value = originalValue ?? '';
        editorInput.placeholder = colConfig.placeHolder || colConfig.placeholder || (colConfig.editor && colConfig.editor.placeHolder) || '';
      } else {
        editorInput = document.createElement('input');
        editorInput.type = editType === 'number' ? 'number' : (editType === 'date' ? 'date' : 'text');
        editorInput.className = 'luna-inline-editor';
        editorInput.value = originalValue ?? '';
        editorInput.placeholder = colConfig.placeHolder || colConfig.placeholder || (colConfig.editor && colConfig.editor.placeHolder) || '';
      }

      // LunaGrid Text, Number & Date Editor 옵션 적용 (maxLength, textCase, inputCharacters, min/maxDate, commitOnSelect)
      const isNumberEditor = editType === 'number' || editorOpts.type === 'number' || colConfig.dataType === 'number';
      const isDateEditor = editType === 'date' || editorOpts.type === 'date' || colConfig.dataType === 'date';

      if (isNumberEditor) {
        editorInput.type = 'number';
        if (editorOpts.min !== undefined) editorInput.min = editorOpts.min;
        else if (editorOpts.positiveOnly) editorInput.min = 0;

        if (editorOpts.max !== undefined) editorInput.max = editorOpts.max;
        if (editorOpts.step !== undefined) editorInput.step = editorOpts.step;
        else if (editorOpts.integerOnly) editorInput.step = 1;
      } else if (isDateEditor) {
        editorInput.type = 'date';
        const minD = editorOpts.minDate || editorOpts.min;
        const maxD = editorOpts.maxDate || editorOpts.max;
        if (minD) editorInput.min = minD;
        if (maxD) editorInput.max = maxD;

        if (editorOpts.commitOnSelect !== false) {
          editorInput.addEventListener('change', () => {
            setTimeout(() => {
              if (this.editingCell && this.editingCell.tdElement === tdElement) {
                this._endCellEdit(true);
              }
            }, 10);
          });
        }
      }

      if (editorOpts.maxLength) {
        editorInput.maxLength = editorOpts.maxLength;
      }
      if (editorOpts.textCase === 'upper') {
        editorInput.style.textTransform = 'uppercase';
      } else if (editorOpts.textCase === 'lower') {
        editorInput.style.textTransform = 'lowercase';
      }

      // inputCharacters / inputCharactersRegex 문자 입력 제한 처리
      if (editorOpts.inputCharacters || editorOpts.inputCharactersRegex) {
        editorInput.addEventListener('input', () => {
          if (editorOpts.inputCharactersRegex) {
            const regex = new RegExp(editorOpts.inputCharactersRegex, 'g');
            const matches = editorInput.value.match(regex);
            editorInput.value = matches ? matches.join('') : '';
          } else if (editorOpts.inputCharacters) {
            const regex = new RegExp(`[^${editorOpts.inputCharacters}]`, 'g');
            editorInput.value = editorInput.value.replace(regex, '');
          }
        });
      }

      // LunaGrid Mask Editor 실시간 입력 포맷팅 지원 (0: 숫자, A: 영문대문자, a: 영문소문자, *: 전체)
      const maskPattern = editorOpts.mask || colConfig.mask;
      if (editorOpts.type === 'mask' || maskPattern) {
        editorInput.addEventListener('input', () => {
          if (!maskPattern) return;
          const raw = editorInput.value.replace(/[^0-9a-zA-Z]/g, '');
          let formatted = '';
          let rawIdx = 0;

          for (let i = 0; i < maskPattern.length && rawIdx < raw.length; i++) {
            const mChar = maskPattern[i];
            if (mChar === '0' || mChar === '9') {
              if (/[0-9]/.test(raw[rawIdx])) formatted += raw[rawIdx++];
              else rawIdx++;
            } else if (mChar === 'A') {
              if (/[a-zA-Z]/.test(raw[rawIdx])) formatted += raw[rawIdx++].toUpperCase();
              else rawIdx++;
            } else if (mChar === 'a') {
              if (/[a-zA-Z]/.test(raw[rawIdx])) formatted += raw[rawIdx++].toLowerCase();
              else rawIdx++;
            } else if (mChar === '*') {
              formatted += raw[rawIdx++];
            } else {
              formatted += mChar;
            }
          }
          editorInput.value = formatted;
        });
      }

      // 컬럼 텍스트 정렬 및 스타일 상속
      if (editorInput && editorInput.style) {
        const textAlign = colConfig.align || (colConfig.dataType === 'number' || editType === 'number' ? 'right' : (colConfig.dataType === 'boolean' ? 'center' : ''));
        if (textAlign) editorInput.style.textAlign = textAlign;
      }

      // 편집 중인 컬럼 헤더 및 행 인디케이터 하이라이트 (이미지 매칭)
      if (this.theadEl) {
        const thList = this.theadEl.querySelectorAll(`th[data-col-key="${colKey}"], th[data-col-name="${colKey}"]`);
        thList.forEach(th => th.classList.add('luna-header-editing'));
      }
      const parentTr = tdElement.closest('tr');
      if (parentTr) {
        const indicatorTd = parentTr.querySelector('td.luna-col-indicator, td.luna-col-state, td:first-child');
        if (indicatorTd) indicatorTd.classList.add('luna-indicator-editing');
      }

      if (editorInput && editType !== 'textarea' && editType !== 'multicheck') {
        const h = cellH || tdElement.offsetHeight || 38;
        editorInput.style.display = 'block';
        editorInput.style.position = 'static';
        editorInput.style.width = '100%';
        editorInput.style.height = h + 'px';
        editorInput.style.minHeight = h + 'px';
        editorInput.style.maxHeight = h + 'px';
        editorInput.style.lineHeight = (h - 4) + 'px';
        editorInput.style.boxSizing = 'border-box';
        editorInput.style.margin = '0px';
        editorInput.style.border = '2px solid #ea580c';
        editorInput.style.borderRadius = '0px';
        editorInput.style.backgroundColor = '#ffffff';
        editorInput.style.outline = 'none';
        editorInput.style.boxShadow = 'none';
        if (editType === 'select') {
          editorInput.style.padding = '0 6px';
        } else {
          editorInput.style.padding = '0 8px';
        }
      }

      tdElement.appendChild(editorInput);
      editorInput.focus();
      if (editorInput.select && editType !== 'date') editorInput.select();

      const isMultiline = editType === 'textarea' || (editorOpts.type === 'multiline');

      editorInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          if (!isMultiline) {
            e.preventDefault();
            this._endCellEdit(true);
          } else {
            // Multiline Editor 엔터 제어
            const requireAlt = editorOpts.altEnter === true;
            const requireShift = editorOpts.shiftEnter === true;

            if (requireAlt || requireShift || editorOpts.commitOnEnter) {
              const isModifierPressed = (requireAlt && e.altKey) || (requireShift && e.shiftKey);
              if (isModifierPressed) {
                // 줄바꿈 삽입 (기본 textarea 동작 허용)
                return;
              } else if (!e.shiftKey && !e.altKey && !e.ctrlKey) {
                // 일반 엔터 입력 시 셀 커밋 완료
                e.preventDefault();
                this._endCellEdit(true);
              }
            }
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          this._endCellEdit(false);
        } else if (e.key === 'Tab') {
          e.preventDefault();
          this._endCellEdit(true);
          this._moveToNextEditableCell(tdElement, e.shiftKey);
        }
      });

      // 에디터 내부 클릭 시 상위 행/셀 클릭 이벤트로 전파되어 포커스가 튀거나 닫히는 현상 차단
      editorInput.addEventListener('click', (e) => e.stopPropagation());
      editorInput.addEventListener('mousedown', (e) => e.stopPropagation());
      editorInput.addEventListener('dblclick', (e) => e.stopPropagation());

      editorInput.addEventListener('blur', () => {
        setTimeout(() => {
          if (this.editingCell && this.editingCell.tdElement === tdElement) {
            // 포커스 이탈 시 셀만 안전하게 갱신(skipRender=true)하여 다른 셀 클릭 시 DOM 파괴 방지
            this._endCellEdit(true, true);
          }
        }, 120);
      });

      if (typeof this.options.onCellEditStart === 'function') {
        this.options.onCellEditStart(originalValue, row, colKey, tdElement);
      }
    }

    /**
     * [LunaGrid 100% 호환] 편집 중인 셀/행을 커밋(데이터 반영 및 유효성 검증)
     * LunaGrid Standard Architecture Specification
     * 
     * 규칙:
     * - 검사 결과의 error.level이 editOptions.commitLevel 이하(같거나 낮음)인 경우 유효성 검사를 통과한 것으로 간주하여 커밋을 완료합니다.
     * - error.level이 commitLevel보다 높은 경우 유효성 검사 실패로 판정하여 커밋이 차단됩니다(false 반환).
     * - force가 true이면 유효성 검사 에러 수준과 관계없이 강제로 커밋을 완료합니다.
     * 
     * @param {boolean} [force=true] - true: 유효성 검사 에러 레벨과 관계없이 강제 커밋, false: commitLevel을 초과하는 에러 발생 시 커밋 차단
     * @returns {boolean} 커밋 성공 여부 (성공 시 true, 검증 실패로 차단 시 false)
     */
    commit(force = true, skipRender = false) {
      if (!this.editingCell) return true;

      const { rowId, colKey, tdElement, originalValue, colConfig, editType } = this.editingCell;
      const row = this._findRowById(rowId);
      if (!row) {
        if (tdElement) tdElement.classList.remove('editing');
        this.editingCell = null;
        return true;
      }

      const editorInput = tdElement.querySelector('.luna-inline-editor');
      let newValue = originalValue;
      if (editType === 'multicheck') {
        const itemChks = tdElement.querySelectorAll('.luna-mchk-item:checked');
        const checkedVals = Array.from(itemChks).map(c => c.value);
        const sep = (colConfig.editor && colConfig.editor.itemSeparator) || ',';
        newValue = checkedVals.join(sep);
      } else if (editorInput) {
        newValue = editorInput.value;
      }

      // 텍스트 케이스 변환
      const editorOpts = colConfig.editor || {};
      if (editorOpts.textCase === 'upper' && typeof newValue === 'string') {
        newValue = newValue.toUpperCase();
      } else if (editorOpts.textCase === 'lower' && typeof newValue === 'string') {
        newValue = newValue.toLowerCase();
      }

      // Mask includeLiteral 처리 (false 설정 시 리터럴 기호 제거)
      const maskPattern = editorOpts.mask || colConfig.mask;
      if ((editorOpts.type === 'mask' || maskPattern) && editorOpts.includeLiteral === false && typeof newValue === 'string') {
        newValue = newValue.replace(/[^0-9a-zA-Z]/g, '');
      }

      // emptyValue 기본값 치환
      if (newValue === '' && editorOpts.emptyValue !== undefined) {
        newValue = editorOpts.emptyValue;
      }

      const isNumType = colConfig.dataType === 'number' || editType === 'number' || editorOpts.type === 'number';
      if (isNumType && newValue !== '' && newValue !== null && newValue !== undefined) {
        let num = Number(newValue);
        if (!isNaN(num)) {
          if (editorOpts.integerOnly) num = Math.round(num);
          if (editorOpts.positiveOnly && num < 0) num = 0;
          if (editorOpts.min !== undefined && num < editorOpts.min) num = editorOpts.min;
          if (editorOpts.max !== undefined && num > editorOpts.max) num = editorOpts.max;
          newValue = num;
        }
      } else if (colConfig.dataType === 'boolean') {
        newValue = (newValue === 'true' || newValue === true || newValue === 'Y');
      }

      const rowIndex = this.displayData.indexOf(row);
      const inserting = !!row._isNew;
      const dataRow = row.id || row.__treeNodeId || rowIndex;

      // 1. onEditCommit 이벤트 발생 (false 반환 시 커밋 차단 및 에디터 유지)
      if (!this._emit('editCommit', rowIndex, colKey, originalValue, newValue, dataRow)) {
        if (editorInput) editorInput.focus();
        return false;
      }

      // 2. 셀 단위 유효성 검사 수행
      const validationResult = this._validateCell(newValue, row, colConfig, rowIndex, inserting, dataRow);
      let rowErrors = this.validationErrors.get(rowId) || {};

      if (!validationResult.valid) {
        const errorLevel = validationResult.level || 'error';
        const commitAllowed = force || this._checkCommitLevel(errorLevel);

        if (!commitAllowed) {
          // 커밋 차단: 에러 기록 및 피드백 표시, 에디터 유지
          rowErrors[colKey] = validationResult.message;
          rowErrors[`${colKey}_level`] = errorLevel;
          this.validationErrors.set(rowId, rowErrors);

          if (typeof this.showToast === 'function') {
            this.showToast(validationResult.message, { type: errorLevel === 'warning' ? 'warning' : 'danger' });
          }
          if (editorInput) editorInput.focus();
          return false;
        }

        // commitLevel 이하인 경우 커밋 허용 (에러/경고 표시는 셀에 유지)
        rowErrors[colKey] = validationResult.message;
        rowErrors[`${colKey}_level`] = errorLevel;
      } else {
        delete rowErrors[colKey];
        delete rowErrors[`${colKey}_level`];
      }

      // 3. 값 저장 및 상호 연계 처리
      if (String(newValue) !== String(originalValue)) {
        this.setCellValue(rowId, colKey, newValue);

        // LookupTree 하위 컬럼 자동 초기화
        this.options.columns.forEach(childCol => {
          if (childCol.lookupParentKey === colKey) {
            this.setCellValue(rowId, childCol.key, '');
          }
        });

        // onCellEdited 및 onCellEditEnd 이벤트 발생
        this._emit('cellEdited', rowIndex, dataRow, colKey);
        this._emit('cellEditEnd', newValue, originalValue, row, colKey);

        if (typeof this.onEditCommit === 'function') {
          this.onEditCommit({ dataRow: rowIndex, itemIndex: rowIndex, rowId, colKey, fieldName: colKey }, originalValue, newValue);
        }
        if (typeof this.options.onEditCommit === 'function') {
          this.options.onEditCommit({ dataRow: rowIndex, itemIndex: rowIndex, rowId, colKey, fieldName: colKey }, originalValue, newValue);
        }
        if (typeof this.onCellEditEnd === 'function') {
          this.onCellEditEnd(newValue, originalValue, row, colKey);
        }
        if (typeof this.options.onCellEditEnd === 'function') {
          this.options.onCellEditEnd(newValue, originalValue, row, colKey);
        }
      }

      // 4. LunaGrid onValidateRow 및 rowValidations 행 단위 유효성 검사 실행
      const tempRowObj = Object.assign({}, row, { [colKey]: newValue });
      const onValidateRowFn = this.onValidateRow || this.options.onValidateRow;
      if (typeof onValidateRowFn === 'function') {
        const rowErr = onValidateRowFn(this, rowIndex, dataRow, inserting, tempRowObj);
        if (rowErr && typeof rowErr === 'object') {
          if (rowErr.fields && typeof rowErr.fields === 'object') {
            Object.keys(rowErr.fields).forEach(fKey => {
              rowErrors[fKey] = rowErr.fields[fKey];
              rowErrors[`${fKey}_level`] = rowErr.level || 'error';
            });
          } else if (rowErr.message || rowErr.level) {
            const errField = rowErr.fieldName || colKey;
            rowErrors[errField] = rowErr.message || '행 데이터 유효성 검사를 통과하지 못했습니다.';
            rowErrors[`${errField}_level`] = rowErr.level || 'error';
          }
        }
      }

      // 행 규칙 (rowValidations) 검사
      if (Array.isArray(this.rowValidations) && this.rowValidations.length > 0) {
        for (let rRule of this.rowValidations) {
          const mode = (rRule.mode || 'always').toLowerCase();
          if (mode === 'insert' && !inserting) continue;
          if (mode === 'update' && inserting) continue;

          const level = rRule.level || 'error';
          const msg = rRule.message || '행 데이터 유효성 검사 조건을 만족하지 못했습니다.';
          const fName = rRule.fieldName || (this.options.columns[0] && this.options.columns[0].key) || 'row';

          if (typeof rRule.criteria === 'string' && rRule.criteria) {
            try {
              const fn = new Function('values', 'row', 'grid', `with(values) { return (${rRule.criteria}); }`);
              const passed = fn(tempRowObj, tempRowObj, this);
              if (!passed) {
                rowErrors[fName] = msg;
                rowErrors[`${fName}_level`] = level;
              }
            } catch (err) {
              console.warn('[Row Validation Criteria Error]', err);
            }
          } else if (typeof rRule.validator === 'function') {
            const passed = rRule.validator(tempRowObj, this);
            if (!passed) {
              rowErrors[fName] = msg;
              rowErrors[`${fName}_level`] = level;
            }
          }
        }
      }

      if (Object.keys(rowErrors).length > 0) {
        this.validationErrors.set(rowId, rowErrors);
      } else {
        this.validationErrors.delete(rowId);
      }

      if (skipRender) {
        if (tdElement) {
          tdElement.classList.remove('editing');
          tdElement.style.padding = '';
          tdElement.style.margin = '';
          tdElement.style.position = '';
          tdElement.style.boxShadow = '';
          const displayVal = this._renderCellContent(colConfig, newValue, row);
          tdElement.innerHTML = displayVal;
          if (row._isDirty) tdElement.classList.add('dirty');
        }
        this._clearEditingHighlights();
        this.editingCell = null;
        return true;
      }

      if (tdElement) {
        tdElement.classList.remove('editing');
        tdElement.style.padding = '';
        tdElement.style.margin = '';
        tdElement.style.position = '';
        tdElement.style.boxShadow = '';
      }
      this._clearEditingHighlights();
      this.editingCell = null;
      this._renderBody();
      return true;
    }

    /**
     * 편집 중 적용된 헤더 및 인디케이터 하이라이트 클래스 정리
     */
    _clearEditingHighlights() {
      if (this.theadEl) {
        this.theadEl.querySelectorAll('.luna-header-editing').forEach(th => th.classList.remove('luna-header-editing'));
      }
      if (this.tbodyEl) {
        this.tbodyEl.querySelectorAll('.luna-indicator-editing').forEach(td => td.classList.remove('luna-indicator-editing'));
      }
    }

    /**
     * [LunaGrid 100% 호환] 현재 셀의 편집을 취소하고 원래 값으로 복원
     */
    cancel() {
      if (!this.editingCell) return;
      const { tdElement, colKey, rowId, originalValue, colConfig } = this.editingCell;
      const row = this._findRowById(rowId);
      this.editingCell = null;
      this._clearEditingHighlights();
      if (tdElement) {
        tdElement.classList.remove('editing');
        tdElement.style.padding = '';
        tdElement.style.margin = '';
        tdElement.style.position = '';
        tdElement.style.boxShadow = '';
        if (row && colConfig) {
          tdElement.innerHTML = this._renderCellContent(colConfig, originalValue, row);
        }
      }
      const rIdx = this.focusedCell ? this.focusedCell.rowIndex : -1;

      this._emit('cellEditCancel', rIdx, colKey);
      this._emit('editCanceled', rIdx);
    }

    /**
     * [LunaGrid 100% 호환] 셀 포커스 설정 및 포커스 이벤트 라이프사이클 처리 (_setCellFocus)
     * onCurrentChanging -> (포커스 이동) -> onCurrentChanged -> onCurrentRowChanged
     */
    _setCellFocus(rowIndex, colKey, rowId) {
      const oldIndex = this.getCurrent() || { itemIndex: -1, column: null, dataRow: -1, fieldName: null };
      const row = this.displayData[rowIndex];
      const dataRow = row ? (row.id || row.__treeNodeId || rowIndex) : rowIndex;
      const newIndex = { itemIndex: rowIndex, column: colKey, dataRow, fieldName: colKey };

      // 1. onCurrentChanging 이벤트 발생 (false 반환 시 포커스 이동 차단)
      if (!this._emit('currentChanging', oldIndex, newIndex)) {
        return false;
      }

      // UI 포커스 클래스 갱신
      if (this.tbodyEl) {
        this.tbodyEl.querySelectorAll('.focused-cell, .luna-cell-focused, .cell-focused').forEach(el => {
          el.classList.remove('focused-cell', 'luna-cell-focused', 'cell-focused');
        });
        this.tbodyEl.querySelectorAll('.focused-row, .luna-row-focused').forEach(el => {
          el.classList.remove('focused-row', 'luna-row-focused');
        });

        const tr = this.tbodyEl.querySelector(`tr[data-row-index="${rowIndex}"]`);
        if (tr) {
          tr.classList.add('focused-row', 'luna-row-focused');
          const td = tr.querySelector(`td[data-col-key="${colKey}"]`);
          if (td) td.classList.add('focused-cell', 'luna-cell-focused', 'cell-focused');
        }
      }

      // 범위 선택(Range Selection) 단일 셀 동기화 (기존 선택 영역 해제 후 새 셀로 전환)
      if (this.options.enableRangeSelection) {
        const visibleCols = this.options.columns.filter(c => !c.hidden && c.visible !== false);
        const cIdx = visibleCols.findIndex(c => (c.key || c.name) === colKey);
        if (cIdx !== -1) {
          this.selectedRange = { startRow: rowIndex, startCol: cIdx, endRow: rowIndex, endCol: cIdx };
          this._updateRangeSelectionUi();
        }
      }

      this.focusedCell = { rowIndex, colKey, rowId };

      // 2. onCurrentChanged 및 onCurrentRowChanged 이벤트 발생
      this._emit('currentChanged', newIndex);
      if (oldIndex.itemIndex !== rowIndex) {
        this._emit('currentRowChanged', oldIndex.itemIndex, rowIndex);
      }

      return true;
    }

    /**
     * [LunaGrid 100% 호환] 현재 그리드가 셀/행 편집 중인지 여부 반환
     * @returns {boolean}
     */
    isEditing() {
      return !!this.editingCell;
    }

    /**
     * [LunaGrid 100% 호환] EditOptions 편집 옵션 설정
     * LunaGrid Standard Architecture Specification
     * @param {Object} options - { commitLevel, commitByCell, commitWhenLeave, ... }
     */
    setEditOptions(options = {}) {
      this.editOptions = Object.assign(this.editOptions || {}, options);
      this.options.editOptions = Object.assign({}, this.editOptions);
    }

    /**
     * [LunaGrid 100% 호환] EditOptions 편집 옵션 조회
     * @returns {Object}
     */
    getEditOptions() {
      return Object.assign({}, this.editOptions);
    }

    /**
     * [LunaGrid 100% 호환] 행(Row) 단위 유효성 검사 규칙 설정
     * @param {Array<Object>} validations - [{ criteria, message, level, mode, fieldName }]
     */
    setValidations(validations = []) {
      this.rowValidations = Array.isArray(validations) ? [...validations] : [];
    }

    /**
     * [LunaGrid 100% 호환] 행 단위 유효성 검사 규칙 목록 조회
     * @returns {Array<Object>}
     */
    getValidations() {
      return [...this.rowValidations];
    }

    /**
     * 유효성 검사 에러 레벨이 현재 editOptions.commitLevel 기준을 통과(커밋 허용)하는지 판별
     * LunaGrid Standard Architecture Specification
     * 
     * 동작 원리:
     * 검사 결과의 error.level의 가중치가 commitLevel에 설정된 ValidationLevel의 가중치와 같거나 더 낮을 경우 커밋을 허용합니다.
     * 
     * @param {string} errorLevel - 'error' | 'warning' | 'info' | 'ignore'
     * @returns {boolean} true: 커밋 허용, false: 커밋 차단
     */
    _checkCommitLevel(errorLevel = 'error') {
      const currentCommitLevel = (this.editOptions && this.editOptions.commitLevel) || (this.options.editOptions && this.options.editOptions.commitLevel) || 'info';
      const errWeight = ValidationLevelWeight[String(errorLevel).toLowerCase()] || 40;
      const thresholdWeight = ValidationLevelWeight[String(currentCommitLevel).toLowerCase()] || 20;
      return errWeight <= thresholdWeight;
    }

    _endCellEdit(isCommit = true, skipRender = false) {
      if (!this.editingCell) return;
      if (!isCommit) {
        this.cancel();
        return;
      }
      // commitLevel 규칙에 따라 커밋 시도
      const success = this.commit(false, skipRender);
      if (!success) {
        // 커밋 실패 시(에러 레벨이 commitLevel 초과) 강제 커밋 옵션 또는 편집 상태 유지
        const commitWhenLeave = (this.editOptions && this.editOptions.commitWhenLeave !== false);
        if (commitWhenLeave) {
          this.commit(true, skipRender);
        }
      }
    }

    /**
     * 셀 유효성 검사 엔진 (_validateCell)
     * LunaGrid custom-column-validation (onValidateColumn, col.validations, criteria, mode, level, validateCallback) 완벽 지원
     */
    _validateCell(value, row, colConfig, rowIndex = 0, inserting = false, dataRow = null) {
      if (!colConfig) return { valid: true };

      // 1. 필수값(required) 검사
      if (colConfig.required && (value === '' || value === null || value === undefined)) {
        return { valid: false, level: 'error', message: `${colConfig.label || colConfig.key}은(는) 필수 입력 항목입니다.` };
      }

      // 2. dataType 기본 형식 검사
      if (value !== '' && value !== null && value !== undefined) {
        if (colConfig.dataType === 'number') {
          const num = Number(value);
          if (isNaN(num)) return { valid: false, level: 'error', message: '숫자 형식만 입력 가능합니다.' };
        } else if (colConfig.dataType === 'date') {
          if (isNaN(Date.parse(value))) return { valid: false, level: 'error', message: '올바른 날짜 형식(YYYY-MM-DD)이어야 합니다.' };
        }
      }

      // 3. LunaGrid EditValidation 규칙 배열 (col.validations)
      if (Array.isArray(colConfig.validations) && colConfig.validations.length > 0) {
        for (let vRule of colConfig.validations) {
          const mode = (vRule.mode || 'always').toLowerCase();
          if (mode === 'insert' && !inserting) continue;
          if (mode === 'update' && inserting) continue;

          const level = vRule.level || 'error';
          const msg = vRule.message || `${colConfig.label || colConfig.key}의 값이 유효하지 않습니다.`;

          if (typeof vRule.criteria === 'string' && vRule.criteria) {
            try {
              // LunaGrid criteria 표현식 평가 (예: "value > 0", "value.length >= 3", "value != null")
              const fn = new Function('value', 'row', 'grid', `return (${vRule.criteria});`);
              const passed = fn(value, row, this);
              if (!passed) {
                return { valid: false, level, message: msg };
              }
            } catch (err) {
              console.warn('[Validation Criteria Error]', err);
            }
          } else if (typeof vRule.validator === 'function') {
            const passed = vRule.validator(value, row, colConfig);
            if (!passed) {
              return { valid: false, level, message: msg };
            }
          }
        }
      }

      // 4. 개별 컬럼 커스텀 검증 콜백 (validateCallback / validator)
      const colValidator = colConfig.validateCallback || colConfig.validator;
      if (typeof colValidator === 'function') {
        const res = colValidator(this, colConfig, value, row, rowIndex);
        if (res) {
          if (typeof res === 'boolean' && !res) {
            return { valid: false, level: 'error', message: `${colConfig.label || colConfig.key}의 값이 유효하지 않습니다.` };
          } else if (typeof res === 'object') {
            if (res.valid === false || res.level || res.message) {
              return { valid: false, level: res.level || 'error', message: res.message || '유효하지 않은 값입니다.' };
            }
          }
        }
      }

      // 5. 그리드 전역 onValidateColumn 이벤트 핸들러 (LunaGrid onValidateColumn 스펙 완벽 지원)
      const onValidateColFn = this.onValidateColumn || this.options.onValidateColumn;
      if (typeof onValidateColFn === 'function') {
        const colParam = Object.assign({
          fieldName: colConfig.fieldName || colConfig.key,
          name: colConfig.name || colConfig.key,
          key: colConfig.key
        }, colConfig);
        const err = onValidateColFn(this, colParam, inserting, value, rowIndex, dataRow ?? rowIndex);
        if (err && typeof err === 'object' && (err.message || err.level)) {
          return {
            valid: false,
            level: err.level || 'error',
            message: err.message || `${colConfig.label || colConfig.key}의 값이 유효성 검사를 통과하지 못했습니다.`
          };
        }
      }

      return { valid: true };
    }

    /**
     * 특정 행의 전체 유효성 검사 수행 (validateRow)
     * LunaGrid onValidateRow, rowValidations 및 컬럼별 검증 스펙 완벽 지원
     * @param {string|number} rowIdOrIndex - 행 ID 또는 행 인덱스
     * @returns {Object} { valid: boolean, errors: Object, message: string }
     */
    validateRow(rowIdOrIndex) {
      let row = null;
      let rowIndex = -1;
      let rowId = null;

      if (typeof rowIdOrIndex === 'number' && this.displayData[rowIdOrIndex]) {
        rowIndex = rowIdOrIndex;
        row = this.displayData[rowIndex];
        rowId = this._getRowId(row, rowIndex);
      } else {
        rowId = String(rowIdOrIndex);
        row = this._findRowById(rowId);
        rowIndex = this.displayData.indexOf(row);
      }

      if (!row) return { valid: true, errors: {} };

      const inserting = !!row._isNew;
      const dataRow = row.id || row.__treeNodeId || rowIndex;
      let rowErrors = {};

      // 1. 모든 가시 컬럼 검증 수행
      this.options.columns.forEach(col => {
        const val = row[col.key];
        const res = this._validateCell(val, row, col, rowIndex, inserting, dataRow);
        if (!res.valid) {
          rowErrors[col.key] = res.message;
          if (res.level) rowErrors[`${col.key}_level`] = res.level;
        }
      });

      // 2. grid.setValidations 행 단위 유효성 검사 규칙 평가
      if (Array.isArray(this.rowValidations) && this.rowValidations.length > 0) {
        for (let rRule of this.rowValidations) {
          const mode = (rRule.mode || 'always').toLowerCase();
          if (mode === 'insert' && !inserting) continue;
          if (mode === 'update' && inserting) continue;

          const level = rRule.level || 'error';
          const msg = rRule.message || '행 데이터 유효성 검사 조건을 만족하지 못했습니다.';
          const fName = rRule.fieldName || (this.options.columns[0] && this.options.columns[0].key) || 'row';

          if (typeof rRule.criteria === 'string' && rRule.criteria) {
            try {
              const fn = new Function('values', 'row', 'grid', `with(values) { return (${rRule.criteria}); }`);
              const passed = fn(row, row, this);
              if (!passed) {
                rowErrors[fName] = msg;
                rowErrors[`${fName}_level`] = level;
              }
            } catch (err) {
              console.warn('[Row Validation Criteria Error]', err);
            }
          } else if (typeof rRule.validator === 'function') {
            const passed = rRule.validator(row, this);
            if (!passed) {
              rowErrors[fName] = msg;
              rowErrors[`${fName}_level`] = level;
            }
          }
        }
      }

      // 3. onValidateRow 행 단위 커스텀 검증 실행
      const onValidateRowFn = this.onValidateRow || this.options.onValidateRow;
      if (typeof onValidateRowFn === 'function') {
        const rowErr = onValidateRowFn(this, rowIndex, dataRow, inserting, Object.assign({}, row));
        if (rowErr && typeof rowErr === 'object') {
          if (rowErr.fields && typeof rowErr.fields === 'object') {
            Object.keys(rowErr.fields).forEach(fKey => {
              rowErrors[fKey] = rowErr.fields[fKey];
              rowErrors[`${fKey}_level`] = rowErr.level || 'error';
            });
          } else if (rowErr.message || rowErr.level) {
            const errField = rowErr.fieldName || (this.options.columns[0] && this.options.columns[0].key) || 'row';
            rowErrors[errField] = rowErr.message || '행 데이터 유효성 검사를 통과하지 못했습니다.';
            rowErrors[`${errField}_level`] = rowErr.level || 'error';
          }
        }
      }

      if (Object.keys(rowErrors).length > 0) {
        this.validationErrors.set(rowId, rowErrors);
        return { valid: false, errors: rowErrors, message: Object.values(rowErrors)[0] };
      } else {
        this.validationErrors.delete(rowId);
        return { valid: true, errors: {} };
      }
    }

    /**
     * [LunaGrid 100% 호환] 일괄 유효성 검사 (validateCells)
     * 로드된 데이터 또는 지정된 행들을 대상으로 일괄 유효성 검사를 수행하고 실패 셀 목록(InvalidCell[])을 반환합니다.
     * LunaGrid Standard Architecture Specification
     * LunaGrid Standard Architecture Specification
     * 
     * @param {Array<number>|null} [itemIndices=null] - 검사할 행 인덱스 배열 (null 또는 미지정 시 전체 행 검사)
     * @param {boolean} [showError=false] - true인 경우 첫 번째 오류 셀로 포커스 이동 및 알림 표시
     * @param {string|null} [levelThreshold=null] - 특정 심각도 이상만 필터링할 경우 지정 ('error' | 'warning' | 'info' | 'ignore')
     * @returns {Array<Object>} InvalidCell[] 검증에 실패한 셀 목록
     */
    validateCells(itemIndices = null, showError = false, levelThreshold = null) {
      const invalidCells = [];
      let targetIndices = [];

      if (Array.isArray(itemIndices) && itemIndices.length > 0) {
        targetIndices = itemIndices.filter(idx => idx >= 0 && idx < this.displayData.length);
      } else {
        targetIndices = this.displayData.map((_, idx) => idx);
      }

      const thresholdWeight = levelThreshold ? (ValidationLevelWeight[String(levelThreshold).toLowerCase()] || 0) : 0;

      targetIndices.forEach(rIdx => {
        const row = this.displayData[rIdx];
        if (!row) return;
        const rowId = this._getRowId(row, rIdx);
        const inserting = !!row._isNew;
        const dataRow = row.id || row.__treeNodeId || rIdx;
        let rowErrors = {};

        // 1. 컬럼 단위 유효성 검사
        this.options.columns.forEach(col => {
          if (col.hidden) return;
          const val = row[col.key];
          const res = this._validateCell(val, row, col, rIdx, inserting, dataRow);
          if (!res.valid) {
            const lvl = res.level || 'error';
            rowErrors[col.key] = res.message;
            rowErrors[`${col.key}_level`] = lvl;

            const lvlWeight = ValidationLevelWeight[String(lvl).toLowerCase()] || 40;
            if (!levelThreshold || lvlWeight >= thresholdWeight) {
              invalidCells.push({
                itemIndex: rIdx,
                dataRow: dataRow,
                fieldName: col.fieldName || col.key,
                column: col.fieldName || col.key,
                level: lvl,
                message: res.message,
                value: val
              });
            }
          }
        });

        // 2. grid.setValidations 행 단위 유효성 검사 규칙 평가
        if (Array.isArray(this.rowValidations) && this.rowValidations.length > 0) {
          for (let rRule of this.rowValidations) {
            const mode = (rRule.mode || 'always').toLowerCase();
            if (mode === 'insert' && !inserting) continue;
            if (mode === 'update' && inserting) continue;

            const lvl = rRule.level || 'error';
            const msg = rRule.message || '행 데이터 유효성 검사 조건을 만족하지 못했습니다.';
            const fName = rRule.fieldName || (this.options.columns[0] && this.options.columns[0].key) || 'row';

            let failed = false;
            if (typeof rRule.criteria === 'string' && rRule.criteria) {
              try {
                const fn = new Function('values', 'row', 'grid', `with(values) { return (${rRule.criteria}); }`);
                if (!fn(row, row, this)) failed = true;
              } catch (err) {
                console.warn('[Row Validation Criteria Error]', err);
              }
            } else if (typeof rRule.validator === 'function') {
              if (!rRule.validator(row, this)) failed = true;
            }

            if (failed) {
              rowErrors[fName] = msg;
              rowErrors[`${fName}_level`] = lvl;

              const lvlWeight = ValidationLevelWeight[String(lvl).toLowerCase()] || 40;
              if (!levelThreshold || lvlWeight >= thresholdWeight) {
                if (!invalidCells.some(ic => ic.itemIndex === rIdx && ic.column === fName)) {
                  invalidCells.push({
                    itemIndex: rIdx,
                    dataRow: dataRow,
                    fieldName: fName,
                    column: fName,
                    level: lvl,
                    message: msg,
                    value: row[fName]
                  });
                }
              }
            }
          }
        }

        // 3. 행 단위 유효성 검사 (onValidateRow 콜백)
        const onValidateRowFn = this.onValidateRow || this.options.onValidateRow;
        if (typeof onValidateRowFn === 'function') {
          const rowErr = onValidateRowFn(this, rIdx, dataRow, inserting, Object.assign({}, row));
          if (rowErr && typeof rowErr === 'object') {
            if (rowErr.fields && typeof rowErr.fields === 'object') {
              Object.keys(rowErr.fields).forEach(fKey => {
                rowErrors[fKey] = rowErr.fields[fKey];
                const lvl = rowErr.level || 'error';
                rowErrors[`${fKey}_level`] = lvl;

                const lvlWeight = ValidationLevelWeight[String(lvl).toLowerCase()] || 40;
                if (!levelThreshold || lvlWeight >= thresholdWeight) {
                  if (!invalidCells.some(ic => ic.itemIndex === rIdx && ic.column === fKey)) {
                    invalidCells.push({
                      itemIndex: rIdx,
                      dataRow: dataRow,
                      fieldName: fKey,
                      column: fKey,
                      level: lvl,
                      message: rowErr.fields[fKey],
                      value: row[fKey]
                    });
                  }
                }
              });
            } else if (rowErr.message || rowErr.level) {
              const errField = rowErr.fieldName || (this.options.columns[0] && this.options.columns[0].key) || 'row';
              rowErrors[errField] = rowErr.message || '행 데이터 유효성 검사를 통과하지 못했습니다.';
              const lvl = rowErr.level || 'error';
              rowErrors[`${errField}_level`] = lvl;

              const lvlWeight = ValidationLevelWeight[String(lvl).toLowerCase()] || 40;
              if (!levelThreshold || lvlWeight >= thresholdWeight) {
                if (!invalidCells.some(ic => ic.itemIndex === rIdx && ic.column === errField)) {
                  invalidCells.push({
                    itemIndex: rIdx,
                    dataRow: dataRow,
                    fieldName: errField,
                    column: errField,
                    level: lvl,
                    message: rowErr.message,
                    value: row[errField]
                  });
                }
              }
            }
          }
        }

        if (Object.keys(rowErrors).length > 0) {
          this.validationErrors.set(rowId, rowErrors);
        } else {
          this.validationErrors.delete(rowId);
        }
      });

      this._renderBody();

      // showError 옵션 처리
      if (showError && invalidCells.length > 0) {
        const first = invalidCells[0];
        this.setCurrent({ itemIndex: first.itemIndex, column: first.column });
        if (typeof this.showToast === 'function') {
          this.showToast(first.message, { type: first.level === 'warning' ? 'warning' : 'danger' });
        }
      }

      return invalidCells;
    }

    /**
     * [LunaGrid 100% 호환] 현재 유효성 검사 실패 셀 목록 조회 (getInvalidCells)
     * validateCells() 또는 셀 편집 후 기록된 검증 실패 셀 목록(InvalidCell[])을 반환합니다.
     * @returns {Array<Object>} InvalidCell[]
     */
    getInvalidCells() {
      const invalidCells = [];
      this.displayData.forEach((row, rIdx) => {
        const rowId = this._getRowId(row, rIdx);
        const errors = this.validationErrors.get(rowId);
        if (!errors) return;

        const dataRow = row.id || row.__treeNodeId || rIdx;
        Object.keys(errors).forEach(key => {
          if (key.endsWith('_level')) return;
          const col = this.options.columns.find(c => c.key === key || c.fieldName === key);
          const colName = col ? (col.fieldName || col.key) : key;
          const level = errors[`${key}_level`] || 'error';
          invalidCells.push({
            itemIndex: rIdx,
            dataRow: dataRow,
            fieldName: colName,
            column: colName,
            level: level,
            message: errors[key],
            value: row[key]
          });
        });
      });
      return invalidCells;
    }

    /**
     * [LunaGrid 100% 호환] 유효성 검사 실패 목록 초기화 (clearInvalidCells)
     * 검증에 실패한 모든 셀 정보를 초기화하고 화면 에러 UI를 제거합니다.
     */
    clearInvalidCells() {
      this.validationErrors.clear();
      this._renderBody();
    }

    /**
     * 특정 행의 유효성 검사 실패 목록 조회 (getInvalidCellsOfRow)
     * @param {number|string} itemIndexOrDataRow
     * @returns {Array<Object>} InvalidCell[]
     */
    getInvalidCellsOfRow(itemIndexOrDataRow) {
      let rIdx = -1;
      let row = null;
      if (typeof itemIndexOrDataRow === 'number' && this.displayData[itemIndexOrDataRow]) {
        rIdx = itemIndexOrDataRow;
        row = this.displayData[rIdx];
      } else {
        row = this._findRowById(String(itemIndexOrDataRow));
        rIdx = this.displayData.indexOf(row);
      }
      if (!row || rIdx === -1) return [];

      const rowId = this._getRowId(row, rIdx);
      const errors = this.validationErrors.get(rowId);
      if (!errors) return [];

      const dataRow = row.id || row.__treeNodeId || rIdx;
      const invalidList = [];
      Object.keys(errors).forEach(key => {
        if (key.endsWith('_level')) return;
        const col = this.options.columns.find(c => c.key === key || c.fieldName === key);
        const colName = col ? (col.fieldName || col.key) : key;
        const level = errors[`${key}_level`] || 'error';
        invalidList.push({
          itemIndex: rIdx,
          dataRow: dataRow,
          fieldName: colName,
          column: colName,
          level: level,
          message: errors[key],
          value: row[key]
        });
      });
      return invalidList;
    }

    /**
     * 특정 행의 유효성 검사 실패 정보 초기화 (clearInvalidCellsOfRow)
     * @param {number|string} itemIndexOrDataRow
     */
    clearInvalidCellsOfRow(itemIndexOrDataRow) {
      let row = null;
      let rIdx = -1;
      if (typeof itemIndexOrDataRow === 'number' && this.displayData[itemIndexOrDataRow]) {
        rIdx = itemIndexOrDataRow;
        row = this.displayData[rIdx];
      } else {
        row = this._findRowById(String(itemIndexOrDataRow));
        rIdx = this.displayData.indexOf(row);
      }
      if (!row) return;

      const rowId = this._getRowId(row, rIdx);
      this.validationErrors.delete(rowId);
      this._renderBody();
    }

    /**
     * LunaGrid 호환 포커스 셀 설정 (setCurrent)
     * @param {Object} current - { itemIndex: number, column: string|number, dataRow?: number }
     */
    setCurrent(current) {
      if (!current || typeof current !== 'object') return;
      let rIdx = current.itemIndex;
      if (rIdx === undefined && current.dataRow !== undefined) {
        rIdx = current.dataRow;
      }
      if (rIdx === undefined || rIdx < 0 || rIdx >= this.displayData.length) return;

      const row = this.displayData[rIdx];
      const rowId = this._getRowId(row, rIdx);
      let colKey = current.column;
      if (typeof colKey === 'number') {
        const visibleCols = this.options.columns.filter(c => !c.hidden);
        colKey = visibleCols[colKey] ? visibleCols[colKey].key : null;
      } else if (typeof colKey === 'string') {
        const col = this.options.columns.find(c => c.key === colKey || c.fieldName === colKey || c.name === colKey);
        if (col) colKey = col.key;
      }

      if (!colKey && this.options.columns.length > 0) {
        colKey = this.options.columns[0].key;
      }

      this._setCellFocus(rIdx, colKey, rowId);

      // 해당 셀로 스크롤 이동
      const tr = this.tbodyEl.querySelector(`tr[data-row-index="${rIdx}"]`);
      if (tr) {
        const td = tr.querySelector(`td[data-col-key="${colKey}"]`);
        if (td && typeof td.scrollIntoView === 'function') {
          td.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
      }
    }

    /**
     * LunaGrid 호환 현재 포커스 셀 조회 (getCurrent)
     * @returns {Object|null} { itemIndex, column, fieldName, dataRow }
     */
    getCurrent() {
      if (!this.focusedCell) return null;
      const { rowIndex, colKey, rowId } = this.focusedCell;
      const row = this.displayData[rowIndex];
      const dataRow = row ? (row.id || row.__treeNodeId || rowIndex) : rowIndex;
      return {
        itemIndex: rowIndex,
        dataRow: dataRow,
        column: colKey,
        fieldName: colKey
      };
    }

    /**
     * 그리드 전체 행 유효성 검사 수행 (validateAll / validateRows)
     * @returns {Array<Object>} 오류가 발생한 행들의 목록
     */
    validateAll() {
      const invalidRows = [];
      this.displayData.forEach((row, rIdx) => {
        const rowId = this._getRowId(row, rIdx);
        const res = this.validateRow(rIdx);
        if (!res.valid) {
          const firstErrMsg = Object.values(res.errors).find(v => typeof v === 'string' && v !== 'error' && v !== 'warning' && v !== 'info') || '유효성 검증 오류';
          invalidRows.push({
            rowIndex: rIdx,
            dataRow: rowId,
            rowId,
            errors: res.errors,
            message: firstErrMsg,
            row: Object.assign({}, row)
          });
        }
      });
      this._renderBody();
      return invalidRows;
    }

    validateRows() {
      return this.validateAll();
    }

    _moveToNextEditableCell(currentTd, isShift) {
      const allEditable = Array.from(this.tbodyEl.querySelectorAll('td.editable'));
      const idx = allEditable.indexOf(currentTd);
      if (idx === -1) return;

      const nextIdx = isShift ? idx - 1 : idx + 1;
      if (nextIdx >= 0 && nextIdx < allEditable.length) {
        const nextTd = allEditable[nextIdx];
        const nextTr = nextTd.closest('tr');
        const rowId = nextTr.getAttribute('data-row-id');
        const colKey = nextTd.getAttribute('data-col-key');
        setTimeout(() => this._startCellEdit(nextTd, rowId, colKey), 10);
      }
    }

    // =========================================================================
    // 엑셀 스타일 고유값 체크박스 필터 팝오버
    // =========================================================================

    _openColumnFilterPopover(iconEl, colKey) {
      if (this._activeFilterPopover) {
        const isSame = this._activeFilterPopoverCol === colKey;
        this._closeFilterPopover();
        if (isSame) return;
      }

      const th = iconEl.closest('th');
      const popover = document.createElement('div');
      popover.className = 'luna-filter-popover';

      // 팝오버 내부 클릭/마우스다운 시 상위 th 정렬 및 문서 전역 클릭 전파 완전 차단
      popover.addEventListener('click', (e) => e.stopPropagation());
      popover.addEventListener('mousedown', (e) => e.stopPropagation());
      popover.addEventListener('dblclick', (e) => e.stopPropagation());

      // 1. 해당 컬럼의 고유값 추출 (automating.filteredDataOnly 및 selectorDataOrder 지원)
      const automating = (this.filteringOptions && this.filteringOptions.automating) || {};
      const selectorDataOrder = automating.selectorDataOrder || 'selectionExcludeCurrent';
      const isFilteredOnly = automating.filteredDataOnly || selectorDataOrder === 'selectionExcludeCurrent';

      let sourceData = this.currentData;

      if (isFilteredOnly) {
        // selectionExcludeCurrent: 현재 컬럼을 제외한 나머지 필터 적용 데이터셋 기준
        const otherFilterKeys = Object.keys(this.columnFilters).filter(k => k !== colKey);
        if (otherFilterKeys.length > 0) {
          sourceData = this.currentData.filter(row => {
            return otherFilterKeys.every(k => {
              const rule = this.columnFilters[k];
              const col = this.options.columns.find(c => c.key === k || c.name === k);
              return this._evaluateFilterRule(rule, row, k, col);
            });
          });
        }
      }

      const colObj = this.options.columns.find(c => c.key === colKey || c.name === colKey);
      const isLookupDisplay = automating.lookupDisplay !== false && colObj && colObj.lookupDisplay;

      const allUniqueValues = Array.from(new Set(sourceData.map(r => {
        if (isLookupDisplay && (colObj.values || colObj.lookupData || colObj.lookupTreeId)) {
          return this._renderCellContent(colObj, r[colKey], r);
        }
        return String(r[colKey] ?? '');
      }))).sort();

      const currentSelected = Array.isArray(this.columnFilters[colKey]) ? new Set(this.columnFilters[colKey]) : null;

      let checkListHtml = `
        <div class="luna-filter-check-item">
          <input type="checkbox" id="chk-all-${colKey}" class="luna-filter-check-all" ${!currentSelected ? 'checked' : ''}>
          <label for="chk-all-${colKey}"><strong>${this._escapeHtml(this.getMessage('filterAll', '(전체 선택)'))}</strong></label>
        </div>
      `;

      allUniqueValues.forEach((val, idx) => {
        const isChecked = !currentSelected || currentSelected.has(val);
        checkListHtml += `
          <div class="luna-filter-check-item">
            <input type="checkbox" id="chk-${colKey}-${idx}" class="luna-filter-val-item" value="${this._escapeHtml(val)}" ${isChecked ? 'checked' : ''}>
            <label for="chk-${colKey}-${idx}">${this._escapeHtml(val || '(빈값)')}</label>
          </div>
        `;
      });

      const searchPlaceholder = this.getMessage('filterSearchPlaceholder', '항목 검색...');
      const applyBtnText = this.getMessage('filterApply', '적용');
      const clearBtnText = this.getMessage('filterClear', '초기화');

      popover.innerHTML = `
        <div style="font-weight:600; font-size:12px; margin-bottom:6px; color:var(--luna-text-header);">
          [${this._escapeHtml(colObj ? (colObj.label || colObj.key) : colKey)}] ${this._escapeHtml(this.getMessage('filterTitle', '고유값 필터'))}
        </div>
        <div class="luna-filter-search-box">
          <input type="text" class="luna-col-filter-input" placeholder="${this._escapeHtml(searchPlaceholder)}" style="width:100%;">
        </div>
        <div class="luna-filter-checklist">
          ${checkListHtml}
        </div>
        <div class="luna-filter-actions" style="margin-top:8px;">
          <button type="button" class="luna-btn luna-col-filter-clear">${this._escapeHtml(clearBtnText)}</button>
          <button type="button" class="luna-btn luna-btn-primary luna-col-filter-apply">${this._escapeHtml(applyBtnText)}</button>
        </div>
      `;

      th.appendChild(popover);
      this._activeFilterPopover = popover;
      this._activeFilterPopoverCol = colKey;

      const searchInput = popover.querySelector('.luna-col-filter-input');
      const checkAll = popover.querySelector('.luna-filter-check-all');
      const itemChecks = popover.querySelectorAll('.luna-filter-val-item');

      // 실시간 항목 필터링
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        popover.querySelectorAll('.luna-filter-val-item').forEach(chk => {
          const label = chk.nextElementSibling.textContent.toLowerCase();
          chk.closest('.luna-filter-check-item').style.display = label.includes(query) ? 'flex' : 'none';
        });
      });

      checkAll.addEventListener('change', (e) => {
        itemChecks.forEach(chk => chk.checked = e.target.checked);
      });

      popover.querySelector('.luna-col-filter-apply').addEventListener('click', (e) => {
        e.stopPropagation();
        const selectedVals = Array.from(itemChecks).filter(c => c.checked).map(c => c.value);
        if (selectedVals.length === allUniqueValues.length) {
          delete this.columnFilters[colKey];
        } else {
          this.columnFilters[colKey] = selectedVals;
        }
        this._closeFilterPopover();
        this._renderHeader();
        this.currentPage = 1;
        this._applyFilterAndSort();
        this._triggerAutoSavePersonalization();
      });

      popover.querySelector('.luna-col-filter-clear').addEventListener('click', (e) => {
        e.stopPropagation();
        delete this.columnFilters[colKey];
        this._closeFilterPopover();
        this._renderHeader();
        this.currentPage = 1;
        this._applyFilterAndSort();
        this._triggerAutoSavePersonalization();
      });
    }

    _closeFilterPopover() {
      if (this._activeFilterPopover) {
        this._activeFilterPopover.remove();
        this._activeFilterPopover = null;
        this._activeFilterPopoverCol = null;
      }
    }

    clearAllFilters() {
      this.columnFilters = {};
      this.searchQuery = '';
      if (this.toolbarEl) {
        const input = this.toolbarEl.querySelector('.luna-search-input');
        if (input) input.value = '';
      }
      this._renderHeader();
      this.currentPage = 1;
      this._applyFilterAndSort();
      this.showToast('🔍 모든 필터가 초기화되었습니다.');
    }

    // =========================================================================
    // 정렬 (Multi-Column Sorting) & 필터링
    // =========================================================================

    sort(colKey, direction = null, isShift = false) {
      if (!colKey) return;
      if (this.sortingOptions && this.sortingOptions.enabled === false) return;

      const style = (this.sortingOptions && this.sortingOptions.style) || 'inclusive';
      if (style === 'none') return;

      const col = this.options.columns.find(c => c.key === colKey || c.name === colKey);
      if (col && col.sortable === false) return;

      // 1. onSorting 이벤트 발생 (false 반환 시 정렬 취소)
      if (!this._emit('sorting', colKey, direction, isShift)) return;

      const existingIdx = this.sortRules.findIndex(r => r.key === colKey);

      if (style === 'exclusive' || (!isShift && style !== 'inclusive')) {
        // 단일 정렬 (마지막 클릭 컬럼 기준)
        if (existingIdx !== -1) {
          const currentDir = this.sortRules[existingIdx].dir;
          const nextDir = direction || (currentDir === 'asc' ? 'desc' : 'asc');
          this.sortRules = [{ key: colKey, dir: nextDir }];
        } else {
          this.sortRules = [{ key: colKey, dir: direction || 'asc' }];
        }
      } else if (style === 'reverse') {
        // Reverse: 마지막으로 클릭한 컬럼을 최우선 순위로 앞에 삽입
        if (existingIdx !== -1) {
          const rule = this.sortRules.splice(existingIdx, 1)[0];
          rule.dir = direction || (rule.dir === 'asc' ? 'desc' : 'asc');
          this.sortRules.unshift(rule);
        } else {
          this.sortRules.unshift({ key: colKey, dir: direction || 'asc' });
        }
      } else {
        // Inclusive (기본): 처음 클릭한 컬럼 우선 순서대로 누적 다중 정렬
        if (existingIdx !== -1) {
          const rule = this.sortRules[existingIdx];
          if (rule.dir === 'asc') {
            rule.dir = 'desc';
          } else {
            this.sortRules.splice(existingIdx, 1); // 3회 클릭 시 해당 컬럼 정렬 해제
          }
        } else {
          this.sortRules.push({ key: colKey, dir: direction || 'asc' });
        }
      }

      this._renderHeader();
      this._applyFilterAndSort();
      this._emit('sorted', colKey, direction, isShift);
    }

    _evaluateFilterRule(rule, row, colKey, col) {
      const rawVal = row[colKey];

      // 1. 단순 값 배열 (고유값 필터)
      if (Array.isArray(rule)) {
        if (rule.length === 0) return true;
        // 1-1. 문자열/원시값 배열
        if (typeof rule[0] !== 'object') {
          return rule.some(r => String(r) === String(rawVal ?? ''));
        }
        // 1-2. 필터 객체 배열 [{ name, criteria, callback, active, hidden }]
        const activeFilters = rule.filter(f => f.active !== false && !f.hidden);
        if (activeFilters.length === 0) return true;
        return activeFilters.some(f => this._evaluateSingleFilter(f, row, colKey, col, rawVal));
      }

      // 2. 단일 필터 객체
      if (typeof rule === 'object' && rule !== null) {
        return this._evaluateSingleFilter(rule, row, colKey, col, rawVal);
      }

      // 3. 단순 문자열 검색
      if (typeof rule === 'string') {
        return String(rawVal ?? '').toLowerCase().includes(rule.toLowerCase());
      }

      return true;
    }

    _evaluateSingleFilter(filterObj, row, colKey, col, value) {
      if (typeof filterObj.callback === 'function') {
        return Boolean(filterObj.callback(this.dataAdapter, row.id, colKey, filterObj, value));
      }

      if (filterObj.criteria) {
        try {
          const valNum = Number(value);
          const isNum = !isNaN(valNum) && value !== '' && value !== null;
          let expr = filterObj.criteria
            .replace(/\band\b/gi, '&&')
            .replace(/\bor\b/gi, '||')
            .replace(/month\(value\)/gi, value ? `(new Date('${value}').getMonth() + 1)` : '0');

          if (isNum) {
            expr = expr.replace(/\bvalue\b/gi, valNum);
          } else {
            expr = expr.replace(/\bvalue\b/gi, JSON.stringify(String(value ?? '')));
          }
          // 안전한 비교 연산자 치환
          expr = expr.replace(/(?<![!=><])=(?![=])/g, '===');

          return Boolean(Function(`"use strict"; return (${expr});`)());
        } catch (e) {
          console.warn('[LunaGrid] 필터 criteria 평가 실패:', filterObj.criteria, e);
          return true;
        }
      }

      if (filterObj.name !== undefined || filterObj.value !== undefined) {
        const target = filterObj.value !== undefined ? filterObj.value : filterObj.name;
        return String(target) === String(value ?? '');
      }

      return true;
    }

    _applyFilterAndSort() {
      const hasSearch = !!this.searchQuery;
      const filterKeys = Object.keys(this.columnFilters);
      const hasColFilters = filterKeys.length > 0;

      const searchableKeys = this.options.columns
        .filter(c => !c.hidden && c.searchable !== false)
        .map(c => c.key);

      this.filteredData = this.currentData.filter(row => {
        if (hasSearch) {
          const match = searchableKeys.some(key => {
            const val = row[key];
            return val !== null && val !== undefined && String(val).toLowerCase().includes(this.searchQuery);
          });
          if (!match) return false;
        }

        if (hasColFilters) {
          for (let key of filterKeys) {
            const rule = this.columnFilters[key];
            const col = this.options.columns.find(c => c.key === key || c.name === key);
            if (!this._evaluateFilterRule(rule, row, key, col)) {
              return false;
            }
          }
        }

        return true;
      });

      // 다중 정렬 수행
      if (this.sortRules.length > 0) {
        this.filteredData.sort((a, b) => {
          for (let rule of this.sortRules) {
            const key = rule.key;
            const dir = rule.dir === 'asc' ? 1 : -1;
            const col = this.options.columns.find(c => c.key === key) || {};
            let valA = a[key];
            let valB = b[key];

            if (valA === valB) continue;
            if (valA === null || valA === undefined) return 1;
            if (valB === null || valB === undefined) return -1;

            if (col.dataType === 'number' || (typeof valA === 'number' && typeof valB === 'number')) {
              return (Number(valA) - Number(valB)) * dir;
            }

            if (col.dataType === 'date' || col.dataType === 'datetime') {
              const timeA = new Date(valA).getTime() || 0;
              const timeB = new Date(valB).getTime() || 0;
              return (timeA - timeB) * dir;
            }

            if (col.dataType === 'boolean') {
              return ((valA ? 1 : 0) - (valB ? 1 : 0)) * dir;
            }

            const cmp = String(valA).localeCompare(String(valB), undefined, { numeric: true });
            if (cmp !== 0) return cmp * dir;
          }
          return 0;
        });
      }

      this._updateDisplayData();
    }

    _updateDisplayData() {
      const isPaging = (this.pagingOptions && this.pagingOptions.enabled) || this.options.pageable;
      const pageSize = (this.pagingOptions && this.pagingOptions.enabled) ? this.pagingOptions.size : this.pageSize;
      const curPage = (this.pagingOptions && this.pagingOptions.enabled) ? this.pagingOptions.page : (this.currentPage - 1);

      if (!isPaging) {
        this.displayData = [...this.filteredData];
      } else {
        const start = curPage * pageSize;
        const end = start + pageSize;
        this.displayData = this.filteredData.slice(start, end);
      }

      this._renderBody();
      this._renderFooter();
      this._updateToolbarInfo();
    }

    _updateToolbarInfo() {
      if (!this.toolbarEl) return;
      const infoContainer = this.toolbarEl.querySelector('.luna-toolbar-grid-info');
      const totalCount = this.filteredData ? this.filteredData.length : 0;
      const pageSize = Math.max(1, (this.pagingOptions && this.pagingOptions.enabled) ? this.pagingOptions.size : (this.pageSize || this.options.pageSize || 10));
      const curPage = Math.max(1, (this.pagingOptions && this.pagingOptions.enabled) ? (this.pagingOptions.page + 1) : (this.currentPage || 1));
      const startItem = totalCount === 0 ? 0 : (curPage - 1) * pageSize + 1;
      const endItem = Math.min(curPage * pageSize, totalCount);

      const totalLabel = this.getMessage('totalCount', '전체');
      const itemsLabel = this.getMessage('items', '건');
      const showingLabel = this.getMessage('showingItems', '표시');

      if (infoContainer) {
        const spanEl = infoContainer.querySelector('span');
        if (spanEl) {
          spanEl.innerHTML = `Total <strong>${totalCount.toLocaleString()}</strong> (${startItem} - ${endItem})`;
        }
        const selectEl = infoContainer.querySelector('.luna-page-size-select');
        if (selectEl) {
          selectEl.value = String(pageSize);
        }
      }
    }

    /**
     * 행 드래그 앤 드롭 옵션 설정 (setRowDragOptions)
     */
    setRowDragOptions(options = {}) {
      this.rowDragOptions = Object.assign(this.rowDragOptions || {}, options);
      this._renderBody();
    }

    /**
     * 페이징 설정 (setPaging) - LunaGrid 표준 시그니처 지원
     * @param {boolean} paging - 페이징 활성화 여부
     * @param {number} size - 페이지당 행 수
     * @param {number} [maxCount=0] - 최대 행 수
     */
    setPaging(paging = true, size = 10, maxCount = 0) {
      this.pagingOptions = Object.assign(this.pagingOptions || {}, {
        enabled: Boolean(paging),
        size: Math.max(1, parseInt(size, 10) || 10),
        page: 0,
        maxCount: parseInt(maxCount, 10) || 0
      });
      this.options.pageable = Boolean(paging);
      this.pageSize = this.pagingOptions.size;
      this.currentPage = 1;
      this._updateDisplayData();
      if (typeof this.onPageCountChanged === 'function') {
        this.onPageCountChanged(this, this.getPageCount());
      }
    }

    /**
     * 페이징 옵션 동적 설정 (setPagingOptions)
     * @param {Object} options - { enabled, size, page, align: 'left'|'center'|'right', position: 'left'|'center'|'right' }
     */
    setPagingOptions(options = {}) {
      if (!this.pagingOptions) this.pagingOptions = {};
      Object.assign(this.pagingOptions, options);
      if (options.align || options.position) {
        this.options.pagingAlign = options.align || options.position;
      }
      if (options.enabled !== undefined) {
        this.options.pageable = Boolean(options.enabled);
      }
      if (options.size) {
        this.pageSize = Math.max(1, parseInt(options.size, 10) || 10);
      }
      this._updateDisplayData();
      this._renderFooter();
    }

    /**
     * 페이징 위치/정렬 설정 (setPagingAlign / setPagingPosition)
     * @param {'left'|'center'|'right'} align - 페이징 위치 ('left' | 'center' | 'right')
     */
    setPagingAlign(align = 'right') {
      this.setPagingOptions({ align });
    }

    setPagingPosition(position = 'right') {
      this.setPagingOptions({ align: position });
    }

    /**
     * 페이징 옵션 조회 (getPagingOptions)
     */
    getPagingOptions() {
      return Object.assign({
        align: (this.pagingOptions && (this.pagingOptions.align || this.pagingOptions.position)) || this.options.pagingAlign || 'right'
      }, this.pagingOptions || {});
    }

    /**
     * 특정 페이지로 이동 (setPage)
     * @param {number} pageNumber - 페이지 번호 (1-based 또는 0-based)
     */
    setPage(pageNumber) {
      const totalPages = this.getPageCount();
      let target0Based = pageNumber;
      if (pageNumber >= 1) {
        target0Based = pageNumber - 1;
      }
      target0Based = Math.max(0, Math.min(target0Based, Math.max(0, totalPages - 1)));

      if (typeof this.onPageChanging === 'function') {
        const allow = this.onPageChanging(this, target0Based);
        if (allow === false) return;
      }

      if (this.pagingOptions) {
        this.pagingOptions.page = target0Based;
      }
      this.currentPage = target0Based + 1;
      this._updateDisplayData();

      if (typeof this.onPageChanged === 'function') {
        this.onPageChanged(this, target0Based);
      }
    }

    /**
     * 현재 페이지 번호 반환 (0-based)
     */
    getPage() {
      return (this.pagingOptions && this.pagingOptions.enabled) ? this.pagingOptions.page : (this.currentPage - 1);
    }

    /**
     * 전체 페이지 개수 반환
     */
    getPageCount() {
      const size = (this.pagingOptions && this.pagingOptions.enabled) ? this.pagingOptions.size : (this.pageSize || this.options.pageSize || 10);
      if (!size) return 1;
      const totalCount = this.filteredData ? this.filteredData.length : 0;
      return Math.max(1, Math.ceil(totalCount / size));
    }

    /**
     * 페이지 크기 동적 변경 (setPageSize)
     * @param {number} size - 페이지당 표시할 행 개수
     */
    setPageSize(size) {
      const parsedSize = Math.max(1, parseInt(size, 10) || 10);
      this.pageSize = parsedSize;
      this.options.pageSize = parsedSize;
      if (this.pagingOptions) {
        this.pagingOptions.size = parsedSize;
        this.pagingOptions.page = 0;
      }
      this.currentPage = 1;
      this._updateDisplayData();
      if (typeof this.onPageCountChanged === 'function') {
        this.onPageCountChanged(this, this.getPageCount());
      }
      if (typeof this.onPageSizeChanged === 'function') {
        this.onPageSizeChanged(this, parsedSize);
      }
    }

    /**
     * 행 이동 API (moveRow)
     */
    moveRow(fromIndex, toIndex) {
      return this.dataAdapter.moveRow(fromIndex, toIndex);
    }

    /**
     * 다중 행 이동 API (moveRows)
     */
    moveRows(row, count, newRow) {
      return this.dataAdapter.moveRows(row, count, newRow);
    }

    // =========================================================================
    // Public APIs (LunaGrid Complete Enterprise API Set)
    // =========================================================================

    loadData(data = []) {
      this.dataAdapter.setRows(data);
    }

    async fetchData(params = {}) {
      if (!this.options.url) return;
      this.showLoading();
      try {
        const queryStr = new URLSearchParams(params).toString();
        const fullUrl = this.options.url + (queryStr ? `?${queryStr}` : '');
        const response = await fetch(fullUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        this.loadData(Array.isArray(data) ? data : (data.items || data.content || []));
      } catch (err) {
        console.error('[LunaGrid] 데이터 페치 실패:', err);
      } finally {
        this.hideLoading();
      }
    }

    addRow(initialData = {}, position = 'top') {
      return this.dataAdapter.addRow(initialData, position);
    }

    insertRow(index, initialData = {}) {
      return this.dataAdapter.insertRow(index, initialData);
    }

    addRows(rowArray = [], position = 'bottom') {
      return this.dataAdapter.addRows(rowArray, position);
    }

    insertRows(index, rowArray = []) {
      return this.dataAdapter.insertRows(index, rowArray);
    }

    /**
     * 맨 끝에 빈 행을 추가하고 첫 번째 편집 가능 셀로 즉시 인라인 편집 시작 (beginAppendRow)
     * @param {Object} defaultValues - 기본 입력값
     */
    beginAppendRow(defaultValues = {}) {
      const newRow = this.addRow(defaultValues, 'bottom');
      setTimeout(() => {
        const lastTr = this.tbodyEl.querySelector(`tr[data-row-id="${newRow.id}"]`);
        if (lastTr) {
          const firstEditable = lastTr.querySelector('td.editable');
          if (firstEditable) {
            const colKey = firstEditable.getAttribute('data-col-key');
            this._startCellEdit(firstEditable, newRow.id, colKey);
          }
        }
      }, 50);
      return newRow;
    }

    /**
     * 특정 인덱스 위치에 빈 행을 삽입하고 즉시 인라인 편집 시작 (beginInsertRow)
     * @param {number} itemIndex - 삽입할 행 인덱스 (0-based)
     * @param {Object} defaultValues - 기본 입력값
     */
    beginInsertRow(itemIndex = 0, defaultValues = {}) {
      const newRow = this.insertRow(itemIndex, defaultValues);
      setTimeout(() => {
        const targetTr = this.tbodyEl.querySelector(`tr[data-row-id="${newRow.id}"]`);
        if (targetTr) {
          const firstEditable = targetTr.querySelector('td.editable');
          if (firstEditable) {
            const colKey = firstEditable.getAttribute('data-col-key');
            this._startCellEdit(firstEditable, newRow.id, colKey);
          }
        }
      }, 50);
      return newRow;
    }

    deleteRow(rowIdOrIndex) {
      this.dataAdapter.removeRow(rowIdOrIndex);
    }

    deleteRows(rowIdsOrIndexes = []) {
      return this.dataAdapter.removeRows(rowIdsOrIndexes);
    }

    deleteSelection() {
      return this.deleteSelectedRows();
    }

    clearRows() {
      this.dataAdapter.clearRows();
      this.selectedRowKeys.clear();
      this.showToast('🗑️ 전체 행이 초기화되었습니다.');
    }

    deleteSelectedRows() {
      const selectedIds = Array.from(this.selectedRowKeys);
      if (selectedIds.length === 0) {
        if (this.focusedRowIndex >= 0) {
          const focusedRow = this.displayData[this.focusedRowIndex];
          if (focusedRow) {
            const rowId = this._getRowId(focusedRow, this.focusedRowIndex);
            this.dataAdapter.removeRow(rowId);
            this.showToast('🗑️ 1건의 행이 삭제되었습니다.');
            return;
          }
        }
        alert('삭제할 행을 선택해주세요.');
        return;
      }
      selectedIds.forEach(id => this.dataAdapter.removeRow(id));
      this.selectedRowKeys.clear();
      this.showToast(`🗑️ ${selectedIds.length}건의 행이 삭제되었습니다.`);
    }

    updateRow(rowIdOrIndex, updatedValues = {}) {
      return this.dataAdapter.updateRow(rowIdOrIndex, updatedValues);
    }

    updateRows(startIndex = 0, rowsArray = []) {
      return this.dataAdapter.updateRows(startIndex, rowsArray);
    }

    /**
     * 특정 셀에 포커스 설정 (setFocusCell / setCurrent)
     * @param {number|string} rowIndexOrRowId - 행 인덱스 또는 Row ID
     * @param {string} colKeyOrName - 컬럼 키 또는 이름
     */
    setFocusCell(rowIndexOrRowId, colKeyOrName) {
      let rowIndex = -1;
      let row = null;
      if (typeof rowIndexOrRowId === 'number' && rowIndexOrRowId >= 0 && rowIndexOrRowId < this.displayData.length) {
        rowIndex = rowIndexOrRowId;
        row = this.displayData[rowIndex];
      } else {
        row = this._findRowById(rowIndexOrRowId);
        if (row) rowIndex = this.displayData.indexOf(row);
      }
      if (!row) return null;

      const col = this.options.columns.find(c => c.key === colKeyOrName || c.name === colKeyOrName || c.fieldName === colKeyOrName);
      const colKey = col ? (col.key || col.fieldName || col.name) : colKeyOrName;

      const rowId = row.id || row.__treeNodeId || String(rowIndex);
      return this._setCellFocus(rowIndex, colKey, rowId);
    }

    setCurrent(rowOrIndex, colOrKey) {
      return this.setFocusCell(rowOrIndex, colOrKey);
    }

    /**
     * 특정 셀 또는 현재 포커스된 셀의 인라인 편집 모드 시작 (showEditor / editCell / startEditing)
     */
    showEditor(rowIndexOrRowId = null, colKeyOrName = null) {
      if (rowIndexOrRowId !== null && colKeyOrName !== null) {
        this.setFocusCell(rowIndexOrRowId, colKeyOrName);
      }

      if (!this.focusedCell) {
        if (this.displayData.length > 0 && this.options.columns.length > 0) {
          const firstEditableCol = this.options.columns.find(c => c.editable !== false && !c.hidden);
          if (firstEditableCol) {
            this.setFocusCell(0, firstEditableCol.key || firstEditableCol.fieldName || firstEditableCol.name);
          }
        }
      }

      if (this.focusedCell) {
        const { rowId, colKey, rowIndex } = this.focusedCell;
        let targetTd = null;
        if (this.tbodyEl) {
          targetTd = this.tbodyEl.querySelector(`tr[data-row-id="${rowId}"] td[data-col-key="${colKey}"]`) ||
                     this.tbodyEl.querySelector(`tr[data-row-index="${rowIndex}"] td[data-col-key="${colKey}"]`);
        }
        if (targetTd) {
          this._startCellEdit(targetTd, rowId, colKey);
        }
      }
    }

    editCell(rowIndexOrRowId, colKeyOrName) {
      this.showEditor(rowIndexOrRowId, colKeyOrName);
    }

    startEditing(rowIndexOrRowId, colKeyOrName) {
      this.showEditor(rowIndexOrRowId, colKeyOrName);
    }

    clearFilter(colKeyOrName) {
      const col = this.options.columns.find(c => c.key === colKeyOrName || c.name === colKeyOrName || c.fieldName === colKeyOrName);
      const colKey = col ? (col.key || col.fieldName || col.name) : colKeyOrName;
      delete this.columnFilters[colKey];
      this._renderHeader();
      this._applyFilterAndSort();
      const filterEntries = Object.keys(this.columnFilters).map(k => ({ fieldName: k, values: this.columnFilters[k] }));
      if (typeof this.onFilterChanged === 'function') {
        this.onFilterChanged(filterEntries);
      }
      this._emit('filterChanged', filterEntries);
    }

    setValue(rowIdOrIndex, colKey, value) {
      this.setCellValue(rowIdOrIndex, colKey, value);
    }

    getValue(rowIdOrIndex, colKey) {
      return this.dataAdapter.getValue(rowIdOrIndex, colKey);
    }

    setValues(rowIdOrIndex, values = {}) {
      return this.dataAdapter.setValues(rowIdOrIndex, values);
    }

    getValues(rowIdOrIndex) {
      return this.dataAdapter.getValues(rowIdOrIndex);
    }

    setCellValue(rowIdOrIndex, colKey, value) {
      let row;
      let rowIndex = -1;
      if (typeof rowIdOrIndex === 'number' && rowIdOrIndex >= 0 && rowIdOrIndex < this.displayData.length) {
        rowIndex = rowIdOrIndex;
        row = this.displayData[rowIdOrIndex];
      } else {
        row = this._findRowById(rowIdOrIndex);
        if (row) rowIndex = this.displayData.indexOf(row);
      }
      if (!row) return;

      const col = this.options.columns.find(c => c.key === colKey || c.name === colKey);
      const isMergeEdit = col && (col.mergeEdit === true || (this.options.editOptions && this.options.editOptions.mergedEdit === true));

      // LunaGrid mergeEdit: true 인 경우 병합된 모든 행의 값을 일괄 변경
      if (isMergeEdit && this.mergeSpansMap && rowIndex !== -1) {
        const spanInfo = this.mergeSpansMap.get(`${rowIndex}_${colKey}`);
        if (spanInfo && Array.isArray(spanInfo.mergedRowIndices) && spanInfo.mergedRowIndices.length > 1) {
          spanInfo.mergedRowIndices.forEach(targetRIdx => {
            const targetRow = this.displayData[targetRIdx];
            if (targetRow) {
              if (!targetRow._dirtyFields) targetRow._dirtyFields = new Set();
              targetRow._dirtyFields.add(colKey);
              if (this.dataAdapter && typeof this.dataAdapter.updateRow === 'function') {
                const targetId = targetRow.id !== undefined ? targetRow.id : (targetRow._rowKey !== undefined ? targetRow._rowKey : targetRIdx);
                this.dataAdapter.updateRow(targetId, { [colKey]: value });
              } else {
                targetRow[colKey] = value;
                targetRow._isDirty = true;
              }
            }
          });
          this._applyFilterAndSort();
          return;
        }
      }

      if (!row._dirtyFields) row._dirtyFields = new Set();
      row._dirtyFields.add(colKey);

      if (this.dataAdapter && typeof this.dataAdapter.updateRow === 'function') {
        const targetId = row.id !== undefined ? row.id : (row._rowKey !== undefined ? row._rowKey : rowIndex);
        this.dataAdapter.updateRow(targetId, { [colKey]: value });
      } else {
        row[colKey] = value;
        row._isDirty = true;
      }
      this._applyFilterAndSort();
    }

    commitChanges() {
      this.dataAdapter.commit();
    }

    rollbackChanges() {
      this.dataAdapter.rollback();
    }

    getAddedRows() {
      return this.dataAdapter.getStateRows('created');
    }

    getModifiedRows() {
      return this.dataAdapter.getStateRows('updated');
    }

    getDeletedRows() {
      return this.dataAdapter.getStateRows('deleted');
    }

    getAllChanges() {
      return this.dataAdapter.getAllStateRows();
    }

    getJsonRow(rowIdOrIndex) {
      return this.dataAdapter.getJsonRow(rowIdOrIndex);
    }

    getJsonRows(startRow = 0, endRow = -1) {
      return this.dataAdapter.getJsonRows(startRow, endRow);
    }

    getFieldValues(fieldName, startRow = 0, endRow = -1) {
      return this.dataAdapter.getFieldValues(fieldName, startRow, endRow);
    }

    getDistinctValues(fieldName, maxCount = -1) {
      return this.dataAdapter.getDistinctValues(fieldName, maxCount);
    }

    fillJsonData(jsonData = [], options = {}) {
      this.dataAdapter.fillJsonData(jsonData, options);
    }

    fillCsvData(csvText = '', options = {}) {
      return this.dataAdapter.fillCsvData(csvText, options);
    }

    fillXmlData(xmlData = '', options = {}) {
      return this.dataAdapter.fillXmlData(xmlData, options);
    }

    async loadBulkData(data, options = {}) {
      const res = await this.dataAdapter.loadBulkData(data, options);
      this.showToast(`⚡ 대용량 ${res.totalRows.toLocaleString()}건 로드 완료 (${res.elapsedTimeMs}ms)`);
      return res;
    }

    async benchmarkLoad(count = 10000) {
      this.showToast(`🚀 ${count.toLocaleString()}건 대용량 데이터 생성 및 로드 테스트 시작...`);
      const mockData = this.dataAdapter.generateLargeData(count);
      const res = await this.dataAdapter.loadBulkData(mockData, { chunkSize: 5000 });
      this.showToast(`📊 벤치마크 완료: ${count.toLocaleString()}건 / ${res.elapsedTimeMs}ms (${res.rowsPerSecond.toLocaleString()} rows/sec)`);
      return res;
    }

    getData(startRow = 0, endRow = -1) {
      return this.dataAdapter.getRows(startRow, endRow);
    }

    getCheckedRows() {
      // 체크박스 선택된 실제 행 데이터 객체 배열 반환
      return this.currentData.filter((r, idx) => this.selectedRowKeys.has(this._getRowId(r, idx)));
    }

    getCheckedItemIndices() {
      // 체크박스 선택된 0-based 행 인덱스 배열 반환
      const indices = [];
      this.currentData.forEach((r, idx) => {
        if (this.selectedRowKeys.has(this._getRowId(r, idx))) indices.push(idx);
      });
      return indices;
    }

    getCheckedRowIds() {
      // 체크박스 선택된 고유 행 ID 문자열 배열 반환
      return Array.from(this.selectedRowKeys);
    }

    getSelectedRows() {
      return this.currentData
        .filter((r, idx) => this.selectedRowKeys.has(this._getRowId(r, idx)))
        .map(r => this.dataAdapter._cleanRow(r));
    }

    /**
     * 틀고정(Fixed Columns & Fixed Rows) 동적 설정
     * @param {Object|number} fixedOptions - { colCount: 2, rightColCount: 1, rowCount: 2 } 또는 좌측 고정 열 개수
     */
    setFixedOptions(fixedOptions = {}) {
      if (typeof fixedOptions === 'number') {
        this.options.fixedColCount = fixedOptions;
      } else {
        if (fixedOptions.colCount !== undefined) this.options.fixedColCount = fixedOptions.colCount;
        if (fixedOptions.rightColCount !== undefined) this.options.fixedRightColCount = fixedOptions.rightColCount;
        if (fixedOptions.fixedColCount !== undefined) this.options.fixedColCount = fixedOptions.fixedColCount;
        if (fixedOptions.fixedRightColCount !== undefined) this.options.fixedRightColCount = fixedOptions.fixedRightColCount;
        if (fixedOptions.rowCount !== undefined) this.options.fixedRowCount = fixedOptions.rowCount;
        if (fixedOptions.fixedRowCount !== undefined) this.options.fixedRowCount = fixedOptions.fixedRowCount;
      }
      this._renderHeader();
      this._renderBody();
    }

    /**
     * 디스플레이 옵션 동적 설정 (setDisplayOptions)
     * @param {Object} dispOptions - { rowHeight: number, minRowHeight: number, showEmptyMessage: boolean }
     */
    setDisplayOptions(dispOptions = {}) {
      if (!this.options.displayOptions) this.options.displayOptions = {};
      Object.assign(this.options.displayOptions, dispOptions);
      if (dispOptions.rowHeight !== undefined) this.options.rowHeight = dispOptions.rowHeight;
      if (dispOptions.minRowHeight !== undefined) this.options.minRowHeight = dispOptions.minRowHeight;
      this._renderBody();
    }

    /**
     * 디스플레이 옵션 조회 (getDisplayOptions)
     */
    getDisplayOptions() {
      return Object.assign({ rowHeight: 36, minRowHeight: 28 }, this.options.displayOptions, {
        rowHeight: this.options.rowHeight || (this.options.displayOptions && this.options.displayOptions.rowHeight) || 36
      });
    }

    /**
     * 행 그룹핑 옵션 동적 설정 (setRowGroup)
     * @param {Object} rowGroupOptions - { headerHeight: number, footerHeight: number, summaryHeight: number, footerVisible: boolean }
     */
    setRowGroup(rowGroupOptions = {}) {
      if (!this.options.rowGroup) this.options.rowGroup = {};
      Object.assign(this.options.rowGroup, rowGroupOptions);
      this._renderBody();
    }

    /**
     * 행 그룹핑 옵션 조회 (getRowGroup)
     */
    getRowGroup() {
      return Object.assign({ headerHeight: 36, footerHeight: 34, summaryHeight: 34, footerVisible: true }, this.options.rowGroup);
    }

    /**
     * 행 그룹핑 실행 (groupBy)
     * @param {Array<string>|string} fieldNames - 그룹핑 기준 컬럼 Key 또는 배열
     */
    groupBy(fieldNames = []) {
      const cols = Array.isArray(fieldNames) ? fieldNames : (fieldNames ? [fieldNames] : []);
      if (!this._emit('grouping', cols)) return;

      this.groupColumns = [...cols];
      this.collapsedGroups.clear();
      this._renderGroupPanel();
      this._renderBody();

      this._emit('grouped', this.groupColumns);
      this._emit('groupChange', this.groupColumns);
    }

    /**
     * 화면 상의 아이템 검색 (searchItem / searchCell)
     * LunaGrid searchItem (fields, values, startIndex, wrap, select, caseSensitive, partialMatch, allFields 지원)
     * @param {Object} options - 검색 옵션
     * @returns {number} 매칭된 itemIndex (없으면 -1)
     */
    searchItem(options = {}) {
      if (!this.displayData || this.displayData.length === 0) return -1;
      const fields = Array.isArray(options.fields) ? options.fields : (options.fields ? [options.fields] : this.options.columns.map(c => c.key));
      const values = Array.isArray(options.values) ? options.values : (options.values !== undefined ? [options.values] : []);
      if (values.length === 0) return -1;

      const total = this.displayData.length;
      const start = options.startIndex !== undefined ? Math.max(0, Math.min(options.startIndex, total - 1)) : 0;
      const wrap = options.wrap !== false;
      const caseSensitive = options.caseSensitive === true;
      const partialMatch = options.partialMatch !== false;
      const allFields = options.allFields === true;
      const isBackward = options.direction === 'backward';

      const matchRow = (row) => {
        const results = fields.map((field, idx) => {
          const targetVal = values[idx] !== undefined ? values[idx] : values[0];
          const raw = this._getCellValue(row, { fieldName: field, key: field });
          if (raw === undefined || raw === null) return false;
          let sRaw = String(raw);
          let sTarget = String(targetVal);
          if (!caseSensitive) {
            sRaw = sRaw.toLowerCase();
            sTarget = sTarget.toLowerCase();
          }
          return partialMatch ? sRaw.includes(sTarget) : sRaw === sTarget;
        });

        return allFields ? results.every(Boolean) : results.some(Boolean);
      };

      const checkRange = (from, to, step) => {
        for (let i = from; step > 0 ? i <= to : i >= to; i += step) {
          if (matchRow(this.displayData[i])) return i;
        }
        return -1;
      };

      let matchedIdx = -1;
      if (!isBackward) {
        matchedIdx = checkRange(start, total - 1, 1);
        if (matchedIdx === -1 && wrap && start > 0) {
          matchedIdx = checkRange(0, start - 1, 1);
        }
      } else {
        matchedIdx = checkRange(start, 0, -1);
        if (matchedIdx === -1 && wrap && start < total - 1) {
          matchedIdx = checkRange(total - 1, start + 1, -1);
        }
      }

      // 검색된 행으로 선택 및 스크롤 이동
      if (matchedIdx !== -1 && options.select !== false) {
        const matchedRow = this.displayData[matchedIdx];
        if (matchedRow) {
          const rowId = this._getRowId(matchedRow, matchedIdx);
          this.selectedRowKeys.clear();
          this.selectedRowKeys.add(rowId);
          this._renderBody();
          this.scrollToRow(matchedIdx);
        }
      }

      return matchedIdx;
    }

    searchCell(options = {}) {
      const itemIndex = this.searchItem(options);
      return { itemIndex, dataRow: this.getDataRow(itemIndex) };
    }

    /**
     * 행 그룹핑 해제 (clearGroupBy)
     */
    clearGroupBy() {
      this.groupBy([]);
    }

    /**
     * 행 그룹핑 적용 여부 확인 (isGrouped)
     */
    isGrouped() {
      return this.groupColumns.length > 0;
    }

    /**
     * 현재 그룹핑 컬럼 목록 조회 (getGroupFields / getGroupBy)
     */
    getGroupFields() {
      return [...this.groupColumns];
    }

    getGroupBy() {
      return this.getGroupFields();
    }

    /**
     * 모든 행 그룹 일괄 펼치기 (expandAllGroups)
     */
    expandAllGroups() {
      this.collapsedGroups.clear();
      this._renderBody();
    }

    /**
     * 모든 행 그룹 일괄 접기 (collapseAllGroups)
     */
    collapseAllGroups() {
      if (this.groupColumns.length === 0) return;
      const groups = new Set();
      this.displayData.forEach(row => {
        const grpKey = this.groupColumns.map(col => String(row[col] ?? '')).join(' / ');
        groups.add(grpKey);
      });
      this.collapsedGroups = groups;
      this._renderBody();
    }

    /**
     * 그룹핑 계층 레벨 수 조회 (getGroupLevels)
     */
    getGroupLevels() {
      return this.groupColumns.length;
    }

    /**
     * 특정 행 그룹 펼치기 (expandGroup)
     * @param {string} groupKey - 그룹 고유 식별자
     */
    expandGroup(groupKey) {
      if (this.collapsedGroups.has(groupKey)) {
        this.collapsedGroups.delete(groupKey);
        this._renderBody();
      }
    }

    /**
     * 특정 행 그룹 접기 (collapseGroup)
     * @param {string} groupKey - 그룹 고유 식별자
     */
    collapseGroup(groupKey) {
      if (!this.collapsedGroups.has(groupKey)) {
        this.collapsedGroups.add(groupKey);
        this._renderBody();
      }
    }

    /**
     * 특정 행 그룹 접기/펼치기 토글 (toggleGroup)
     * @param {string} groupKey - 그룹 고유 식별자
     */
    toggleGroup(groupKey) {
      if (this.collapsedGroups.has(groupKey)) {
        this.expandGroup(groupKey);
      } else {
        this.collapseGroup(groupKey);
      }
    }

    /**
     * 모든 행 그룹 일괄 토글 (toggleAllGroups)
     */
    toggleAllGroups() {
      if (this.collapsedGroups.size > 0) {
        this.expandAllGroups();
      } else {
        this.collapseAllGroups();
      }
    }

    /**
     * 좌측 틀고정 컬럼 수 동적 설정 (setFixedColumnCount)
     */
    setFixedColumnCount(count) {
      const num = Number(count) || 0;
      this.options.fixedColCount = num;
      if (this.options.fixedOptions) this.options.fixedOptions.colCount = num;
      this.setFixedOptions({ colCount: num });
    }

    /**
     * 다중 정렬 규칙 동적 설정 (setSort / setSortFields)
     * @param {Array<Object>} sortConfigs - [{ fieldName: 'region', direction: 'asc' }, ...]
     */
    setSort(sortConfigs = []) {
      if (!Array.isArray(sortConfigs)) return;
      this.sortRules = sortConfigs.map(cfg => ({
        key: cfg.fieldName || cfg.name || cfg.key,
        dir: (cfg.direction || cfg.dir || 'asc').toLowerCase()
      }));
      this._renderHeader();
      this._applyFilterAndSort();
      if (typeof this.onSortChanged === 'function') {
        this.onSortChanged(this.sortRules);
      }
      this._emit('sortChanged', this.sortRules);
    }

    setSortFields(sortConfigs = []) {
      this.setSort(sortConfigs);
    }

    /**
     * 전체 정렬 초기화 (clearSort / clearSorting)
     */
    clearSort() {
      this.sortRules = [];
      this._renderHeader();
      this._applyFilterAndSort();
      if (typeof this.onSortChanged === 'function') {
        this.onSortChanged([]);
      }
      this._emit('sortChanged', []);
    }

    clearSorting() {
      this.clearSort();
    }

    /**
     * 특정 컬럼 필터 규칙 설정 (setFilter / setColumnFilter)
     * @param {string} colKeyOrName - 대상 컬럼
     * @param {Array<string>|Object|string} filterValuesOrRule - 필터 대상 값 배열 또는 규칙
     */
    setFilter(colKeyOrName, filterValuesOrRule) {
      const col = this.options.columns.find(c => c.key === colKeyOrName || c.name === colKeyOrName || c.fieldName === colKeyOrName);
      const colKey = col ? (col.key || col.fieldName || col.name) : colKeyOrName;

      this.columnFilters[colKey] = filterValuesOrRule;
      this._renderHeader();
      this._applyFilterAndSort();
      const filterEntries = Object.keys(this.columnFilters).map(k => ({ fieldName: k, values: this.columnFilters[k] }));
      if (typeof this.onFilterChanged === 'function') {
        this.onFilterChanged(filterEntries);
      }
      this._emit('filterChanged', filterEntries);
    }

    setColumnFilter(colKeyOrName, filterValuesOrRule) {
      this.setFilter(colKeyOrName, filterValuesOrRule);
    }

    /**
     * 필터 전체 해제 (clearFilters)
     */
    clearFilters() {
      this.columnFilters = {};
      this._renderHeader();
      this._applyFilterAndSort();
      if (typeof this.onFilterChanged === 'function') {
        this.onFilterChanged([]);
      }
      this._emit('filterChanged', []);
    }

    clearFilter(colKeyOrName) {
      const col = this.options.columns.find(c => c.key === colKeyOrName || c.name === colKeyOrName || c.fieldName === colKeyOrName);
      const colKey = col ? (col.key || col.fieldName || col.name) : colKeyOrName;
      this.filters.delete(colKey);
      this._renderHeader();
      this._applyFilterAndSort();
      const filterEntries = Array.from(this.filters.entries()).map(([k, v]) => ({ fieldName: k, values: v }));
      if (typeof this.onFilterChanged === 'function') {
        this.onFilterChanged(filterEntries);
      }
      this._emit('filterChanged', filterEntries);
    }

    /**
     * 행 드래그 앤 드롭 이동 활성화/비활성화 동적 설정 (setRowDragDrop)
     * @param {boolean|Object} enabledOrOptions - 활성화 여부 또는 설정 객체
     */
    setRowDragDrop(enabledOrOptions) {
      if (typeof enabledOrOptions === 'boolean') {
        this.rowDragOptions = Object.assign(this.rowDragOptions || {}, { enabled: enabledOrOptions });
      } else if (typeof enabledOrOptions === 'object' && enabledOrOptions !== null) {
        this.rowDragOptions = Object.assign(this.rowDragOptions || {}, enabledOrOptions);
      }
      this.options.rowDragDrop = Object.assign({}, this.rowDragOptions);
      this._renderBody();
    }

    /**
     * 특정 그룹에 속한 행 데이터 목록 조회 (getGroupItems)
     * @param {string} groupKey - 그룹 식별자
     */
    getGroupItems(groupKey) {
      if (this.groupColumns.length === 0) return [];
      return this.displayData.filter(row => {
        const key = this.groupColumns.map(col => String(row[col] ?? '')).join(' / ');
        return key === groupKey;
      });
    }

    /**
     * 특정 그룹에 속한 행 개수 조회 (getGroupItemCount)
     * @param {string} groupKey - 그룹 식별자
     */
    getGroupItemCount(groupKey) {
      return this.getGroupItems(groupKey).length;
    }

    /**
     * 특정 그룹의 필드별 요약/통계값 조회 (getGroupSummary)
     * @param {string} groupKey - 그룹 식별자
     * @param {string} fieldName - 컬럼 필드명
     * @param {string} summaryType - 'sum' | 'avg' | 'count' | 'min' | 'max'
     */
    getGroupSummary(groupKey, fieldName, summaryType = 'sum') {
      const items = this.getGroupItems(groupKey);
      if (items.length === 0) return 0;
      if (summaryType === 'count') return items.length;

      const numbers = items.map(r => Number(r[fieldName])).filter(n => !isNaN(n));
      if (numbers.length === 0) return 0;

      const sum = numbers.reduce((acc, v) => acc + v, 0);
      if (summaryType === 'sum') return sum;
      if (summaryType === 'avg' || summaryType === 'average') return Math.round((sum / numbers.length) * 100) / 100;
      if (summaryType === 'min') return Math.min(...numbers);
      if (summaryType === 'max') return Math.max(...numbers);
      return sum;
    }

    /**
     * 화면에 표시된 총 아이템 수 조회 (getItemCount)
     */
    getItemCount() {
      if (!this.tbodyEl) return 0;
      return this.tbodyEl.querySelectorAll('tr').length;
    }

    /**
     * 데이터 행 번호(dataRow)를 화면 뷰 인덱스(itemIndex)로 변환 (getItemIndex)
     * @param {number} dataRow - DataAdapter 상의 행 인덱스
     */
    getItemIndex(dataRow) {
      if (!this.tbodyEl) return -1;
      const tr = this.tbodyEl.querySelector(`tr[data-row-index="${dataRow}"]`);
      if (!tr) return -1;
      return Array.from(this.tbodyEl.children).indexOf(tr);
    }

    /**
     * 화면 뷰 인덱스(itemIndex)를 데이터 행 번호(dataRow)로 변환 (getDataRow)
     * @param {number} itemIndex - 화면 뷰 상의 인덱스
     */
    getDataRow(itemIndex) {
      if (!this.tbodyEl || itemIndex < 0 || itemIndex >= this.tbodyEl.children.length) return -1;
      const tr = this.tbodyEl.children[itemIndex];
      const rIdx = tr.getAttribute('data-row-index');
      return rIdx !== null ? parseInt(rIdx, 10) : -1;
    }

    /**
     * 특정 뷰 인덱스의 아이템 모델 객체 조회 (getModel / getItemModel)
     * @param {number} itemIndex - 화면 뷰 상의 인덱스
     */
    getModel(itemIndex) {
      if (!this.tbodyEl || itemIndex < 0 || itemIndex >= this.tbodyEl.children.length) return null;
      const tr = this.tbodyEl.children[itemIndex];

      if (tr.classList.contains('luna-group-header-row')) {
        const grpKey = tr.getAttribute('data-group-key');
        return {
          itemIndex,
          itemType: 'group',
          groupKey: grpKey,
          dataRow: -1,
          count: this.getGroupItemCount(grpKey),
          expanded: !this.collapsedGroups.has(grpKey),
          level: this.groupColumns.length
        };
      }

      if (tr.classList.contains('luna-group-footer-row')) {
        return {
          itemIndex,
          itemType: 'footer',
          dataRow: -1,
          level: this.groupColumns.length
        };
      }

      const rIdx = parseInt(tr.getAttribute('data-row-index') || '-1', 10);
      const rowId = tr.getAttribute('data-row-id');
      const rowData = this.displayData[rIdx] || this._findRowById(rowId);

      return {
        itemIndex,
        itemType: 'row',
        dataRow: rIdx,
        rowId: rowId,
        values: rowData ? Object.assign({}, rowData) : {},
        level: 0
      };
    }

    getItemModel(itemIndex) {
      return this.getModel(itemIndex);
    }

    /**
     * 디테일 그리드와 1:N 마스터-디테일 관계 자동 동기화 바인딩 (bindDetailGrid)
     * @param {LunaGrid} detailGrid - 하위 디테일 그리드 인스턴스
     * @param {Object} [options] - { masterKey: string, detailKey: string, filterCallback: Function }
     */
    bindDetailGrid(detailGrid, options = {}) {
      if (!detailGrid) return;
      const masterKey = options.masterKey || options.key || 'id';
      const detailKey = options.detailKey || options.key || 'masterId';
      const filterCallback = options.filterCallback;

      const syncDetail = (masterRow) => {
        if (!masterRow) {
          detailGrid.setFilter(detailKey, '__EMPTY__NO_MATCH__');
          return;
        }
        if (typeof filterCallback === 'function') {
          detailGrid.setFilterCallback((dRow) => filterCallback(masterRow, dRow));
        } else {
          const masterVal = masterRow[masterKey];
          detailGrid.setFilter(detailKey, masterVal);
        }
      };

      // 마스터 행 클릭/선택 이벤트 바인딩
      const origRowClick = this.options.onRowClick;
      this.options.onRowClick = (grid, row, rowIndex) => {
        syncDetail(row);
        if (typeof origRowClick === 'function') origRowClick(grid, row, rowIndex);
      };

      // 데이터 로드 완료 시 첫 번째 행 자동 선택 및 동기화
      this.dataAdapter.on('dataLoaded', (rows) => {
        if (rows && rows.length > 0) {
          syncDetail(rows[0]);
        } else {
          syncDetail(null);
        }
      });

      // 현재 데이터가 이미 로드되어 있는 경우 즉시 1회 동기화
      if (this.currentData && this.currentData.length > 0) {
        syncDetail(this.currentData[0]);
      }
    }

    /**
     * 마스터 행 값 기준으로 디테일 그리드 데이터 필터링 (filterByMaster)
     * @param {Object} masterRow - 마스터 행 객체
     * @param {string|Object} keyMapping - 'masterId' 또는 { masterKey: 'id', detailKey: 'deptId' }
     */
    filterByMaster(masterRow, keyMapping = {}) {
      if (!masterRow) {
        this.clearFilters();
        return;
      }
      const masterKey = typeof keyMapping === 'string' ? 'id' : (keyMapping.masterKey || 'id');
      const detailKey = typeof keyMapping === 'string' ? keyMapping : (keyMapping.detailKey || 'masterId');
      const targetVal = masterRow[masterKey];
      this.setFilter(detailKey, targetVal);
    }

    /**
     * 외부 DataAdapter 연결 및 공유 설정 (setDataAdapter)
     * @param {LunaDataAdapter} adapter - 공유할 DataAdapter 인스턴스
     */
    setDataAdapter(adapter) {
      if (!(adapter instanceof LunaDataAdapter) && typeof adapter !== 'object') return;
      this.dataAdapter = adapter;
      this.options.dataAdapter = adapter;

      // DataAdapter 이벤트 재바인딩
      this.dataAdapter.on('dataLoaded', (rows) => {
        this.currentData = rows;
        this.selectedRowKeys.clear();
        this.validationErrors.clear();
        this._applyFilterAndSort();
      });

      this.dataAdapter.on('rowAdded', () => this._applyFilterAndSort());
      this.dataAdapter.on('rowDeleted', () => this._applyFilterAndSort());
      this.dataAdapter.on('rowUpdated', () => this._applyFilterAndSort());
      this.dataAdapter.on('dataCommitted', () => this._renderBody());
      this.dataAdapter.on('dataRollback', () => this._renderBody());

      this.currentData = this.dataAdapter.rows || [];
      this._applyFilterAndSort();
    }

    /**
     * 현재 바인딩된 DataAdapter 인스턴스 조회 (getDataAdapter)
     */
    getDataAdapter() {
      return this.dataAdapter;
    }

    /**
     * 헤더 속성 동적 설정 (setHeader)
     * @param {Object} headerOptions - { height: number, minHeight: number, itemHeights: Array<number>, visible: boolean }
     */
    setHeader(headerOptions = {}) {
      if (!this.options.header) this.options.header = {};
      Object.assign(this.options.header, headerOptions);
      this._renderHeader();
    }

    /**
     * 헤더 속성 조회 (getHeader)
     */
    getHeader() {
      return Object.assign({ height: 32, minHeight: 26, itemHeights: [] }, this.options.header);
    }

    /**
     * 푸터 속성 동적 설정 (setFooter)
     * @param {Object} footerOptions - { visible: boolean, height: number, customSummary: Function }
     */
    setFooter(footerOptions = {}) {
      if (!this.options.footer) this.options.footer = {};
      Object.assign(this.options.footer, footerOptions);
      this._renderFooter();
    }

    /**
     * 푸터 속성 조회 (getFooter)
     */
    getFooter() {
      return Object.assign({ visible: true, height: 28 }, this.options.footer);
    }

    /**
     * 상단 요약(Header Summary) 동적 설정 (setHeaderSummary)
     * @param {Object} summaryOptions - { visible: boolean, height: number }
     */
    setHeaderSummary(summaryOptions = {}) {
      if (!this.options.headerSummary) this.options.headerSummary = {};
      Object.assign(this.options.headerSummary, summaryOptions);
      this._renderHeader();
    }

    /**
     * 상단 요약 속성 조회 (getHeaderSummary)
     */
    getHeaderSummary() {
      return Object.assign({ visible: false, height: 28 }, this.options.headerSummary);
    }

    /**
     * 컬럼 목록 전체 새로 설정 (setColumns)
     * @param {Array} columns - 새로운 컬럼 정의 배열
     */
    setColumns(columns = []) {
      this.options.columns = columns.map(col => {
        const colObj = Object.assign({}, col);
        if (!colObj.key && (colObj.fieldName || colObj.name)) {
          colObj.key = colObj.fieldName || colObj.name;
        }
        if (!colObj.name && (colObj.fieldName || colObj.key)) {
          colObj.name = colObj.fieldName || colObj.key;
        }
        if (!colObj.fieldName && (colObj.key || colObj.name)) {
          colObj.fieldName = colObj.key || colObj.name;
        }
        if (!colObj.label && (colObj.header && colObj.header.text)) {
          colObj.label = colObj.header.text;
        }
        if (colObj.type && !colObj.dataType) {
          colObj.dataType = colObj.type;
        }
        if (colObj.format && !colObj.displayFormat) {
          colObj.displayFormat = colObj.format;
        }
        if (colObj.format && !colObj.dateFormat && (colObj.dataType === 'datetime' || colObj.dataType === 'date')) {
          colObj.dateFormat = colObj.format;
        }
        return colObj;
      });
      this._renderHeader();
      this._renderBody();
      this._renderFooter();
    }

    getColumns() {
      return [...this.options.columns];
    }

    /**
     * 단일 컬럼 동적 추가 (addColumn)
     * @param {Object} column - 컬럼 정의 객체
     * @param {number} index - 삽입할 인덱스 (기본: 맨 뒤)
     */
    addColumn(column = {}, index = -1) {
      const colObj = Object.assign({}, column);
      if (!colObj.key && (colObj.fieldName || colObj.name)) {
        colObj.key = colObj.fieldName || colObj.name;
      }
      if (!colObj.name && (colObj.fieldName || colObj.key)) {
        colObj.name = colObj.fieldName || colObj.key;
      }
      if (!colObj.fieldName && (colObj.key || colObj.name)) {
        colObj.fieldName = colObj.key || colObj.name;
      }
      if (!colObj.label && (colObj.header && colObj.header.text)) {
        colObj.label = colObj.header.text;
      }
      if (colObj.type && !colObj.dataType) {
        colObj.dataType = colObj.type;
      }
      if (colObj.format && !colObj.displayFormat) {
        colObj.displayFormat = colObj.format;
      }
      if (colObj.format && !colObj.dateFormat && (colObj.dataType === 'datetime' || colObj.dataType === 'date')) {
        colObj.dateFormat = colObj.format;
      }

      if (index >= 0 && index < this.options.columns.length) {
        this.options.columns.splice(index, 0, colObj);
      } else {
        this.options.columns.push(colObj);
      }

      this._renderHeader();
      this._renderBody();
      this._renderFooter();
      return colObj;
    }

    /**
     * 단일 컬럼 동적 삭제 (removeColumn)
     * @param {string} colNameOrKey - 삭제할 컬럼 Key 또는 Name
     */
    removeColumn(colNameOrKey) {
      const idx = this.options.columns.findIndex(c => c.key === colNameOrKey || c.name === colNameOrKey || c.fieldName === colNameOrKey);
      if (idx === -1) return;
      const removed = this.options.columns.splice(idx, 1)[0];
      this._renderHeader();
      this._renderBody();
      this._renderFooter();
      return removed;
    }

    /**
     * 이름/Key로 컬럼 설정 객체 조회 (columnByName)
     */
    columnByName(nameOrKey) {
      return this.options.columns.find(c => c.name === nameOrKey || c.key === nameOrKey) || null;
    }

    /**
     * 데이터 필드명으로 컬럼 설정 객체 조회 (columnByField)
     */
    columnByField(fieldName) {
      return this.options.columns.find(c => c.fieldName === fieldName || c.key === fieldName) || null;
    }

    /**
     * 컬럼 속성 동적 변경 (visible, editable, width, equalBlank, renderer 등)
     * @param {string|Object} colKey - 컬럼 Key, Name 또는 컬럼 객체
     * @param {string|Object} propName - 속성명 또는 속성 객체 { visible: false, width: 120 }
     * @param {*} [propValue] - 변경할 값
     */
    setColumnProperty(colKey, propName, propValue) {
      const col = typeof colKey === 'object' && colKey !== null
        ? colKey
        : this.options.columns.find(c => c.key === colKey || c.name === colKey || c.fieldName === colKey);
      if (!col) return;

      if (typeof propName === 'object' && propName !== null) {
        Object.entries(propName).forEach(([k, v]) => this._applyColumnProp(col, k, v));
      } else {
        this._applyColumnProp(col, propName, propValue);
      }

      this._renderHeader();
      this._renderBody();
      this._renderFooter();
    }

    _applyColumnProp(col, propName, propValue) {
      if (propName === 'visible') {
        col.visible = Boolean(propValue);
        col.hidden = !propValue;
      } else if (propName === 'hidden') {
        col.hidden = Boolean(propValue);
        col.visible = !propValue;
      } else if (propName === 'width' || propName === 'cellWidth') {
        col.width = typeof propValue === 'number' ? `${propValue}px` : propValue;
      } else {
        col[propName] = propValue;
      }
    }

    getColumnProperty(colKey, propName) {
      const col = typeof colKey === 'object' && colKey !== null
        ? colKey
        : this.options.columns.find(c => c.key === colKey || c.name === colKey || c.fieldName === colKey);
      if (!col) return null;
      if (propName === 'visible') return col.visible !== false && !col.hidden;
      if (propName === 'hidden') return col.hidden === true || col.visible === false;
      return propName ? col[propName] : Object.assign({}, col);
    }

    /**
     * [LunaGrid 100% 호환] 현재 컬럼 레이아웃 상태 추출 (saveColumnLayout)
     * LunaGrid Standard Architecture Specification
     * 
     * 컬럼의 위치(순서), 너비(width), 가시성(visible/hidden), 그룹 구조, 태그 등을 배열 형태로 반환합니다.
     * @param {Object} [options={}] - { allColumns: boolean, hierarchical: boolean }
     * @returns {Array<Object>} ColumnLayoutInfo[]
     */
    saveColumnLayout(options = {}) {
      const allColumns = options.allColumns !== false;
      const hierarchical = options.hierarchical === true;
      const targetCols = allColumns ? this.options.columns : this.options.columns.filter(c => !c.hidden && c.visible !== false);

      if (hierarchical) {
        const layoutItems = [];
        const groupMap = new Map();

        targetCols.forEach(col => {
          const colInfo = {
            name: col.name || col.key,
            fieldName: col.fieldName || col.key,
            width: parseInt(col.width, 10) || (col.width ? String(col.width) : 100),
            visible: col.visible !== false && !col.hidden,
            tag: col.tag,
            header: {
              text: col.label || (col.header && col.header.text) || col.key,
              tooltip: col.headerTooltip || (col.header && col.header.tooltip)
            }
          };

          if (col.group) {
            if (!groupMap.has(col.group)) {
              const grpObj = {
                name: col.group,
                header: { text: col.group },
                items: []
              };
              groupMap.set(col.group, grpObj);
              layoutItems.push(grpObj);
            }
            groupMap.get(col.group).items.push(colInfo);
          } else {
            layoutItems.push(colInfo);
          }
        });
        return layoutItems;
      }

      return targetCols.map(col => ({
        name: col.name || col.key,
        fieldName: col.fieldName || col.key,
        width: parseInt(col.width, 10) || (col.width ? String(col.width) : 100),
        visible: col.visible !== false && !col.hidden,
        tag: col.tag,
        group: col.group || null,
        header: {
          text: col.label || (col.header && col.header.text) || col.key,
          tooltip: col.headerTooltip || (col.header && col.header.tooltip)
        }
      }));
    }

    /**
     * [LunaGrid 100% 호환] 저장된 컬럼 레이아웃 복원 적용 (setColumnLayout)
     * LunaGrid Standard Architecture Specification
     * 
     * @param {Array<string|Object>} layout - LunaGrid 호환 컬럼 레이아웃 배열
     */
    setColumnLayout(layout = []) {
      if (!Array.isArray(layout) || layout.length === 0) return;
      this.columnLayout = layout;

      const newOrderedCols = [];
      const usedColMap = new Set();

      const processLayoutItem = (item, parentGroupText = null) => {
        if (typeof item === 'string') {
          const col = this.columnByName(item) || this.columnByField(item);
          if (col && !usedColMap.has(col)) {
            col.group = parentGroupText || null;
            newOrderedCols.push(col);
            usedColMap.add(col);
          }
        } else if (typeof item === 'object' && item !== null) {
          const isGroup = Array.isArray(item.items) || Array.isArray(item.columns);
          if (isGroup) {
            const grpName = (item.header && item.header.text) || item.name || item.text || parentGroupText || 'Group';
            const childItems = item.items || item.columns || [];
            childItems.forEach(child => processLayoutItem(child, grpName));
          } else {
            const colKey = item.name || item.fieldName || item.key;
            const col = this.columnByName(colKey) || this.columnByField(colKey);
            if (col && !usedColMap.has(col)) {
              if (item.width !== undefined) {
                col.width = typeof item.width === 'number' ? `${item.width}px` : item.width;
              }
              if (item.visible !== undefined) {
                col.visible = Boolean(item.visible);
                col.hidden = !item.visible;
              }
              if (item.hidden !== undefined) {
                col.hidden = Boolean(item.hidden);
                col.visible = !item.hidden;
              }
              if (item.header && item.header.text) {
                col.label = item.header.text;
              }
              if (item.tag !== undefined) {
                col.tag = item.tag;
              }
              col.group = item.group || parentGroupText || null;
              newOrderedCols.push(col);
              usedColMap.add(col);
            }
          }
        }
      };

      layout.forEach(item => processLayoutItem(item, null));

      // 레이아웃에 명시되지 않은 신규/누락 컬럼도 안전하게 뒤에 배치하여 누락 방지
      this.options.columns.forEach(col => {
        if (!usedColMap.has(col)) {
          newOrderedCols.push(col);
        }
      });

      this.options.columns = newOrderedCols;
      this._renderHeader();
      this._renderBody();
      this._renderFooter();
      this._triggerAutoSavePersonalization();
    }

    getColumnLayout() {
      return this.columnLayout ? JSON.parse(JSON.stringify(this.columnLayout)) : this.saveColumnLayout();
    }

    /**
     * [LunaGrid 100% 호환] 현재 적용된 그룹핑 필드명 목록 반환 (getGroupFieldNames)
     * @returns {Array<string>}
     */
    getGroupFieldNames() {
      return [...this.groupColumns];
    }

    /**
     * [LunaGrid 100% 호환] 현재 정렬 규칙 정보 목록 반환 (getSortedFields)
     * @returns {Array<Object>} [{ fieldName: string, direction: 'asc'|'desc' }]
     */
    getSortedFields() {
      return this.sortRules.map(r => ({
        fieldName: r.key,
        direction: r.dir || 'asc'
      }));
    }

    /**
     * [LunaGrid 100% 호환] 현재 적용된 필터 컬럼 및 필터 조건 조회 (getFilteringFields / getActiveFilters)
     * @returns {Object} { [colKey]: filterValues }
     */
    getFilteringFields() {
      return JSON.parse(JSON.stringify(this.columnFilters));
    }

    getActiveFilters() {
      return this.getFilteringFields();
    }

    /**
     * [LunaGrid 100% 호환] 틀고정 설정 조회 (getFixedOptions)
     * @returns {Object}
     */
    getFixedOptions() {
      return {
        colCount: this.options.fixedColCount || 0,
        rightColCount: this.options.fixedRightColCount || 0,
        rowCount: this.options.fixedRowCount || 0,
        exceptFromSorting: this.options.fixedOptions ? this.options.fixedOptions.exceptFromSorting : true,
        exceptFromFiltering: this.options.fixedOptions ? this.options.fixedOptions.exceptFromFiltering : true
      };
    }

    /**
     * [LunaGrid 100% 호환] 틀고정 설정 동적 변경 (setFixedOptions)
     * @param {Object} options - { colCount, rightColCount, rowCount }
     */
    setFixedOptions(options = {}) {
      if (options.colCount !== undefined) this.options.fixedColCount = options.colCount;
      if (options.rightColCount !== undefined) this.options.fixedRightColCount = options.rightColCount;
      if (options.rowCount !== undefined) this.options.fixedRowCount = options.rowCount;
      if (!this.options.fixedOptions) this.options.fixedOptions = {};
      Object.assign(this.options.fixedOptions, options);
      this._renderHeader();
      this._renderBody();
      this._triggerAutoSavePersonalization();
    }

    /**
     * [Enterprise Personalization] 전체 개인화 설정(컬럼 레이아웃, 그룹핑, 정렬, 필터, 고정, 테마, 페이지) 저장
     * LunaGrid Standard Architecture Specification
     * 
     * @param {string|null} [storageKey=null] - LocalStorage/SessionStorage 키 이름 (null인 경우 객체만 반환)
     * @param {Object} [customData={}] - 사용자가 추가로 함께 저장하고 싶은 커스텀 메타데이터
     * @returns {Object} 개인화 설정 객체
     */
    saveUserConfig(storageKey = null, customData = {}) {
      const key = storageKey || (this.options.personalization && this.options.personalization.storageKey) || (this.options.personal && this.options.personal.storageKey);
      const storageType = (this.options.personalization && this.options.personalization.storage) || 'localStorage';

      const config = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        gridId: this.options.id || this.container.id || 'luna_grid',
        columnLayout: this.saveColumnLayout(),
        groupColumns: [...this.groupColumns],
        sortRules: JSON.parse(JSON.stringify(this.sortRules)),
        columnFilters: JSON.parse(JSON.stringify(this.columnFilters)),
        fixedOptions: {
          fixedColCount: this.options.fixedColCount || 0,
          fixedRightColCount: this.options.fixedRightColCount || 0,
          fixedRowCount: this.options.fixedRowCount || 0
        },
        theme: this.options.theme || 'dark',
        pageSize: this.pageSize || this.options.pageSize || 10,
        customData: customData
      };

      if (key && typeof window !== 'undefined') {
        try {
          const storage = storageType === 'sessionStorage' ? window.sessionStorage : window.localStorage;
          storage.setItem(key, JSON.stringify(config));
        } catch (err) {
          console.warn('[Personalization Save Warning]', err);
        }
      }

      if (typeof this.options.onSaveUserConfig === 'function') {
        this.options.onSaveUserConfig(config);
      }

      return config;
    }

    savePersonalConfig(storageKey, customData) {
      return this.saveUserConfig(storageKey, customData);
    }

    /**
     * [Enterprise Personalization] 전체 개인화 설정 복원 적용
     * @param {string|Object} storageKeyOrConfig - 스토리지 키 문자열 또는 개인화 설정 JSON 객체
     * @returns {boolean} 복원 성공 여부
     */
    loadUserConfig(storageKeyOrConfig = null) {
      let config = null;
      const key = typeof storageKeyOrConfig === 'string'
        ? storageKeyOrConfig
        : ((this.options.personalization && this.options.personalization.storageKey) || (this.options.personal && this.options.personal.storageKey));
      const storageType = (this.options.personalization && this.options.personalization.storage) || 'localStorage';

      if (typeof storageKeyOrConfig === 'object' && storageKeyOrConfig !== null) {
        config = storageKeyOrConfig;
      } else if (key && typeof window !== 'undefined') {
        try {
          const storage = storageType === 'sessionStorage' ? window.sessionStorage : window.localStorage;
          const raw = storage.getItem(key);
          if (raw) config = JSON.parse(raw);
        } catch (err) {
          console.warn('[Personalization Load Warning]', err);
        }
      }

      if (!config || typeof config !== 'object') return false;

      // 1. 컬럼 레이아웃 복원
      if (Array.isArray(config.columnLayout)) {
        this.setColumnLayout(config.columnLayout);
      }

      // 2. 행 그룹핑 복원
      if (Array.isArray(config.groupColumns)) {
        this.groupColumns = [...config.groupColumns];
        if (this.groupPanelEl) this._renderGroupPanel();
      }

      // 3. 정렬 규칙 복원
      if (Array.isArray(config.sortRules)) {
        this.sortRules = [...config.sortRules];
      }

      // 4. 컬럼 필터 복원
      if (config.columnFilters && typeof config.columnFilters === 'object') {
        this.columnFilters = Object.assign({}, config.columnFilters);
      }

      // 5. 틀고정 복원
      if (config.fixedOptions && typeof config.fixedOptions === 'object') {
        if (config.fixedOptions.fixedColCount !== undefined) this.options.fixedColCount = config.fixedOptions.fixedColCount;
        if (config.fixedOptions.fixedRightColCount !== undefined) this.options.fixedRightColCount = config.fixedOptions.fixedRightColCount;
        if (config.fixedOptions.fixedRowCount !== undefined) this.options.fixedRowCount = config.fixedOptions.fixedRowCount;
      }

      // 6. 테마 복원
      if (config.theme && config.theme !== this.options.theme) {
        this.setTheme(config.theme);
      }

      // 7. 페이지 크기 복원
      if (config.pageSize && config.pageSize !== this.pageSize) {
        this.pageSize = config.pageSize;
        this.options.pageSize = config.pageSize;
      }

      this._renderHeader();
      this.currentPage = 1;
      this._applyFilterAndSort();
      this._renderFooter();

      if (typeof this.options.onLoadUserConfig === 'function') {
        this.options.onLoadUserConfig(config);
      }

      return true;
    }

    loadPersonalConfig(storageKeyOrConfig) {
      return this.loadUserConfig(storageKeyOrConfig);
    }

    /**
     * [Enterprise Personalization] 개인화 설정 초기화 (초기 디폴트 상태로 원복)
     * @param {string|null} [storageKey=null]
     */
    resetUserConfig(storageKey = null) {
      const key = storageKey || (this.options.personalization && this.options.personalization.storageKey) || (this.options.personal && this.options.personal.storageKey);
      const storageType = (this.options.personalization && this.options.personalization.storage) || 'localStorage';

      if (key && typeof window !== 'undefined') {
        try {
          const storage = storageType === 'sessionStorage' ? window.sessionStorage : window.localStorage;
          storage.removeItem(key);
        } catch (err) { }
      }

      if (this._originalColumns) {
        this.options.columns = JSON.parse(JSON.stringify(this._originalColumns));
      }
      if (this._originalOptions) {
        this.groupColumns = [...(this._originalOptions.groupBy || [])];
        this.pageSize = this._originalOptions.pageSize || 10;
        this.options.fixedColCount = this._originalOptions.fixedColCount || 0;
        this.options.fixedRightColCount = this._originalOptions.fixedRightColCount || 0;
        this.options.fixedRowCount = this._originalOptions.fixedRowCount || 0;
      }

      this.sortRules = [];
      this.columnFilters = {};
      this.collapsedGroups.clear();

      if (this.groupPanelEl) this._renderGroupPanel();
      this._renderHeader();
      this.currentPage = 1;
      this._applyFilterAndSort();
      this._renderFooter();
      this.showToast('🔄 개인화 설정이 초기 상태로 복원되었습니다.');
    }

    resetPersonalConfig(storageKey) {
      this.resetUserConfig(storageKey);
    }

    /**
     * [Enterprise Personalization] 개인화 설정 JSON 문자열로 내보내기 (exportUserConfig)
     * @returns {string}
     */
    exportUserConfig() {
      const cfg = this.saveUserConfig();
      return JSON.stringify(cfg, null, 2);
    }

    /**
     * [Enterprise Personalization] JSON 문자열 또는 객체로부터 개인화 설정 가져오기 (importUserConfig)
     * @param {string|Object} jsonOrObj
     * @returns {boolean}
     */
    importUserConfig(jsonOrObj) {
      let parsed = jsonOrObj;
      if (typeof jsonOrObj === 'string') {
        try {
          parsed = JSON.parse(jsonOrObj);
        } catch (e) {
          console.warn('[Personalization Import Error]', e);
          return false;
        }
      }
      return this.loadUserConfig(parsed);
    }

    _initPersonalization() {
      const pOpts = this.options.personalization || this.options.personal;
      if (pOpts && pOpts.enabled !== false && pOpts.autoLoad !== false) {
        const key = pOpts.storageKey || 'luna_grid_pref';
        this.loadUserConfig(key);
      }
    }

    _triggerAutoSavePersonalization() {
      const pOpts = this.options.personalization || this.options.personal;
      if (pOpts && pOpts.enabled !== false && pOpts.autoSave !== false) {
        clearTimeout(this._personalAutoSaveTimer);
        this._personalAutoSaveTimer = setTimeout(() => {
          const key = pOpts.storageKey || 'luna_grid_pref';
          this.saveUserConfig(key);
        }, 200);
      }
    }

    on(event, callback) {
      if (typeof callback === 'function') {
        if (!this.listeners) this.listeners = [];
        this.listeners.push({ event, callback });
      }
      return this;
    }

    off(event, callback) {
      if (!this.listeners) return this;
      const propHandlerName = `on${event.charAt(0).toUpperCase() + event.slice(1)}`;
      if (!callback) {
        this.listeners = this.listeners.filter(l => l.event !== event && l.event !== propHandlerName);
      } else {
        this.listeners = this.listeners.filter(l => !((l.event === event || l.event === propHandlerName) && l.callback === callback));
      }
      return this;
    }

    emit(event, ...args) {
      return this._emit(event, ...args);
    }

    _emit(event, ...args) {
      let cancel = false;
      const propHandlerName = event.startsWith('on') ? event : `on${event.charAt(0).toUpperCase() + event.slice(1)}`;

      // 1. 인스턴스 직접 프로퍼티 (grid.onCurrentChanging = ...)
      if (typeof this[propHandlerName] === 'function') {
        try {
          const res = this[propHandlerName](this, ...args);
          if (res === false) cancel = true;
        } catch (e) {
          console.error(`[LunaGrid ${propHandlerName} error]`, e);
        }
      }

      // 2. options 내부 프로퍼티 (options.onCurrentChanging)
      if (this.options && typeof this.options[propHandlerName] === 'function') {
        try {
          const res = this.options[propHandlerName](this, ...args);
          if (res === false) cancel = true;
        } catch (e) {
          console.error(`[LunaGrid options.${propHandlerName} error]`, e);
        }
      }

      // 3. on() 등록 리스너
      if (this.listeners && this.listeners.length > 0) {
        const matched = this.listeners.filter(l => l.event === event || l.event === propHandlerName);
        for (const l of matched) {
          try {
            const res = l.callback(this, ...args);
            if (res === false) cancel = true;
          } catch (e) {
            console.error(`[LunaGrid event '${event}' error]`, e);
          }
        }
      }

      return !cancel;
    }

    /**
     * 컬럼 레이아웃 제어 프록시 (LunaGrid 호환 layoutByColumn)
     */
    layoutByColumn(nameOrKey) {
      const self = this;
      const col = this.columnByName(nameOrKey) || this.columnByField(nameOrKey);
      if (!col) return null;

      return {
        get cellWidth() {
          return parseInt(col.width, 10) || 100;
        },
        set cellWidth(val) {
          self.setColumnProperty(col, 'width', val);
        },
        get visible() {
          return col.visible !== false && !col.hidden;
        },
        set visible(val) {
          self.setColumnProperty(col, 'visible', val);
        },
        get vindex() {
          return self.options.columns.indexOf(col);
        },
        set vindex(targetIdx) {
          self.moveColumn(col, targetIdx);
        },
        get displayIndex() {
          return self.options.columns.indexOf(col);
        },
        set displayIndex(targetIdx) {
          self.moveColumn(col, targetIdx);
        },
        get header() {
          return {
            get text() {
              return col.label || col.key;
            },
            set text(val) {
              self.setColumnProperty(col, 'label', val);
            },
            get tooltip() {
              return col.headerTooltip || (col.header && col.header.tooltip);
            },
            set tooltip(val) {
              self.setColumnProperty(col, 'headerTooltip', val);
            }
          };
        }
      };
    }

    /**
     * 그룹 헤더 레이아웃 제어 프록시 (LunaGrid 호환 layoutByName)
     * @param {string} groupName - 그룹 식별자
     */
    layoutByName(groupName) {
      const self = this;
      return {
        get header() {
          return {
            get text() {
              return groupName;
            },
            set text(val) {
              self.options.columns.forEach(col => {
                if (col.group === groupName) col.group = val;
              });
              self._renderHeader();
            },
            get tooltip() {
              return (self.options.groupTooltips && self.options.groupTooltips[groupName]) || '';
            },
            set tooltip(val) {
              if (!self.options.groupTooltips) self.options.groupTooltips = {};
              self.options.groupTooltips[groupName] = val;
              self._renderHeader();
            }
          };
        },
        get visible() {
          return self.options.columns.some(col => col.group === groupName && col.visible !== false && !col.hidden);
        },
        set visible(val) {
          self.options.columns.forEach(col => {
            if (col.group === groupName) {
              self.setColumnProperty(col, 'visible', val);
            }
          });
        },
        get expanded() {
          return self.isGroupExpanded(groupName);
        },
        set expanded(val) {
          if (val) self.expandGroup(groupName);
          else self.collapseGroup(groupName);
        },
        itemByName(name) {
          const col = self.options.columns.find(c => (c.key === name || c.name === name) && c.group === groupName);
          return col ? self.layoutByColumn(col) : null;
        },
        addItem(item, index) {
          const colKey = typeof item === 'string' ? item : (item.column || item.name || item.key);
          let col = self.columnByName(colKey) || self.columnByField(colKey);
          if (col) {
            col.group = groupName;
            if (typeof index === 'number') {
              self.moveColumn(col, index);
            } else {
              self._renderHeader();
              self._renderBody();
            }
          } else if (typeof item === 'object') {
            item.group = groupName;
            self.addColumn(item, index);
          }
        },
        removeItem(itemName) {
          const colKey = typeof itemName === 'string' ? itemName : (itemName.column || itemName.name || itemName.key);
          const col = self.options.columns.find(c => (c.key === colKey || c.name === colKey) && c.group === groupName);
          if (col) {
            col.group = null;
            self._renderHeader();
            self._renderBody();
          }
        }
      };
    }

    /**
     * 그리드 레이아웃에 아이템 추가 (addLayoutItem)
     * @param {string|Object} item - 추가할 컬럼명 또는 레이아웃 객체
     * @param {number} [index] - 삽입할 위치
     */
    addLayoutItem(item, index) {
      if (typeof item === 'string') {
        const col = this.columnByName(item) || this.columnByField(item);
        if (col && typeof index === 'number') {
          this.moveColumn(col, index);
        }
      } else if (typeof item === 'object') {
        if (item.items && Array.isArray(item.items)) {
          // 그룹 아이템
          const grpName = item.header ? item.header.text : item.name;
          item.items.forEach(child => {
            const childKey = typeof child === 'string' ? child : (child.column || child.name);
            const col = this.columnByName(childKey) || this.columnByField(childKey);
            if (col) col.group = grpName;
          });
          this._renderHeader();
          this._renderBody();
        } else {
          this.addColumn(item, index);
        }
      }
    }

    /**
     * 그리드 레이아웃에서 아이템 제거 (removeLayoutItem)
     * @param {string} itemName - 제거할 컬럼명 또는 그룹명
     */
    removeLayoutItem(itemName) {
      // 그룹명인지 확인
      const hasGroup = this.options.columns.some(col => col.group === itemName);
      if (hasGroup) {
        this.options.columns.forEach(col => {
          if (col.group === itemName) col.group = null;
        });
        this._renderHeader();
        this._renderBody();
        return;
      }

      // 개별 컬럼 숨김 또는 제거
      const col = this.columnByName(itemName) || this.columnByField(itemName);
      if (col) {
        this.setColumnProperty(col, 'visible', false);
      }
    }

    /**
     * 그룹 컬럼 펼치기 (expandGroup)
     * @param {string} groupName - 그룹명
     */
    expandGroup(groupName) {
      if (!groupName) return;
      this.groupExpandStates.set(groupName, true);
      this._renderHeader();
      this._renderBody();
      this._renderFooter();
    }

    /**
     * 그룹 컬럼 접기 (collapseGroup)
     * @param {string} groupName - 그룹명
     */
    collapseGroup(groupName) {
      if (!groupName) return;
      this.groupExpandStates.set(groupName, false);
      this._renderHeader();
      this._renderBody();
      this._renderFooter();
    }

    /**
     * 그룹 컬럼 접기/펼치기 토글 (toggleGroup)
     * @param {string} groupName - 그룹명
     */
    toggleGroup(groupName) {
      const current = this.isGroupExpanded(groupName);
      if (current) this.collapseGroup(groupName);
      else this.expandGroup(groupName);
    }

    isGroupExpanded(groupName) {
      return this.groupExpandStates.has(groupName) ? this.groupExpandStates.get(groupName) : true;
    }

    /**
     * 컬럼 위치 프로그래밍 방식 이동 (moveColumn)
     * @param {string|Object} colKeyOrName - 이동할 컬럼 Key, Name 또는 객체
     * @param {number} targetIndex - 이동할 목적지 인덱스 (0-based)
     */
    moveColumn(colKeyOrName, targetIndex = 0) {
      const col = typeof colKeyOrName === 'object' && colKeyOrName !== null
        ? colKeyOrName
        : this.columnByName(colKeyOrName) || this.columnByField(colKeyOrName);
      if (!col) return;

      const fromIdx = this.options.columns.indexOf(col);
      if (fromIdx === -1) return;

      const targetIdx = Math.max(0, Math.min(targetIndex, this.options.columns.length - 1));
      if (fromIdx === targetIdx) return;

      const movedCol = this.options.columns.splice(fromIdx, 1)[0];
      this.options.columns.splice(targetIdx, 0, movedCol);

      this._renderHeader();
      this._renderBody();
      this._renderFooter();

      if (typeof this.options.onColumnMove === 'function') {
        this.options.onColumnMove(this, col.key || col.name, fromIdx, targetIdx);
      }
    }

    /**
     * 그리드 디스플레이 옵션 설정 (fitStyle: 'none' | 'even' | 'evenFill' | 'fill')
     * @param {Object} displayOptions - { fitStyle: 'even' | 'evenFill' | 'fill' | 'none' }
     */
    setDisplayOptions(displayOptions = {}) {
      Object.assign(this.displayOptions, displayOptions);
      this._renderHeader();
      this._renderBody();
      this._renderFooter();
    }

    getDisplayOptions() {
      return Object.assign({}, this.displayOptions);
    }

    /**
     * 정렬 옵션 동적 설정 (SortingOptions)
     * @param {Object} sortingOptions - { enabled: true, style: 'exclusive' | 'inclusive' | 'reverse' | 'none', keepFocusedRow: true }
     */
    setSortingOptions(sortingOptions = {}) {
      Object.assign(this.sortingOptions, sortingOptions);
      if (this.sortingOptions.enabled === false || this.sortingOptions.style === 'none') {
        this.sortRules = [];
      }
      this._renderHeader();
      this._applyFilterAndSort();
    }

    getSortingOptions() {
      return Object.assign({}, this.sortingOptions);
    }

    /**
     * 프로그래밍 방식 정렬 수행 (orderBy / orderByFields)
     * @param {Array<string>} fields - 정렬할 필드명 또는 컬럼 Key 목록 (예: ['dept', 'salary'])
     * @param {Array<string>} directions - 정렬 방향 목록 (예: ['asc', 'desc'])
     */
    orderBy(fields = [], directions = []) {
      if (!Array.isArray(fields)) fields = [fields];
      if (!Array.isArray(directions)) directions = [directions];

      this.sortRules = fields.map((f, idx) => ({
        key: f,
        dir: (directions[idx] || 'asc').toLowerCase() === 'desc' ? 'desc' : 'asc'
      }));

      this._renderHeader();
      this._applyFilterAndSort();
    }

    orderByFields(fields = [], directions = []) {
      this.orderBy(fields, directions);
    }

    /**
     * 필터링 옵션 동적 설정 (FilteringOptions)
     * @param {Object} filteringOptions - { enabled: true }
     */
    setFilteringOptions(filteringOptions = {}) {
      Object.assign(this.filteringOptions, filteringOptions);
      if (this.filteringOptions.enabled === false) {
        this.clearColumnFilters();
      }
      this._renderHeader();
      this._applyFilterAndSort();
    }

    getFilteringOptions() {
      return Object.assign({}, this.filteringOptions);
    }

    /**
     * 특정 컬럼 필터 조건 프로그래밍 방식 설정 (setColumnFilters / setColumnFilter)
     * @param {string} colKey - 컬럼 Key
     * @param {Array<string>|string} filters - 필터 조건값 배열 또는 문자열
     */
    setColumnFilters(colKey, filters = []) {
      if (!colKey) return;
      if (filters === null || filters === undefined || (Array.isArray(filters) && filters.length === 0)) {
        delete this.columnFilters[colKey];
      } else {
        this.columnFilters[colKey] = filters;
      }
      this._renderHeader();
      this._applyFilterAndSort();
    }

    setColumnFilter(colKey, filters = []) {
      this.setColumnFilters(colKey, filters);
    }

    getColumnFilters(colKey) {
      return colKey ? this.columnFilters[colKey] : Object.assign({}, this.columnFilters);
    }

    /**
     * 컬럼 필터 추가 등록 (addColumnFilters)
     */
    addColumnFilters(colKey, filters = [], overwrite = true) {
      if (!colKey || !Array.isArray(filters)) return;
      let current = this.columnFilters[colKey] || [];
      if (!Array.isArray(current) || (current.length > 0 && typeof current[0] !== 'object')) {
        current = [];
      }

      filters.forEach(f => {
        const existIdx = current.findIndex(c => c.name === f.name);
        if (existIdx !== -1) {
          if (overwrite) current[existIdx] = Object.assign({}, f);
        } else {
          current.push(Object.assign({}, f));
        }
      });

      this.columnFilters[colKey] = current;
      this._renderHeader();
      this._applyFilterAndSort();
    }

    /**
     * 특정 필터 제거 (removeColumnFilters)
     */
    removeColumnFilters(colKey, filterNames = []) {
      if (!colKey || !this.columnFilters[colKey]) return;
      const names = Array.isArray(filterNames) ? filterNames : [filterNames];
      let current = this.columnFilters[colKey];
      if (Array.isArray(current)) {
        this.columnFilters[colKey] = current.filter(f => !names.includes(typeof f === 'object' ? f.name : f));
      }
      this._renderHeader();
      this._applyFilterAndSort();
    }

    /**
     * 특정 필터 활성화/비활성화 (activateColumnFilters)
     */
    activateColumnFilters(colKey, filterNames = [], active = true) {
      if (!colKey || !this.columnFilters[colKey]) return;
      const names = Array.isArray(filterNames) ? filterNames : [filterNames];
      let current = this.columnFilters[colKey];
      if (Array.isArray(current)) {
        current.forEach(f => {
          if (typeof f === 'object' && names.includes(f.name)) {
            f.active = Boolean(active);
          }
        });
      }
      this._renderHeader();
      this._applyFilterAndSort();
    }

    activateAllColumnFilters(colKey, active = true) {
      if (!colKey || !this.columnFilters[colKey]) return;
      let current = this.columnFilters[colKey];
      if (Array.isArray(current)) {
        current.forEach(f => {
          if (typeof f === 'object') f.active = Boolean(active);
        });
      }
      this._renderHeader();
      this._applyFilterAndSort();
    }

    /**
     * 필터 상태 토글 (toggleColumnFilters)
     */
    toggleColumnFilters(colKey, filterNames = []) {
      if (!colKey || !this.columnFilters[colKey]) return;
      const names = Array.isArray(filterNames) ? filterNames : [filterNames];
      let current = this.columnFilters[colKey];
      if (Array.isArray(current)) {
        current.forEach(f => {
          if (typeof f === 'object' && names.includes(f.name)) {
            f.active = !f.active;
          }
        });
      }
      this._renderHeader();
      this._applyFilterAndSort();
    }

    toggleAllColumnFilters(colKey) {
      if (!colKey || !this.columnFilters[colKey]) return;
      let current = this.columnFilters[colKey];
      if (Array.isArray(current)) {
        current.forEach(f => {
          if (typeof f === 'object') f.active = !f.active;
        });
      }
      this._renderHeader();
      this._applyFilterAndSort();
    }

    /**
     * 필터 숨기기/숨김 해제 (hideColumnFilters / hideAllColumnFilters)
     */
    hideColumnFilters(colKey, filterNames = [], hide = true) {
      if (!colKey || !this.columnFilters[colKey]) return;
      const names = Array.isArray(filterNames) ? filterNames : [filterNames];
      let current = this.columnFilters[colKey];
      if (Array.isArray(current)) {
        current.forEach(f => {
          if (typeof f === 'object' && names.includes(f.name)) {
            f.hidden = Boolean(hide);
          }
        });
      }
      this._renderHeader();
      this._applyFilterAndSort();
    }

    hideAllColumnFilters(colKey, hide = true) {
      if (!colKey || !this.columnFilters[colKey]) return;
      let current = this.columnFilters[colKey];
      if (Array.isArray(current)) {
        current.forEach(f => {
          if (typeof f === 'object') f.hidden = Boolean(hide);
        });
      }
      this._renderHeader();
      this._applyFilterAndSort();
    }

    /**
     * 컬럼 필터 초기화 (clearColumnFilters)
     * @param {string} [colKey] - 특정 컬럼만 초기화하거나 생략 시 전체 컬럼 필터 초기화
     */
    clearColumnFilters(colKey = null) {
      if (colKey) {
        delete this.columnFilters[colKey];
      } else {
        this.columnFilters = {};
      }
      this._renderHeader();
      this._applyFilterAndSort();
    }

    /**
     * 필터 패널 동적 설정 (FilterPanel)
     * @param {Object} filterPanelOptions - { visible: boolean, height: number, delay: number }
     */
    setFilterPanel(filterPanelOptions = {}) {
      Object.assign(this.filterPanel, filterPanelOptions);
      this._renderHeader();
    }

    getFilterPanel() {
      return Object.assign({}, this.filterPanel);
    }

    /**
     * 팝업 메뉴 등록 (PopupMenu)
     * @param {string} name - 팝업 메뉴 식별자
     * @param {Array} menuItems - [{ label: '상세보기', value: 'detail', icon: '🔍', callback: fn }]
     */
    addPopupMenu(name, menuItems = []) {
      this.popupMenus.set(name, menuItems);
    }

    setPopupMenu(name, menuItems = []) {
      this.addPopupMenu(name, menuItems);
    }

    /**
     * 계층형 룩업 트리 등록 (LookupTree)
     * @param {Object} treeConfig - { id, levels, keys, values, nodes }
     */
    addLookupTree(treeConfig = {}) {
      if (treeConfig && treeConfig.id) {
        this.lookupTrees.set(treeConfig.id, treeConfig);
        this._renderBody();
      }
    }

    setLookups(lookups = []) {
      if (Array.isArray(lookups)) {
        lookups.forEach(tree => this.addLookupTree(tree));
      } else if (typeof lookups === 'object') {
        this.addLookupTree(lookups);
      }
    }

    _showCellPopupMenu(triggerEl, menuName, row, colKey) {
      if (this._activePopupMenu) {
        this._activePopupMenu.remove();
        this._activePopupMenu = null;
      }

      const menuItems = this.popupMenus.get(menuName) || [];
      if (menuItems.length === 0) return;

      const menuEl = document.createElement('div');
      menuEl.className = 'luna-popup-menu';

      menuItems.forEach(item => {
        if (item.separator) {
          const sep = document.createElement('div');
          sep.className = 'luna-popup-menu-sep';
          menuEl.appendChild(sep);
          return;
        }

        const itemEl = document.createElement('div');
        itemEl.className = `luna-popup-menu-item ${item.disabled ? 'disabled' : ''}`;

        let iconHtml = item.icon ? `<span class="luna-popup-menu-icon">${item.icon}</span>` : '';
        itemEl.innerHTML = `
          ${iconHtml}
          <span class="luna-popup-menu-label">${this._escapeHtml(item.label || item.text || item.value)}</span>
        `;

        if (!item.disabled) {
          itemEl.addEventListener('click', (e) => {
            e.stopPropagation();
            menuEl.remove();
            this._activePopupMenu = null;

            if (typeof item.callback === 'function') {
              item.callback(this, row, colKey, item);
            } else if (typeof this.options.onMenuItemClicked === 'function') {
              this.options.onMenuItemClicked(this, row, colKey, item);
            }
          });
        }

        menuEl.appendChild(itemEl);
      });

      document.body.appendChild(menuEl);
      this._activePopupMenu = menuEl;

      // 위치 계산
      const rect = triggerEl.getBoundingClientRect();
      menuEl.style.position = 'fixed';
      menuEl.style.left = `${rect.left}px`;
      menuEl.style.top = `${rect.bottom + 4}px`;
      menuEl.style.zIndex = '99999';

      // 뷰포트 초과 방지
      const menuRect = menuEl.getBoundingClientRect();
      if (menuRect.right > window.innerWidth) {
        menuEl.style.left = `${rect.right - menuRect.width}px`;
      }
      if (menuRect.bottom > window.innerHeight) {
        menuEl.style.top = `${rect.top - menuRect.height - 4}px`;
      }

      // 바깥 클릭 시 닫기
      const closeHandler = (e) => {
        if (!menuEl.contains(e.target) && e.target !== triggerEl) {
          menuEl.remove();
          this._activePopupMenu = null;
          document.removeEventListener('click', closeHandler);
        }
      };
      setTimeout(() => document.addEventListener('click', closeHandler), 0);
    }

    search(query = '') {
      this.searchQuery = String(query).trim().toLowerCase();
      this.currentPage = 1;
      this._applyFilterAndSort();
    }

    setTheme(themeName = 'default') {
      this.options.theme = themeName;
      this.container.setAttribute('data-theme', themeName);
      this._emit('themeChanged', themeName);
    }

    copySelectedToClipboard() {
      let targetRows = this.getSelectedRows();
      if (targetRows.length === 0 && this.selectedRange) {
        // 범위 선택 영역 복사
        const minRow = Math.min(this.selectedRange.startRow, this.selectedRange.endRow);
        const maxRow = Math.max(this.selectedRange.startRow, this.selectedRange.endRow);
        const minCol = Math.min(this.selectedRange.startCol, this.selectedRange.endCol);
        const maxCol = Math.max(this.selectedRange.startCol, this.selectedRange.endCol);
        const visibleCols = this.options.columns.filter(c => !c.hidden).slice(minCol, maxCol + 1);

        const headers = visibleCols.map(c => c.label || c.key).join('\t');
        const rows = this.displayData.slice(minRow, maxRow + 1).map(row => {
          return visibleCols.map(c => row[c.key] ?? '').join('\t');
        }).join('\n');

        const textToCopy = `${headers}\n${rows}`;
        navigator.clipboard.writeText(textToCopy).then(() => {
          this.showToast(`📋 선택 영역(${maxRow - minRow + 1}행 x ${visibleCols.length}열)이 클립보드에 복사되었습니다.`);
        });
        return;
      }

      if (targetRows.length === 0) targetRows = this.displayData;

      const visibleCols = this.options.columns.filter(c => !c.hidden);
      const headers = visibleCols.map(c => c.label || c.key).join('\t');
      const rows = targetRows.map(row => visibleCols.map(c => row[c.key] ?? '').join('\t')).join('\n');
      const textToCopy = `${headers}\n${rows}`;

      navigator.clipboard.writeText(textToCopy).then(() => {
        this.showToast(`📋 ${targetRows.length}건이 클립보드에 복사되었습니다. (엑셀에 Ctrl+V 가능)`);
      });
    }

    /**
     * 엑셀(Excel XML / XLSX) 파일 내보내기 (exportToExcel)
     */
    exportToExcel(filename = 'luna_grid_export.xlsx', options = {}) {
      return this.exportGrid(Object.assign({ type: 'excel', fileName: filename }, options));
    }

    /**
     * CSV 파일 내보내기 (exportToCsv)
     */
    exportToCsv(filename = 'luna_grid_export.csv', options = {}) {
      const targetCols = (options.allColumns ? this.options.columns : this.options.columns.filter(c => !c.hidden));
      const dataRows = options.onlySelected && this.getSelectedRows ? this.getSelectedRows() : (this.filteredData && this.filteredData.length > 0 ? this.filteredData : this.displayData);
      const lookupDisplay = options.lookupDisplay !== false;
      const showHeader = options.header !== false;

      const lines = [];
      if (showHeader) {
        lines.push(targetCols.map(c => `"${String(c.label || c.key).replace(/"/g, '""')}"`).join(','));
      }
      dataRows.forEach(row => {
        const line = targetCols.map(col => {
          let val = this._getCellValue(row, col);
          if (lookupDisplay && (col.lookupTreeId || col.lookupSourceId)) {
            val = this._getLookupLabel(col, val, row);
          } else if (lookupDisplay && col.lookupData && col.lookupData[val] !== undefined) {
            val = col.lookupData[val];
          } else if (lookupDisplay && Array.isArray(col.values) && Array.isArray(col.labels)) {
            const vIdx = col.values.findIndex(v => String(v) === String(val));
            if (vIdx !== -1 && col.labels[vIdx]) val = col.labels[vIdx];
          }
          return `"${String(val ?? '').replace(/"/g, '""')}"`;
        }).join(',');
        lines.push(line);
      });

      const csvContent = '\uFEFF' + lines.join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      this._downloadBlob(blob, filename);
      this.showToast(`📥 CSV 파일 다운로드 완료: ${filename}`);
      if (typeof options.done === 'function') options.done(this);
    }

    /**
     * TSV(Tab-Separated Values) 파일 내보내기 (exportToTsv)
     */
    exportToTsv(filename = 'luna_grid_export.tsv', options = {}) {
      const targetCols = (options.allColumns ? this.options.columns : this.options.columns.filter(c => !c.hidden));
      const dataRows = options.onlySelected && this.getSelectedRows ? this.getSelectedRows() : (this.filteredData && this.filteredData.length > 0 ? this.filteredData : this.displayData);
      const lookupDisplay = options.lookupDisplay !== false;
      const showHeader = options.header !== false;

      const lines = [];
      if (showHeader) {
        lines.push(targetCols.map(c => String(c.label || c.key).replace(/\t|\r?\n/g, ' ')).join('\t'));
      }
      dataRows.forEach(row => {
        const line = targetCols.map(col => {
          let val = this._getCellValue(row, col);
          if (lookupDisplay && (col.lookupTreeId || col.lookupSourceId)) {
            val = this._getLookupLabel(col, val, row);
          } else if (lookupDisplay && col.lookupData && col.lookupData[val] !== undefined) {
            val = col.lookupData[val];
          } else if (lookupDisplay && Array.isArray(col.values) && Array.isArray(col.labels)) {
            const vIdx = col.values.findIndex(v => String(v) === String(val));
            if (vIdx !== -1 && col.labels[vIdx]) val = col.labels[vIdx];
          }
          return String(val ?? '').replace(/\t|\r?\n/g, ' ');
        }).join('\t');
        lines.push(line);
      });

      const tsvContent = '\uFEFF' + lines.join('\r\n');
      const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
      this._downloadBlob(blob, filename);
      this.showToast(`📥 TSV 파일 다운로드 완료: ${filename}`);
      if (typeof options.done === 'function') options.done(this);
    }

    /**
     * XML 파일 내보내기 (exportToXml)
     */
    exportToXml(filename = 'luna_grid_export.xml', options = {}) {
      const targetCols = (options.allColumns ? this.options.columns : this.options.columns.filter(c => !c.hidden));
      const dataRows = options.onlySelected && this.getSelectedRows ? this.getSelectedRows() : (this.filteredData && this.filteredData.length > 0 ? this.filteredData : this.displayData);
      const lookupDisplay = options.lookupDisplay !== false;
      const rootTag = options.rootTag || 'LunaGrid';
      const rowTag = options.rowTag || 'Row';

      const escapeXml = (unsafe) => String(unsafe ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootTag}>\n`;
      dataRows.forEach((row, rIdx) => {
        xml += `  <${rowTag} id="${escapeXml(row.id || rIdx + 1)}">\n`;
        targetCols.forEach(col => {
          let val = this._getCellValue(row, col);
          if (lookupDisplay && (col.lookupTreeId || col.lookupSourceId)) {
            val = this._getLookupLabel(col, val, row);
          } else if (lookupDisplay && col.lookupData && col.lookupData[val] !== undefined) {
            val = col.lookupData[val];
          } else if (lookupDisplay && Array.isArray(col.values) && Array.isArray(col.labels)) {
            const vIdx = col.values.findIndex(v => String(v) === String(val));
            if (vIdx !== -1 && col.labels[vIdx]) val = col.labels[vIdx];
          }
          const colKey = col.key || col.name || `col_${col.fieldName}`;
          xml += `    <${colKey} label="${escapeXml(col.label || colKey)}">${escapeXml(val)}</${colKey}>\n`;
        });
        xml += `  </${rowTag}>\n`;
      });
      xml += `</${rootTag}>\n`;

      const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
      this._downloadBlob(blob, filename);
      this.showToast(`📥 XML 파일 다운로드 완료: ${filename}`);
      if (typeof options.done === 'function') options.done(this);
    }

    /**
     * JSON 파일 내보내기 (exportToJson)
     */
    exportToJson(filename = 'luna_grid_export.json', options = {}) {
      const data = options.raw ? (this.dataAdapter ? this.dataAdapter.getRows() : this.getData()) : this.getData();
      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      this._downloadBlob(blob, filename);
      this.showToast(`📥 JSON 파일 다운로드 완료: ${filename}`);
      if (typeof options.done === 'function') options.done(this);
    }

    /**
     * HTML 단독 보고서 문서 내보내기 (exportToHtml)
     */
    exportToHtml(filename = 'luna_grid_export.html', options = {}) {
      const targetCols = (options.allColumns ? this.options.columns : this.options.columns.filter(c => !c.hidden));
      const dataRows = options.onlySelected && this.getSelectedRows ? this.getSelectedRows() : (this.filteredData && this.filteredData.length > 0 ? this.filteredData : this.displayData);
      const lookupDisplay = options.lookupDisplay !== false;
      const title = options.title || this.options.title || 'LunaGrid Data Report';

      let tableHtml = `<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%; font-family:sans-serif; font-size:13px; text-align:left;">\n<thead>\n<tr style="background-color:#1e293b; color:#ffffff;">\n`;
      tableHtml += `<th style="padding:10px; width:40px; text-align:center;">No.</th>\n`;
      targetCols.forEach(col => {
        tableHtml += `<th style="padding:10px; text-align:${col.align || 'left'};">${this._escapeHtml(col.label || col.key)}</th>\n`;
      });
      tableHtml += `</tr>\n</thead>\n<tbody>\n`;

      dataRows.forEach((row, rIdx) => {
        const bg = rIdx % 2 === 0 ? '#ffffff' : '#f8fafc';
        tableHtml += `<tr style="background-color:${bg};">\n`;
        tableHtml += `<td style="padding:8px; text-align:center; color:#64748b;">${rIdx + 1}</td>\n`;
        targetCols.forEach(col => {
          let val = this._getCellValue(row, col);
          if (lookupDisplay && (col.lookupTreeId || col.lookupSourceId)) {
            val = this._getLookupLabel(col, val, row);
          } else if (lookupDisplay && col.lookupData && col.lookupData[val] !== undefined) {
            val = col.lookupData[val];
          } else if (lookupDisplay && Array.isArray(col.values) && Array.isArray(col.labels)) {
            const vIdx = col.values.findIndex(v => String(v) === String(val));
            if (vIdx !== -1 && col.labels[vIdx]) val = col.labels[vIdx];
          }
          tableHtml += `<td style="padding:8px; text-align:${col.align || 'left'};">${this._escapeHtml(String(val ?? ''))}</td>\n`;
        });
        tableHtml += `</tr>\n`;
      });
      tableHtml += `</tbody>\n</table>`;

      const fullHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>${this._escapeHtml(title)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; padding: 30px; background-color: #f1f5f9; color: #1e293b; }
    .report-card { background: #ffffff; border-radius: 8px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); max-width: 1200px; margin: 0 auto; }
    h1 { font-size: 22px; margin-top: 0; color: #0f172a; }
    .meta-info { font-size: 12px; color: #64748b; margin-bottom: 20px; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="report-card">
    <h1>${this._escapeHtml(title)}</h1>
    <div class="meta-info">
      <span>총 <strong>${dataRows.length}</strong>건의 레코드</span>
      <span>출력 일시: ${new Date().toLocaleString()}</span>
    </div>
    ${tableHtml}
  </div>
</body>
</html>`;

      if (options.target === '_blank') {
        const win = window.open('', '_blank');
        if (win) {
          win.document.write(fullHtml);
          win.document.close();
        }
      } else {
        const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8;' });
        this._downloadBlob(blob, filename);
        this.showToast(`📥 HTML 파일 다운로드 완료: ${filename}`);
      }
      if (typeof options.done === 'function') options.done(this);
    }

    /**
     * PDF 인쇄/문서 내보내기 (exportToPdf)
     */
    exportToPdf(filename = 'luna_grid_export.pdf', options = {}) {
      const targetCols = (options.allColumns ? this.options.columns : this.options.columns.filter(c => !c.hidden));
      const dataRows = options.onlySelected && this.getSelectedRows ? this.getSelectedRows() : (this.filteredData && this.filteredData.length > 0 ? this.filteredData : this.displayData);
      const lookupDisplay = options.lookupDisplay !== false;
      const title = options.title || this.options.title || 'LunaGrid Report';

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('팝업 차단을 해제해 주세요.');
        return;
      }

      let rowsHtml = '';
      dataRows.forEach((row, rIdx) => {
        rowsHtml += `<tr><td style="text-align:center;">${rIdx + 1}</td>`;
        targetCols.forEach(col => {
          let val = this._getCellValue(row, col);
          if (lookupDisplay && (col.lookupTreeId || col.lookupSourceId)) {
            val = this._getLookupLabel(col, val, row);
          } else if (lookupDisplay && col.lookupData && col.lookupData[val] !== undefined) {
            val = col.lookupData[val];
          } else if (lookupDisplay && Array.isArray(col.values) && Array.isArray(col.labels)) {
            const vIdx = col.values.findIndex(v => String(v) === String(val));
            if (vIdx !== -1 && col.labels[vIdx]) val = col.labels[vIdx];
          }
          rowsHtml += `<td style="text-align:${col.align || 'left'};">${this._escapeHtml(String(val ?? ''))}</td>`;
        });
        rowsHtml += `</tr>`;
      });

      const printDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${this._escapeHtml(title)}</title>
  <style>
    @page { size: A4 landscape; margin: 15mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 11px; margin: 0; color: #111; }
    h2 { margin: 0 0 10px 0; font-size: 16px; border-bottom: 2px solid #333; padding-bottom: 5px; }
    .header-info { display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 10px; color: #555; }
    table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
    tr { page-break-inside: avoid; page-break-after: auto; }
    th, td { border: 1px solid #ccc; padding: 5px 7px; }
    th { background: #eee; font-weight: bold; text-align: center; }
  </style>
</head>
<body>
  <h2>${this._escapeHtml(title)}</h2>
  <div class="header-info">
    <span>총 출력 데이터: ${dataRows.length}건</span>
    <span>출력 일시: ${new Date().toLocaleString()}</span>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width:30px;">No.</th>
        ${targetCols.map(c => `<th>${this._escapeHtml(c.label || c.key)}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 250);
    };
  <\/script>
</body>
</html>`;

      printWindow.document.write(printDoc);
      printWindow.document.close();
      this.showToast(`🖨️ PDF 인쇄 미리보기 창이 열렸습니다.`);
      if (typeof options.done === 'function') options.done(this);
    }

    _downloadBlob(blob, filename) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    }

    /**
     * 간편 데이터 내보내기 통합 API (exportData)
     * @param {'excel'|'csv'|'tsv'|'json'|'html'|'xml'|'pdf'} type - 내보내기 형식
     * @param {string} filename - 파일명
     * @param {Object} options - 추가 옵션
     */
    exportData(type = 'excel', filename = null, options = {}) {
      const lowerType = (type || 'excel').toLowerCase();
      if (lowerType === 'excel' || lowerType === 'xlsx') {
        return this.exportToExcel(filename || 'export.xlsx', options);
      } else if (lowerType === 'csv') {
        return this.exportToCsv(filename || 'export.csv', options);
      } else if (lowerType === 'tsv') {
        return this.exportToTsv(filename || 'export.tsv', options);
      } else if (lowerType === 'json') {
        return this.exportToJson(filename || 'export.json', options);
      } else if (lowerType === 'html') {
        return this.exportToHtml(filename || 'export.html', options);
      } else if (lowerType === 'xml') {
        return this.exportToXml(filename || 'export.xml', options);
      } else if (lowerType === 'pdf') {
        return this.exportToPdf(filename || 'export.pdf', options);
      }
      return this.exportToExcel(filename || 'export.xlsx', options);
    }

    /**
     * LunaGrid 호환 통합 내보내기 엔진 (exportGrid)
     * type: 'excel' | 'csv' | 'html' | 'pdf' | 'xml' | 'tsv' | 'json'
     * @param {Object} options - 내보내기 옵션
     */
    exportGrid(options = {}) {
      const type = (options.type || 'excel').toLowerCase();
      const fileName = options.fileName || (
        type === 'csv' ? 'gridExport.csv' :
          type === 'tsv' ? 'gridExport.tsv' :
            type === 'xml' ? 'gridExport.xml' :
              type === 'json' ? 'gridExport.json' :
                type === 'html' ? 'gridExport.html' :
                  type === 'pdf' ? 'gridExport.pdf' :
                    'gridExport.xlsx'
      );
      const sheetName = options.sheetName || 'Sheet1';
      const showIndicator = options.indicator === 'visible' || (options.indicator !== 'hidden' && this.options.indicator && this.options.indicator.visible !== false);
      const showHeader = options.header !== 'hidden';
      const showFooter = options.footer === 'visible' || (options.footer !== 'hidden' && (this.options.showSummary || this.options.summary));
      const lookupDisplay = options.lookupDisplay !== false;
      const allCols = options.allColumns === true;
      const progress = options.showProgress === true;
      const applyDynamicStyles = options.applyDynamicStyles === true;
      const exportShape = options.exportShape === true || (options.exportOptions && options.exportOptions.exportShape === true);
      const isSheetProtect = options.sheetProtect === true || options.sheetProtection !== undefined;
      const sheetProtectOptions = typeof options.sheetProtection === 'object' ? options.sheetProtection : (typeof options.sheetProtect === 'object' ? options.sheetProtect : { password: '', selectLockedCells: true, selectUnlockedCells: true });
      const exportMemoCfg = options.exportMemo;

      // Document Title/Subtitle/Tail 파싱
      const parseDocTitle = (cfg, defaultAlign = 'center', defTop = 1, defBtm = 1) => {
        if (!cfg) return null;
        if (typeof cfg === 'string') return { message: cfg, visible: true, spaceTop: defTop, spaceBottom: defBtm, align: defaultAlign };
        if (typeof cfg === 'object' && cfg.message && cfg.visible !== false) {
          return Object.assign({ visible: true, spaceTop: defTop, spaceBottom: defBtm, align: defaultAlign }, cfg);
        }
        return null;
      };

      const docTitle = parseDocTitle(options.documentTitle, 'center', 1, 1);
      const docSubtitle = parseDocTitle(options.documentSubtitle || options.documentSubTitle, 'right', 0, 1);
      const docTail = parseDocTitle(options.documentTail, 'left', 1, 0);

      if (progress && options.progressMessage) {
        this.showToast(options.progressMessage);
      }

      if (type === 'csv') {
        this.exportToCsv(fileName, options);
        return;
      }
      if (type === 'tsv' || type === 'txt') {
        this.exportToTsv(fileName, options);
        return;
      }
      if (type === 'xml') {
        this.exportToXml(fileName, options);
        return;
      }
      if (type === 'json') {
        this.exportToJson(fileName, options);
        return;
      }
      if (type === 'html') {
        this.exportToHtml(fileName, options);
        return;
      }
      if (type === 'pdf' || type === 'print') {
        this.exportToPdf(fileName, options);
        return;
      }

      // 다중 그리드 일괄 내보내기 (exportGrids)
      if (Array.isArray(options.exportGrids) && options.exportGrids.length > 0) {
        return LunaGrid.exportGrid(options);
      }

      const targetCols = allCols ? this.options.columns : this.options.columns.filter(c => !c.hidden);
      const dataRows = this.filteredData && this.filteredData.length > 0 ? this.filteredData : this.displayData;
      const isGrouped = this.isGrouped && this.isGrouped();
      const hasColGroups = targetCols.some(c => c.group);
      const totalColCount = targetCols.length + (showIndicator ? 1 : 0);

      // 도형 렌더러 엑셀 변환 헬퍼 (shape-export)
      const formatShapeValue = (col, rawVal, row, rIdx) => {
        if (!exportShape) return rawVal;
        const r = col.renderer;
        if (!r) return rawVal;
        const rType = typeof r === 'string' ? r : r.type;

        if (rType === 'shape') {
          let shapeType = r.shape || 'circle';
          if (typeof r.shapeCallback === 'function') {
            shapeType = r.shapeCallback(this, row, col.key, rawVal, rIdx) || shapeType;
          }
          const shapeSymbols = {
            'circle': '●', 'ellipse': '●', 'square': '■', 'rectangle': '■',
            'triangle': '▲', 'invertedTriangle': '▼', 'diamond': '◆', 'star': '★',
            'plus': '➕', 'minus': '➖', 'check': '✔'
          };
          const symbol = shapeSymbols[shapeType] || '●';
          return `${symbol} ${rawVal ?? ''}`.trim();
        }

        if (rType === 'bar') {
          const num = Number(rawVal) || 0;
          const min = r.minimum !== undefined ? r.minimum : 0;
          const max = r.maximum !== undefined ? r.maximum : 100;
          const percent = Math.max(0, Math.min(100, Math.round(((num - min) / (max - min)) * 100)));
          const filled = Math.round(percent / 10);
          const barStr = '█'.repeat(filled) + '░'.repeat(10 - filled);
          return `${barStr} ${percent}%`;
        }

        if (rType === 'signal') {
          const num = Number(rawVal) || 0;
          if (num >= 80) return '🟢 우수';
          if (num >= 50) return '🟡 보통';
          return '🔴 주의';
        }

        return rawVal;
      };

      // 엑셀 메모 파싱 헬퍼 (excel-memo)
      const getCellMemo = (col, val, row, rIdx, isHeader = false) => {
        if (isHeader) {
          if (col && col.header && col.header.excelMemo) {
            const hm = col.header.excelMemo;
            return typeof hm === 'string' ? { author: 'LunaGrid', message: hm } : hm;
          }
          if (col && col.excelMemo) {
            const cm = col.excelMemo;
            return typeof cm === 'string' ? { author: 'LunaGrid', message: cm } : cm;
          }
          return null;
        }

        if (exportMemoCfg) {
          if (typeof exportMemoCfg.callback === 'function') {
            const memoRes = exportMemoCfg.callback(this, rIdx, row, col.key || col.fieldName, row?._memo);
            if (memoRes) {
              return typeof memoRes === 'string' ? { author: 'LunaGrid', message: memoRes } : memoRes;
            }
          }
        }

        if (row && row._memos && row._memos[col.key]) {
          const rm = row._memos[col.key];
          return typeof rm === 'string' ? { author: 'LunaGrid', message: rm } : rm;
        }

        return null;
      };

      const formatXmlComment = (memoObj) => {
        if (!memoObj || !memoObj.message) return '';
        const author = this._escapeHtml(memoObj.author || 'LunaGrid');
        const msg = this._escapeHtml(memoObj.message);
        return `<Comment ss:Author="${author}"><Data xmlns="http://www.w3.org/TR/REC-html40"><B>${author}:</B>&#10;${msg}</Data></Comment>`;
      };

      // 동적 스타일 맵 (customStylesMap)
      const customStylesMap = new Map();

      // 셀 잠금 여부 판별 (sheet-protection)
      const isColLocked = (col) => {
        if (col.cellProtectProps && col.cellProtectProps.locked !== undefined) return col.cellProtectProps.locked;
        if (col.readOnly === false || col.editable === true) return false;
        return true;
      };

      const getCellStyleId = (col, val, row, rIdx) => {
        const locked = isColLocked(col);
        const lockSuffix = isSheetProtect ? (locked ? '_L' : '_U') : '';
        let defaultStyleId = (col.exportStyleName || (col.dataType === 'number' ? 'sNumber' : (col.dataType === 'date' || col.dataType === 'datetime' ? 'sDate' : 'sText'))) + lockSuffix;

        if (applyDynamicStyles && col.dynamicStyles) {
          let dynStyle = null;
          if (typeof col.dynamicStyles === 'function') {
            dynStyle = col.dynamicStyles(this, row, col.key || col.fieldName, val, rIdx);
          } else if (Array.isArray(col.dynamicStyles)) {
            for (let rule of col.dynamicStyles) {
              let match = false;
              if (typeof rule.criteria === 'function') {
                match = rule.criteria(val, row, rIdx);
              } else if (typeof rule.criteria === 'string') {
                const expr = rule.criteria.replace(/values\['(\w+)'\]/g, (_, k) => JSON.stringify(row[k] ?? ''))
                  .replace(/value/g, JSON.stringify(val ?? ''));
                try {
                  match = Boolean(new Function(`return (${expr});`)());
                } catch (e) { match = false; }
              }
              if (match) {
                if (rule.exportStyleName) return rule.exportStyleName + lockSuffix;
                dynStyle = rule.styles;
                break;
              }
            }
          }

          if (dynStyle && typeof dynStyle === 'object') {
            const bg = dynStyle.background || dynStyle.backgroundColor;
            const color = dynStyle.color || dynStyle.fontColor;
            const bold = dynStyle.fontWeight === 'bold' || dynStyle.bold === true;
            const align = dynStyle.align || (col.dataType === 'number' ? 'Right' : 'Left');
            const key = `sDyn_${String(bg || '').replace(/[^a-zA-Z0-9]/g, '')}_${String(color || '').replace(/[^a-zA-Z0-9]/g, '')}_${bold ? 'B' : 'N'}_${align}${lockSuffix}`;
            if (!customStylesMap.has(key)) {
              customStylesMap.set(key, { bg, color, bold, align: align.charAt(0).toUpperCase() + align.slice(1), locked });
            }
            return key;
          }
        }
        return defaultStyleId;
      };

      // 행 그룹핑 데이터 구조 생성
      const groups = new Map();
      if (isGrouped) {
        dataRows.forEach((row, idx) => {
          const grpKey = this.groupColumns.map(col => String(row[col] ?? '')).join(' / ');
          if (!groups.has(grpKey)) groups.set(grpKey, []);
          groups.get(grpKey).push({ row, originalIndex: idx });
        });
      }

      // 컬럼 그룹 맵핑 구조 생성 (layout-export)
      const colGroupsMap = [];
      let curColGrp = null;
      targetCols.forEach(col => {
        const gName = col.group || null;
        if (gName) {
          if (curColGrp && curColGrp.name === gName) {
            curColGrp.cols.push(col);
          } else {
            curColGrp = { name: gName, cols: [col] };
            colGroupsMap.push(curColGrp);
          }
        } else {
          curColGrp = null;
          colGroupsMap.push({ name: null, cols: [col] });
        }
      });

      // userCells 및 오프셋 파싱 (user-cells)
      let userCells = Array.isArray(options.userCells) ? options.userCells : (typeof options.userCellsCallback === 'function' ? options.userCellsCallback(this) : []);
      const yOffset = typeof options.yOffset === 'number' ? Math.max(0, options.yOffset) : 0;
      const xOffset = typeof options.xOffset === 'number' ? Math.max(0, options.xOffset) : 0;

      // 1. SheetJS(XLSX) 라이브러리가 로드되어 있는 경우 고성능 바이너리 .xlsx 생성
      if (typeof window !== 'undefined' && window.XLSX) {
        const wb = window.XLSX.utils.book_new();
        const wsData = [];
        const merges = [];

        const ensureRowAndCol = (r, c) => {
          while (wsData.length <= r) {
            wsData.push(new Array(totalColCount + xOffset).fill(''));
          }
          while (wsData[r].length <= c) {
            wsData[r].push('');
          }
        };

        const addEmptyRows = (cnt) => {
          for (let i = 0; i < cnt; i++) wsData.push(new Array(totalColCount + xOffset).fill(''));
        };

        // userCells 사전 배치 (절대 좌표 또는 yOffset 이전)
        if (Array.isArray(userCells) && userCells.length > 0) {
          userCells.forEach(uc => {
            const r = uc.row !== undefined ? uc.row : (uc.r || 0);
            const c = uc.col !== undefined ? uc.col : (uc.c || 0);
            const val = uc.value !== undefined ? uc.value : (uc.text || '');
            const mRow = uc.mergeRow !== undefined ? uc.mergeRow : (uc.rowspan || 1);
            const mCol = uc.mergeCol !== undefined ? uc.mergeCol : (uc.colspan || 1);

            ensureRowAndCol(r + mRow - 1, c + mCol - 1);
            wsData[r][c] = val;

            if (mRow > 1 || mCol > 1) {
              merges.push({ s: { r, c }, e: { r: r + mRow - 1, c: c + mCol - 1 } });
            }
          });
        }

        // yOffset 위치까지 빈 행 패딩
        while (wsData.length < yOffset) {
          wsData.push(new Array(totalColCount + xOffset).fill(''));
        }

        // Document Title
        if (docTitle) {
          if (docTitle.spaceTop > 0) addEmptyRows(docTitle.spaceTop);
          const tRowIdx = wsData.length;
          const tRow = new Array(totalColCount + xOffset).fill('');
          tRow[xOffset] = docTitle.message;
          wsData.push(tRow);
          merges.push({ s: { r: tRowIdx, c: xOffset }, e: { r: tRowIdx, c: xOffset + totalColCount - 1 } });
          if (docTitle.spaceBottom > 0) addEmptyRows(docTitle.spaceBottom);
        }

        // Document Subtitle
        if (docSubtitle) {
          if (docSubtitle.spaceTop > 0) addEmptyRows(docSubtitle.spaceTop);
          const stRowIdx = wsData.length;
          const stRow = new Array(totalColCount + xOffset).fill('');
          stRow[xOffset] = docSubtitle.message;
          wsData.push(stRow);
          merges.push({ s: { r: stRowIdx, c: xOffset }, e: { r: stRowIdx, c: xOffset + totalColCount - 1 } });
          if (docSubtitle.spaceBottom > 0) addEmptyRows(docSubtitle.spaceBottom);
        }

        const headerStartRowIdx = wsData.length;
        const cellComments = []; // { r, c, a, t }

        // Header (다단 그룹 컬럼 레이아웃 지원)
        if (showHeader) {
          if (hasColGroups) {
            const headerRow1 = new Array(xOffset).fill('');
            const headerRow2 = new Array(xOffset).fill('');
            let cOffset = xOffset;

            if (showIndicator) {
              headerRow1.push('No.');
              headerRow2.push('');
              merges.push({ s: { r: headerStartRowIdx, c: cOffset }, e: { r: headerStartRowIdx + 1, c: cOffset } });
              cOffset++;
            }

            colGroupsMap.forEach(grp => {
              if (grp.name) {
                const grpSpan = grp.cols.length;
                headerRow1.push(grp.name);
                for (let i = 1; i < grpSpan; i++) headerRow1.push('');
                grp.cols.forEach((c, subIdx) => {
                  headerRow2.push(c.label || c.key);
                  const hMemo = getCellMemo(c, null, null, -1, true);
                  if (hMemo) cellComments.push({ r: headerStartRowIdx + 1, c: cOffset + subIdx, a: hMemo.author, t: hMemo.message });
                });

                if (grpSpan > 1) {
                  merges.push({ s: { r: headerStartRowIdx, c: cOffset }, e: { r: headerStartRowIdx, c: cOffset + grpSpan - 1 } });
                }
                cOffset += grpSpan;
              } else {
                const singleCol = grp.cols[0];
                headerRow1.push(singleCol.label || singleCol.key);
                headerRow2.push('');
                const hMemo = getCellMemo(singleCol, null, null, -1, true);
                if (hMemo) cellComments.push({ r: headerStartRowIdx, c: cOffset, a: hMemo.author, t: hMemo.message });
                merges.push({ s: { r: headerStartRowIdx, c: cOffset }, e: { r: headerStartRowIdx + 1, c: cOffset } });
                cOffset++;
              }
            });

            wsData.push(headerRow1);
            wsData.push(headerRow2);
          } else {
            const headerRow = new Array(xOffset).fill('');
            if (showIndicator) headerRow.push('No.');
            targetCols.forEach((col, cIdx) => {
              headerRow.push(col.label || col.key);
              const hMemo = getCellMemo(col, null, null, -1, true);
              if (hMemo) {
                const colPos = xOffset + (showIndicator ? 1 : 0) + cIdx;
                cellComments.push({ r: headerStartRowIdx, c: colPos, a: hMemo.author, t: hMemo.message });
              }
            });
            wsData.push(headerRow);
          }
        }

        if (isGrouped) {
          // 행 그룹핑 계층 내보내기
          let rowCounter = 1;
          groups.forEach((items, grpKey) => {
            // 그룹 헤더 행
            const grpHeaderRow = new Array(xOffset).fill('');
            if (showIndicator) grpHeaderRow.push('');
            grpHeaderRow.push(`[그룹] ${grpKey} (${items.length}건)`);
            wsData.push(grpHeaderRow);

            // 소속 데이터 행들
            items.forEach(({ row }) => {
              const curRIdx = wsData.length;
              const rowData = new Array(xOffset).fill('');
              if (showIndicator) rowData.push(rowCounter++);
              targetCols.forEach((col, cIdx) => {
                let val = this._getCellValue(row, col);
                const isImageCol = (col.renderer && (col.renderer.type === 'image' || col.renderer.type === 'icon')) || col.type === 'image' || col.exportImage === true;
                if (isImageCol) {
                  if (col.renderer && col.renderer.imageField && row[col.renderer.imageField] !== undefined) {
                    val = row[col.renderer.imageField];
                  }
                } else if (lookupDisplay && col.lookupData && col.lookupData[val] !== undefined) {
                  val = col.lookupData[val];
                } else if (lookupDisplay && Array.isArray(col.values) && Array.isArray(col.labels)) {
                  const vIdx = col.values.findIndex(v => String(v) === String(val));
                  if (vIdx !== -1 && col.labels[vIdx]) val = col.labels[vIdx];
                }

                val = formatShapeValue(col, val, row, rowCounter - 1);
                const cMemo = getCellMemo(col, val, row, rowCounter - 1, false);
                if (cMemo) {
                  const colPos = xOffset + (showIndicator ? 1 : 0) + cIdx;
                  cellComments.push({ r: curRIdx, c: colPos, a: cMemo.author, t: cMemo.message });
                }

                if (col.dataType === 'number' && typeof val === 'number') {
                  rowData.push(val);
                } else {
                  rowData.push(val !== undefined && val !== null ? String(val) : '');
                }
              });
              wsData.push(rowData);
            });

            // 그룹 소계 행
            const subtotalRow = new Array(xOffset).fill('');
            if (showIndicator) subtotalRow.push('소계');
            targetCols.forEach(col => {
              const numericVals = items.map(it => Number(it.row[col.key])).filter(v => !isNaN(v));
              if (col.dataType === 'number' && numericVals.length > 0) {
                const subSum = numericVals.reduce((acc, v) => acc + v, 0);
                subtotalRow.push(subSum);
              } else if (this.groupColumns.includes(col.key)) {
                subtotalRow.push(`${grpKey} 소계`);
              } else {
                subtotalRow.push('');
              }
            });
            wsData.push(subtotalRow);
          });
        } else {
          // 일반 플랫 데이터 행들
          dataRows.forEach((row, rIdx) => {
            const curRIdx = wsData.length;
            const rowData = new Array(xOffset).fill('');
            if (showIndicator) rowData.push(rIdx + 1);
            targetCols.forEach((col, cIdx) => {
              let val = this._getCellValue(row, col);
              const isImageCol = (col.renderer && (col.renderer.type === 'image' || col.renderer.type === 'icon')) || col.type === 'image' || col.exportImage === true;
              if (isImageCol) {
                if (col.renderer && col.renderer.imageField && row[col.renderer.imageField] !== undefined) {
                  val = row[col.renderer.imageField];
                }
              } else if (lookupDisplay && col.lookupData && col.lookupData[val] !== undefined) {
                val = col.lookupData[val];
              } else if (lookupDisplay && Array.isArray(col.values) && Array.isArray(col.labels)) {
                const vIdx = col.values.findIndex(v => String(v) === String(val));
                if (vIdx !== -1 && col.labels[vIdx]) val = col.labels[vIdx];
              }

              val = formatShapeValue(col, val, row, rIdx);
              const cMemo = getCellMemo(col, val, row, rIdx, false);
              if (cMemo) {
                const colPos = xOffset + (showIndicator ? 1 : 0) + cIdx;
                cellComments.push({ r: curRIdx, c: colPos, a: cMemo.author, t: cMemo.message });
              }

              if (col.dataType === 'number' && typeof val === 'number') {
                rowData.push(val);
              } else {
                rowData.push(val !== undefined && val !== null ? String(val) : '');
              }
            });
            wsData.push(rowData);
          });
        }

        // Footer Summary
        if (showFooter && this.options.summary) {
          const footerRow = new Array(xOffset).fill('');
          if (showIndicator) footerRow.push('총계');
          const summaryConfig = this.options.summary || {};
          const fieldsConfig = summaryConfig.fields || {};
          targetCols.forEach(col => {
            const agg = fieldsConfig[col.key];
            if (agg) {
              footerRow.push(this._computeAggregation(dataRows, col.key, agg));
            } else {
              footerRow.push('');
            }
          });
          wsData.push(footerRow);
        }

        // Document Tail
        if (docTail) {
          if (docTail.spaceTop > 0) addEmptyRows(docTail.spaceTop);
          const tRowIdx = wsData.length;
          const tRow = new Array(totalColCount + xOffset).fill('');
          tRow[xOffset] = docTail.message;
          wsData.push(tRow);
          merges.push({ s: { r: tRowIdx, c: xOffset }, e: { r: tRowIdx, c: xOffset + totalColCount - 1 } });
          if (docTail.spaceBottom > 0) addEmptyRows(docTail.spaceBottom);
        }

        const ws = window.XLSX.utils.aoa_to_sheet(wsData);
        if (merges.length > 0) {
          ws['!merges'] = merges;
        }
        if (cellComments.length > 0) {
          cellComments.forEach(cm => {
            const cellRef = window.XLSX.utils.encode_cell({ r: cm.r, c: cm.c });
            if (ws[cellRef]) {
              ws[cellRef].c = [{ a: cm.a || 'LunaGrid', t: cm.t || '' }];
            }
          });
        }
        if (isSheetProtect) {
          ws['!protect'] = sheetProtectOptions;
        }
        window.XLSX.utils.book_append_sheet(wb, ws, sheetName);
        window.XLSX.writeFile(wb, fileName);

        this.showToast(`📥 엑셀 파일 내보내기 완료: ${fileName}`);
        if (typeof options.done === 'function') options.done(this);
        return;
      }

      // 2. 외부 라이브러리 없이 순수 XML Spreadsheet 2003 엔진으로 고품질 엑셀 생성
      let xmlRows = '';
      const totalColspan = totalColCount;

      const makeXmlEmptyRows = (cnt) => {
        let res = '';
        for (let i = 0; i < cnt; i++) res += `<Row ss:Height="14"/>\n`;
        return res;
      };

      // userCells XML 렌더링
      if (Array.isArray(userCells) && userCells.length > 0) {
        const uCellsByRow = new Map();
        userCells.forEach(uc => {
          const r = uc.row !== undefined ? uc.row : (uc.r || 0);
          if (!uCellsByRow.has(r)) uCellsByRow.set(r, []);
          uCellsByRow.get(r).push(uc);
        });

        const sortedRows = Array.from(uCellsByRow.keys()).sort((a, b) => a - b);
        let lastR = -1;
        sortedRows.forEach(r => {
          while (lastR + 1 < r) {
            xmlRows += `<Row ss:Height="18"/>\n`;
            lastR++;
          }
          let uRowCells = '';
          const rowItems = uCellsByRow.get(r).sort((a, b) => (a.col ?? a.c ?? 0) - (b.col ?? b.c ?? 0));
          let curCol = 0;
          rowItems.forEach(uc => {
            const c = uc.col !== undefined ? uc.col : (uc.c || 0);
            while (curCol < c) {
              uRowCells += `<Cell ss:StyleID="sText"><Data ss:Type="String"></Data></Cell>`;
              curCol++;
            }
            const val = uc.value !== undefined ? uc.value : (uc.text || '');
            const mRow = uc.mergeRow !== undefined ? uc.mergeRow : (uc.rowspan || 1);
            const mCol = uc.mergeCol !== undefined ? uc.mergeCol : (uc.colspan || 1);
            const mAcross = mCol > 1 ? `ss:MergeAcross="${mCol - 1}"` : '';
            const mDown = mRow > 1 ? `ss:MergeDown="${mRow - 1}"` : '';

            let uStyleId = 'sText';
            if (uc.styles && typeof uc.styles === 'object') {
              const bg = uc.styles.background || uc.styles.backgroundColor;
              const color = uc.styles.color || uc.styles.fontColor;
              const bold = uc.styles.fontWeight === 'bold' || uc.styles.bold === true;
              const align = uc.styles.align || 'Left';
              uStyleId = `sUser_${String(bg || '').replace(/[^a-zA-Z0-9]/g, '')}_${String(color || '').replace(/[^a-zA-Z0-9]/g, '')}_${bold ? 'B' : 'N'}_${align}`;
              if (!customStylesMap.has(uStyleId)) {
                customStylesMap.set(uStyleId, { bg, color, bold, align: align.charAt(0).toUpperCase() + align.slice(1) });
              }
            } else if (uc.styleName) {
              uStyleId = uc.styleName;
            }

            const uMemo = uc.memo ? (typeof uc.memo === 'string' ? { author: 'LunaGrid', message: uc.memo } : uc.memo) : null;
            const commentXml = formatXmlComment(uMemo);

            uRowCells += `<Cell ${mAcross} ${mDown} ss:StyleID="${uStyleId}">${commentXml}<Data ss:Type="String">${this._escapeHtml(String(val))}</Data></Cell>`;
            curCol += mCol;
          });
          xmlRows += `<Row ss:Height="22">${uRowCells}</Row>\n`;
          lastR = r;
        });

        while (lastR + 1 < yOffset) {
          xmlRows += `<Row ss:Height="18"/>\n`;
          lastR++;
        }
      }

      // Document Title
      if (docTitle) {
        if (docTitle.spaceTop > 0) xmlRows += makeXmlEmptyRows(docTitle.spaceTop);
        const alignStyle = docTitle.align === 'left' ? 'sDocTitleLeft' : (docTitle.align === 'right' ? 'sDocTitleRight' : 'sDocTitleCenter');
        xmlRows += `<Row ss:Height="36"><Cell ss:MergeAcross="${totalColspan - 1}" ss:StyleID="${alignStyle}"><Data ss:Type="String">${this._escapeHtml(docTitle.message)}</Data></Cell></Row>\n`;
        if (docTitle.spaceBottom > 0) xmlRows += makeXmlEmptyRows(docTitle.spaceBottom);
      }

      // Document Subtitle
      if (docSubtitle) {
        if (docSubtitle.spaceTop > 0) xmlRows += makeXmlEmptyRows(docSubtitle.spaceTop);
        const alignStyle = docSubtitle.align === 'left' ? 'sDocSubtitleLeft' : (docSubtitle.align === 'center' ? 'sDocSubtitleCenter' : 'sDocSubtitleRight');
        xmlRows += `<Row ss:Height="22"><Cell ss:MergeAcross="${totalColspan - 1}" ss:StyleID="${alignStyle}"><Data ss:Type="String">${this._escapeHtml(docSubtitle.message)}</Data></Cell></Row>\n`;
        if (docSubtitle.spaceBottom > 0) xmlRows += makeXmlEmptyRows(docSubtitle.spaceBottom);
      }

      // Header (다단 컬럼 그룹 헤더 레이아웃 완벽 지원)
      if (showHeader) {
        if (hasColGroups) {
          let topCells = '';
          let subCells = '';

          if (showIndicator) {
            topCells += `<Cell ss:MergeDown="1" ss:StyleID="sHeader"><Data ss:Type="String">No.</Data></Cell>`;
          }

          colGroupsMap.forEach(grp => {
            if (grp.name) {
              const grpSpan = grp.cols.length;
              const acrossAttr = grpSpan > 1 ? `ss:MergeAcross="${grpSpan - 1}"` : '';
              topCells += `<Cell ${acrossAttr} ss:StyleID="sHeader"><Data ss:Type="String">${this._escapeHtml(grp.name)}</Data></Cell>`;
              grp.cols.forEach(c => {
                const hMemo = getCellMemo(c, null, null, -1, true);
                const commentXml = formatXmlComment(hMemo);
                subCells += `<Cell ss:StyleID="sHeader">${commentXml}<Data ss:Type="String">${this._escapeHtml(c.label || c.key)}</Data></Cell>`;
              });
            } else {
              const singleCol = grp.cols[0];
              const hMemo = getCellMemo(singleCol, null, null, -1, true);
              const commentXml = formatXmlComment(hMemo);
              topCells += `<Cell ss:MergeDown="1" ss:StyleID="sHeader">${commentXml}<Data ss:Type="String">${this._escapeHtml(singleCol.label || singleCol.key)}</Data></Cell>`;
            }
          });

          xmlRows += `<Row ss:Height="24">${topCells}</Row>\n`;
          if (subCells) {
            xmlRows += `<Row ss:Height="22">${subCells}</Row>\n`;
          }
        } else {
          let headerCells = '';
          if (showIndicator) {
            headerCells += `<Cell ss:StyleID="sHeader"><Data ss:Type="String">No.</Data></Cell>`;
          }
          targetCols.forEach(col => {
            const hMemo = getCellMemo(col, null, null, -1, true);
            const commentXml = formatXmlComment(hMemo);
            headerCells += `<Cell ss:StyleID="sHeader">${commentXml}<Data ss:Type="String">${this._escapeHtml(col.label || col.key)}</Data></Cell>`;
          });
          xmlRows += `<Row ss:Height="24">${headerCells}</Row>\n`;
        }
      }

      if (isGrouped) {
        let rowCounter = 1;
        groups.forEach((items, grpKey) => {
          // 그룹 헤더 행
          xmlRows += `<Row ss:Height="22"><Cell ss:MergeAcross="${totalColspan - 1}" ss:StyleID="sGroupHeader"><Data ss:Type="String">📁 [그룹] ${this._escapeHtml(grpKey)} (${items.length}건)</Data></Cell></Row>\n`;

          // 그룹 소속 데이터 행들
          items.forEach(({ row }) => {
            let cells = '';
            if (showIndicator) {
              cells += `<Cell ss:StyleID="sIndicator"><Data ss:Type="Number">${rowCounter++}</Data></Cell>`;
            }
            targetCols.forEach(col => {
              let val = this._getCellValue(row, col);
              const isImageCol = (col.renderer && (col.renderer.type === 'image' || col.renderer.type === 'icon')) || col.type === 'image' || col.exportImage === true;
              if (isImageCol) {
                if (col.renderer && col.renderer.imageField && row[col.renderer.imageField] !== undefined) {
                  val = row[col.renderer.imageField];
                }
              } else if (lookupDisplay && col.lookupData && col.lookupData[val] !== undefined) {
                val = col.lookupData[val];
              } else if (lookupDisplay && Array.isArray(col.values) && Array.isArray(col.labels)) {
                const vIdx = col.values.findIndex(v => String(v) === String(val));
                if (vIdx !== -1 && col.labels[vIdx]) val = col.labels[vIdx];
              }

              val = formatShapeValue(col, val, row, rowCounter - 1);
              const cellStyleId = getCellStyleId(col, val, row, rowCounter - 1);
              const hrefAttr = (isImageCol && typeof val === 'string' && val.startsWith('http')) ? `ss:HRef="${this._escapeHtml(val)}"` : '';
              const cMemo = getCellMemo(col, val, row, rowCounter - 1, false);
              const commentXml = formatXmlComment(cMemo);

              if (col.dataType === 'number' && typeof val === 'number' && !isNaN(val)) {
                cells += `<Cell ss:StyleID="${cellStyleId}">${commentXml}<Data ss:Type="Number">${val}</Data></Cell>`;
              } else if (col.dataType === 'date' || col.dataType === 'datetime') {
                const dateStr = val ? new Date(val).toISOString().split('T')[0] : '';
                cells += `<Cell ss:StyleID="${cellStyleId}">${commentXml}<Data ss:Type="String">${dateStr}</Data></Cell>`;
              } else {
                cells += `<Cell ss:StyleID="${cellStyleId}" ${hrefAttr}>${commentXml}<Data ss:Type="String">${this._escapeHtml(String(val ?? ''))}</Data></Cell>`;
              }
            });
            xmlRows += `<Row ss:Height="20">${cells}</Row>\n`;
          });

          // 그룹 소계 행
          let subCells = '';
          if (showIndicator) {
            subCells += `<Cell ss:StyleID="sGroupFooter"><Data ss:Type="String">소계</Data></Cell>`;
          }
          targetCols.forEach(col => {
            const numericVals = items.map(it => Number(it.row[col.key])).filter(v => !isNaN(v));
            if (col.dataType === 'number' && numericVals.length > 0) {
              const subSum = numericVals.reduce((acc, v) => acc + v, 0);
              subCells += `<Cell ss:StyleID="sGroupFooterNum"><Data ss:Type="Number">${subSum}</Data></Cell>`;
            } else if (this.groupColumns.includes(col.key)) {
              subCells += `<Cell ss:StyleID="sGroupFooter"><Data ss:Type="String">${this._escapeHtml(grpKey)} 소계</Data></Cell>`;
            } else {
              subCells += `<Cell ss:StyleID="sGroupFooter"><Data ss:Type="String"></Data></Cell>`;
            }
          });
          xmlRows += `<Row ss:Height="22">${subCells}</Row>\n`;
        });
      } else {
        // 일반 플랫 데이터 행들
        dataRows.forEach((row, rIdx) => {
          let cells = '';
          if (showIndicator) {
            cells += `<Cell ss:StyleID="sIndicator"><Data ss:Type="Number">${rIdx + 1}</Data></Cell>`;
          }
          targetCols.forEach(col => {
            let val = this._getCellValue(row, col);
            const isImageCol = (col.renderer && (col.renderer.type === 'image' || col.renderer.type === 'icon')) || col.type === 'image' || col.exportImage === true;
            if (isImageCol) {
              if (col.renderer && col.renderer.imageField && row[col.renderer.imageField] !== undefined) {
                val = row[col.renderer.imageField];
              }
            } else if (lookupDisplay && col.lookupData && col.lookupData[val] !== undefined) {
              val = col.lookupData[val];
            } else if (lookupDisplay && Array.isArray(col.values) && Array.isArray(col.labels)) {
              const vIdx = col.values.findIndex(v => String(v) === String(val));
              if (vIdx !== -1 && col.labels[vIdx]) val = col.labels[vIdx];
            }

            val = formatShapeValue(col, val, row, rIdx);
            const cellStyleId = getCellStyleId(col, val, row, rIdx);
            const hrefAttr = (isImageCol && typeof val === 'string' && val.startsWith('http')) ? `ss:HRef="${this._escapeHtml(val)}"` : '';
            const cMemo = getCellMemo(col, val, row, rIdx, false);
            const commentXml = formatXmlComment(cMemo);

            if (col.dataType === 'number' && typeof val === 'number' && !isNaN(val)) {
              cells += `<Cell ss:StyleID="${cellStyleId}">${commentXml}<Data ss:Type="Number">${val}</Data></Cell>`;
            } else if (col.dataType === 'date' || col.dataType === 'datetime') {
              const dateStr = val ? new Date(val).toISOString().split('T')[0] : '';
              cells += `<Cell ss:StyleID="${cellStyleId}">${commentXml}<Data ss:Type="String">${dateStr}</Data></Cell>`;
            } else {
              cells += `<Cell ss:StyleID="${cellStyleId}" ${hrefAttr}>${commentXml}<Data ss:Type="String">${this._escapeHtml(String(val ?? ''))}</Data></Cell>`;
            }
          });
          xmlRows += `<Row ss:Height="20">${cells}</Row>\n`;
        });
      }

      // Footer Summary (전체 총계)
      if (showFooter && this.options.summary) {
        let footerCells = '';
        if (showIndicator) {
          footerCells += `<Cell ss:StyleID="sFooter"><Data ss:Type="String">총계</Data></Cell>`;
        }
        const summaryConfig = this.options.summary || {};
        const fieldsConfig = summaryConfig.fields || {};
        targetCols.forEach(col => {
          const agg = fieldsConfig[col.key];
          if (agg) {
            const val = this._computeAggregation(dataRows, col.key, agg);
            footerCells += `<Cell ss:StyleID="sFooter"><Data ss:Type="String">${this._escapeHtml(String(val))}</Data></Cell>`;
          } else {
            footerCells += `<Cell ss:StyleID="sFooter"><Data ss:Type="String"></Data></Cell>`;
          }
        });
        xmlRows += `<Row ss:Height="22">${footerCells}</Row>\n`;
      }

      // Document Tail
      if (docTail) {
        if (docTail.spaceTop > 0) xmlRows += makeXmlEmptyRows(docTail.spaceTop);
        const alignStyle = docTail.align === 'right' ? 'sDocTailRight' : (docTail.align === 'center' ? 'sDocTailCenter' : 'sDocTailLeft');
        xmlRows += `<Row ss:Height="20"><Cell ss:MergeAcross="${totalColspan - 1}" ss:StyleID="${alignStyle}"><Data ss:Type="String">${this._escapeHtml(docTail.message)}</Data></Cell></Row>\n`;
        if (docTail.spaceBottom > 0) xmlRows += makeXmlEmptyRows(docTail.spaceBottom);
      }

      // 동적 스타일 XML 생성
      let dynamicStylesXml = '';
      customStylesMap.forEach((styleObj, sId) => {
        let interior = styleObj.bg ? `<Interior ss:Color="${styleObj.bg}" ss:Pattern="Solid"/>` : '';
        let fontColor = styleObj.color ? `ss:Color="${styleObj.color}"` : '';
        let fontBold = styleObj.bold ? `ss:Bold="1"` : '';
        let align = styleObj.align || 'Left';
        let prot = isSheetProtect ? `<Protection ss:Protected="${styleObj.locked !== false ? '1' : '0'}"/>` : '';
        dynamicStylesXml += `
    <Style ss:ID="${sId}">
      <Alignment ss:Horizontal="${align}" ss:Vertical="Center"/>
      <Font ss:FontName="Malgun Gothic" ss:Size="10" ${fontBold} ${fontColor}/>
      ${interior}
      ${prot}
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
      </Borders>
    </Style>`;
      });

      const protTag = isSheetProtect ? `<Protection ss:Protected="1"/>` : '';
      const unprotTag = isSheetProtect ? `<Protection ss:Protected="0"/>` : '';

      const excelXml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Center"/>
      <Font ss:FontName="Malgun Gothic" ss:Size="10" ss:Color="#000000"/>
    </Style>
    <Style ss:ID="sDocTitleCenter">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Malgun Gothic" ss:Size="16" ss:Bold="1" ss:Color="#0f172a"/>
      ${protTag}
    </Style>
    <Style ss:ID="sDocTitleLeft">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Font ss:FontName="Malgun Gothic" ss:Size="16" ss:Bold="1" ss:Color="#0f172a"/>
      ${protTag}
    </Style>
    <Style ss:ID="sDocTitleRight">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Font ss:FontName="Malgun Gothic" ss:Size="16" ss:Bold="1" ss:Color="#0f172a"/>
      ${protTag}
    </Style>
    <Style ss:ID="sDocSubtitleCenter">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Malgun Gothic" ss:Size="10" ss:Color="#64748b"/>
      ${protTag}
    </Style>
    <Style ss:ID="sDocSubtitleLeft">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Font ss:FontName="Malgun Gothic" ss:Size="10" ss:Color="#64748b"/>
      ${protTag}
    </Style>
    <Style ss:ID="sDocSubtitleRight">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Font ss:FontName="Malgun Gothic" ss:Size="10" ss:Color="#64748b"/>
      ${protTag}
    </Style>
    <Style ss:ID="sDocTailCenter">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Malgun Gothic" ss:Size="9" ss:Color="#94a3b8"/>
      ${protTag}
    </Style>
    <Style ss:ID="sDocTailLeft">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Font ss:FontName="Malgun Gothic" ss:Size="9" ss:Color="#94a3b8"/>
      ${protTag}
    </Style>
    <Style ss:ID="sDocTailRight">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Font ss:FontName="Malgun Gothic" ss:Size="9" ss:Color="#94a3b8"/>
      ${protTag}
    </Style>
    <Style ss:ID="sHeader">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Malgun Gothic" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#1e293b" ss:Pattern="Solid"/>
      ${protTag}
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#475569"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#475569"/>
      </Borders>
    </Style>
    <Style ss:ID="sGroupHeader">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Font ss:FontName="Malgun Gothic" ss:Size="10" ss:Bold="1" ss:Color="#0369a1"/>
      <Interior ss:Color="#e0f2fe" ss:Pattern="Solid"/>
      ${protTag}
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#bae6fd"/>
      </Borders>
    </Style>
    <Style ss:ID="sGroupFooter">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Font ss:FontName="Malgun Gothic" ss:Size="10" ss:Bold="1" ss:Color="#334155"/>
      <Interior ss:Color="#f1f5f9" ss:Pattern="Solid"/>
      ${protTag}
      <Borders>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
      </Borders>
    </Style>
    <Style ss:ID="sGroupFooterNum">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Font ss:FontName="Malgun Gothic" ss:Size="10" ss:Bold="1" ss:Color="#0f172a"/>
      <NumberFormat ss:Format="#,##0"/>
      <Interior ss:Color="#f1f5f9" ss:Pattern="Solid"/>
      ${protTag}
      <Borders>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
      </Borders>
    </Style>
    <Style ss:ID="sText">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      ${protTag}
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
      </Borders>
    </Style>
    <Style ss:ID="sText_L">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      ${protTag}
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
      </Borders>
    </Style>
    <Style ss:ID="sText_U">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      ${unprotTag}
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
      </Borders>
    </Style>
    <Style ss:ID="sNumber">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <NumberFormat ss:Format="#,##0"/>
      ${protTag}
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
      </Borders>
    </Style>
    <Style ss:ID="sNumber_L">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <NumberFormat ss:Format="#,##0"/>
      ${protTag}
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
      </Borders>
    </Style>
    <Style ss:ID="sNumber_U">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <NumberFormat ss:Format="#,##0"/>
      ${unprotTag}
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
      </Borders>
    </Style>
    <Style ss:ID="sIndicator">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Interior ss:Color="#f8fafc" ss:Pattern="Solid"/>
      ${protTag}
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
      </Borders>
    </Style>
    <Style ss:ID="sFooter">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Font ss:FontName="Malgun Gothic" ss:Size="10" ss:Bold="1" ss:Color="#0f172a"/>
      <Interior ss:Color="#cbd5e1" ss:Pattern="Solid"/>
      ${protTag}
      <Borders>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#64748b"/>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#64748b"/>
      </Borders>
    </Style>${dynamicStylesXml}
  </Styles>
  <Worksheet ss:Name="${this._escapeHtml(sheetName)}">
    <Table>
      ${xmlRows}
    </Table>
    ${isSheetProtect ? `
    <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
      <ProtectObjects>True</ProtectObjects>
      <ProtectScenarios>True</ProtectScenarios>
      <EnableSelection>${sheetProtectOptions.selectLockedCells !== false ? '1' : '0'}</EnableSelection>
    </WorksheetOptions>` : ''}
  </Worksheet>
</Workbook>`;

      const blob = new Blob([excelXml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      this.showToast(`📥 엑셀 파일 내보내기 완료: ${fileName}`);
      if (typeof options.done === 'function') options.done(this);
    }

    showToast(message, duration = 2500) {
      const toast = document.createElement('div');
      toast.className = 'luna-toast';
      toast.innerHTML = `<span>${this._escapeHtml(message)}</span>`;
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => {
          if (toast && typeof toast.remove === 'function') {
            toast.remove();
          } else if (toast && toast.parentNode && typeof toast.parentNode.removeChild === 'function') {
            toast.parentNode.removeChild(toast);
          }
        }, 300);
      }, duration);
    }

    showLoading() {
      this.isLoading = true;
      if (this.loadingEl) this.loadingEl.style.display = 'flex';
    }

    hideLoading() {
      this.isLoading = false;
      if (this.loadingEl) this.loadingEl.style.display = 'none';
    }

    _escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    /**
     * 클래스 커스텀 렌더러 등록 (LunaGrid 호환 registerCustomRenderer)
     */
    registerCustomRenderer(name, rendererClassOrObj) {
      if (!name) return;
      this.customRenderers.set(name, rendererClassOrObj);
    }

    /**
     * 데이터 어댑터 설정 (setDataAdapter)
     * @param {LunaDataAdapter} adapter - LunaDataAdapter 인스턴스
     */
    setDataAdapter(adapter) {
      if (!adapter) return;
      this.dataAdapter = adapter;
      this.options.dataAdapter = adapter;
      this._bindGlobalEvents();
      this.refresh();
    }

    /**
     * 데이터 어댑터 조회 (getDataAdapter)
     * @returns {LunaDataAdapter}
     */
    getDataAdapter() {
      return this.dataAdapter;
    }

    /**
     * 특정 행(itemIndex)의 행 상태(RowState) 반환
     */
    getRowState(itemIndex) {
      if (!this.dataAdapter || typeof this.dataAdapter.getRowState !== 'function') return RowState.NONE;
      const targetRow = this.displayData[itemIndex];
      return targetRow ? this.dataAdapter.getRowState(targetRow) : RowState.NONE;
    }

    /**
     * 특정 상태를 가진 행 인덱스 배열 반환
     */
    getStateRows(state) {
      return this.dataAdapter && typeof this.dataAdapter.getStateRows === 'function'
        ? this.dataAdapter.getStateRows(state)
        : [];
    }

    /**
     * 실행 취소 (LunaGrid Undo)
     */
    undo() {
      if (this.dataAdapter && typeof this.dataAdapter.undo === 'function') {
        const res = this.dataAdapter.undo();
        if (res) {
          this._applyFilterAndSort();
        }
        return res;
      }
      return false;
    }

    /**
     * 다시 실행 (LunaGrid Redo)
     */
    redo() {
      if (this.dataAdapter && typeof this.dataAdapter.redo === 'function') {
        const res = this.dataAdapter.redo();
        if (res) {
          this._applyFilterAndSort();
        }
        return res;
      }
      return false;
    }

    /**
     * Undo 가능 여부 확인
     */
    canUndo() {
      return this.dataAdapter && typeof this.dataAdapter.canUndo === 'function' ? this.dataAdapter.canUndo() : false;
    }

    /**
     * Redo 가능 여부 확인
     */
    canRedo() {
      return this.dataAdapter && typeof this.dataAdapter.canRedo === 'function' ? this.dataAdapter.canRedo() : false;
    }

    /**
     * Undo/Redo 커맨드 스택 초기화
     */
    clearCommandStack() {
      if (this.dataAdapter && typeof this.dataAdapter.clearCommandStack === 'function') {
        this.dataAdapter.clearCommandStack();
      }
    }

    /**
     * [LunaGrid 100% 호환] 로케일 문자열 또는 객체 해석 (_resolveLocale)
     */
    _resolveLocale(localeOpt) {
      if (!localeOpt) return LunaGridLocaleManager.getLocale();
      if (typeof localeOpt === 'string') return LunaGridLocaleManager.getLocale(localeOpt);
      if (typeof localeOpt === 'object' && localeOpt !== null) {
        const code = localeOpt.locale || 'custom';
        const base = LunaGridLocaleManager.getLocale(code) || LunaGridLocaleManager.getLocale('ko');
        return {
          locale: code,
          currency: localeOpt.currency || base.currency || 'KRW',
          currencySymbol: localeOpt.currencySymbol || base.currencySymbol || '₩',
          messages: Object.assign({}, base.messages || {}, localeOpt.messages || {}),
          numberFormats: Object.assign({}, base.numberFormats || {}, localeOpt.numberFormats || {})
        };
      }
      return LunaGridLocaleManager.getLocale();
    }

    /**
     * [LunaGrid 100% 호환] 로케일 메시지 조회 (getMessage)
     * @param {string} key - 메시지 키
     * @param {string} [fallback=''] - 기본값
     * @returns {string}
     */
    getMessage(key, fallback = '') {
      if (this.localeConfig && this.localeConfig.messages && this.localeConfig.messages[key] !== undefined) {
        return this.localeConfig.messages[key];
      }
      const globalLoc = LunaGridLocaleManager.getLocale();
      if (globalLoc && globalLoc.messages && globalLoc.messages[key] !== undefined) {
        return globalLoc.messages[key];
      }
      return fallback;
    }

    /**
     * [LunaGrid 100% 호환] 로케일 동적 변경 (setLocale)
     * @param {string|Object} localeConfig - 로케일 코드 ('en', 'ko', 'ja', 'zh') 또는 LunaGridLocale 객체
     */
    setLocale(localeConfig) {
      this.localeConfig = this._resolveLocale(localeConfig);
      if (this.toolbarEl) this._renderToolbar();
      if (this.groupPanelEl) this._renderGroupPanel();
      if (this.theadEl) this._renderHeader();
      this._applyFilterAndSort();
      if (this.footerEl) this._renderFooter();
      this._emit('localeChanged', this.localeConfig);
    }

    /**
     * [LunaGrid 100% 호환] 현재 로케일 정보 조회 (getLocale)
     * @returns {Object} LunaGridLocale
     */
    getLocale() {
      if (this.localeConfig) {
        return Object.assign({}, this.localeConfig);
      }
      return Object.assign({}, LunaGridLocaleManager.getLocale());
    }

    /**
     * 로케일 기반 숫자 포맷팅 (formatNumber)
     */
    formatNumber(value, options = {}) {
      const num = Number(value);
      if (isNaN(num)) return String(value ?? '');
      const loc = this.getLocale();
      const locCode = loc.locale || 'ko-KR';
      return new Intl.NumberFormat(locCode, options).format(num);
    }

    /**
     * 로케일 기반 통화 포맷팅 (formatCurrency)
     */
    formatCurrency(value, currencyCode = null) {
      const loc = this.getLocale();
      const curr = currencyCode || loc.currency || 'KRW';
      const locCode = loc.locale || (curr === 'USD' ? 'en-US' : (curr === 'JPY' ? 'ja-JP' : (curr === 'CNY' ? 'zh-CN' : 'ko-KR')));
      const num = Number(value);
      if (isNaN(num)) return String(value ?? '');
      const fractionDigits = (curr === 'KRW' || curr === 'JPY') ? 0 : 2;
      return new Intl.NumberFormat(locCode, {
        style: 'currency',
        currency: curr,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
      }).format(num);
    }

    /**
     * 그리드 전체 화면 새로고침 (refresh / repaint / invalidate)
     */
    refresh() {
      if (this.toolbarEl) this._renderToolbar();
      if (this.groupPanelEl) this._renderGroupPanel();
      if (this.theadEl) this._renderHeader();
      this._applyFilterAndSort();
      if (this.footerEl) this._renderFooter();
    }

    repaint() {
      this.refresh();
    }

    invalidate() {
      this.refresh();
    }
  }

  // LunaGrid 정식 전역 registerCustomRenderer 엔진
  LunaGrid.customRenderers = new Map();
  LunaGrid.registerCustomRenderer = function (name, rendererClassOrObj) {
    if (!name) return;
    LunaGrid.customRenderers.set(name, rendererClassOrObj);
  };

  // LunaGrid 정식 전역 exportGrid 엔진 (다중 그리드 exportGrids 지원)
  LunaGrid.exportGrid = function (options = {}) {
    const exportList = options.exportGrids || [];
    if (exportList.length === 0) return;

    const fileName = options.fileName || 'multiGridExport.xlsx';
    const progress = options.showProgress === true;
    if (progress && options.progressMessage && exportList[0] && exportList[0].grid) {
      exportList[0].grid.showToast(options.progressMessage);
    }

    // 1. SheetJS(XLSX) 라이브러리가 로드되어 있는 경우
    if (typeof window !== 'undefined' && window.XLSX) {
      const wb = window.XLSX.utils.book_new();

      exportList.forEach((item, idx) => {
        const grid = item.grid;
        if (!grid) return;

        const sName = item.sheetName || `Sheet${idx + 1}`;
        const showIndicator = item.indicator === 'visible' || (item.indicator !== 'hidden' && grid.options.indicator && grid.options.indicator.visible !== false);
        const showHeader = item.header !== 'hidden';
        const showFooter = item.footer === 'visible' || (item.footer !== 'hidden' && (grid.options.showSummary || grid.options.summary));
        const lookupDisplay = item.lookupDisplay !== false;
        const allCols = item.allColumns === true;
        const targetCols = allCols ? grid.options.columns : grid.options.columns.filter(c => !c.hidden);
        const dataRows = grid.filteredData && grid.filteredData.length > 0 ? grid.filteredData : grid.displayData;
        const isGrouped = grid.isGrouped && grid.isGrouped();
        const hasColGroups = targetCols.some(c => c.group);

        const wsData = [];
        const merges = [];

        // Header
        if (showHeader) {
          if (hasColGroups) {
            const colGroupsMap = [];
            let curGrp = null;
            targetCols.forEach(col => {
              const gName = col.group || null;
              if (gName) {
                if (curGrp && curGrp.name === gName) curGrp.cols.push(col);
                else { curGrp = { name: gName, cols: [col] }; colGroupsMap.push(curGrp); }
              } else { curGrp = null; colGroupsMap.push({ name: null, cols: [col] }); }
            });

            const headerRow1 = [];
            const headerRow2 = [];
            let cOffset = 0;

            if (showIndicator) {
              headerRow1.push('No.');
              headerRow2.push('');
              merges.push({ s: { r: 0, c: 0 }, e: { r: 1, c: 0 } });
              cOffset++;
            }

            colGroupsMap.forEach(grp => {
              if (grp.name) {
                const grpSpan = grp.cols.length;
                headerRow1.push(grp.name);
                for (let i = 1; i < grpSpan; i++) headerRow1.push('');
                grp.cols.forEach(c => headerRow2.push(c.label || c.key));
                if (grpSpan > 1) {
                  merges.push({ s: { r: 0, c: cOffset }, e: { r: 0, c: cOffset + grpSpan - 1 } });
                }
                cOffset += grpSpan;
              } else {
                const singleCol = grp.cols[0];
                headerRow1.push(singleCol.label || singleCol.key);
                headerRow2.push('');
                merges.push({ s: { r: 0, c: cOffset }, e: { r: 1, c: cOffset } });
                cOffset++;
              }
            });

            wsData.push(headerRow1);
            wsData.push(headerRow2);
          } else {
            const headerRow = [];
            if (showIndicator) headerRow.push('No.');
            targetCols.forEach(col => headerRow.push(col.label || col.key));
            wsData.push(headerRow);
          }
        }

        // Data Rows
        if (isGrouped) {
          const groups = new Map();
          dataRows.forEach((row, rIdx) => {
            const grpKey = grid.groupColumns.map(col => String(row[col] ?? '')).join(' / ');
            if (!groups.has(grpKey)) groups.set(grpKey, []);
            groups.get(grpKey).push({ row, originalIndex: rIdx });
          });

          let rowCounter = 1;
          groups.forEach((items, grpKey) => {
            const grpHeaderRow = [];
            if (showIndicator) grpHeaderRow.push('');
            grpHeaderRow.push(`[그룹] ${grpKey} (${items.length}건)`);
            wsData.push(grpHeaderRow);

            items.forEach(({ row }) => {
              const rowData = [];
              if (showIndicator) rowData.push(rowCounter++);
              targetCols.forEach(col => {
                let val = grid._getCellValue(row, col);
                if (lookupDisplay && col.lookupData && col.lookupData[val] !== undefined) val = col.lookupData[val];
                if (col.dataType === 'number' && typeof val === 'number') rowData.push(val);
                else rowData.push(val !== undefined && val !== null ? String(val) : '');
              });
              wsData.push(rowData);
            });

            const subtotalRow = [];
            if (showIndicator) subtotalRow.push('소계');
            targetCols.forEach(col => {
              const numericVals = items.map(it => Number(it.row[col.key])).filter(v => !isNaN(v));
              if (col.dataType === 'number' && numericVals.length > 0) {
                subtotalRow.push(numericVals.reduce((acc, v) => acc + v, 0));
              } else if (grid.groupColumns.includes(col.key)) {
                subtotalRow.push(`${grpKey} 소계`);
              } else {
                subtotalRow.push('');
              }
            });
            wsData.push(subtotalRow);
          });
        } else {
          dataRows.forEach((row, rIdx) => {
            const rowData = [];
            if (showIndicator) rowData.push(rIdx + 1);
            targetCols.forEach(col => {
              let val = grid._getCellValue(row, col);
              if (lookupDisplay && col.lookupData && col.lookupData[val] !== undefined) val = col.lookupData[val];
              if (col.dataType === 'number' && typeof val === 'number') rowData.push(val);
              else rowData.push(val !== undefined && val !== null ? String(val) : '');
            });
            wsData.push(rowData);
          });
        }

        // Footer Summary
        if (showFooter && grid.options.summary) {
          const footerRow = [];
          if (showIndicator) footerRow.push('총계');
          const summaryConfig = grid.options.summary || {};
          const fieldsConfig = summaryConfig.fields || {};
          targetCols.forEach(col => {
            const agg = fieldsConfig[col.key];
            if (agg) footerRow.push(grid._computeAggregation(dataRows, col.key, agg));
            else footerRow.push('');
          });
          wsData.push(footerRow);
        }

        const ws = window.XLSX.utils.aoa_to_sheet(wsData);
        if (merges.length > 0) ws['!merges'] = merges;
        window.XLSX.utils.book_append_sheet(wb, ws, sName);
      });

      window.XLSX.writeFile(wb, fileName);
    } else {
      // 2. 외부 라이브러리 없이 순수 XML Spreadsheet 2003 엔진으로 다중 Worksheet 생성
      let worksheetsXml = '';

      exportList.forEach((item, idx) => {
        const grid = item.grid;
        if (!grid) return;

        const sName = item.sheetName || `Sheet${idx + 1}`;
        const showIndicator = item.indicator === 'visible' || (item.indicator !== 'hidden' && grid.options.indicator && grid.options.indicator.visible !== false);
        const showHeader = item.header !== 'hidden';
        const showFooter = item.footer === 'visible' || (item.footer !== 'hidden' && (grid.options.showSummary || grid.options.summary));
        const lookupDisplay = item.lookupDisplay !== false;
        const allCols = item.allColumns === true;
        const targetCols = allCols ? grid.options.columns : grid.options.columns.filter(c => !c.hidden);
        const dataRows = grid.filteredData && grid.filteredData.length > 0 ? grid.filteredData : grid.displayData;
        const isGrouped = grid.isGrouped && grid.isGrouped();
        const hasColGroups = targetCols.some(c => c.group);

        const parseDocTitle = (cfg, defaultAlign = 'center', defTop = 1, defBtm = 1) => {
          if (!cfg) return null;
          if (typeof cfg === 'string') return { message: cfg, visible: true, spaceTop: defTop, spaceBottom: defBtm, align: defaultAlign };
          if (typeof cfg === 'object' && cfg.message && cfg.visible !== false) {
            return Object.assign({ visible: true, spaceTop: defTop, spaceBottom: defBtm, align: defaultAlign }, cfg);
          }
          return null;
        };

        const docTitle = parseDocTitle(item.documentTitle || options.documentTitle, 'center', 1, 1);
        const docSubtitle = parseDocTitle(item.documentSubtitle || item.documentSubTitle || options.documentSubtitle || options.documentSubTitle, 'right', 0, 1);
        const docTail = parseDocTitle(item.documentTail || options.documentTail, 'left', 1, 0);

        let xmlRows = '';
        const totalColspan = targetCols.length + (showIndicator ? 1 : 0);

        const makeXmlEmptyRows = (cnt) => {
          let res = '';
          for (let i = 0; i < cnt; i++) res += `<Row ss:Height="14"/>\n`;
          return res;
        };

        // Document Title
        if (docTitle) {
          if (docTitle.spaceTop > 0) xmlRows += makeXmlEmptyRows(docTitle.spaceTop);
          const alignStyle = docTitle.align === 'left' ? 'sDocTitleLeft' : (docTitle.align === 'right' ? 'sDocTitleRight' : 'sDocTitleCenter');
          xmlRows += `<Row ss:Height="36"><Cell ss:MergeAcross="${totalColspan - 1}" ss:StyleID="${alignStyle}"><Data ss:Type="String">${grid._escapeHtml(docTitle.message)}</Data></Cell></Row>\n`;
          if (docTitle.spaceBottom > 0) xmlRows += makeXmlEmptyRows(docTitle.spaceBottom);
        }

        // Document Subtitle
        if (docSubtitle) {
          if (docSubtitle.spaceTop > 0) xmlRows += makeXmlEmptyRows(docSubtitle.spaceTop);
          const alignStyle = docSubtitle.align === 'left' ? 'sDocSubtitleLeft' : (docSubtitle.align === 'center' ? 'sDocSubtitleCenter' : 'sDocSubtitleRight');
          xmlRows += `<Row ss:Height="22"><Cell ss:MergeAcross="${totalColspan - 1}" ss:StyleID="${alignStyle}"><Data ss:Type="String">${grid._escapeHtml(docSubtitle.message)}</Data></Cell></Row>\n`;
          if (docSubtitle.spaceBottom > 0) xmlRows += makeXmlEmptyRows(docSubtitle.spaceBottom);
        }

        // Header
        if (showHeader) {
          if (hasColGroups) {
            let topCells = '';
            let subCells = '';
            if (showIndicator) topCells += `<Cell ss:MergeDown="1" ss:StyleID="sHeader"><Data ss:Type="String">No.</Data></Cell>`;

            const colGroupsMap = [];
            let curGrp = null;
            targetCols.forEach(col => {
              const gName = col.group || null;
              if (gName) {
                if (curGrp && curGrp.name === gName) curGrp.cols.push(col);
                else { curGrp = { name: gName, cols: [col] }; colGroupsMap.push(curGrp); }
              } else { curGrp = null; colGroupsMap.push({ name: null, cols: [col] }); }
            });

            colGroupsMap.forEach(grp => {
              if (grp.name) {
                const grpSpan = grp.cols.length;
                const acrossAttr = grpSpan > 1 ? `ss:MergeAcross="${grpSpan - 1}"` : '';
                topCells += `<Cell ${acrossAttr} ss:StyleID="sHeader"><Data ss:Type="String">${grid._escapeHtml(grp.name)}</Data></Cell>`;
                grp.cols.forEach(c => {
                  subCells += `<Cell ss:StyleID="sHeader"><Data ss:Type="String">${grid._escapeHtml(c.label || c.key)}</Data></Cell>`;
                });
              } else {
                const singleCol = grp.cols[0];
                topCells += `<Cell ss:MergeDown="1" ss:StyleID="sHeader"><Data ss:Type="String">${grid._escapeHtml(singleCol.label || singleCol.key)}</Data></Cell>`;
              }
            });

            xmlRows += `<Row ss:Height="24">${topCells}</Row>\n`;
            if (subCells) xmlRows += `<Row ss:Height="22">${subCells}</Row>\n`;
          } else {
            let headerCells = '';
            if (showIndicator) headerCells += `<Cell ss:StyleID="sHeader"><Data ss:Type="String">No.</Data></Cell>`;
            targetCols.forEach(col => {
              headerCells += `<Cell ss:StyleID="sHeader"><Data ss:Type="String">${grid._escapeHtml(col.label || col.key)}</Data></Cell>`;
            });
            xmlRows += `<Row ss:Height="24">${headerCells}</Row>\n`;
          }
        }

        // Data Rows
        if (isGrouped) {
          const groups = new Map();
          dataRows.forEach((row, rIdx) => {
            const grpKey = grid.groupColumns.map(col => String(row[col] ?? '')).join(' / ');
            if (!groups.has(grpKey)) groups.set(grpKey, []);
            groups.get(grpKey).push({ row, originalIndex: rIdx });
          });

          let rowCounter = 1;
          groups.forEach((items, grpKey) => {
            xmlRows += `<Row ss:Height="22"><Cell ss:MergeAcross="${totalColspan - 1}" ss:StyleID="sGroupHeader"><Data ss:Type="String">📁 [그룹] ${grid._escapeHtml(grpKey)} (${items.length}건)</Data></Cell></Row>\n`;

            items.forEach(({ row }) => {
              let cells = '';
              if (showIndicator) cells += `<Cell ss:StyleID="sIndicator"><Data ss:Type="Number">${rowCounter++}</Data></Cell>`;
              targetCols.forEach(col => {
                let val = grid._getCellValue(row, col);
                if (lookupDisplay && col.lookupData && col.lookupData[val] !== undefined) val = col.lookupData[val];
                if (col.dataType === 'number' && typeof val === 'number' && !isNaN(val)) {
                  cells += `<Cell ss:StyleID="sNumber"><Data ss:Type="Number">${val}</Data></Cell>`;
                } else if (col.dataType === 'date' || col.dataType === 'datetime') {
                  const dateStr = val ? new Date(val).toISOString().split('T')[0] : '';
                  cells += `<Cell ss:StyleID="sDate"><Data ss:Type="String">${dateStr}</Data></Cell>`;
                } else {
                  cells += `<Cell ss:StyleID="sText"><Data ss:Type="String">${grid._escapeHtml(String(val ?? ''))}</Data></Cell>`;
                }
              });
              xmlRows += `<Row ss:Height="20">${cells}</Row>\n`;
            });

            let subCells = '';
            if (showIndicator) subCells += `<Cell ss:StyleID="sGroupFooter"><Data ss:Type="String">소계</Data></Cell>`;
            targetCols.forEach(col => {
              const numericVals = items.map(it => Number(it.row[col.key])).filter(v => !isNaN(v));
              if (col.dataType === 'number' && numericVals.length > 0) {
                const subSum = numericVals.reduce((acc, v) => acc + v, 0);
                subCells += `<Cell ss:StyleID="sGroupFooterNum"><Data ss:Type="Number">${subSum}</Data></Cell>`;
              } else if (grid.groupColumns.includes(col.key)) {
                subCells += `<Cell ss:StyleID="sGroupFooter"><Data ss:Type="String">${grid._escapeHtml(grpKey)} 소계</Data></Cell>`;
              } else {
                subCells += `<Cell ss:StyleID="sGroupFooter"><Data ss:Type="String"></Data></Cell>`;
              }
            });
            xmlRows += `<Row ss:Height="22">${subCells}</Row>\n`;
          });
        } else {
          dataRows.forEach((row, rIdx) => {
            let cells = '';
            if (showIndicator) cells += `<Cell ss:StyleID="sIndicator"><Data ss:Type="Number">${rIdx + 1}</Data></Cell>`;
            targetCols.forEach(col => {
              let val = grid._getCellValue(row, col);
              if (lookupDisplay && col.lookupData && col.lookupData[val] !== undefined) val = col.lookupData[val];
              if (col.dataType === 'number' && typeof val === 'number' && !isNaN(val)) {
                cells += `<Cell ss:StyleID="sNumber"><Data ss:Type="Number">${val}</Data></Cell>`;
              } else if (col.dataType === 'date' || col.dataType === 'datetime') {
                const dateStr = val ? new Date(val).toISOString().split('T')[0] : '';
                cells += `<Cell ss:StyleID="sDate"><Data ss:Type="String">${dateStr}</Data></Cell>`;
              } else {
                cells += `<Cell ss:StyleID="sText"><Data ss:Type="String">${grid._escapeHtml(String(val ?? ''))}</Data></Cell>`;
              }
            });
            xmlRows += `<Row ss:Height="20">${cells}</Row>\n`;
          });
        }

        // Footer Summary
        if (showFooter && grid.options.summary) {
          let footerCells = '';
          if (showIndicator) footerCells += `<Cell ss:StyleID="sFooter"><Data ss:Type="String">총계</Data></Cell>`;
          const summaryConfig = grid.options.summary || {};
          const fieldsConfig = summaryConfig.fields || {};
          targetCols.forEach(col => {
            const agg = fieldsConfig[col.key];
            if (agg) {
              const val = grid._computeAggregation(dataRows, col.key, agg);
              footerCells += `<Cell ss:StyleID="sFooter"><Data ss:Type="String">${grid._escapeHtml(String(val))}</Data></Cell>`;
            } else {
              footerCells += `<Cell ss:StyleID="sFooter"><Data ss:Type="String"></Data></Cell>`;
            }
          });
          xmlRows += `<Row ss:Height="22">${footerCells}</Row>\n`;
        }

        // Document Tail
        if (docTail) {
          if (docTail.spaceTop > 0) xmlRows += makeXmlEmptyRows(docTail.spaceTop);
          const alignStyle = docTail.align === 'right' ? 'sDocTailRight' : (docTail.align === 'center' ? 'sDocTailCenter' : 'sDocTailLeft');
          xmlRows += `<Row ss:Height="20"><Cell ss:MergeAcross="${totalColspan - 1}" ss:StyleID="${alignStyle}"><Data ss:Type="String">${grid._escapeHtml(docTail.message)}</Data></Cell></Row>\n`;
          if (docTail.spaceBottom > 0) xmlRows += makeXmlEmptyRows(docTail.spaceBottom);
        }

        worksheetsXml += `
  <Worksheet ss:Name="${grid._escapeHtml(sName)}">
    <Table>
      ${xmlRows}
    </Table>
  </Worksheet>`;
      });

      const excelXml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Center"/>
      <Font ss:FontName="Malgun Gothic" ss:Size="10" ss:Color="#000000"/>
    </Style>
    <Style ss:ID="sDocTitleCenter">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Malgun Gothic" ss:Size="16" ss:Bold="1" ss:Color="#0f172a"/>
    </Style>
    <Style ss:ID="sDocTitleLeft">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Font ss:FontName="Malgun Gothic" ss:Size="16" ss:Bold="1" ss:Color="#0f172a"/>
    </Style>
    <Style ss:ID="sDocTitleRight">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Font ss:FontName="Malgun Gothic" ss:Size="16" ss:Bold="1" ss:Color="#0f172a"/>
    </Style>
    <Style ss:ID="sDocSubtitleCenter">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Malgun Gothic" ss:Size="10" ss:Color="#64748b"/>
    </Style>
    <Style ss:ID="sDocSubtitleLeft">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Font ss:FontName="Malgun Gothic" ss:Size="10" ss:Color="#64748b"/>
    </Style>
    <Style ss:ID="sDocSubtitleRight">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Font ss:FontName="Malgun Gothic" ss:Size="10" ss:Color="#64748b"/>
    </Style>
    <Style ss:ID="sDocTailCenter">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Malgun Gothic" ss:Size="9" ss:Color="#94a3b8"/>
    </Style>
    <Style ss:ID="sDocTailLeft">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Font ss:FontName="Malgun Gothic" ss:Size="9" ss:Color="#94a3b8"/>
    </Style>
    <Style ss:ID="sDocTailRight">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Font ss:FontName="Malgun Gothic" ss:Size="9" ss:Color="#94a3b8"/>
    </Style>
    <Style ss:ID="sHeader">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Malgun Gothic" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#1e293b" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#475569"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#475569"/>
      </Borders>
    </Style>
    <Style ss:ID="sGroupHeader">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Font ss:FontName="Malgun Gothic" ss:Size="10" ss:Bold="1" ss:Color="#0369a1"/>
      <Interior ss:Color="#e0f2fe" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#bae6fd"/>
      </Borders>
    </Style>
    <Style ss:ID="sGroupFooter">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Font ss:FontName="Malgun Gothic" ss:Size="10" ss:Bold="1" ss:Color="#334155"/>
      <Interior ss:Color="#f1f5f9" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
      </Borders>
    </Style>
    <Style ss:ID="sGroupFooterNum">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Font ss:FontName="Malgun Gothic" ss:Size="10" ss:Bold="1" ss:Color="#0f172a"/>
      <NumberFormat ss:Format="#,##0"/>
      <Interior ss:Color="#f1f5f9" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
      </Borders>
    </Style>
    <Style ss:ID="sText">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
      </Borders>
    </Style>
    <Style ss:ID="sNumber">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <NumberFormat ss:Format="#,##0"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
      </Borders>
    </Style>
    <Style ss:ID="sIndicator">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Interior ss:Color="#f8fafc" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
      </Borders>
    </Style>
    <Style ss:ID="sFooter">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Font ss:FontName="Malgun Gothic" ss:Size="10" ss:Bold="1" ss:Color="#0f172a"/>
      <Interior ss:Color="#cbd5e1" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#64748b"/>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#64748b"/>
      </Borders>
    </Style>
  </Styles>${worksheetsXml}
</Workbook>`;

      const blob = new Blob([excelXml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    if (exportList[0] && exportList[0].grid) {
      exportList[0].grid.showToast(`📥 다중 그리드 엑셀 파일 내보내기 완료: ${fileName}`);
    }
    if (typeof options.done === 'function') options.done();
  };

  // =========================================================================
  // 3. TreeView (LunaGrid TreeView - 계층 트리 뷰어 컨트롤러)
  // =========================================================================
  class TreeView extends LunaGrid {
    constructor(container, options = {}) {
      const treeOptions = Object.assign({
        expandWhenSetData: true,
        iconField: 'icon',
        lineVisible: true,
        checkBox: false
      }, options.treeOptions || {});

      // TreeLunaDataAdapter 자동 인스턴스화
      if (!options.dataAdapter) {
        options.dataAdapter = new TreeLunaDataAdapter({ treeOptions });
      }

      super(container, options);
      this.isTreeView = true;
      this.treeOptions = treeOptions;
    }

    setTreeOptions(options = {}) {
      Object.assign(this.treeOptions, options);
      if (this.dataAdapter && this.dataAdapter.treeOptions) {
        Object.assign(this.dataAdapter.treeOptions, options);
      }
      this._renderBody();
    }

    getTreeOptions() {
      return Object.assign({}, this.treeOptions);
    }

    /**
     * 특정 노드 펼침 (expand)
     * LunaGrid onTreeItemExpanding (취소 가능), onTreeItemExpanded 완벽 지원
     * @param {number|string} rowIdOrIndex - itemIndex 또는 rowId
     * @param {boolean} [recursive=false] - 하위 자식 노드 재귀 펼침 여부
     * @param {boolean} [force=false] - 상위 부모 노드들까지 강제 펼침 여부
     */
    expand(rowIdOrIndex, recursive = false, force = false) {
      if (this.dataAdapter && typeof this.dataAdapter.expand === 'function') {
        const nodeId = this._resolveTreeNodeId(rowIdOrIndex);
        const itemIndex = this._resolveItemIndex(rowIdOrIndex);

        // 이벤트: onTreeItemExpanding (인스턴스 프로퍼티 및 옵션 콜백 모두 지원)
        const expandingFn = this.onTreeItemExpanding || this.options.onTreeItemExpanding;
        if (typeof expandingFn === 'function') {
          if (expandingFn(this, itemIndex, nodeId) === false) return;
        }

        this.dataAdapter.expand(nodeId, recursive, force);

        // 이벤트: onTreeItemExpanded
        const expandedFn = this.onTreeItemExpanded || this.options.onTreeItemExpanded;
        if (typeof expandedFn === 'function') {
          expandedFn(this, itemIndex, nodeId);
        }
      }
    }

    /**
     * 특정 노드 접기 (collapse)
     * LunaGrid onTreeItemCollapsing (취소 가능), onTreeItemCollapsed 완벽 지원
     * @param {number|string} rowIdOrIndex - itemIndex 또는 rowId
     * @param {boolean} [recursive=false] - 하위 자식 노드 재귀 접기 여부
     */
    collapse(rowIdOrIndex, recursive = false) {
      if (this.dataAdapter && typeof this.dataAdapter.collapse === 'function') {
        const nodeId = this._resolveTreeNodeId(rowIdOrIndex);
        const itemIndex = this._resolveItemIndex(rowIdOrIndex);

        // 이벤트: onTreeItemCollapsing (인스턴스 프로퍼티 및 옵션 콜백 모두 지원)
        const collapsingFn = this.onTreeItemCollapsing || this.options.onTreeItemCollapsing;
        if (typeof collapsingFn === 'function') {
          if (collapsingFn(this, itemIndex, nodeId) === false) return;
        }

        this.dataAdapter.collapse(nodeId, recursive);

        // 이벤트: onTreeItemCollapsed
        const collapsedFn = this.onTreeItemCollapsed || this.options.onTreeItemCollapsed;
        if (typeof collapsedFn === 'function') {
          collapsedFn(this, itemIndex, nodeId);
        }
      }
    }

    /**
     * 특정 노드 펼침/접힘 토글 (toggle)
     */
    toggle(rowIdOrIndex) {
      const nodeId = this._resolveTreeNodeId(rowIdOrIndex);
      if (this.isExpanded(nodeId)) {
        this.collapse(nodeId);
      } else {
        this.expand(nodeId);
      }
    }

    /**
     * 전체 트리 노드 펼침 (expandAll)
     * @param {number} [level] - 특정 깊이 레벨까지만 펼침
     */
    expandAll(level = null) {
      if (this.dataAdapter && typeof this.dataAdapter.expandAll === 'function') {
        this.dataAdapter.expandAll(level);
      }
    }

    /**
     * 전체 트리 노드 접기 (collapseAll)
     */
    collapseAll() {
      if (this.dataAdapter && typeof this.dataAdapter.collapseAll === 'function') {
        this.dataAdapter.collapseAll();
      }
    }

    /**
     * 노드 펼침 여부 확인 (isExpanded)
     */
    isExpanded(rowIdOrIndex) {
      if (this.dataAdapter && typeof this.dataAdapter.isExpanded === 'function') {
        const nodeId = this._resolveTreeNodeId(rowIdOrIndex);
        return this.dataAdapter.isExpanded(nodeId);
      }
      return false;
    }

    /**
     * 특정 노드가 다른 노드의 후손인지 여부 검사 (isDescendantOf)
     */
    isDescendantOf(descendant, ancestor) {
      if (this.dataAdapter && typeof this.dataAdapter.isDescendantOf === 'function') {
        const dId = this._resolveTreeNodeId(descendant);
        const aId = this._resolveTreeNodeId(ancestor);
        return this.dataAdapter.isDescendantOf(dId, aId);
      }
      return false;
    }

    getParent(rowIdOrIndex) {
      const nodeId = this._resolveTreeNodeId(rowIdOrIndex);
      const pId = this.dataAdapter ? this.dataAdapter.getParent(nodeId) : null;
      if (!pId) return typeof rowIdOrIndex === 'number' ? -1 : null;
      return typeof rowIdOrIndex === 'number' ? this.getItemIndex(pId) : pId;
    }

    getChildren(rowIdOrIndex) {
      const nodeId = this._resolveTreeNodeId(rowIdOrIndex);
      const cIds = this.dataAdapter ? this.dataAdapter.getChildren(nodeId) : [];
      if (typeof rowIdOrIndex === 'number') {
        return cIds.map(id => this.getItemIndex(id));
      }
      return cIds;
    }

    getDescendants(rowIdOrIndex, maxLevel = null) {
      const nodeId = this._resolveTreeNodeId(rowIdOrIndex);
      const dIds = this.dataAdapter && typeof this.dataAdapter.getDescendants === 'function'
        ? this.dataAdapter.getDescendants(nodeId, maxLevel)
        : [];
      if (typeof rowIdOrIndex === 'number') {
        return dIds.map(id => this.getItemIndex(id));
      }
      return dIds;
    }

    getAncestors(rowIdOrIndex, includeRoot = false) {
      const nodeId = this._resolveTreeNodeId(rowIdOrIndex);
      const aIds = this.dataAdapter && typeof this.dataAdapter.getAncestors === 'function'
        ? this.dataAdapter.getAncestors(nodeId, includeRoot)
        : [];
      if (typeof rowIdOrIndex === 'number') {
        return aIds.map(id => this.getItemIndex(id));
      }
      return aIds;
    }

    getChildCount(rowIdOrIndex) {
      const nodeId = this._resolveTreeNodeId(rowIdOrIndex);
      return this.dataAdapter && typeof this.dataAdapter.getChildCount === 'function'
        ? this.dataAdapter.getChildCount(nodeId)
        : (this.dataAdapter ? this.dataAdapter.getChildren(nodeId).length : 0);
    }

    getDescendantCount(rowIdOrIndex) {
      const nodeId = this._resolveTreeNodeId(rowIdOrIndex);
      return this.dataAdapter && typeof this.dataAdapter.getDescendantCount === 'function'
        ? this.dataAdapter.getDescendantCount(nodeId)
        : this.getDescendants(nodeId).length;
    }

    getTreeItem(rowIdOrIndex) {
      const nodeId = this._resolveTreeNodeId(rowIdOrIndex);
      const item = this.dataAdapter && typeof this.dataAdapter.getTreeItem === 'function'
        ? this.dataAdapter.getTreeItem(nodeId)
        : null;
      if (!item) return null;
      return Object.assign({}, item, {
        itemIndex: this.getItemIndex(nodeId)
      });
    }

    getTreeRoots() {
      const roots = this.dataAdapter && typeof this.dataAdapter.getTreeRoots === 'function'
        ? this.dataAdapter.getTreeRoots()
        : [];
      return roots;
    }

    getItemIndex(rowId) {
      return this.displayData.findIndex(r => r.__treeNodeId === String(rowId) || r.id === String(rowId));
    }

    getDataRow(itemIndex) {
      const row = this.displayData[itemIndex];
      return row ? (row.__treeNodeId || row.id) : null;
    }

    getLevel(rowIdOrIndex) {
      const nodeId = this._resolveTreeNodeId(rowIdOrIndex);
      return this.dataAdapter ? this.dataAdapter.getLevel(nodeId) : 0;
    }

    isLeaf(rowIdOrIndex) {
      const nodeId = this._resolveTreeNodeId(rowIdOrIndex);
      return this.dataAdapter ? this.dataAdapter.isLeaf(nodeId) : true;
    }

    getIconIndex(rowIdOrIndex) {
      const nodeId = this._resolveTreeNodeId(rowIdOrIndex);
      return this.dataAdapter && typeof this.dataAdapter.getIconIndex === 'function'
        ? this.dataAdapter.getIconIndex(nodeId)
        : null;
    }

    setIconIndex(rowIdOrIndex, iconIndex) {
      const nodeId = this._resolveTreeNodeId(rowIdOrIndex);
      if (this.dataAdapter && typeof this.dataAdapter.setIconIndex === 'function') {
        this.dataAdapter.setIconIndex(nodeId, iconIndex);
      }
    }

    getExpandedIconIndex(rowIdOrIndex) {
      const nodeId = this._resolveTreeNodeId(rowIdOrIndex);
      return this.dataAdapter && typeof this.dataAdapter.getExpandedIconIndex === 'function'
        ? this.dataAdapter.getExpandedIconIndex(nodeId)
        : null;
    }

    setExpandedIconIndex(rowIdOrIndex, iconIndex) {
      const nodeId = this._resolveTreeNodeId(rowIdOrIndex);
      if (this.dataAdapter && typeof this.dataAdapter.setExpandedIconIndex === 'function') {
        this.dataAdapter.setExpandedIconIndex(nodeId, iconIndex);
      }
    }

    /**
     * 형제 노드 간의 순서 상하 이동 (moveRowSibling)
     * @param {number|string} rowIdOrIndex - 이동할 itemIndex 또는 rowId
     * @param {number} offset - 이동할 칸 수 (-1: 위로, +1: 아래로)
     */
    moveRowSibling(rowIdOrIndex, offset) {
      const nodeId = this._resolveTreeNodeId(rowIdOrIndex);
      if (this.dataAdapter && typeof this.dataAdapter.moveRowSibling === 'function') {
        return this.dataAdapter.moveRowSibling(nodeId, offset);
      }
      return false;
    }

    /**
     * 노드의 부모 계층 변경 및 이동 (changeRowParent)
     * @param {number|string} rowIdOrIndex - 이동할 itemIndex 또는 rowId
     * @param {number|string|null} newParentIdOrIndex - 새 부모의 itemIndex 또는 rowId (최상위 루트 이동 시 null)
     * @param {number} [index=-1] - 새 부모의 자식 목록 내 위치
     */
    changeRowParent(rowIdOrIndex, newParentIdOrIndex, index = -1) {
      const nodeId = this._resolveTreeNodeId(rowIdOrIndex);
      const newParentId = newParentIdOrIndex !== null && newParentIdOrIndex !== undefined && newParentIdOrIndex !== -1
        ? this._resolveTreeNodeId(newParentIdOrIndex)
        : null;

      if (this.dataAdapter && typeof this.dataAdapter.changeRowParent === 'function') {
        return this.dataAdapter.changeRowParent(nodeId, newParentId, index);
      }
      return false;
    }

    getCollapsedIconIndex(rowIdOrIndex) {
      const nodeId = this._resolveTreeNodeId(rowIdOrIndex);
      return this.dataAdapter && typeof this.dataAdapter.getCollapsedIconIndex === 'function'
        ? this.dataAdapter.getCollapsedIconIndex(nodeId)
        : null;
    }

    setCollapsedIconIndex(rowIdOrIndex, iconIndex) {
      const nodeId = this._resolveTreeNodeId(rowIdOrIndex);
      if (this.dataAdapter && typeof this.dataAdapter.setCollapsedIconIndex === 'function') {
        this.dataAdapter.setCollapsedIconIndex(nodeId, iconIndex);
      }
    }

    /**
     * 트리 템플릿 설정 (setTreeTemplate)
     * @param {string|Function} templateOrCallback - HTML 템플릿 문자열 또는 템플릿 콜백 함수
     */
    setTreeTemplate(templateOrCallback) {
      if (typeof templateOrCallback === 'function') {
        this.treeOptions.templateCallback = templateOrCallback;
      } else {
        this.treeOptions.template = templateOrCallback;
      }
      this._renderBody();
    }

    /**
     * 트리 템플릿 조회 (getTreeTemplate)
     */
    getTreeTemplate() {
      return this.treeOptions.templateCallback || this.treeOptions.template || null;
    }

    _resolveTreeNodeId(rowIdOrIndex) {
      if (typeof rowIdOrIndex === 'number' && this.displayData[rowIdOrIndex]) {
        return this.displayData[rowIdOrIndex].__treeNodeId || this.displayData[rowIdOrIndex].id;
      }
      return rowIdOrIndex;
    }

    _resolveItemIndex(rowIdOrIndex) {
      if (typeof rowIdOrIndex === 'number') return rowIdOrIndex;
      return this.displayData.findIndex(r => (r.__treeNodeId === String(rowIdOrIndex) || r.id === String(rowIdOrIndex)));
    }

    setTreeData(data, treeField = null, needSorting = false, childrenField = null, iconField = null) {
      if (this.dataAdapter && typeof this.dataAdapter.setTreeData === 'function') {
        this.dataAdapter.setTreeData(data, treeField, needSorting, childrenField, iconField);
      }
    }

    setObjectRows(json, rowsProp = null, childrenProp = 'children', iconProp = null) {
      if (this.dataAdapter && typeof this.dataAdapter.setObjectRows === 'function') {
        this.dataAdapter.setObjectRows(json, rowsProp, childrenProp, iconProp);
      }
    }

    setNestedRows(json, childrenProp = 'children', iconProp = null) {
      if (this.dataAdapter && typeof this.dataAdapter.setNestedRows === 'function') {
        this.dataAdapter.setNestedRows(json, childrenProp, iconProp);
      }
    }

    setXmlRows(xml, rowElement = 'row', childrenField = null, iconField = null) {
      if (this.dataAdapter && typeof this.dataAdapter.setXmlRows === 'function') {
        this.dataAdapter.setXmlRows(xml, rowElement, childrenField, iconField);
      }
    }

    fillXmlData(xmlData, options = {}) {
      if (this.dataAdapter && typeof this.dataAdapter.fillXmlData === 'function') {
        this.dataAdapter.fillXmlData(xmlData, options);
      }
    }

    setRows(data, treeField = null, needSorting = false, childrenField = null, iconField = null) {
      if (this.dataAdapter && typeof this.dataAdapter.setRows === 'function') {
        this.dataAdapter.setRows(data, treeField, needSorting, childrenField, iconField);
      }
    }

    insertChildRow(parentId, index = -1, values = {}, iconIndex = null, hasChildren = false) {
      const pId = this._resolveTreeNodeId(parentId);
      return this.dataAdapter && typeof this.dataAdapter.insertChildRow === 'function'
        ? this.dataAdapter.insertChildRow(pId, index, values, iconIndex, hasChildren)
        : null;
    }

    setChildren(parentId, childrenRows = [], iconField = null) {
      const pId = this._resolveTreeNodeId(parentId);
      if (this.dataAdapter && typeof this.dataAdapter.setChildren === 'function') {
        this.dataAdapter.setChildren(pId, childrenRows, iconField);
      }
    }

    addChildRows(parentId, childrenRows = [], iconField = null) {
      this.setChildren(parentId, childrenRows, iconField);
    }

    setHasChildren(rowIdOrIndex, hasChildren = true) {
      const nodeId = this._resolveTreeNodeId(rowIdOrIndex);
      if (this.dataAdapter && typeof this.dataAdapter.setHasChildren === 'function') {
        this.dataAdapter.setHasChildren(nodeId, hasChildren);
      }
    }

    getHasChildren(rowIdOrIndex) {
      const nodeId = this._resolveTreeNodeId(rowIdOrIndex);
      return this.dataAdapter && typeof this.dataAdapter.getHasChildren === 'function'
        ? this.dataAdapter.getHasChildren(nodeId)
        : false;
    }

    /**
     * 특정 노드의 하위 자손 데이터 집계값 계산 (getSummary)
     * @param {number|string} rowIdOrIndex - 대상 노드의 itemIndex 또는 rowId (전체 집계 시 null)
     * @param {string} fieldName - 집계할 필드명
     * @param {string} [summaryType='sum'] - 'sum', 'avg', 'count', 'max', 'min'
     * @param {boolean} [onlyLeafNodes=true] - 최하위 리프 노드들만 집계할지 여부
     */
    getSummary(rowIdOrIndex, fieldName, summaryType = 'sum', onlyLeafNodes = true) {
      const nodeId = rowIdOrIndex !== null && rowIdOrIndex !== undefined && rowIdOrIndex !== -1
        ? this._resolveTreeNodeId(rowIdOrIndex)
        : null;
      return this.dataAdapter && typeof this.dataAdapter.getSummary === 'function'
        ? this.dataAdapter.getSummary(nodeId, fieldName, summaryType, onlyLeafNodes)
        : 0;
    }

    /**
     * 하위 노드 값들을 상향식 롤업하여 부모 노드에 자동 계산 반영 (calcSubnodeSummary)
     * @param {Object|Array<string>} calcConfigs - { amount: 'sum', headcount: 'sum' }
     * @param {number|string} [rootRowIdOrIndex] - 특정 노드 하위만 계산할 경우 지정
     */
    calcSubnodeSummary(calcConfigs, rootRowIdOrIndex = null) {
      const nodeId = rootRowIdOrIndex !== null && rootRowIdOrIndex !== undefined && rootRowIdOrIndex !== -1
        ? this._resolveTreeNodeId(rootRowIdOrIndex)
        : null;
      if (this.dataAdapter && typeof this.dataAdapter.calcSubnodeSummary === 'function') {
        this.dataAdapter.calcSubnodeSummary(calcConfigs, nodeId);
        this._renderBody();
      }
    }

    /**
     * 특정 노드 값 수정 후 상위 조상 노드들 집계값 연쇄 갱신 (recalcParentNodes)
     */
    recalcParentNodes(rowIdOrIndex, calcConfigs) {
      const nodeId = this._resolveTreeNodeId(rowIdOrIndex);
      if (this.dataAdapter && typeof this.dataAdapter.recalcParentNodes === 'function') {
        this.dataAdapter.recalcParentNodes(nodeId, calcConfigs);
        this._renderBody();
      }
    }
  }

  // LunaGrid / LunaLib 전역 로케일 및 네임스페이스 바인딩
  LunaGrid.setLocale = (localeConfig) => LunaGridLocaleManager.setLocale(localeConfig);
  LunaGrid.getLocale = (code) => LunaGridLocaleManager.getLocale(code);
  LunaGrid.registerLocale = (code, localeObj) => LunaGridLocaleManager.registerLocale(code, localeObj);

  // LunaGrid 네임스페이스 프로퍼티 제공 (충돌 방지 권장 방식: LunaGrid.ValueType, LunaGrid.RowState 등)
  LunaGrid.ValueType = ValueType;
  LunaGrid.LunaValueType = ValueType;
  LunaGrid.RowState = RowState;
  LunaGrid.LunaRowState = RowState;
  LunaGrid.ValidationLevel = ValidationLevel;
  LunaGrid.LunaValidationLevel = ValidationLevel;
  LunaGrid.LunaDataAdapter = LunaDataAdapter;
  LunaGrid.TreeLunaDataAdapter = TreeLunaDataAdapter;
  LunaGrid.LunaGridView = LunaGrid;
  LunaGrid.LunaTreeView = TreeView;

  return {
    Grid: LunaGrid,
    LunaGrid: LunaGrid,
    LunaGridView: LunaGrid,
    GridView: LunaGrid,
    LunaTreeView: TreeView,
    TreeView: TreeView,
    LunaDataAdapter: LunaDataAdapter,
    TreeLunaDataAdapter: TreeLunaDataAdapter,
    LunaValueType: ValueType,
    ValueType: ValueType,
    LunaRowState: RowState,
    RowState: RowState,
    LunaValidationLevel: ValidationLevel,
    ValidationLevel: ValidationLevel,
    setLocale: (cfg) => LunaGridLocaleManager.setLocale(cfg),
    getLocale: (code) => LunaGridLocaleManager.getLocale(code),
    registerLocale: (code, obj) => LunaGridLocaleManager.registerLocale(code, obj),
    LunaGridLocaleManager: LunaGridLocaleManager,
    DEFAULT_LOCALES: DEFAULT_LOCALES,
    exportGrid: LunaGrid.exportGrid,
    registerCustomRenderer: LunaGrid.registerCustomRenderer
  };
});


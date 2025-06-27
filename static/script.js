// 4人支援ページ用スクリプト
let includeFilters = [];
let excludeFilters = [];
let usedChars = [];

// 使用済みキャラを除外してテーブルを更新
function updateCharTableVisibility() {
    $('#filter-char-table tbody tr').each(function() {
        const row = $(this);
        let hasUsedChar = false;
        
        row.find('input[data-name]').each(function() {
            const charName = $(this).data('name');
            if (usedChars.includes(charName)) {
                hasUsedChar = true;
                return false; // break
            }
        });
        
        if (hasUsedChar) {
            row.hide();
        } else {
            row.show();
        }
    });
}

// チェックボックス状態からフィルタ配列を更新
function updateFiltersFromCheckbox() {
    includeFilters = [];
    excludeFilters = [];
    $('#filter-char-table .include-chk:checked').each(function() {
        includeFilters.push($(this).data('name'));
    });
    $('#filter-char-table .exclude-chk:checked').each(function() {
        excludeFilters.push($(this).data('name'));
    });
    renderTags();
    $('#supportTable').DataTable().draw();
}

// タグ表示
function renderTags() {
    const container = $('#filter-tags');
    container.empty();
    includeFilters.forEach((name, idx) => {
        const tag = $(`<span class="badge bg-primary me-2">${name}（含む）</span>`);
        container.append(tag);
    });
    excludeFilters.forEach((name, idx) => {
        const tag = $(`<span class="badge bg-danger me-2">${name}（除外）</span>`);
        container.append(tag);
    });
}

function renderUsedChars() {
    const list = $('#used-chars-list');
    list.empty();
    if (usedChars.length === 0) {
        list.text('なし');
    } else {
        usedChars.forEach((name, idx) => {
            const tag = $(`<span class="badge bg-secondary me-1">${name}</span>`);
            list.append(tag);
        });
    }
}

// DataTables カスタムフィルター関数
$.fn.dataTable.ext.search.push(function (settings, data) {
    const rowText = data.join(" ");
    // 含むキャラすべてを含んでいるか
    if (!includeFilters.every(name => rowText.includes(name))) return false;
    // 含まないキャラが1人でも含まれていたら非表示
    if (excludeFilters.some(name => rowText.includes(name))) return false;
    // 使用済みキャラが1人でも含まれていたら非表示
    if (usedChars.some(name => rowText.includes(name))) return false;
    return true;
});

// ページ読み込み時の初期化
$(document).ready(function () {
    renderUsedChars();
    renderTags();

    const table = $('#supportTable').DataTable({
        language: {
            url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/ja.json"
        }
    });

    // チェックボックス変更
    $('#filter-char-table').on('change', '.include-chk, .exclude-chk', function() {
        // 片方チェック時はもう片方を外す
        const name = $(this).data('name');
        if ($(this).hasClass('include-chk') && $(this).is(':checked')) {
            $(`.exclude-chk[data-name='${name}']`).prop('checked', false);
            $(`.exclude-chk[data-name='${name}']`).removeClass('red-bg');
        }
        if ($(this).hasClass('exclude-chk') && $(this).is(':checked')) {
            $(`.include-chk[data-name='${name}']`).prop('checked', false);
        }
        updateFiltersFromCheckbox();
    });

    // テーブル行クリックで使用済みキャラ追加
    $('#supportTable tbody').on('click', 'tr', function () {
        const rowData = table.row(this).data();
        if (!rowData) return;
        rowData.forEach(name => {
            if (!usedChars.includes(name)) usedChars.push(name);
        });
        renderUsedChars();
        updateCharTableVisibility();
        table.draw();
    });

    // リセットボタン
    $('#reset-used-chars').on('click', function () {
        usedChars = [];
        renderUsedChars();
        updateCharTableVisibility();
        table.draw();
    });

    // ×列のチェックボックスに赤色を適用（fallback for browsers not supporting accent-color）
    $('#filter-char-table').on('change', '.exclude-chk', function() {
        if (this.checked) {
            $(this).addClass('red-bg');
        } else {
            $(this).removeClass('red-bg');
        }
    });
}); 
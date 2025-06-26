// 4人支援ページ用スクリプト
const allNames = [
    "イサドラ","ウィル","ヴァイダ","エリウッド","エルク","オズイン","カアラ","カナス","カレル","ギィ","ガイツ","ケント","ジャファル","セイン","セーラ","ダーツ","ドルカス","ニノ","ニニアン","バアトル","ハーケン","パント","ヒース","ファリナ","フィオーラ","フロリーナ","プリシラ","ヘクトル","ホークアイ","マーカス","マシュー","マリナス","ラガルト","ラス","リン","レイヴァン","レナート","レベッカ","ルイーズ","ルセア","ロウエン","ワレス"
];
let includeFilters = [];
let excludeFilters = [];
let usedChars = [];

// キャラ一覧テーブル生成（1行に5セット横並び、キャラ名の左に縦線）
function renderCharTable() {
    const tbody = $('#filter-char-table tbody');
    tbody.empty();
    const setPerRow = 5; // 1行に5セット
    let row = $('<tr></tr>');
    let colCount = 0;
    allNames.forEach(name => {
        if (usedChars.includes(name)) return;
        if (colCount === setPerRow) {
            tbody.append(row);
            row = $('<tr></tr>');
            colCount = 0;
        }
        row.append(`<td class="text-center border-left-sep" style="width:30px;"><input type="checkbox" class="form-check-input include-chk" data-name="${name}"></td>`);
        row.append(`<td class="text-center" style="width:30px;"><input type="checkbox" class="form-check-input exclude-chk" data-name="${name}"></td>`);
        row.append(`<td class="border-right-sep text-center" style="width:100px;">${name}</td>`);
        colCount++;
    });
    if (colCount > 0) tbody.append(row);
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
    renderCharTable();
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
        renderCharTable();
        table.draw();
    });

    // リセットボタン
    $('#reset-used-chars').on('click', function () {
        usedChars = [];
        renderUsedChars();
        renderCharTable();
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
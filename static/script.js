// 4人支援ページ用スクリプト
let includeFilters = [];
let excludeFilters = [];
let usedChars = [];
let usedCombinations = []; // 選択済み組み合わせを管理

// 使用済みキャラを除外してテーブルを更新
function updateCharTableVisibility() {
    $('#filter-char-table tbody tr').each(function() {
        const row = $(this);
        
        // 各行のセル（3セット分）をチェック
        for (let i = 0; i < 6; i++) {
            const includeCell = row.find(`td:nth-child(${i * 3 + 1})`);
            const excludeCell = row.find(`td:nth-child(${i * 3 + 2})`);
            const nameCell = row.find(`td:nth-child(${i * 3 + 3})`);
            
            const charName = includeCell.find('input').data('name');
            if (charName && usedChars.includes(charName)) {
                // 使用済みキャラのセルをグレーアウト
                includeCell.addClass('used-character');
                excludeCell.addClass('used-character');
                nameCell.addClass('used-character');
                
                // チェックボックスを非活性化
                includeCell.find('input').prop('disabled', true);
                excludeCell.find('input').prop('disabled', true);
            } else if (charName) {
                // 使用されていないキャラのセルを通常表示
                includeCell.removeClass('used-character');
                excludeCell.removeClass('used-character');
                nameCell.removeClass('used-character');
                
                // チェックボックスを活性化
                includeCell.find('input').prop('disabled', false);
                excludeCell.find('input').prop('disabled', false);
            }
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

function renderUsedCombinations() {
    const container = $('#used-combinations-list');
    container.empty();
    if (usedCombinations.length === 0) {
        container.html('<span class="text-muted">なし</span>');
    } else {
        usedCombinations.forEach((combination, idx) => {
            const combinationDiv = $(`
                <div class="mb-1 p-2 border rounded">
                    <div class="d-flex flex-wrap gap-1 align-items-center">
                        ${combination.map(name => `<span class="badge bg-secondary">${name}</span>`).join('')}
                        <button type="button" class="btn-close ms-1" 
                                data-combination-index="${idx}" aria-label="削除"></button>
                    </div>
                </div>
            `);
            container.append(combinationDiv);
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
    renderUsedCombinations();
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
        
        // 組み合わせとして追加
        usedCombinations.push([...rowData]);
        
        // 使用済みキャラリストを更新
        rowData.forEach(name => {
            if (!usedChars.includes(name)) usedChars.push(name);
        });
        
        renderUsedCombinations();
        updateCharTableVisibility();
        table.draw();
    });

    // リセットボタン
    $('#reset-used-chars').on('click', function () {
        usedChars = [];
        usedCombinations = [];
        renderUsedCombinations();
        updateCharTableVisibility();
        table.draw();
    });

    // 個別組み合わせ削除ボタン
    $('#used-combinations-list').on('click', '.btn-close', function() {
        const index = $(this).data('combination-index');
        const combination = usedCombinations[index];
        
        // 組み合わせを削除
        usedCombinations.splice(index, 1);
        
        // 使用済みキャラリストを再構築
        usedChars = [];
        usedCombinations.forEach(combo => {
            combo.forEach(name => {
                if (!usedChars.includes(name)) usedChars.push(name);
            });
        });
        
        renderUsedCombinations();
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
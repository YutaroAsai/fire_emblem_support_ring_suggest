import re
from flask import Flask, render_template, request
import csv
import os

app = Flask(__name__)

# 封印の剣
CHARACTERS_FUIN = [
    "ロイ","マーカス","アレン","ランス","ウォルト","ボールス","エレン","ディーク","ワード","ロット","シャニー","チャド","ルゥ","クラリーネ","ルトガー","サウル","ドロシー","スー","ゼロット","トレック","ノア","アストール","リリーナ","ウェンディ","バース","オージェ","フィル","シン","ゴンザレス","ギース","クレイン","ティト","ララム","エキドナ","エルフィン","バアトル","レイ","キャス","ミレディ","パーシバル","セシリア","ソフィーヤ","イグレーヌ","ガレット","ファ","ヒュウ","ツァイス","ダグラス","ニイメ","ダヤン","ユーノ","ヨーデル","カレル"
]
# 烈火の剣
CHARACTERS_REKKA = [
    "エリウッド","ロウエン","マーカス","レベッカ","ドルカス","バアトル","ヘクトル","オズイン","セーラ","マシュー","ギィ","マリナス","エルク","プリシラ","リン","ウィル","ケント","セイン","フロリーナ","レイヴァン","ルセア","カナス","ダーツ","フィオーラ","ラガルト","ニニアン","イサドラ","ヒース","ラス","ホークアイ","ガイツ","ワレス","パント","ルイーズ","カレル","ハーケン","ニノ","ジャファル","ヴァイダ","ニルス","カアラ","レナート"
]
# 聖魔の光石
CHARACTERS_SEIMA = [
    "エイリーク","ゼト","ギリアム","フランツ","モルダ","ヴァネッサ","ロス","ガルシア","ネイミー","コーマ","アスレイ","ルーテ","ナターシャ","ヨシュア","エフラム","フォルデ","カイル","ターナ","アメリア","ヒーニアス","ジスト","テティス","マリカ","ラーチェル","ドズラ","サレフ","ユアン","クーガー","レナック","デュッセル","ノール","ミルラ","シレーネ"
]

# 作品名→キャラリストの辞書
CHARACTER_LISTS = {
    "烈火": CHARACTERS_REKKA,
    "封印": CHARACTERS_FUIN,
    "聖魔": CHARACTERS_SEIMA
}

# CSVファイルを読み込んでリスト化
def load_support_data(filepath):
    support_list = []
    with open(filepath, encoding="utf-8") as f:
        reader = csv.reader(f)
        for row in reader:
            if len(row) >= 4:
                support_list.append(row)
    return support_list

# data配下のファイルから人数候補を抽出
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
FILE_PATTERN = re.compile(r"(.+)_支援環リスト_k=(\d+)\.csv")

def get_title_num_options():
    # 作品名は固定
    title_order = ["封印", "烈火", "聖魔"]
    options = {}
    
    # 各作品の人数を取得
    for title in title_order:
        options[title] = []
        files = os.listdir(DATA_DIR)
        for fname in files:
            if fname.startswith(f"{title}_支援環リスト_k="):
                m = re.search(r"k=(\d+)\.csv", fname)
                if m:
                    num = int(m.group(1))
                    options[title].append(num)
        # 人数を昇順でソート
        options[title].sort()
    
    return options

@app.route("/")
def index():
    return "<p>アクセス先：<a href='/support'>支援環検索</a>"

@app.route("/support")
def support():
    options = get_title_num_options()
    # デフォルト
    default_title = "封印"
    default_num = 4
    # パラメータ取得
    title = request.args.get("title", default_title)
    num = int(request.args.get("num", default_num))
    # ファイルパス
    filename = f"{title}_支援環リスト_k={num}.csv"
    filepath = os.path.join(DATA_DIR, filename)
    # データ取得
    if os.path.exists(filepath):
        results = load_support_data(filepath)
    else:
        results = []
    # キャラリスト
    characters = CHARACTER_LISTS.get(title, [])
    return render_template(
        "support.html",
        results=results,
        characters=characters,
        options=options,
        selected_title=title,
        selected_num=num
    )

if __name__ == "__main__":
    app.run(debug=True)

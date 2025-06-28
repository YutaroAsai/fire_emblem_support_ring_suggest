import re
from flask import Flask, render_template, request
import csv
import os

app = Flask(__name__)

# 烈火の剣
CHARACTERS_REKKA = [
    "イサドラ","ウィル","ヴァイダ","エリウッド","エルク","オズイン","カアラ","カナス","カレル","ギィ","ガイツ","ケント","ジャファル","セイン","セーラ","ダーツ","ドルカス","ニノ","ニニアン","バアトル","ハーケン","パント","ヒース","ファリナ","フィオーラ","フロリーナ","プリシラ","ヘクトル","ホークアイ","マーカス","マシュー","マリナス","ラガルト","ラス","リン","レイヴァン","レナート","レベッカ","ルイーズ","ルセア","ロウエン","ワレス"
]
# 封印の剣
CHARACTERS_FUIN = [
    "アレン","アストール","イグレーヌ","ウェンディ","エキドナ","エレン","エルフィン","オージェ","カレル","キャス","ギース","クレイン","クラリーネ","ゴンザレス","サウル","シン","シャニー","スー","セシリア","ゼロット","ダグラス","チャド","ティト","ツァイス","ドロシー","ニイメ","ノア","バアトル","パーシバル","ファ","フィル","ブレイダン","ボールス","マーカス","ミレディ","ルゥ","レイ","レナ","ロイ","ロット","ワード","ユーノ","ララム","ラガルト","リリーナ","ルトガー","レイ","レナック","ロット","ワード","ユーノ","ララム","リリーナ","ルトガー"
]
# 聖魔の光石
CHARACTERS_SEIMA = [
    "アメリア","アスレイ","エイリーク","エフラム","ガルシア","ギリアム","クーガー","コーマ","サレフ","ジスト","シレーネ","ゼト","ターナ","テティス","ドズラ","ナターシャ","ネイミー","ノール","ヒーニアス","フランツ","フォルデ","マリカ","ミルラ","モルダ","ラーチェル","ルーテ","ロス","レナック","ヨシュア","ヴァネッサ","ユアン"
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

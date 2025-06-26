from flask import Flask, render_template
import csv
import os

app = Flask(__name__)


# CSVファイルを読み込んでリスト化
def load_support_data(filepath):
    support_list = []
    with open(filepath, encoding="utf-8") as f:
        reader = csv.reader(f)
        for row in reader:
            if len(row) >= 4:
                support_list.append(row) 
    return support_list


@app.route("/")
def index():
    return "<p>アクセス先：<a href='/support-4'>4人支援ページ</a></p><p>アクセス先：<a href='/support-6'>6人支援ページ</a></p>"

@app.route("/support-4")
def support_4():
    filepath = os.path.join(os.path.dirname(__file__), "data", "support_4.csv")
    support_4_list = load_support_data(filepath)
    return render_template("support_4.html", results=support_4_list)


@app.route("/support-6")
def support_6():
    filepath = os.path.join(os.path.dirname(__file__), "data", "support_6.csv")
    support_6_list = load_support_data(filepath)
    return render_template("support_6.html", results=support_6_list)


if __name__ == "__main__":
    app.run(debug=True)

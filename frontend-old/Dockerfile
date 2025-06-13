# ベースイメージとしてNginxを使用
FROM nginx:1.25-alpine

# 作成した静的ファイル（html, js）をNginxのドキュメントルートにコピー
COPY index.html /usr/share/nginx/html
COPY script.js /usr/share/nginx/html

# カスタムのNginx設定ファイルをコピー
COPY nginx.conf /etc/nginx/conf.d/default.conf
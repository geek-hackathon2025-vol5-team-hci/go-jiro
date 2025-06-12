# ベースイメージとしてNode.js v18を使用
FROM node:18-alpine

# 作業ディレクトリを作成
WORKDIR /usr/src/app

# 依存関係ファイルをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# ソースコードをコピー
COPY . .

# アプリケーションを起動
CMD [ "npm", "start" ]
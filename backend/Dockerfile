# ベースイメージとしてNode.js 18を指定
FROM node:18

# アプリケーションディレクトリを作成
WORKDIR /usr/src/app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
# ここではPrismaもインストールされます
RUN npm install

# プロジェクトファイル（prismaフォルダを含む）をすべてコピー
COPY . .

# Prisma Clientを生成
# COPY . . の後なので schema.prisma が存在しています
RUN npx prisma generate

# アプリケーションのポートを公開
EXPOSE 3000

# アプリケーションを起動
CMD [ "npm", "start" ]
# go-jiro


//ビルド&実行

docker-compose up --build

//以下にアクセス

http://localhost:3000

//データベース初期化？

docker-compose exec backend npm run prisma:migrate


dockerize -wait tcp://malcopolo-db:3306 -timeout 20s

npx prisma migrate dev --name init
npx prisma generate

npm run start:dev
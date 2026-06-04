# 로컬 db 환경세팅 가이드

## 1. 초기 설치

1. 도커 데스크탑 혹은 도커 설치
2. 터미널에서 프로젝트 루트 폴더로 이동 후 `docker-compose -f docker-compose.local.yml up -d`
3. 포트 오류 발생시 .env파일에서 다른 포트 명시하여 변경후 재시도 (예 : DB_PORT=33566 )
4. mysql workbench 등 원하는 툴로 정상 동작 확인하기

## 2. 관련 주요 명령어
|명령어|설명|
|-----|----|
|docker-compose -f docker-compose.local.yml up -d | 최초 시작 |
|docker-compose -f docker-compose.local.yml down| 삭제 |
|docker-compose -f docker-compose.local.yml down -v |볼륨 포함 삭제 (저장 데이터 초기화)|
|docker-compose -f docker-compose.local.yml stop| 잠시 정지|
|docker-compose -f docker-compose.local.yml start| 재시작|

## 3. Prisma Migrate

1. cd backend
2. npx prisma migrate deploy
3. npx prisma generate
4. tsx ./prisma/seed.ts
순으로 실행하면 됨.
# Bun Bo Hue Co Do

Website dat mon va dat ban truc tuyen cho nha hang Bun Bo Hue Co Do.

Link deploy:
https://bun-bo-co-do-hue.vercel.app/

## Cap nhat quan trong

Du an da chuyen sang MongoDB Atlas cho du lieu runtime.

- API menu, coupon, customer, order, reservation doc du lieu tu MongoDB.
- Script seed da ho tro fallback DNS de tranh loi SRV tren mot so mang noi bo.
- Ban co the chay local voi Atlas ma khong can MongoDB local.

## Cong nghe

- Next.js 14 + TypeScript
- React 18 + Tailwind CSS
- MongoDB Atlas (mongodb driver)
- JWT + bcryptjs
- Nodemailer + SMS provider

## Cau truc du lieu seed

Script seed se day cac bo du lieu sau len Atlas:

- menu_items
- combos
- coupons
- users (admin mac dinh)
- counters

Du lieu nguon nam trong:

- src/data/menu.json
- src/data/combos.json
- src/data/promos.json

## Yeu cau truoc khi chay

- Node.js 18 tro len
- npm 9 tro len
- MongoDB Atlas cluster da tao user truy cap
- Atlas Network Access da cho phep IP cua ban (hoac 0.0.0.0/0 cho moi truong hoc tap)

## Bien moi truong

Tao file .env.local va cau hinh toi thieu:

MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=<app>&retryWrites=true&w=majority
MONGODB_DB_NAME=bun_bo_hue_co_do
TARGET_MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=<app>&retryWrites=true&w=majority
MONGODB_DNS_SERVERS=8.8.8.8,1.1.1.1

JWT_SECRET=replace_with_strong_secret_key
JWT_EXPIRES_IN=7d

SMS_ENABLED=false
SMS_PROVIDER=infobip

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

Ghi chu:

- MONGODB_URI la ket noi ma app su dung khi chay.
- TARGET_MONGODB_URI duoc dung cho cac script migrate/copy du lieu.
- MONGODB_DNS_SERVERS giup fallback DNS khi gap loi querySrv ECONNREFUSED.

## Huong dan khoi dong code

1. Cai dependency

npm install

2. Seed du lieu len Atlas

npm run seed:mongo

3. Chay dev server

npm run dev

Neu cong 3000 dang ban:

npm run dev -- -p 3001

4. Mo trinh duyet

http://localhost:3000
hoac
http://localhost:3001

## Chay production local

1. Build

npm run build

2. Start

npm run start

Neu can doi cong:

npm run start -- -p 3001

## Tai khoan admin seed mac dinh

- Username: admin
- Password: Admin@12345

Khuyen nghi doi mat khau admin ngay sau lan dang nhap dau.

## Xu ly loi thuong gap

1. Loi EADDRINUSE port 3000

- Nguyen nhan: da co process dang dung cong 3000.
- Cach xu ly: doi cong 3001 hoac tat process chiem cong.

2. Loi querySrv ECONNREFUSED _mongodb._tcp...

- Nguyen nhan: DNS he thong khong resolve duoc SRV cua Atlas.
- Cach xu ly:
	- Dat MONGODB_DNS_SERVERS=8.8.8.8,1.1.1.1
	- Kiem tra DNS may tinh, VPN, proxy, firewall
	- Thu doi mang (wifi/hotspot)

3. API menu tra ve rong

- Nguyen nhan: chua seed du lieu len Atlas hoac seed vao DB khac ten.
- Cach xu ly:
	- Kiem tra MONGODB_DB_NAME
	- Chay lai npm run seed:mongo
	- Goi thu GET /api/menu de xac nhan count > 0

## Scripts huu ich

- npm run dev: chay local development
- npm run build: build production
- npm run start: chay production build
- npm run lint: lint source code
- npm run seed:mongo: seed du lieu co ban len MongoDB
- npm run migrate:atlas: migrate du lieu tu local len Atlas

## Bao mat

- Khong commit file .env.local len git.
- Neu tung lo credential, can doi ngay:
	- MongoDB Atlas password
	- Email app password
	- JWT secret

## Thong tin bo sung

Neu ban muon bo sung migration du lieu orders, reservations, customers tu local Mongo sang Atlas, su dung script trong thu muc database va backup du lieu truoc khi copy.

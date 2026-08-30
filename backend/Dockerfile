FROM node:20-alpine

WORKDIR /app

# نصب پکیج‌ها
COPY package*.json ./
RUN npm install

# کپی سورس‌کد
COPY . .

EXPOSE 5000

# اجرای بکند به صورت لایو با tsx watch
CMD ["npx", "tsx", "watch", "src/app.ts"]

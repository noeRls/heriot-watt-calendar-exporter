# Node application
FROM buildkite/puppeteer:latest

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install

COPY ./prisma ./prisma
RUN npx prisma generate

COPY . ./

COPY src ./src/

# Run application
CMD npm start
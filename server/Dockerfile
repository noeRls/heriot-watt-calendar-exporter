# Node application
FROM buildkite/puppeteer:latest

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install

COPY ./prisma ./prisma
RUN npx prisma generate

ARG NODE_ENV
RUN if [ "$NODE_ENV" = "production" ]; then npm run-script build; fi

COPY . ./

COPY src ./src/

# Run application
CMD npm start
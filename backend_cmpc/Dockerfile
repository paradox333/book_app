FROM node:22

WORKDIR /app
COPY . .

RUN yarn install

CMD ["sh", "-c", "yarn migrate && yarn start:dev"]

EXPOSE 3000

FROM node:20-alpine

RUN addgroup -S app && adduser -S -G app appuser

WORKDIR /app

COPY package*.json ./

RUN chown -R appuser:app /app

USER appuser

RUN npm ci

COPY --chown=appuser:app . .

RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "start"]

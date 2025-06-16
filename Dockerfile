FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN chmod +x entrypoint.sh

CMD ["sh", "entrypoint.sh"]

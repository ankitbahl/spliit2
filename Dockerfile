FROM node:18.17
WORKDIR '/app'
COPY . .
RUN npm install
RUN npm run build
CMD ["npm", "run", "start"]

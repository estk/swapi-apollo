FROM alpine

RUN apk add --update --no-cache nodejs tini
WORKDIR /app

COPY ./package.json /app
RUN npm --unsafe-perm install && npm cache clear

COPY . /app
RUN npm build

EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["npm", "start"]

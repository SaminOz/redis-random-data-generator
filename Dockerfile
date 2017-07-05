FROM node:onbuild

RUN \
  sed -i 's/127.0.0.1/redis/' config.json

ENTRYPOINT [ "node", "generator.js" ]

FROM node:10.15.3-alpine

LABEL "com.github.actions.name"="Release note scribe"
LABEL "com.github.actions.description"="Generate release notes on Github based on commit msg."
LABEL "com.github.actions.icon"="circle"
LABEL "com.github.actions.color"="yellow"

COPY . /


ENTRYPOINT ["node", "/entrypoint.js"]
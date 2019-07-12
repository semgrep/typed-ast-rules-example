FROM node:11.10.0-stretch

RUN groupadd -r analysis && useradd -m --no-log-init --system --gid analysis analysis
RUN chown -R analysis:analysis /home/analysis

USER analysis
COPY --chown=analysis:analysis src /analyzer
WORKDIR /analyzer
RUN npm install
RUN npm run-script build

WORKDIR /
CMD ["/analyzer/analyze.sh"]
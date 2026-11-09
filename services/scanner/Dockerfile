FROM node:24-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends clamav clamav-daemon ca-certificates curl dumb-init netcat-openbsd \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json server.mjs ./
COPY docker-entrypoint.sh /usr/local/bin/pitchpond-scanner-entrypoint
RUN chmod 0755 /usr/local/bin/pitchpond-scanner-entrypoint \
  && mkdir -p /var/lib/clamav /run/clamav \
  && chown -R clamav:clamav /var/lib/clamav /run/clamav

ENV PORT=8080 \
  CLAMD_HOST=127.0.0.1 \
  CLAMD_PORT=3310

EXPOSE 8080
VOLUME ["/var/lib/clamav"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=120s --retries=3 CMD curl --fail --silent http://127.0.0.1:8080/health || exit 1

ENTRYPOINT ["dumb-init", "--", "pitchpond-scanner-entrypoint"]

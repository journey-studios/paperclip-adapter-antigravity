ARG PAPERCLIP_BASE=ghcr.io/paperclipai/paperclip@sha256:08dbadebd4d40550eb336c25c3691f582322a88bae3f1cca101c5dd096bdc9d3

FROM ${PAPERCLIP_BASE} AS builder
USER root
WORKDIR /app
COPY patches/paperclip-journey.patch /tmp/paperclip-journey.patch
RUN git apply --check /tmp/paperclip-journey.patch \
 && git apply --whitespace=nowarn /tmp/paperclip-journey.patch

ENV NODE_ENV=development
RUN CI=1 pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm exec vitest run \
      packages/adapters/cursor-local/src/server/parse.test.ts \
      packages/adapters/cursor-local/src/server/execute.provider.test.ts \
      ui/src/lib/cursor-pricing.test.ts \
      ui/src/lib/provider-cost-totals.test.ts \
 && pnpm --filter @paperclipai/adapter-cursor-local typecheck
RUN pnpm --filter @paperclipai/adapter-agy-local build \
 && pnpm --filter @paperclipai/adapter-cursor-local build
RUN cd /app/server && pnpm exec tsc
RUN cd /app/ui && pnpm build

FROM ${PAPERCLIP_BASE} AS runtime
USER root
WORKDIR /app

# Runtime artifacts compiled from the patched source.
COPY --from=builder /app/server/dist /app/server/dist
COPY --from=builder /app/ui/dist /app/ui/dist

# Preserve patched sources too: they are useful for diagnostics and keep the
# running container aligned with the recipe that produced its compiled output.
COPY --from=builder /app/server/src /app/server/src
COPY --from=builder /app/ui/src /app/ui/src
COPY --from=builder /app/packages/adapters/agy-local /app/packages/adapters/agy-local
COPY --from=builder /app/packages/adapters/cursor-local/src /app/packages/adapters/cursor-local/src
COPY --from=builder /app/packages/adapters/cursor-local/dist /app/packages/adapters/cursor-local/dist

# The production image already contains compatible runtime dependencies.
# Recreate only the workspace links needed by the embedded agy_local adapter.
RUN rm -rf /app/packages/adapters/agy-local/node_modules \
 && mkdir -p /app/packages/adapters/agy-local/node_modules/@paperclipai \
 && ln -s ../../../../adapter-utils /app/packages/adapters/agy-local/node_modules/@paperclipai/adapter-utils \
 && ln -s ../../../../node_modules/.pnpm/picocolors@1.1.1/node_modules/picocolors /app/packages/adapters/agy-local/node_modules/picocolors \
 && ln -sfn ../../../packages/adapters/agy-local /app/server/node_modules/@paperclipai/adapter-agy-local

LABEL org.opencontainers.image.title="Journey Studios Paperclip" \
      org.opencontainers.image.description="Paperclip with Journey Studios agy_local integration and Cursor accounting fixes" \
      com.journeystudios.paperclip.base.commit="8f8a0ab7effbd6a0584107d8038736c134ee5047" \
      com.journeystudios.paperclip.base.version="2026.1001.0" \
      com.journeystudios.paperclip.overlay="agy-local+cursor-cost-v1"

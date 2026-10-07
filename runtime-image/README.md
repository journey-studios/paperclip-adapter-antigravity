# Journey Studios Paperclip runtime overlay

Reproduz a imagem customizada usada pela Journey Studios sem editar containers em produção.

## Fonte

- base upstream fixada por digest no `Dockerfile`;
- customizações da Journey em `patches/paperclip-journey.patch`;
- documentação de contabilização em `docs/CURSOR-COST-ACCOUNTING.md`;
- procedimento operacional em `docs/UPGRADE-RUNBOOK.md`.

## Fluxo

```bash
./scripts/build.sh paperclip:agy-cursor-cost-v1
./scripts/verify.sh paperclip:agy-cursor-cost-v1
./scripts/deploy.sh paperclip:agy-cursor-cost-v1
```

Não usar a imagem oficial diretamente no Compose. Sempre gerar e validar a imagem Journey.

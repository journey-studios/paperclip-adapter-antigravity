# Journey Studios Paperclip custom image — runbook

## Base atual

- upstream: `paperclipai/paperclip`
- release: `2026.1001.0`
- commit: `8f8a0ab7effbd6a0584107d8038736c134ee5047`
- digest fixado: `sha256:08dbadebd4d40550eb336c25c3691f582322a88bae3f1cca101c5dd096bdc9d3`
- família de imagem de produção: `paperclip:agy-*`

Nunca substituir a imagem Journey diretamente pela imagem upstream. O `agy_local` e os overlays da Journey não existem na imagem oficial.

## Arquitetura

```text
Paperclip upstream fixado por digest
        ↓
patches/paperclip-journey.patch
        ↓
builder temporário
  - agy_local
  - cursor-local
  - server TypeScript
  - UI
        ↓
runtime limpo baseado novamente na imagem oficial
        ↓
paperclip:agy-<versão>
```

O builder instala devDependencies, executa as regressões focadas e compila. O estágio runtime não herda essas devDependencies. O runner Rust não é recompilado quando não foi alterado; preservamos o binário oficial da imagem base.

## Conteúdo do overlay

O patch captura as customizações existentes da instalação, incluindo integração `agy_local`, e adiciona as correções de contabilização do Cursor documentadas em `CURSOR-COST-ACCOUNTING.md`.

O repositório `journey-studios/paperclip-adapter-antigravity` continua sendo a fonte reutilizável do adapter Antigravity. O patch de runtime representa a integração exata desse adapter e demais alterações com uma versão específica do Paperclip.

## Build

```bash
cd /opt/paperclip-build/runtime-image
./scripts/build.sh paperclip:agy-cursor-cost-v1
./scripts/verify.sh paperclip:agy-cursor-cost-v1
```

O build deve:

1. aplicar o patch com `git apply --check`;
2. rodar as 9 regressões focadas de Cursor/custos e o typecheck do adapter;
3. compilar `agy_local`;
4. compilar `cursor-local`;
5. compilar o TypeScript do servidor sem refazer o runner Rust;
6. gerar a UI de produção;
7. criar uma imagem runtime nova a partir do digest upstream fixado.

## Validação pré-deploy

Antes de trocar produção:

- conferir containers e espaço em disco;
- executar os testes focados de Cursor/custos;
- gerar dump do PostgreSQL;
- preservar o `docker-compose.yml`;
- criar tag de rollback para a imagem atualmente em uso;
- confirmar que os mounts do `agy` e das credenciais Gemini permanecem iguais.

## Deploy

```bash
cd /opt/paperclip-build/runtime-image
./scripts/deploy.sh paperclip:agy-cursor-cost-v1
```

Depois, validar:

- container Paperclip em execução;
- HTTP/API local;
- conexão com PostgreSQL;
- UI;
- disponibilidade do `agy_local`;
- um run real de baixo custo do CTO/CEO via `agy_local` quando pertinente;
- um run do Cursor e sua telemetria de provider, input, cache, output e subscription share.

## Rollback

O script de deploy cria um dump PostgreSQL, snapshot do Compose e uma tag `paperclip:agy-rollback-<timestamp>` da imagem anterior. O Compose continua usando o tag estável `paperclip:agy`; o script move esse tag local somente depois que a candidata já passou build/verify e aguarda `/api/health` ficar pronto.

Para rollback:

1. apontar `image:` no Compose para a tag de rollback;
2. executar `docker compose up -d --no-deps paperclip`;
3. validar API, UI, `agy_local` e Cursor.

Restore de banco só é necessário se uma atualização tiver aplicado migration incompatível. Este overlay de custos não cria migration.

## Upgrade upstream

Para cada nova release do Paperclip:

1. ler release notes e migrations;
2. identificar commit e digest exatos;
3. criar um checkout limpo do upstream;
4. rodar `git apply --check` com o patch Journey;
5. resolver conflitos conscientemente;
6. revisar se o upstream já incorporou alguma correção local e remover duplicação;
7. rodar testes focados e builds;
8. gerar nova tag versionada da imagem;
9. fazer backup;
10. deploy;
11. validar `agy_local` e Cursor em runs reais;
12. atualizar este runbook com novo commit/digest.

Não regenerar o patch a partir de um container em produção sem antes comparar contra o commit upstream conhecido.

## Testes de regressão adicionados

- parser do Cursor lê `cacheReadTokens`;
- modelos `composer-*` e `cursor-*` resolvem provider `cursor`;
- Composer 2.5 calcula o valor equivalente esperado;
- cache entra no total uma vez;
- 100% de uso via assinatura é exibido como 100%, não 50%.

## Limitações conhecidas do baseline upstream

O typecheck completo da UI dessa release apresenta erros em `native-run-events-boundary-golden.test.ts` ligados a um módulo de test-support ausente no artefato oficial. Eles não foram introduzidos pelo overlay. Os testes focados do overlay e o build de produção da UI passam.


## Rollout de 2026-10-06

- imagem anterior preservada em `paperclip:agy-rollback-20261007T015505Z`;
- backup pré-deploy: `/opt/paperclip/backup/snapshots/20261007T015505Z-cursor-cost`;
- o primeiro health check do script antigo ocorreu cedo demais e recebeu connection reset durante o boot; o servidor ficou saudável logo depois;
- o script foi corrigido para polling de readiness;
- o patch runtime antigo `/paperclip/patch-ui.sh`, que alterava um bundle por hash para habilitar quota Google, não é mais necessário para a nova build; o suporte Google foi incorporado ao source. O arquivo antigo pode permanecer durante a janela de rollback porque não encontra o bundle novo e não altera nada;
- JOU-12 validou um run Cursor real após o deploy.

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

O builder instala devDependencies com `--frozen-lockfile`, executa as regressões focadas e compila. O estágio runtime não herda essas devDependencies. O runner Rust não é recompilado quando não foi alterado; preservamos o binário oficial da imagem base.

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
- executar `verify.sh` na candidata antes de qualquer mutação;
- criar tag de rollback para a imagem atualmente em uso;
- confirmar que os mounts do `agy` e das credenciais Gemini permanecem iguais.

## Deploy

```bash
cd /opt/paperclip-build/runtime-image
./scripts/deploy.sh paperclip:agy-cursor-cost-v1
```

O script recusa deploy concorrente, mantém o Compose em `paperclip:agy`, promove a candidata somente após `verify.sh`, aguarda readiness e confirma que o image ID do container é exatamente o da candidata. Em falha pós-promoção, repõe automaticamente a imagem anterior.

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

1. **não altere o Compose para uma tag de rollback**; ele deve permanecer em `paperclip:agy`;
2. repromova a imagem escolhida para o tag estável, por exemplo `docker tag paperclip:agy-rollback-<timestamp> paperclip:agy`;
3. execute `docker compose up -d --force-recreate paperclip`;
4. valide que o container ativo usa o image ID esperado e então valide API, UI, `agy_local` e Cursor.

O `deploy.sh` automatiza rollback em falha de readiness, mismatch de image ID, erro e sinais INT/TERM após a promoção. Ele também serializa deploys com `flock`, normaliza o Compose para `paperclip:agy` e executa `verify.sh` antes de qualquer mutação.

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


### Estado final reproduzível

- imagem ativa: `paperclip:agy` → `sha256:529b4eca9fd9a7972794b98820527dbf10ec90457b1796c6a0cc2f9c492453db`;
- backup do deploy reproduzível: `/opt/paperclip/backup/snapshots/20261007T020617Z-cursor-cost`;
- rollback imediato do deploy reproduzível: `paperclip:agy-rollback-20261007T020617Z`;
- rollback para a imagem original anterior a esta mudança permanece disponível em `paperclip:agy-rollback-20261007T015505Z`;
- JOU-14 / run `8496b6c0-279e-4cdb-bf96-aac79267b30f` validou a imagem construída pela receita: provider `cursor`, input `26,474`, cache read `92,923`, output `882`, billing `subscription_included`, cost status `unpriced`.


## Segurança do Antigravity

`dangerouslySkipPermissions` tem default **false** quando omitido. O flag `--dangerously-skip-permissions` só pode ser enviado quando a configuração estiver explicitamente em `true`. Os testes focados do build verificam o comportamento omitido, `false` e `true`.


## Postura de segurança verificada em produção

Verificado em 2026-10-06/07 antes do merge desta receita:

- container Paperclip: `Privileged=false`;
- `CapAdd`: nenhum capability adicional;
- processo do container atualmente roda como `root`;
- root filesystem não está read-only;
- volume `/paperclip`: read-write;
- credenciais Gemini montadas em `/paperclip/.gemini` e `/root/.gemini`: read-write;
- binário `/usr/local/bin/agy`: bind read-only;
- `/opt/scripts`: bind read-only.

Os quatro agentes `agy_local` existentes (CEO, CMO, Content & SEO Specialist e Social & Creative Lead) possuem `dangerouslySkipPermissions: true` explicitamente. Portanto, mudar o default omitido para `false` não altera esses agentes existentes. Novos agentes ou configurações sem esse campo permanecem seguros por padrão.

Rodar como root e manter credenciais/volume persistente em RW é um risco operacional conhecido e deve ser tratado em uma etapa separada de hardening, com teste de compatibilidade e rollback; não deve ser alterado incidentalmente neste patch de contabilização/deploy.

# Cursor cost accounting overlay

## Problema

No Paperclip 2026.1001.0, runs do Cursor com `composer-2.5` eram persistidos com:

- provider `unknown`;
- `cacheReadTokens` descartado;
- `costStatus: unpriced`, mas a interface mostrava `$0.00`;
- percentual de assinatura com dupla contagem no denominador, produzindo 50% quando todo o uso do provider vinha da assinatura.

O evento `result` observado no Cursor CLI expõe `inputTokens`, `outputTokens` e `cacheReadTokens`. Em runs autenticados pela assinatura do Cursor, ele não informa custo em dólares.

## Correções

1. `cursor-local/parse.ts`
   - aceita `cacheReadTokens` em camelCase, além de formas compatíveis em snake_case.
2. `cursor-local/execute.ts`
   - mapeia IDs `composer-*` e `cursor-*` para provider `cursor`.
3. UI de Costs
   - inclui cache no total de tokens;
   - calcula assinatura como `subscription tokens / total tokens`, sem somar novamente os mesmos tokens ao denominador;
   - exibe tokens de cache;
   - para modelos Cursor com tarifa conhecida, exibe um **custo equivalente estimado**, separado do spend efetivamente registrado no ledger.

## Tarifas equivalentes do Composer 2.5

Verificadas em 2026-10-06 na tabela pública do Cursor:

- input: USD 0.50 / 1M;
- cache read: USD 0.20 / 1M;
- output: USD 2.50 / 1M.

Esses valores medem valor equivalente de consumo. Eles **não comprovam cobrança adicional** na assinatura.

`composer-2.5-fast` possui tarifa própria e não herda a tarifa do Composer 2.5 normal.

## Caso de regressão real

Três runs observados antes da correção:

- input: 111,664;
- cache read: 1,117,177;
- output: 14,265;
- total incluindo cache: 1,243,106;
- participação de assinatura correta: 100%;
- custo equivalente aproximado: USD 0.31493.

## Histórico e backfill aplicado em 2026-10-06

A correção não altera automaticamente linhas antigas. Na instalação da Journey Studios, havia exatamente três eventos Cursor anteriores ao patch. Como os logs preservados continham os valores reais, foi feito um backfill controlado após backup:

- provider: `unknown` → `cursor`;
- cache read total: `0` → `1,117,177`;
- `heartbeat_runs.usage_json.cachedInputTokens` e `rawCachedInputTokens` foram reconstruídos por run;
- `agent_runtime_state.total_cached_input_tokens` foi reconciliado com o ledger.

Foram preservados `cost_cents = 0` e `costStatus = unpriced`, pois a assinatura do Cursor não informou custo faturado nesses runs.

Nenhuma tarefa histórica foi reexecutada. Em outra instalação, só fazer backfill quando houver evidência verificável por run; nunca inferir cache ausente a partir do total.

## Smoke pós-deploy

O run `43f22b08-3101-4717-8444-aaeb488f93b2` (JOU-12) foi criado depois do deploy e persistiu automaticamente:

- provider: `cursor`;
- input: `26,574`;
- cache read: `93,120`;
- output: `1,014`;
- billing: `subscription_included`;
- cost status: `unpriced`.

Isso valida o parser novo sem intervenção no banco.


### Smoke da imagem reproduzível

Após reconstruir a imagem pela receita multi-stage e redeployar, o run `8496b6c0-279e-4cdb-bf96-aac79267b30f` (JOU-14) confirmou novamente a captura automática:

- provider: `cursor`;
- input: `26,474`;
- cache read: `92,923`;
- output: `882`;
- billing: `subscription_included`;
- cost status: `unpriced`.

Assim, a correção não depende do primeiro build manual nem do backfill histórico.

# Company Field Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Exibir cada erro de validação retornado pela API junto ao campo correspondente no cadastro de empresa.

**Architecture:** O contrato `ApiError` passa a representar o mapa `campos` já enviado pelo backend. `CompanyList` mantém esse mapa em um signal, o template deriva estado, mensagem e acessibilidade de cada controle, e um pequeno conjunto de estilos globais apresenta o destaque visual sem alterar as regras do backend.

**Tech Stack:** Angular 22, TypeScript 6, template-driven forms, Vitest/jsdom.

**Spec:** `docs/superpowers/specs/2026-10-29-company-field-validation-design.md`

## Global Constraints

- Não alterar as regras de validação do backend.
- Preservar o tratamento atual de erros sem detalhes em `campos`.
- Não sobrescrever as alterações não relacionadas já existentes no worktree, especialmente em `src/styles.scss`.
- Limpar erros ao editar o campo, cancelar, abrir novamente ou concluir o cadastro.

## Review Focus

- Resposta com apenas um campo inválido deve destacar e focar somente esse controle.
- Resposta com vários campos deve manter todas as mensagens e focar o primeiro conforme a ordem visual do formulário.
- Chave desconhecida em `campos` não deve quebrar o template nem remover a mensagem geral.
- Resposta sem `campos` deve continuar exibindo `apiErrorMessage(response)`.
- Editar um campo deve remover apenas o erro daquele campo, preservando os demais.

---

### Task 1: Erros de validação inline no cadastro de empresa

**Files:**
- Create: `src/app/features/companies/pages/company-list/company-list.spec.ts`
- Modify: `src/app/core/models/api.models.ts`
- Modify: `src/app/features/companies/pages/company-list/company-list.ts`
- Modify: `src/app/features/companies/pages/company-list/company-list.html`
- Modify: `src/styles.scss`

**Interfaces:**
- Consumes: resposta HTTP `{ mensagem?: string; message?: string; campos?: Record<string, string> }`.
- Produces: `fieldErrors: Signal<Record<string, string>>`, `fieldError(field: CompanyField): string | undefined` e `clearFieldError(field: CompanyField): void` no componente.

- [ ] **Step 1: Escrever testes falhando do componente**

Criar testes que simulem `criarEmpresa()` retornando `HttpErrorResponse` com `campos`, enviem o formulário e verifiquem: resumo “Corrija os campos destacados.”, mensagem abaixo do CNPJ, `aria-invalid="true"`, foco no primeiro inválido, limpeza exclusiva do erro após `input`, tratamento de múltiplos campos/chave desconhecida e fallback sem `campos`.

- [ ] **Step 2: Executar o teste e confirmar a falha esperada**

Run: `npm test -- --watch=false --include src/app/features/companies/pages/company-list/company-list.spec.ts`

Expected: FAIL porque o componente ainda não lê nem renderiza `campos`.

- [ ] **Step 3: Ampliar o contrato de erro**

Adicionar `campos?: Record<string, string>` a `ApiError` em `src/app/core/models/api.models.ts`.

- [ ] **Step 4: Implementar estado e ciclo de vida dos erros no componente**

Adicionar o tipo dos cinco campos do formulário, armazenar somente chaves conhecidas recebidas da API, manter o fallback atual quando não houver campo conhecido, focar o primeiro controle inválido após a renderização e limpar o mapa nos eventos definidos pela especificação.

- [ ] **Step 5: Renderizar estado e mensagem junto aos controles**

No template, adicionar identificadores estáveis, `aria-invalid`, `aria-describedby`, mensagem inline condicional e `(ngModelChange)` para limpeza individual. Abrir e cancelar o formulário por métodos que também limpem os erros.

- [ ] **Step 6: Adicionar os estilos mínimos**

Acrescentar classes reutilizáveis para borda/anel de campo inválido e texto de erro em `src/styles.scss`, preservando integralmente as mudanças preexistentes do arquivo.

- [ ] **Step 7: Executar o teste focal e confirmar aprovação**

Run: `npm test -- --watch=false --include src/app/features/companies/pages/company-list/company-list.spec.ts`

Expected: PASS sem erros nem avisos novos.

- [ ] **Step 8: Executar verificação completa**

Run: `npm test -- --watch=false`

Expected: toda a suíte PASS.

Run: `npm run build`

Expected: build Angular concluído sem erros.

- [ ] **Step 9: Revisar o diff restrito à entrega**

Confirmar que somente o novo teste, o contrato de erro, o componente/template e os trechos de estilo da validação pertencem à implementação; manter intactas todas as demais mudanças do usuário.

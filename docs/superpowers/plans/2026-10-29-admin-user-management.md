# Admin User Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que o Administrador FlowOps liste e cadastre usuários com perfil global, papel empresarial e acessos a projetos.

**Architecture:** O backend oferece contratos administrativos próprios em `/api/usuarios`, deriva perfil/papel a partir de um tipo de acesso e persiste usuário, vínculo e membros de projeto na mesma transação. O frontend adiciona uma rota protegida, menu condicional e página standalone com formulário e tabela.

**Tech Stack:** Java 21, Spring Boot 3.5, JPA, JUnit/Mockito; Angular 22, TypeScript, template-driven forms e Vitest.

**Spec:** `docs/superpowers/specs/2026-10-29-admin-user-management-design.md`

## Global Constraints

- Preservar todas as alterações preexistentes nos dois repositórios.
- Não alterar o cadastro público existente.
- Não armazenar ou retornar senha em texto puro.
- Manter perfil global e papel empresarial como conceitos distintos no domínio.

## Review Focus

- Um não administrador não pode usar os endpoints administrativos.
- CPF/e-mail duplicados não deixam dados parciais.
- Projetos de outra empresa são rejeitados.
- Cadastro de Administrador FlowOps não cria vínculo empresarial.
- Coordenador sem projeto ainda é criado com vínculo válido, mas não acessa projetos até receber associação.

---

### Task 1: Contratos administrativos no backend

**Files:**
- Create: DTOs administrativos de request/response e enum de tipo de acesso.
- Modify: `src/main/java/br/com/flowopsbackend/controller/UsuarioController.java`
- Modify: `src/main/java/br/com/flowopsbackend/service/UsuarioService.java`
- Test: `src/test/java/br/com/flowopsbackend/service/UsuarioServiceTest.java`

- [ ] Escrever testes falhando para criação de Coordenador, Administrador, duplicidade e projeto de outra empresa.
- [ ] Executar o teste focal e confirmar RED.
- [ ] Implementar DTOs, listagem enriquecida e criação transacional mínima.
- [ ] Executar teste focal e suíte completa do backend.

### Task 2: Tela administrativa no frontend

**Files:**
- Create: `src/app/features/users/pages/user-list/user-list.ts`
- Create: `src/app/features/users/pages/user-list/user-list.html`
- Create: `src/app/features/users/pages/user-list/user-list.spec.ts`
- Modify: modelos, serviço HTTP, rotas, navegação, shell e ícones existentes.
- Modify: `src/styles.scss` apenas com classes novas da tela.

- [ ] Escrever teste falhando para renderização exclusiva de admin e payload de Coordenador com empresa/projetos.
- [ ] Executar teste focal e confirmar RED.
- [ ] Implementar modelos, API, guarda, rota, menu, ícone e página.
- [ ] Executar teste focal, suíte Angular, build e Prettier.
- [ ] Revisar os diffs de ambos os repositórios sem incorporar mudanças não relacionadas.

<div align="center">

# FlowOps Web

Interface operacional para projetos, tarefas e auditorias.

![Angular](https://img.shields.io/badge/Angular-22-DD0031?style=flat-square&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white)

</div>

## Recursos

- Login e cadastro de usuários.
- Rotas protegidas por autenticação.
- Dashboard com indicadores reais.
- Solicitação de acesso a empresas.
- Criação e acompanhamento de projetos.
- Quadro de tarefas por etapa do fluxo.
- Envio, aprovação e correção de tarefas.
- Interface responsiva.

## Desenvolvimento

Requer Node.js 24.15 ou superior.

```powershell
npm install
npm start
```

A aplicação abre em `http://localhost:4200` e encaminha chamadas `/api` para `http://localhost:8080`.

## Validação

```powershell
npm run build
npm test -- --watch=false
```

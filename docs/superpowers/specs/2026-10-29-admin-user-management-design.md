# Gestão administrativa de usuários

## Intenção

Dar ao Administrador FlowOps uma tela central para consultar e cadastrar usuários já com o acesso necessário, sem depender do cadastro público e da solicitação posterior de vínculo.

## Fluxo escolhido

- Adicionar o item **Usuários** apenas para `ADMIN_FLOWOPS`.
- Exibir usuários ativos, perfil global e vínculos empresariais.
- Em **Novo usuário**, coletar nome, CPF, e-mail, nascimento e senha inicial definida pelo administrador.
- Apresentar um único campo amigável **Tipo de acesso** com: Administrador FlowOps, Gestor, Coordenador e Funcionário.
- Administrador FlowOps cria apenas perfil global; os demais exigem empresa e cargo e criam vínculo aprovado e ativo.
- Coordenador e Funcionário podem receber um ou mais projetos no mesmo cadastro; Gestor já possui acesso de gestão pela empresa.
- O backend traduz o tipo escolhido para `PerfilSistema` e `PapelEmpresa`, valida empresa/projetos e executa toda a criação em uma transação.

## Segurança e validação

- Somente `ADMIN_FLOWOPS` pode listar e cadastrar pela área administrativa.
- CPF e e-mail permanecem únicos.
- Projetos informados devem pertencer à empresa escolhida.
- A senha é armazenada apenas como BCrypt.
- O cadastro criado fica ativo imediatamente.

## Fora de escopo

- Envio de convite por e-mail, senha temporária ou troca obrigatória no primeiro login.
- Edição, desativação ou exclusão de usuários.
- Alteração de vínculos existentes.

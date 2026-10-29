# Exibição de erros por campo no cadastro de empresa

## Intenção

Permitir que o administrador identifique e corrija diretamente cada dado rejeitado pela API no formulário de nova empresa.

## Comportamento

- Manter um aviso geral no topo, substituindo a mensagem genérica por uma orientação para corrigir os campos destacados quando a API retornar erros de validação.
- Associar as chaves retornadas em `campos` pela API aos controles correspondentes do formulário.
- Exibir borda de erro e mensagem logo abaixo de cada campo inválido, com `aria-invalid` e associação acessível entre controle e mensagem.
- Levar o foco ao primeiro campo inválido após a resposta da API.
- Remover o erro individual assim que o usuário editar o respectivo campo.
- Limpar todos os erros ao abrir, cancelar ou concluir o cadastro.
- Preservar o tratamento atual para erros que não tenham detalhes por campo.

## Abordagens consideradas

- **Mensagens inline e resumo no topo (escolhida):** oferece a correção mais direta e mantém contexto global.
- **Lista de erros somente no aviso superior:** exige que o usuário localize manualmente os campos e tem pior usabilidade em formulários maiores.

## Escopo técnico

- Ampliar o modelo de erro da API para representar `campos`.
- Adaptar o componente e o template de empresas para armazenar, apresentar e limpar erros por campo.
- Adicionar estilos globais reutilizáveis para estado e mensagem de campo inválido.
- Cobrir o comportamento com teste do componente, incluindo resposta da API, renderização e limpeza após edição.

## Fora de escopo

- Alterar as regras de validação do backend.
- Traduzir ou reescrever mensagens de validação retornadas pela API.
- Aplicar o padrão aos demais formulários nesta entrega.

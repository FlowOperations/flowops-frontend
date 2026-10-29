export type PerfilSistema = 'ADMIN_FLOWOPS' | 'USUARIO';
export type PapelEmpresa = 'GESTOR' | 'COORDENADOR' | 'FUNCIONARIO';
export type TipoAcessoUsuario = 'ADMIN_FLOWOPS' | PapelEmpresa;
export type StatusProjeto = 'PLANEJAMENTO' | 'EM_ANDAMENTO' | 'PAUSADO' | 'CONCLUIDO' | 'CANCELADO';
export type PrioridadeTarefa = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
export type StatusTarefa =
  'PENDENTE' | 'EM_ANDAMENTO' | 'AGUARDANDO_AUDITORIA' | 'EM_CORRECAO' | 'APROVADA';

export interface Usuario {
  id: number;
  nomeCompleto: string;
  cpf: string;
  email: string;
  dataNascimento: string;
  perfilSistema: PerfilSistema;
  ativo: boolean;
}

export interface AuthResponse {
  token: string;
  tipo: string;
  expiraEmSegundos: number;
  usuario: Usuario;
}

export interface CadastroUsuario {
  nomeCompleto: string;
  cpf: string;
  email: string;
  senha: string;
  dataNascimento: string;
}

export interface AcessoUsuario {
  empresaId: number;
  empresaNome: string;
  papel: PapelEmpresa;
  cargo: string;
}

export interface UsuarioAdministracao extends Usuario {
  acessos: AcessoUsuario[];
}

export interface CadastroUsuarioAdmin extends CadastroUsuario {
  tipoAcesso: TipoAcessoUsuario;
  empresaId: number | null;
  cargo: string | null;
  projetoIds: number[];
}

export interface Empresa {
  id: number;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  flgAtivo: boolean;
}

export interface VinculoEmpresa {
  id: number;
  usuarioId: number;
  usuarioNome: string;
  usuarioEmail: string;
  empresaId: number;
  empresaNome: string;
  cargo: string | null;
  papel: PapelEmpresa | null;
  status: 'SOLICITADO' | 'APROVADO' | 'REJEITADO';
  solicitadoEm: string;
  analisadoEm: string | null;
  ativo: boolean;
}

export interface Projeto {
  id: number;
  empresaId: number;
  empresaNome: string;
  gestorResponsavelId: number;
  gestorResponsavelNome: string;
  nome: string;
  descricao: string;
  dataInicioPrevista: string;
  dataFimPrevista: string;
  status: StatusProjeto;
  progresso: number;
}

export interface Tarefa {
  id: number;
  projetoId: number;
  responsavelId: number | null;
  responsavelNome: string | null;
  titulo: string;
  descricao: string;
  prioridade: PrioridadeTarefa;
  prazo: string;
  status: StatusTarefa;
}

export interface Auditoria {
  id: number;
  tarefaId: number;
  tarefaTitulo: string;
  auditorId: number;
  auditorNome: string;
  resultado: 'APROVADA' | 'CORRECAO_SOLICITADA';
  motivoCorrecao: string | null;
  auditadaEm: string;
}

export interface ApiError {
  mensagem?: string;
  message?: string;
  campos?: Record<string, string>;
}

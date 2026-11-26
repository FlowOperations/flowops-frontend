import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  Auditoria,
  CadastroUsuarioAdmin,
  Empresa,
  PrioridadeTarefa,
  Projeto,
  StatusProjeto,
  Tarefa,
  Usuario,
  UsuarioAdministracao,
  VinculoEmpresa,
  ContextoEmpresa,
  PapelEmpresa,
  ProjetoMembro,
} from '@core/models/api.models';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class FlowOpsApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  listarContextosEmpresa(): Observable<ContextoEmpresa[]> {
    return this.auth.user()?.perfilSistema === 'ADMIN_FLOWOPS'
      ? this.listarEmpresas().pipe(
          map((companies) =>
            companies.map((company) => ({
              empresaId: company.id,
              empresaNome: company.nomeFantasia,
            })),
          ),
        )
      : this.listarMeusVinculos();
  }

  listarMinhasSolicitacoes(): Observable<VinculoEmpresa[]> {
    return this.http.get<VinculoEmpresa[]>('/api/vinculos/solicitacoes/minhas');
  }

  listarSolicitacoesPendentes(empresaId: number): Observable<VinculoEmpresa[]> {
    return this.http.get<VinculoEmpresa[]>(`/api/vinculos/empresas/${empresaId}/pendentes`);
  }

  analisarSolicitacao(
    id: number,
    aprovado: boolean,
    cargo: string,
    papel: PapelEmpresa,
  ): Observable<VinculoEmpresa> {
    return this.http.patch<VinculoEmpresa>(`/api/vinculos/${id}/analise`, {
      aprovado,
      cargo,
      papel,
    });
  }

  listarColaboradores(empresaId: number): Observable<VinculoEmpresa[]> {
    return this.http.get<VinculoEmpresa[]>(`/api/vinculos/empresas/${empresaId}/colaboradores`);
  }

  listarMembrosProjeto(projetoId: number): Observable<ProjetoMembro[]> {
    return this.http.get<ProjetoMembro[]>(`/api/projetos/${projetoId}/membros`);
  }

  listarEmpresas(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>('/api/empresas');
  }

  criarEmpresa(payload: {
    razaoSocial: string;
    nomeFantasia: string;
    cnpj: string;
    flgAtivo: boolean;
    gestorInicialId: number;
    cargoGestor: string;
  }): Observable<Empresa> {
    return this.http.post<Empresa>('/api/empresas', payload);
  }

  listarUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>('/api/usuarios');
  }

  listarUsuariosAdministracao(): Observable<UsuarioAdministracao[]> {
    return this.http.get<UsuarioAdministracao[]>('/api/usuarios/administracao');
  }

  criarUsuarioAdministrativamente(payload: CadastroUsuarioAdmin): Observable<UsuarioAdministracao> {
    return this.http.post<UsuarioAdministracao>('/api/usuarios/administracao', payload);
  }

  solicitarVinculo(empresaId: number): Observable<VinculoEmpresa> {
    return this.http.post<VinculoEmpresa>('/api/vinculos/solicitacoes', { empresaId });
  }

  listarMeusVinculos(): Observable<VinculoEmpresa[]> {
    return this.http.get<VinculoEmpresa[]>('/api/vinculos/meus');
  }

  listarProjetos(empresaId: number): Observable<Projeto[]> {
    return this.http.get<Projeto[]>('/api/projetos', {
      params: new HttpParams().set('empresaId', empresaId),
    });
  }

  criarProjeto(payload: {
    empresaId: number;
    gestorResponsavelId: number;
    nome: string;
    descricao: string;
    dataInicioPrevista: string;
    dataFimPrevista: string;
  }): Observable<Projeto> {
    return this.http.post<Projeto>('/api/projetos', payload);
  }

  alterarStatusProjeto(id: number, status: StatusProjeto): Observable<Projeto> {
    return this.http.patch<Projeto>(`/api/projetos/${id}/status`, { status });
  }

  listarTarefas(projetoId: number): Observable<Tarefa[]> {
    return this.http.get<Tarefa[]>('/api/tarefas', {
      params: new HttpParams().set('projetoId', projetoId),
    });
  }

  criarTarefa(payload: {
    projetoId: number;
    titulo: string;
    descricao: string;
    prioridade: PrioridadeTarefa;
    prazo: string;
    responsavelId: number | null;
  }): Observable<Tarefa> {
    return this.http.post<Tarefa>('/api/tarefas', payload);
  }

  iniciarTarefa(id: number): Observable<Tarefa> {
    return this.http.patch<Tarefa>(`/api/tarefas/${id}/iniciar`, {});
  }

  enviarParaAuditoria(id: number): Observable<Tarefa> {
    return this.http.patch<Tarefa>(`/api/tarefas/${id}/enviar-auditoria`, {});
  }

  listarAuditoriasPendentes(): Observable<Tarefa[]> {
    return this.http.get<Tarefa[]>('/api/auditorias/pendentes');
  }

  aprovarTarefa(id: number): Observable<Auditoria> {
    return this.http.post<Auditoria>(`/api/auditorias/tarefas/${id}/aprovar`, {});
  }

  solicitarCorrecao(id: number, motivo: string): Observable<Auditoria> {
    return this.http.post<Auditoria>(`/api/auditorias/tarefas/${id}/correcao`, { motivo });
  }
}

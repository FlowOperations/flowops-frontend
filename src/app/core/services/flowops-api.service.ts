import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  Auditoria,
  Empresa,
  PrioridadeTarefa,
  Projeto,
  StatusProjeto,
  Tarefa,
  VinculoEmpresa,
} from '@core/models/api.models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FlowOpsApiService {
  private readonly http = inject(HttpClient);

  listarEmpresas(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>('/api/empresas');
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

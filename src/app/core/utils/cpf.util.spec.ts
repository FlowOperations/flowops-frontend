import { isValidCpf } from './cpf.util';

describe('CPF', () => {
  it('aceita dígitos verificadores válidos com e sem máscara', () => {
    expect(isValidCpf('52998224725')).toBe(true);
    expect(isValidCpf('529.982.247-25')).toBe(true);
  });
  it('recusa repetição, tamanho incorreto e dígitos verificadores incorretos', () => {
    for (const cpf of ['', '123', '00000000000', '11111111111', '52998224724']) {
      expect(isValidCpf(cpf)).toBe(false);
    }
  });
});

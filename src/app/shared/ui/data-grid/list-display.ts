export function initials(name: string): string {
  const words = name.trim().split(/\s+/);
  return (
    words.length > 1 ? words[0][0] + words[words.length - 1][0] : words[0].slice(0, 2)
  ).toLocaleUpperCase('pt-BR');
}

export const priorityLabels = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
  URGENTE: 'Urgente',
} as const;

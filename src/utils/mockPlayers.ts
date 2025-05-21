import { Player } from '../types';

const nomes = [
  // Nomes de jogadores reais famosos (exemplos)
  'Pelé', 'Zico', 'Romário', 'Ronaldo', 'Ronaldinho', 'Neymar', 'Kaká', 'Rivaldo', 'Sócrates', 'Garrincha',
  'Tostão', 'Careca', 'Bebeto', 'Adriano', 'Roberto Carlos', 'Cafu', 'Dida', 'Júlio César', 'Edmundo', 'Jardel',
  'Fred', 'Gerson', 'Jairzinho', 'Falcão', 'Djalminha', 'Alex', 'Ricardinho', 'Juninho', 'Leonardo', 'Aldair',
  'Lúcio', 'Juan', 'Thiago Silva', 'David Luiz', 'Daniel Alves', 'Maicon', 'Miranda', 'Felipe Melo', 'Paulinho', 'Casemiro',
  'Willian', 'Oscar', 'Lucas Moura', 'Gabriel Jesus', 'Richarlison', 'Vinícius Júnior', 'Rodrygo', 'Raphinha', 'Bruno Guimarães', 'Éverton Ribeiro',
  'Taffarel', 'Marcos', 'Ceni', 'Zé Roberto', 'Emerson', 'Elano', 'Diego', 'Anderson', 'Renato Augusto', 'Douglas Costa',
  'Hulk', 'Gabigol', 'Pedro', 'Everton Cebolinha', 'Danilo', 'Alex Sandro', 'Renan Lodi', 'Fagner', 'Weverton', 'Ederson',
  'Alisson', 'Fabinho', 'Arthur', 'Lucas Paquetá', 'Philippe Coutinho', 'Malcom', 'Douglas Luiz', 'Matheus Cunha', 'Antony', 'Bremer'
];

const sobrenomes = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira',
  'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares',
  'Fernandes', 'Vieira', 'Barbosa', 'Rocha', 'Dias', 'Nascimento', 'Andrade', 'Moreira',
  'Nunes', 'Marques', 'Machado', 'Mendes', 'Freitas', 'Cardoso', 'Ramos', 'Gonçalves',
  'Santana', 'Teixeira', 'Araújo', 'Pinto', 'Azevedo', 'Cunha', 'Reis', 'Correia',
  'Campos', 'Borges', 'Monteiro', 'Coelho', 'Cruz', 'Melo', 'Miranda', 'Pires', 'Simões',
  'Batista', 'Cavalcanti', 'Barros', 'Nogueira', 'Duarte', 'Fonseca', 'Aguiar', 'Bezerra',
  'Castro', 'Guimarães', 'Tavares', 'Silveira', 'Brito', 'Carneiro', 'Peixoto', 'Neves'
];

const positions: ('defesa' | 'meio' | 'ataque')[] = ['defesa', 'meio', 'ataque'];
const ageGroups: ('15-20' | '21-30' | '31-40' | '41-50' | '+50')[] = ['15-20', '21-30', '31-40', '41-50', '+50'];
const skillLevels: (1 | 2 | 3 | 4 | 5)[] = [1, 2, 3, 4, 5];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateUniqueName(usedNames: Set<string>): { nome: string; sobrenome: string } {
  let nome, sobrenome, fullName;
  do {
    nome = nomes[Math.floor(Math.random() * nomes.length)];
    sobrenome = sobrenomes[Math.floor(Math.random() * sobrenomes.length)];
    fullName = `${nome} ${sobrenome}`;
  } while (usedNames.has(fullName));
  
  usedNames.add(fullName);
  return { nome, sobrenome };
}

export function generateRandomPlayers(count: number): Player[] {
  if (count > nomes.length * sobrenomes.length) {
    throw new Error('Número de jogadores solicitado excede o número de combinações possíveis de nomes');
  }

  const usedNames = new Set<string>();

  return Array.from({ length: count }, (_, i) => {
    const { nome, sobrenome } = generateUniqueName(usedNames);
    const position = positions[Math.floor(Math.random() * positions.length)];
    const skillLevel = Math.floor(Math.random() * 5) + 1 as 1 | 2 | 3 | 4 | 5;
    const ageGroup = ageGroups[Math.floor(Math.random() * ageGroups.length)] as '15-20' | '21-30' | '31-40' | '41-50' | '+50';
    const paymentType = Math.random() > 0.5 ? 'mensalista' : 'diarista';

    return {
      id: Math.random().toString(36).substr(2, 9),
      name: `${nome} ${sobrenome}`,
      email: `jogador${i + 1}@email.com`,
      confirmed: true,
      arrivalTime: new Date(),
      position,
      skillLevel,
      ageGroup,
      arrivalOrder: i + 1,
      paymentType,
    };
  });
} 
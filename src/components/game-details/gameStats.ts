import { Game, Match, Team, getGoalTeamId } from '../../types';

export interface MatchOutcome {
  draw: boolean;
  winner?: Team; // vencedor pelo PLACAR (não confundir com match.winner = time que continua)
  scoreA: number; // time 0 (Azul)
  scoreB: number; // time 1 (Laranja)
}

// Resultado de uma partida SEMPRE pelo placar. Empate quando os gols são iguais.
// match.winner representa apenas quem continua em campo e NÃO decide vitória.
// Fonte única usada por placar exibido e por estatísticas, para não divergirem.
export function matchOutcome(match: Match): MatchOutcome {
  const teams = match.teams;
  const teamA = teams[0];
  const teamB = teams[1];

  const teamGoals: Record<string, number> = {};
  teams.forEach(t => { teamGoals[t.id] = 0; });
  (match.goals ?? []).forEach(g => {
    const tid = getGoalTeamId(g, teams);
    if (tid && tid in teamGoals) teamGoals[tid] += 1;
  });

  // Só cai para team.score quando não há nenhum gol registrado.
  const totalRecorded = Object.values(teamGoals).reduce((a, b) => a + b, 0);
  if (totalRecorded === 0) teams.forEach(t => { teamGoals[t.id] = t.score ?? 0; });

  const scoreA = teamGoals[teamA?.id] ?? 0;
  const scoreB = teamGoals[teamB?.id] ?? 0;

  if (scoreA === scoreB) return { draw: true, scoreA, scoreB };
  return { draw: false, winner: scoreA > scoreB ? teamA : teamB, scoreA, scoreB };
}

export interface PlayerStat {
  id: string;
  name: string;
  position: string;
  arrivalOrder: number;
  goals: number;
  assists: number;
  victories: number;
  draws: number;
  losses: number;
  matches: number;
  winRate: number;
}

// Estatísticas por jogador a partir das partidas finalizadas.
// Vitória/empate/derrota são decididas pelo PLACAR (gol contra não credita autor).
export function computePlayerStats(game: Game): PlayerStat[] {
  const stats: Record<string, PlayerStat> = {};

  game.players.forEach(p => {
    stats[p.id] = {
      id: p.id,
      name: p.name,
      position: p.position,
      arrivalOrder: p.arrivalOrder,
      goals: 0,
      assists: 0,
      victories: 0,
      draws: 0,
      losses: 0,
      matches: 0,
      winRate: 0,
    };
  });

  game.matches.forEach(match => {
    if (match.status !== 'finished') return;

    (match.goals ?? []).forEach(goal => {
      if (goal.scorerId && stats[goal.scorerId] && !goal.ownGoal) stats[goal.scorerId].goals += 1;
      if (goal.assisterId && stats[goal.assisterId]) stats[goal.assisterId].assists += 1;
    });

    const { draw, winner } = matchOutcome(match);

    match.teams.forEach(team => {
      team.players.forEach(player => {
        const s = stats[player.id];
        if (!s) return;
        s.matches += 1;
        if (draw) s.draws += 1;
        else if (winner?.id === team.id) s.victories += 1;
        else s.losses += 1;
      });
    });
  });

  // Aproveitamento = vitórias / partidas (empate NÃO conta como vitória).
  Object.values(stats).forEach(p => {
    p.winRate = p.matches > 0 ? Math.round((p.victories / p.matches) * 100) : 0;
  });

  return Object.values(stats).sort(
    (a, b) => b.goals - a.goals || b.assists - a.assists || b.victories - a.victories
  );
}

export interface MatchScore {
  index: number;
  blue: number;
  orange: number;
  live: boolean;
}

// Placar por partida (time 0 = Azul, time 1 = Laranja), usado no gráfico "gols por partida".
export function computeMatchScores(game: Game): MatchScore[] {
  return (game.matches ?? []).map((match, index) => {
    const { scoreA, scoreB } = matchOutcome(match);
    return {
      index: index + 1,
      blue: scoreA,
      orange: scoreB,
      live: match.status === 'in_progress',
    };
  });
}

export interface GameTotals {
  finishedMatches: number;
  totalMatches: number;
  liveMatches: number;
  totalGoals: number;
  goalsPerMatch: number;
  blueWins: number;
  orangeWins: number;
  draws: number;
  blueGoals: number;
  orangeGoals: number;
}

export function computeGameTotals(game: Game): GameTotals {
  const finished = game.matches.filter(m => m.status === 'finished');
  const live = game.matches.filter(m => m.status === 'in_progress');
  const scores = computeMatchScores(game);

  let totalGoals = 0;
  let blueWins = 0;
  let orangeWins = 0;
  let draws = 0;
  let blueGoals = 0;
  let orangeGoals = 0;

  scores.forEach((s, i) => {
    const match = game.matches[i];
    // Gols/média consideram todas as partidas (inclui a que está ao vivo), como no mock.
    blueGoals += s.blue;
    orangeGoals += s.orange;
    totalGoals += s.blue + s.orange;
    // Vitória/empate só contam em partidas finalizadas e sempre pelo placar.
    if (match.status === 'finished') {
      if (s.blue === s.orange) draws += 1;
      else if (s.blue > s.orange) blueWins += 1;
      else orangeWins += 1;
    }
  });

  const matchCount = game.matches.length;
  return {
    finishedMatches: finished.length,
    totalMatches: matchCount,
    liveMatches: live.length,
    totalGoals,
    goalsPerMatch: matchCount > 0 ? Math.round((totalGoals / matchCount) * 10) / 10 : 0,
    blueWins,
    orangeWins,
    draws,
    blueGoals,
    orangeGoals,
  };
}

export const POSITION_LABEL: Record<string, string> = { defesa: 'DEF', meio: 'MEI', ataque: 'ATA' };
export const POSITION_HEX: Record<string, string> = { defesa: '#d99a1a', meio: '#0d7a72', ataque: '#c2560f' };

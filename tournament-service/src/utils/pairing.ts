export interface IPairing {
  whitePlayerId: string;
  blackPlayerId: string;
  roundNumber: number;
}

export const swissPairing = (participants: Array<{ userId: string; score: number }>, roundNumber: number): IPairing[] => {
  const sorted = [...participants].sort((a, b) => b.score - a.score);
  const pairings: IPairing[] = [];
  const used = new Set<string>();

  for (let i = 0; i < sorted.length; i++) {
    if (used.has(sorted[i].userId)) continue;

    let paired = false;
    for (let j = i + 1; j < sorted.length; j++) {
      if (used.has(sorted[j].userId)) continue;

      pairings.push({
        whitePlayerId: sorted[i].userId,
        blackPlayerId: sorted[j].userId,
        roundNumber,
      });
      used.add(sorted[i].userId);
      used.add(sorted[j].userId);
      paired = true;
      break;
    }

    if (!paired && i === sorted.length - 1) {
      pairings.push({
        whitePlayerId: sorted[i].userId,
        blackPlayerId: sorted[i].userId,
        roundNumber,
      });
    }
  }

  return pairings;
};

export const roundRobinPairing = (
  participants: Array<{ userId: string }>,
  roundNumber: number
): IPairing[] => {
  const pairings: IPairing[] = [];
  const n = participants.length;

  if (n % 2 === 1) {
    participants.push({ userId: 'BYE' });
  }

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n / 2; j++) {
      const white = participants[j];
      const black = participants[n - 1 - j];

      if (white.userId !== 'BYE' && black.userId !== 'BYE') {
        pairings.push({
          whitePlayerId: white.userId,
          blackPlayerId: black.userId,
          roundNumber,
        });
      }
    }

    const last = participants.pop();
    if (last) {
      participants.splice(1, 0, last);
    }
  }

  return pairings;
};

export const eliminationPairing = (
  participants: Array<{ userId: string; score: number }>,
  roundNumber: number
): IPairing[] => {
  const sorted = [...participants].sort((a, b) => b.score - a.score);
  const pairings: IPairing[] = [];

  for (let i = 0; i < sorted.length; i += 2) {
    if (i + 1 < sorted.length) {
      pairings.push({
        whitePlayerId: sorted[i].userId,
        blackPlayerId: sorted[i + 1].userId,
        roundNumber,
      });
    }
  }

  return pairings;
};


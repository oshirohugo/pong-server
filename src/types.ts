export type Input = {
  playerId: number;
  pressTime: number;
  sequenceNumber: number;
};

export type GameState = {
  players: {
    id: number;
    pos: {
      x: string;
      y: string;
    };
    points: number;
  };
  ball: {
    x: string;
    y: string;
  };
  speed: number;
  lastPlayerId: number;
};

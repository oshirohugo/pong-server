import WebSocket from 'ws';

import Player from './player';
import Ball from './ball';
import Pos from './pos';
import { MAP_WIDTH, MAP_HEIGHT } from './server';

class Game {
  public playersConnections: Map<WebSocket, Player>;
  public players: (Player | undefined)[] = [];
  public ball: Ball;
  public speed: number;
  public nextId = 0;
  public lastPlayerId = 0;
  public serverUpdateRate: number;

  constructor(speed: number, updateRate: number) {
    this.playersConnections = new Map<WebSocket, Player>();
    this.ball = new Ball(new Pos(MAP_WIDTH / 2, MAP_HEIGHT / 2 + 20));
    this.speed = speed;
    this.serverUpdateRate = updateRate;
  }

  public createNewPlayer(): Player {
    const x = this.nextId ? MAP_WIDTH - 20 : 10;
    const player = new Player(this.nextId++, new Pos(x, 10)); // TODO return correct position
    this.lastPlayerId = player.id;
    this.players.splice(player.id, 0, player);
    return player;
  }

  public generateNewBall(): void {
    const lastPlayerPos = this.players[this.lastPlayerId]?.pos;
    const pos: Pos = new Pos(lastPlayerPos?.x, lastPlayerPos?.y); // TODO take half

    this.ball = new Ball(pos);
  }

  public clearDirection(): void {
    for (const player of this.players) {
      if (player) {
        player.clearDirection();
      }
    }
  }

  public toJSON(): any {
    return {
      players: this.players.filter((player) => player !== undefined),
      ball: this.ball,
      speed: this.speed,
      lastPlayerId: this.lastPlayerId,
      serverUpdateRate: this.serverUpdateRate,
    };
  }
}

export default Game;

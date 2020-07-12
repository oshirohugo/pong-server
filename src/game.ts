import WebSocket from 'ws';

import Player from './player';
import Ball from './ball';
import Pos from './pos';
import Message from './message';
import { Input, CollideDirection } from './types';

type GameParams = {
  updateRate: number;
  mapWidth: number;
  mapHeight: number;
  playerWidth: number;
  playerHeight: number;
  playerSpeed: number;
  ballSpeedX: number;
  ballSpeedY: number;
  ballAcceleration: number;
  ballSz: number;
};

class Game {
  public playersConnections: Map<WebSocket, Player>;
  public players: (Player | undefined)[] = [];
  public ball: Ball;
  public nextId = 0;
  public lastPlayerId = 0;

  public playerHeight: number;
  public playerWidth: number;
  public playerSpeed: number;

  public tickRate: number;
  public loopPeriod: number;
  public mapWidth: number;
  public mapHeight: number;

  private msgQueue: Message[] = [];
  private onTick: (msg: string) => void;

  constructor({
    updateRate,
    mapHeight,
    mapWidth,
    playerHeight,
    playerWidth,
    playerSpeed,
    ballSpeedX,
    ballSpeedY,
    ballAcceleration,
    ballSz,
  }: GameParams) {
    this.mapHeight = mapHeight;
    this.mapWidth = mapWidth;
    this.playersConnections = new Map<WebSocket, Player>();

    this.ball = new Ball({
      speed: new Pos(ballSpeedX, ballSpeedY),
      acceleration: new Pos(ballAcceleration, ballAcceleration),
      pos: new Pos(mapWidth / 2, mapHeight / 2),
      size: ballSz,
    });

    this.playerHeight = playerHeight;
    this.playerWidth = playerWidth;
    this.playerSpeed = playerSpeed;

    this.tickRate = updateRate;
    this.loopPeriod = (1 / this.tickRate) * 1000;
    this.onTick = () => {};
  }

  /**
   * Create new Player
   */
  public createNewPlayer(): Player {
    // calculate correct player position according to its id
    const x = this.nextId ? this.mapWidth - 2 * this.playerWidth : this.playerWidth;

    const player = new Player({
      id: this.nextId++,
      pos: new Pos(x, this.mapHeight / 2 - this.playerHeight / 2),
      speed: this.playerSpeed,
      width: this.playerWidth,
      height: this.playerHeight,
    });
    this.lastPlayerId = player.id;
    this.players.splice(player.id, 0, player);
    return player;
  }

  /**
   * Clear players direction that is set when input is processed
   */
  public clearDirection() {
    for (const player of this.players) {
      if (player) {
        player.clearDirection();
      }
    }
  }

  /**
   * Method called when ws message arrives
   * @param rawMsg
   */
  public onMessage(rawMsg: string) {
    const msg = Message.parse(rawMsg);
    this.msgQueue.push(msg);
  }

  /**
   * Method called when connection closes
   * @param ws
   */
  public onClose(ws: WebSocket) {
    const player = this.playersConnections.get(ws);
    if (player) {
      this.players[player.id] = undefined;
      this.nextId = player?.id;
    }
    this.playersConnections.delete(ws);
    this.ball.setPos(new Pos(this.mapWidth / 2, this.mapHeight / 2));
  }

  /**
   *  Method called when client connects to server
   * @param ws
   */
  public onConnection(ws: WebSocket) {
    // Don't connect any more players if game is already full
    if (this.playersConnections.size === 2) {
      return;
    }

    const newPlayer = this.createNewPlayer();
    this.playersConnections.set(ws, newPlayer);

    const startMsg = new Message('START', this);

    ws.send(startMsg.stringify());
  }

  public setOnTick(onTick: (msg: string) => void) {
    this.onTick = onTick;
  }

  public start() {
    let lastUpdate = new Date().getTime();
    let elapsed;
    let currentUpdate;
    // Game loop
    setInterval(() => {
      let j = 0;
      // Process controller inputs
      while (j < this.msgQueue.length) {
        const msg = this.msgQueue[j];
        const { playerId, pressTime, sequenceNumber } = msg.body as Input;
        const currentPlayer = this.players[playerId];
        if (currentPlayer) {
          currentPlayer.applyInput(pressTime, this.mapHeight);
          currentPlayer.lastProcessedInput = sequenceNumber;
        }
        this.msgQueue.splice(j, 1);
        j++;
      }

      currentUpdate = new Date().getTime();
      elapsed = (currentUpdate - lastUpdate) / 1000;
      lastUpdate = currentUpdate;

      // Only move the ball if there is match
      if (this.playersConnections.size >= 2) {
        this.updateBallPosition(elapsed);
      }

      // only clear player directions after all collision detections in
      // updateBallPosition
      this.clearDirection();

      const gameStateMsg = new Message('GAME_STATE', this);
      this.onTick(gameStateMsg.stringify());
    }, this.loopPeriod);
  }

  /**
   * update ball position and make all the checks
   */
  public updateBallPosition(dt: number) {
    let newX = this.ball.pos.x + this.ball.speed.x * dt;
    const newY = this.ball.pos.y + this.ball.speed.y * dt;

    const marginSize = 10;
    let collide: CollideDirection = null;
    const passLeft = newX <= 0 + this.ball.size + marginSize;
    const passRight = newX + this.ball.size >= this.mapWidth - marginSize - this.ball.size;

    // Check if the ball hit one of the horizontal edges
    if (passLeft || passRight) {
      const affectedPlayer = passLeft ? this.players[0] : this.players[1];
      if (affectedPlayer) {
        collide = affectedPlayer.collide(this.ball, newY);
      }

      // check if there is a collision with a player
      if (collide) {
        this.ball.speed.x *= -1;
        if (collide === 'UP') {
          this.ball.speed.y = this.ball.speed.y * (this.ball.speed.y < 0 ? 2.0 : 0.5);
        }
        if (collide === 'DOWN') {
          this.ball.speed.y = this.ball.speed.y * (this.ball.speed.y > 0 ? 2.0 : 0.5);
        }
      } else {
        // if there was no collision somebody won a point
        if (newX <= 0) {
          const winnerPlayer = this.players[1];
          if (winnerPlayer) {
            winnerPlayer.points++;
          }
          newX = this.mapWidth / 2;
        }
        if (newX + this.ball.size > this.mapWidth) {
          const winnerPlayer = this.players[0];
          if (winnerPlayer) {
            winnerPlayer.points++;
          }
          newX = this.mapWidth / 2;
        }

        this.ball.pos.x = newX;
      }
    } else {
      // no collision, do normal position updated
      this.ball.pos.x = newX;
    }

    // if up or bottom wall
    if (newY <= 0 || newY + this.ball.size > this.mapHeight) {
      this.ball.speed.y *= -1;
    } else {
      this.ball.pos.y = newY;
    }
  }

  public toJSON() {
    return {
      players: this.players.filter((player) => player !== undefined),
      ball: this.ball,
      lastPlayerId: this.lastPlayerId,
      serverUpdateRate: this.tickRate,
    };
  }
}

export default Game;

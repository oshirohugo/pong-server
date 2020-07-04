import Pos from './pos';
import { MAP_HEIGHT } from './server';
import Ball from './ball';

class Player {
  public pos: Pos;
  public id: number;
  public speed = 300;
  public points = 0;
  public lastProcessedInput = 0;
  public width = 10;
  public height = 60;
  public up = false;
  public down = false;

  constructor(id: number, pos: Pos) {
    this.id = id;
    this.pos = pos;
  }

  public applyInput(pressTime: number): void {
    const newPos = this.pos.y + pressTime * this.speed;
    if (newPos <= MAP_HEIGHT - 60 && newPos >= 0) {
      this.pos.y = newPos;
    }

    // necessary for ball speed adjustment
    if (pressTime < 0) {
      this.up = true;
      this.down = false;
    } else {
      this.up = false;
      this.down = true;
    }
  }

  public clearDirection(): void {
    this.up = false;
    this.down = false;
  }

  public leftPlayerColide(ball: Ball, newX: number): boolean {
    // console.log('checking x for colision', newX, this.pos.x + this.width);
    if (newX <= this.pos.x + this.width) {
      console.log('will pass x left');
      return true;
    }
    return false;
  }

  public rightPlayerColide(ball: Ball, newX: number): boolean {
    // console.log('checking x for colision', newX + ball.size, this.pos.x);
    if (newX + ball.size >= this.pos.x) {
      // console.log('will pass x right');
      return true;
    }
    return false;
  }

  public colide(ball: Ball, newY: number): 'UP' | 'DOWN' | 'NEUTRAL' | null {
    // console.log('colision check', newY, this.pos.y - ball.size);
    // console.log('colision check', newY, this.pos.y + this.height);
    if (newY > this.pos.y - ball.size && newY < this.pos.y + this.height) {
      if (this.up) return 'UP';
      if (this.down) return 'DOWN';
      return 'NEUTRAL';
    }

    return null;
  }

  public toJSON(): any {
    return {
      id: this.id,
      pos: {
        x: this.pos.x,
        y: this.pos.y,
      },
      points: this.points,
      lastProcessedInput: this.lastProcessedInput,
    };
  }
}

export default Player;

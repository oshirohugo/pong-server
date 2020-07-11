import Pos from './pos';
import Ball from './ball';

type PlayerParams = {
  id: number;
  speed: number;
  width: number;
  height: number;
  pos: Pos;
};

class Player {
  public pos: Pos;
  public id: number;
  public speed: number;
  public points = 0;
  public lastProcessedInput = 0;
  public width: number;
  public height: number;
  public up = false;
  public down = false;

  constructor({ id, pos, speed, width, height }: PlayerParams) {
    this.id = id;
    this.pos = pos;
    this.speed = speed;
    this.width = width;
    this.height = height;
  }

  /**
   * Apply inputs received from client
   * @param pressTime
   */
  public applyInput(pressTime: number, mapHeight: number): void {
    const newPos = this.pos.y + pressTime * this.speed;

    // respect map limits
    if (newPos <= mapHeight - this.height && newPos >= 0) {
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

  /**
   * Clear players direction that is set when input is processed
   */
  public clearDirection(): void {
    this.up = false;
    this.down = false;
  }

  /**
   * Check if there was a collision and return the collision direction
   * @param ball
   * @param newY
   */
  public collide(ball: Ball, newY: number): 'UP' | 'DOWN' | 'NEUTRAL' | null {
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

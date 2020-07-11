import Pos from './pos';

type BallParams = {
  speed: Pos;
  acceleration: Pos;
  pos: Pos;
  size: number;
};

class Ball {
  public speed: Pos;
  public acceleration: Pos;
  public pos: Pos;
  public size: number;

  constructor({ speed, acceleration, pos, size }: BallParams) {
    this.speed = speed;
    this.acceleration = acceleration;
    this.pos = pos;
    this.size = size;
  }

  public accelerate(dt: number) {
    this.speed.x = this.speed.x + this.ax * dt;
    this.speed.y = this.speed.y + this.ay * dt;
  }

  get ax() {
    return this.speed.x > 0 ? this.acceleration.x : -this.acceleration.x;
  }

  get ay() {
    return this.speed.y > 0 ? this.acceleration.y : -this.acceleration.y;
  }

  public toJSON() {
    return {
      x: this.pos.x,
      y: this.pos.y,
    };
  }
}

export default Ball;

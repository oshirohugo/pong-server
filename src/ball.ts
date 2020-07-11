import Pos from './pos';

class Ball {
  public speed: Pos = new Pos(-300, -20);
  public acceleration: Pos = new Pos(5, 5);

  public size = 10;

  constructor(public pos: Pos) {}

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

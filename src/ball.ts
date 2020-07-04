import Pos from './pos';
import { MAP_HEIGHT, MAP_WIDTH } from './server';
import Player from './player';

class Ball {
  private speed: Pos = new Pos(-300, -20);

  public size = 10;

  constructor(public pos: Pos) {}

  public updatePosition(dt: number, players: (Player | undefined)[]): void {
    let newX = this.pos.x + this.speed.x * dt;
    const newY = this.pos.y + this.speed.y * dt;

    // console.log(`${this.pos.x}, ${this.pos.y}, ${this.speed.x}, ${this.speed.y}, ${newX}\r`);

    const marginSize = 10;
    let colide = null;
    const passLeft = newX <= 0 + this.size + marginSize;
    const passRight = newX + this.size >= MAP_WIDTH - marginSize - this.size;
    if (passLeft || passRight) {
      // console.log('in x limits');
      const affectedPlayer = passLeft ? players[0] : players[1];
      if (affectedPlayer) {
        colide = affectedPlayer.colide(this, newY);
      }

      if (colide) {
        // console.log('colide');
        this.speed.x *= -1;
        if (colide === 'UP') {
          this.speed.y = this.speed.y * (this.speed.y < 0 ? 2.0 : 0.5);
        }
        if (colide === 'DOWN') {
          this.speed.y = this.speed.y * (this.speed.y > 0 ? 2.0 : 0.5);
        }
      } else {
        if (newX <= 0) {
          const winnerPlayer = players[1];
          if (winnerPlayer) {
            winnerPlayer.points++;
          }
          newX = MAP_WIDTH / 2;
        }
        if (newX + this.size > MAP_WIDTH) {
          const winnerPlayer = players[0];
          if (winnerPlayer) {
            winnerPlayer.points++;
          }
          newX = MAP_WIDTH / 2;
        }

        this.pos.x = newX;
      }
    } else {
      this.pos.x = newX;
    }

    // if up or bottom wall
    if (newY <= 0 || newY + this.size > MAP_HEIGHT) {
      this.speed.y *= -1;
    } else {
      this.pos.y = newY;
    }

    // process.stdout.write(
    //   `${colide}, ${this.pos.x}, ${this.pos.y}, ${this.speed.x}, ${this.speed.y}\r`,
    // );
    // console.log(`${this.pos.x}, ${this.pos.y}, ${this.speed.x}, ${this.speed.y}, ${colide}`);
    // console.log(newX, newY);
  }

  public accelerate() {}

  public toJSON(): any {
    return {
      x: this.pos.x,
      y: this.pos.y,
    };
  }
}

export default Ball;

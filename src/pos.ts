class Pos {
  public x: number;
  public y: number;

  constructor(x?: number, y?: number) {
    this.x = x || 0;
    this.y = y || 0;
  }

  public isEqual(pos: Pos): boolean {
    if (pos.x !== this.x) {
      return false;
    }
    if (pos.y !== this.y) {
      return false;
    }

    return true;
  }

  public add(increment: Pos): void {
    this.x += increment.x;
    this.y += increment.y;
  }

  public toJSON(): any {
    return {
      x: this.x,
      y: this.y,
    };
  }
}

export default Pos;

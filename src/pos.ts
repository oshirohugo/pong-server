class Pos {
  public x: number;
  public y: number;

  constructor(x?: number, y?: number) {
    this.x = x || 0;
    this.y = y || 0;
  }

  public toJSON() {
    return {
      x: this.x,
      y: this.y,
    };
  }
}

export default Pos;

import { Graphics } from "pixi.js";

export class BossBullet extends Graphics {
  private speed: number = 6;

  constructor() {
    super();
    this.createBullet();
  }

  private createBullet(): void {
    this.beginFill(0xff0000);
    this.drawRect(-2, -8, 4, 16);
    this.endFill();
  }

  public update(): void {
    this.y += this.speed; // Move downward
  }
}

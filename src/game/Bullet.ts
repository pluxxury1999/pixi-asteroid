import { Graphics } from "pixi.js";

export class Bullet extends Graphics {
  private speed: number = 8;

  constructor() {
    super();
    this.createBullet();
  }

  private createBullet(): void {
    this.beginFill(0xffff00);
    this.drawRect(-2, -8, 4, 16);
    this.endFill();
  }

  public update(): void {
    this.y -= this.speed;
  }
}

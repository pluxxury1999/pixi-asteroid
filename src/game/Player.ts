import { Graphics } from "pixi.js";

export class Player extends Graphics {
  constructor() {
    super();
    this.createPlayer();
  }

  private createPlayer(): void {
    // Draw player ship as a triangle
    this.beginFill(0x00ff00);
    this.moveTo(0, -20);
    this.lineTo(-15, 15);
    this.lineTo(15, 15);
    this.closePath();
    this.endFill();
    
    // Add some details
    this.beginFill(0xffffff);
    this.drawRect(-3, -10, 6, 8);
    this.endFill();
  }

  public getHitbox(): { x: number, y: number, width: number, height: number } {
    // Player dimensions: width 30 (from -15 to +15), height 35 (from -20 to +15)
    return {
      x: this.x - 15,
      y: this.y - 20,
      width: 30,
      height: 35
    };
  }

  public checkPointCollision(x: number, y: number): boolean {
    const bounds = this.getHitbox();
    return x >= bounds.x && x <= bounds.x + bounds.width &&
           y >= bounds.y && y <= bounds.y + bounds.height;
  }
}

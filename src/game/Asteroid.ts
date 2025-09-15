import { Graphics } from "pixi.js";

export class Asteroid extends Graphics {
  constructor() {
    super();
    this.createAsteroid();
  }

  private createAsteroid(): void {
    // Create a rough, irregular asteroid shape
    this.beginFill(0x8B4513);
    this.moveTo(0, -15);
    this.lineTo(12, -8);
    this.lineTo(15, 5);
    this.lineTo(8, 15);
    this.lineTo(-5, 12);
    this.lineTo(-15, 5);
    this.lineTo(-10, -5);
    this.closePath();
    this.endFill();
    
    // Add some surface details
    this.beginFill(0x654321);
    this.drawRect(-8, -3, 4, 4);
    this.drawRect(5, 2, 3, 3);
    this.endFill();
  }
}

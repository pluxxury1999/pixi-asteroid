import { Graphics } from "pixi.js";

export class Boss extends Graphics {
  private hp: number = 4;
  private maxHP: number = 4;
  private moveSpeed: number = 2;
  private moveDirection: number = 1; // 1 for right, -1 for left
  private moveTimer: number = 0;
  private moveDuration: number = 0;
  private pauseTimer: number = 0;
  private pauseDuration: number = 0;

  constructor() {
    super();
    this.createBoss();
    this.startNewMovement();
  }

  private createBoss(): void {
    // Main body
    this.beginFill(0xff0000);
    this.drawRect(-40, -20, 80, 40);
    this.endFill();
    
    // Wings
    this.beginFill(0xcc0000);
    this.drawRect(-60, -10, 20, 20);
    this.drawRect(40, -10, 20, 20);
    this.endFill();
    
    // Cockpit
    this.beginFill(0x0000ff);
    this.drawRect(-15, -15, 30, 15);
    this.endFill();
    
    // Engines
    this.beginFill(0xffff00);
    this.drawRect(-35, 15, 10, 10);
    this.drawRect(-10, 15, 10, 10);
    this.drawRect(10, 15, 10, 10);
    this.drawRect(35, 15, 10, 10);
    this.endFill();
    
    // Guns
    this.beginFill(0x666666);
    this.drawRect(-30, -25, 8, 15);
    this.drawRect(22, -25, 8, 15);
    this.endFill();
  }

  public takeDamage(): void {
    this.hp--;
  }

  public getHP(): number {
    return this.hp;
  }

  public getMaxHP(): number {
    return this.maxHP;
  }

  public getHitbox(): { x: number, y: number, width: number, height: number } {
    // Boss dimensions: width 100 (from -60 to +60), height 50 (from -25 to +25)
    return {
      x: this.x - 60,
      y: this.y - 25,
      width: 120,
      height: 50
    };
  }

  public checkPointCollision(x: number, y: number): boolean {
    const bounds = this.getHitbox();
    return x >= bounds.x && x <= bounds.x + bounds.width &&
           y >= bounds.y && y <= bounds.y + bounds.height;
  }

  private startNewMovement(): void {
    // Randomly decide whether to move or pause
    if (Math.random() < 0.6) { // 60% chance to move
      this.moveDuration = Math.random() * 120 + 60; // 60-180 frames of movement
      this.moveTimer = 0;
      this.pauseDuration = 0;
      this.pauseTimer = 0;
    } else { // 40% chance to pause
      this.pauseDuration = Math.random() * 90 + 30; // 30-120 frames of pause
      this.pauseTimer = 0;
      this.moveDuration = 0;
      this.moveTimer = 0;
    }
  }

  public update(screenWidth: number, gameState: string = "playing"): void {
    // Stop moving if game is not in playing state
    if (gameState !== "playing") {
      return;
    }

    if (this.moveDuration > 0) {
      // Moving phase
      this.moveTimer++;
      this.x += this.moveSpeed * this.moveDirection;
      
      // Check boundaries and reverse direction if needed
      if (this.x <= 60) { // Left boundary (boss width is 120, so half is 60)
        this.x = 60;
        this.moveDirection = 1;
      } else if (this.x >= screenWidth - 60) { // Right boundary
        this.x = screenWidth - 60;
        this.moveDirection = -1;
      }
      
      // Check if movement phase is over
      if (this.moveTimer >= this.moveDuration) {
        this.startNewMovement();
      }
    } else if (this.pauseDuration > 0) {
      // Pausing phase
      this.pauseTimer++;
      
      // Check if pause phase is over
      if (this.pauseTimer >= this.pauseDuration) {
        this.startNewMovement();
      }
    }
  }
}

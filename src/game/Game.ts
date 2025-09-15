import { Application, Container, Graphics, Text, TextStyle } from "pixi.js";

import { Asteroid } from "./Asteroid.js";
import { Boss } from "./Boss.js";
import { BossBullet } from "./BossBullet.js";
import { Bullet } from "./Bullet.js";
import { Explosion } from "./Explosion.js";
import { Player } from "./Player.js";

export enum GameState {
  START_SCREEN = "start_screen",
  PLAYING = "playing",
  LEVEL_COMPLETE = "level_complete",
  GAME_OVER = "game_over",
  GAME_WIN = "game_win"
}

export class Game {
  private app: Application;
  private player!: Player;
  private bullets: Bullet[] = [];
  private asteroids: Asteroid[] = [];
  private boss: Boss | null = null;
  private bossBullets: BossBullet[] = [];
  private explosions: Explosion[] = [];
  
  private gameState: GameState = GameState.START_SCREEN;
  private currentLevel: number = 1;
  private timeRemaining: number = 60;
  private shotsRemaining: number = 10;
  
  private uiContainer!: Container;
  private timerText!: Text;
  private shotsText!: Text;
  private messageText!: Text;
  private startButton!: Graphics;
  private startButtonText!: Text;
  private gameHintsText!: Text;
  private controlsText!: Text;
  private hpBar!: Graphics;
  private hpBarBackground!: Graphics;
  
  private keys: { [key: string]: boolean } = {};
  private lastBossShot: number = 0;

  constructor(app: Application) {
    this.app = app;
    this.setupInput();
    this.setupUI();
    this.setupPlayer();
    this.showStartScreen();
  }

  private setupInput(): void {
    window.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });
  }

  private setupUI(): void {
    this.uiContainer = new Container();
    this.app.stage.addChild(this.uiContainer);

    // Timer text
    const timerStyle = new TextStyle({
      fontFamily: "Arial",
      fontSize: 24,
      fill: 0xffffff,
      stroke: 0x000000
    });
    this.timerText = new Text({ text: "Time: 60", style: timerStyle });
    this.timerText.position.set(20, 20);
    this.uiContainer.addChild(this.timerText);

    // Shots text
    const shotsStyle = new TextStyle({
      fontFamily: "Arial",
      fontSize: 24,
      fill: 0xffffff,
      stroke: 0x000000
    });
    this.shotsText = new Text({ text: "Shots: 10", style: shotsStyle });
    this.shotsText.position.set(20, 50);
    this.uiContainer.addChild(this.shotsText);

    // Message text
    const messageStyle = new TextStyle({
      fontFamily: "Arial",
      fontSize: 48,
      fill: 0xffffff,
      stroke: 0x000000
    });
    this.messageText = new Text({ text: "", style: messageStyle });
    this.messageText.anchor.set(0.5);
    this.messageText.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
    this.messageText.visible = false;
    this.uiContainer.addChild(this.messageText);

    // HP Bar for boss
    this.hpBarBackground = new Graphics();
    this.hpBarBackground.rect(0, 0, 200, 20);
    this.hpBarBackground.fill(0x333333);
    this.hpBarBackground.visible = false;
    this.uiContainer.addChild(this.hpBarBackground);

    this.hpBar = new Graphics();
    this.hpBar.rect(0, 0, 200, 20);
    this.hpBar.fill(0xff0000);
    this.hpBar.visible = false;
    this.uiContainer.addChild(this.hpBar);

    // Start button with better design
    this.startButton = new Graphics();
    // Button background with border
    this.startButton.rect(-80, -25, 160, 50);
    this.startButton.fill(0x2a2a2a);
    this.startButton.rect(-78, -23, 156, 46);
    this.startButton.fill(0x4a4a4a);
    this.startButton.rect(-76, -21, 152, 42);
    this.startButton.fill(0x00aa00);
    this.startButton.position.set(this.app.screen.width / 2, this.app.screen.height / 2 + 80);
    this.startButton.interactive = true;
    this.startButton.cursor = 'pointer';
    this.startButton.on('pointerdown', () => this.startGame());
    this.startButton.on('pointerover', () => {
      this.startButton.clear();
      this.startButton.rect(-80, -25, 160, 50);
      this.startButton.fill(0x2a2a2a);
      this.startButton.rect(-78, -23, 156, 46);
      this.startButton.fill(0x4a4a4a);
      this.startButton.rect(-76, -21, 152, 42);
      this.startButton.fill(0x00ff00); // Brighter green on hover
    });
    this.startButton.on('pointerout', () => {
      this.startButton.clear();
      this.startButton.rect(-80, -25, 160, 50);
      this.startButton.fill(0x2a2a2a);
      this.startButton.rect(-78, -23, 156, 46);
      this.startButton.fill(0x4a4a4a);
      this.startButton.rect(-76, -21, 152, 42);
      this.startButton.fill(0x00aa00); // Normal green
    });
    this.uiContainer.addChild(this.startButton);

    const startButtonStyle = new TextStyle({
      fontFamily: "Arial",
      fontSize: 20,
      fill: 0xffffff,
      fontWeight: "bold",
      stroke: 0x000000
    });
    this.startButtonText = new Text({ text: "START GAME", style: startButtonStyle });
    this.startButtonText.anchor.set(0.5);
    this.startButtonText.position.set(this.app.screen.width / 2, this.app.screen.height / 2 + 80);
    this.uiContainer.addChild(this.startButtonText);

    // Game hints text
    const hintsStyle = new TextStyle({
      fontFamily: "Arial",
      fontSize: 16,
      fill: 0xcccccc,
      align: "center"
    });
    this.gameHintsText = new Text({ 
      text: "Destroy all asteroids to advance to the boss fight!\nYou have 10 shots and 60 seconds per level.", 
      style: hintsStyle 
    });
    this.gameHintsText.anchor.set(0.5);
    this.gameHintsText.position.set(this.app.screen.width / 2, this.app.screen.height / 2 + 140);
    this.uiContainer.addChild(this.gameHintsText);

    // Controls text
    const controlsStyle = new TextStyle({
      fontFamily: "Arial",
      fontSize: 14,
      fill: 0xaaaaaa,
      align: "center"
    });
    this.controlsText = new Text({ 
      text: "CONTROLS:\nArrow Keys: Move • Space: Shoot • R: Restart", 
      style: controlsStyle 
    });
    this.controlsText.anchor.set(0.5);
    this.controlsText.position.set(this.app.screen.width / 2, this.app.screen.height / 2 + 200);
    this.uiContainer.addChild(this.controlsText);
  }

  private setupPlayer(): void {
    this.player = new Player();
    this.player.position.set(this.app.screen.width / 2, this.app.screen.height - 50);
    this.app.stage.addChild(this.player);
  }

  private setupAsteroids(): void {
    this.asteroids = [];
    for (let i = 0; i < 8; i++) {
      const asteroid = new Asteroid();
      asteroid.position.set(
        Math.random() * (this.app.screen.width - 100) + 50,
        Math.random() * (this.app.screen.height - 200) + 100
      );
      this.asteroids.push(asteroid);
      this.app.stage.addChild(asteroid);
    }
  }

  private setupBoss(): void {
    this.boss = new Boss();
    this.boss.position.set(this.app.screen.width / 2, 150);
    this.app.stage.addChild(this.boss);
    
    this.hpBarBackground.visible = true;
    this.hpBar.visible = true;
    this.updateHPBar();
    this.updateHPBarPosition();
  }

  private updateHPBar(): void {
    if (this.boss) {
      const hpPercentage = this.boss.getHP() / this.boss.getMaxHP();
      this.hpBar.width = 200 * hpPercentage;
    }
  }

  private updateHPBarPosition(): void {
    if (this.boss) {
      // Position HP bar above the boss, centered
      this.hpBarBackground.x = this.boss.x - 100; // Center the 200px wide bar
      this.hpBarBackground.y = this.boss.y - 50; // Above the boss
      
      this.hpBar.x = this.boss.x - 100; // Center the 200px wide bar
      this.hpBar.y = this.boss.y - 50; // Above the boss
    }
  }

  private handleInput(): void {
    // Restart game with R key (works in any state except start screen)
    if (this.keys["KeyR"] && this.gameState !== GameState.START_SCREEN) {
      this.restartGame();
      this.keys["KeyR"] = false; // Prevent continuous restart
      return;
    }

    if (this.gameState !== GameState.PLAYING) return;

    // Player movement
    if (this.keys["ArrowLeft"] && this.player.x > 25) {
      this.player.x -= 5;
    }
    if (this.keys["ArrowRight"] && this.player.x < this.app.screen.width - 25) {
      this.player.x += 5;
    }

    // Shooting
    if (this.keys["Space"] && this.shotsRemaining > 0) {
      this.shoot();
      this.keys["Space"] = false; // Prevent continuous shooting
    }
  }

  private shoot(): void {
    if (this.shotsRemaining <= 0) return;

    const bullet = new Bullet();
    bullet.position.set(this.player.x, this.player.y - 20);
    this.bullets.push(bullet);
    this.app.stage.addChild(bullet);
    this.shotsRemaining--;
    this.updateShotsText();
  }

  private bossShoot(): void {
    if (!this.boss || this.gameState !== GameState.PLAYING) return;

    const currentTime = Date.now();
    if (currentTime - this.lastBossShot >= 2000) { // Every 2 seconds
      const bossBullet = new BossBullet();
      bossBullet.position.set(this.boss.x, this.boss.y + 30);
      this.bossBullets.push(bossBullet);
      this.app.stage.addChild(bossBullet);
      this.lastBossShot = currentTime;
    }
  }

  private updateBullets(): void {
    // Update player bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.update();
      
      if (bullet.y < 0) {
        this.bullets.splice(i, 1);
        this.app.stage.removeChild(bullet);
      }
    }

    // Update boss bullets
    for (let i = this.bossBullets.length - 1; i >= 0; i--) {
      const bossBullet = this.bossBullets[i];
      bossBullet.update();
      
      if (bossBullet.y > this.app.screen.height) {
        this.bossBullets.splice(i, 1);
        this.app.stage.removeChild(bossBullet);
      }
    }
  }

  private checkCollisions(): void {
    if (this.gameState !== GameState.PLAYING) return;

    // Player bullets vs Asteroids
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      
      for (let j = this.asteroids.length - 1; j >= 0; j--) {
        const asteroid = this.asteroids[j];
        if (this.checkCollision(bullet, asteroid)) {
          // Create explosion at asteroid position
          this.createExplosion(asteroid.x, asteroid.y, 6);
          
          this.bullets.splice(i, 1);
          this.asteroids.splice(j, 1);
          this.app.stage.removeChild(bullet);
          this.app.stage.removeChild(asteroid);
          break;
        }
      }
    }

    // Player bullets vs Boss
    if (this.boss) {
      for (let i = this.bullets.length - 1; i >= 0; i--) {
        const bullet = this.bullets[i];
        if (this.boss!.checkPointCollision(bullet.x, bullet.y)) {
          this.bullets.splice(i, 1);
          this.app.stage.removeChild(bullet);
          this.boss!.takeDamage();
          this.updateHPBar();
          
          if (this.boss!.getHP() <= 0) {
            // Create large explosion when boss is destroyed
            this.createExplosion(this.boss!.x, this.boss!.y, 12);
            this.app.stage.removeChild(this.boss!);
            this.boss = null;
            
            // Hide HP bar when boss is destroyed
            this.hpBarBackground.visible = false;
            this.hpBar.visible = false;
            
            this.showMessage("YOU WIN!", 0x00ff00);
            this.gameState = GameState.GAME_WIN;
          }
        }
      }
    }

    // Boss bullets vs Player bullets
    for (let i = this.bossBullets.length - 1; i >= 0; i--) {
      const bossBullet = this.bossBullets[i];
      
      for (let j = this.bullets.length - 1; j >= 0; j--) {
        const playerBullet = this.bullets[j];
        if (this.checkCollision(bossBullet, playerBullet)) {
          // Create small explosion when bullets collide
          this.createExplosion(bossBullet.x, bossBullet.y, 4);
          
          this.bossBullets.splice(i, 1);
          this.bullets.splice(j, 1);
          this.app.stage.removeChild(bossBullet);
          this.app.stage.removeChild(playerBullet);
          break;
        }
      }
    }

    // Boss bullets vs Player
    for (let i = this.bossBullets.length - 1; i >= 0; i--) {
      const bossBullet = this.bossBullets[i];
      if (this.player.checkPointCollision(bossBullet.x, bossBullet.y)) {
        // Create explosion at player position
        this.createExplosion(this.player.x, this.player.y, 8);
        
        this.bossBullets.splice(i, 1);
        this.app.stage.removeChild(bossBullet);
        this.showMessage("YOU LOSE!", 0xff0000);
        this.gameState = GameState.GAME_OVER;
      }
    }
  }

  private checkCollision(obj1: { x: number; y: number }, obj2: { x: number; y: number }): boolean {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < 30; // Collision radius
  }

  private updateTimer(): void {
    if (this.gameState !== GameState.PLAYING) return;

    this.timeRemaining -= 1/60; // Assuming 60 FPS
    this.updateTimerText();

    if (this.timeRemaining <= 0) {
      this.showMessage("YOU LOSE!", 0xff0000);
      this.gameState = GameState.GAME_OVER;
    }
  }

  private checkLevelComplete(): void {
    if (this.currentLevel === 1 && this.asteroids.length === 0 && this.gameState === GameState.PLAYING) {
      this.currentLevel = 2;
      this.shotsRemaining = 10;
      this.timeRemaining = 60;
      this.setupBoss();
      this.updateShotsText();
      this.updateTimerText();
    }
  }

  private checkGameOver(): void {
    // Only check for game over if we're still playing and have no bullets in flight
    if (this.gameState !== GameState.PLAYING) return;
    
    // For level 1: lose if no shots left, asteroids remain, and no bullets in flight
    if (this.shotsRemaining <= 0 && this.asteroids.length > 0 && this.currentLevel === 1 && this.bullets.length === 0) {
      this.showMessage("YOU LOSE!", 0xff0000);
      this.gameState = GameState.GAME_OVER;
    }
    
    // For level 2: lose if no shots left, boss has HP, and no bullets in flight
    if (this.shotsRemaining <= 0 && this.boss && this.boss.getHP() > 0 && this.currentLevel === 2 && this.bullets.length === 0) {
      this.showMessage("YOU LOSE!", 0xff0000);
      this.gameState = GameState.GAME_OVER;
    }
  }

  private updateTimerText(): void {
    this.timerText.text = `Time: ${Math.ceil(this.timeRemaining)}`;
  }

  private updateShotsText(): void {
    this.shotsText.text = `Shots: ${this.shotsRemaining}`;
  }

  private showMessage(text: string, color: number): void {
    this.messageText.text = text;
    this.messageText.style.fill = color;
    this.messageText.visible = true;
  }

  private createExplosion(x: number, y: number, particleCount: number = 8): void {
    const explosion = new Explosion(x, y, particleCount);
    this.explosions.push(explosion);
    this.app.stage.addChild(explosion);
  }

  private startGame(): void {
    this.gameState = GameState.PLAYING;
    this.currentLevel = 1;
    this.timeRemaining = 60;
    this.shotsRemaining = 10;
    
    // Hide start screen elements
    this.startButton.visible = false;
    this.startButtonText.visible = false;
    this.gameHintsText.visible = false;
    this.controlsText.visible = false;
    this.messageText.visible = false;
    
    // Show game UI
    this.timerText.visible = true;
    this.shotsText.visible = true;
    
    // Reset game elements
    this.resetGame();
  }

  private restartGame(): void {
    this.gameState = GameState.PLAYING;
    this.currentLevel = 1;
    this.timeRemaining = 60;
    this.shotsRemaining = 10;
    
    // Hide game over/win messages
    this.messageText.visible = false;
    
    // Show game UI
    this.timerText.visible = true;
    this.shotsText.visible = true;
    
    // Reset game elements
    this.resetGame();
  }

  private resetGame(): void {
    // Clear all bullets
    this.bullets.forEach(bullet => this.app.stage.removeChild(bullet));
    this.bossBullets.forEach(bullet => this.app.stage.removeChild(bullet));
    this.bullets = [];
    this.bossBullets = [];
    
    // Clear all explosions
    this.explosions.forEach(explosion => this.app.stage.removeChild(explosion));
    this.explosions = [];
    
    // Remove boss if exists
    if (this.boss) {
      this.app.stage.removeChild(this.boss);
      this.boss = null;
      this.hpBarBackground.visible = false;
      this.hpBar.visible = false;
    }
    
    // Clear asteroids
    this.asteroids.forEach(asteroid => this.app.stage.removeChild(asteroid));
    this.asteroids = [];
    
    // Reset player position
    this.player.position.set(this.app.screen.width / 2, this.app.screen.height - 50);
    
    // Setup asteroids
    this.setupAsteroids();
    
    // Update UI
    this.updateTimerText();
    this.updateShotsText();
  }

  private showStartScreen(): void {
    // Show start screen elements
    this.startButton.visible = true;
    this.startButtonText.visible = true;
    this.gameHintsText.visible = true;
    this.controlsText.visible = true;
    
    // Hide game UI elements
    this.timerText.visible = false;
    this.shotsText.visible = false;
    this.messageText.visible = false;
    
    // Show welcome message
    this.messageText.text = "SPACE SHOOTER";
    this.messageText.style.fill = 0xffffff;
    this.messageText.visible = true;
  }

  private updateExplosions(): void {
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const explosion = this.explosions[i];
      const isComplete = explosion.update();
      explosion.render();
      
      if (isComplete) {
        this.explosions.splice(i, 1);
        this.app.stage.removeChild(explosion);
      }
    }
  }

  public start(): void {
    this.app.ticker.add(() => {
      this.handleInput();
      
      // Only update game logic when playing
      if (this.gameState === GameState.PLAYING) {
        this.updateBullets();
        this.updateExplosions();
        this.checkCollisions();
        this.updateTimer();
        this.checkLevelComplete();
        this.checkGameOver();
        
        if (this.currentLevel === 2) {
          this.bossShoot();
          if (this.boss) {
            this.boss.update(this.app.screen.width, this.gameState);
            this.updateHPBarPosition();
          }
        }
      }
    });
  }
}

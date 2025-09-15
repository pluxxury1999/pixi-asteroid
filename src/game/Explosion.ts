import { Graphics } from "pixi.js";

export class Explosion extends Graphics {
  private animationTimer: number = 0;
  private maxDuration: number = 30; // 30 frames (0.5 seconds at 60fps)
  private particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
  }> = [];

  constructor(x: number, y: number, particleCount: number = 8) {
    super();
    this.position.set(x, y);
    this.createParticles(particleCount);
  }

  private createParticles(count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = Math.random() * 4 + 2;
      const life = Math.random() * 20 + 10;
      
      this.particles.push({
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: life,
        maxLife: life,
        size: Math.random() * 3 + 1
      });
    }
  }

  public update(): boolean {
    this.animationTimer++;
    
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;
      
      // Apply gravity
      particle.vy += 0.1;
      
      // Remove dead particles
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
    
    // Check if animation is complete
    return this.animationTimer >= this.maxDuration || this.particles.length === 0;
  }

  public render(): void {
    this.clear();
    
    for (const particle of this.particles) {
      const alpha = particle.life / particle.maxLife;
      const color = this.getParticleColor(alpha);
      
      this.beginFill(color, alpha);
      this.drawCircle(particle.x, particle.y, particle.size);
      this.endFill();
    }
  }

  private getParticleColor(alpha: number): number {
    // Color transitions from yellow/orange to red as particles fade
    if (alpha > 0.7) {
      return 0xffaa00; // Orange
    } else if (alpha > 0.4) {
      return 0xff6600; // Dark orange
    } else {
      return 0xff0000; // Red
    }
  }
}

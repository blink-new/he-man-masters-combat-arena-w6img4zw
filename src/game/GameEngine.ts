import { GameState, Character, Controls, Projectile, Particle, Vector2 } from '../types/game';
import { PhysicsEngine } from './physics';

export class GameEngine {
  private physics: PhysicsEngine;
  private lastTime: number = 0;

  constructor() {
    this.physics = new PhysicsEngine();
  }

  update(gameState: GameState, controls: { player1: Controls; player2: Controls }, currentTime: number): void {
    if (gameState.isPaused) return;

    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 1/30); // Cap at 30fps minimum
    this.lastTime = currentTime;

    gameState.gameTime += deltaTime;

    // Update characters
    gameState.characters.forEach((character, index) => {
      const playerControls = index === 0 ? controls.player1 : controls.player2;
      this.updateCharacter(character, playerControls, deltaTime);
      this.physics.updateCharacter(character, deltaTime, gameState.arena.platforms);
    });

    // Check character collisions
    if (gameState.characters.length >= 2) {
      if (this.physics.checkCharacterCollision(gameState.characters[0], gameState.characters[1])) {
        this.physics.resolveCharacterCollision(gameState.characters[0], gameState.characters[1]);
      }
    }

    // Update projectiles
    gameState.projectiles = gameState.projectiles.filter(projectile => {
      this.physics.updateProjectile(projectile, deltaTime);
      return projectile.lifetime > 0 && this.isInBounds(projectile.position, gameState.arena);
    });

    // Update particles
    gameState.particles = gameState.particles.filter(particle => {
      this.physics.updateParticle(particle, deltaTime);
      return particle.lifetime > 0;
    });

    // Check win conditions
    this.checkWinConditions(gameState);
  }

  private updateCharacter(character: Character, controls: Controls, deltaTime: number): void {
    const moveForce = 300;
    const jumpForce = 400;

    // Movement
    if (controls.left) {
      this.physics.applyForce(character, { x: -moveForce * deltaTime, y: 0 });
    }
    if (controls.right) {
      this.physics.applyForce(character, { x: moveForce * deltaTime, y: 0 });
    }

    // Jumping
    if (controls.up && character.isGrounded) {
      this.physics.applyImpulse(character, { x: 0, y: -jumpForce });
    }

    // Attack
    if (controls.attack) {
      this.performAttack(character, controls);
    }

    // Special ability
    if (controls.special) {
      this.useSpecialAbility(character);
    }

    // Regenerate power slowly
    character.power = Math.min(character.maxPower, character.power + 10 * deltaTime);
  }

  private performAttack(character: Character, controls: Controls): void {
    if (!character.weapon) return;

    const attackDirection = this.getAttackDirection(character, controls);
    const attackForce = 200;

    // Apply attack impulse
    this.physics.applyImpulse(character, {
      x: attackDirection.x * attackForce * 0.1,
      y: attackDirection.y * attackForce * 0.1
    });

    // Create attack particles
    this.createAttackParticles(character, attackDirection);

    // Weapon swing rotation
    character.angularVelocity += (Math.random() - 0.5) * 20;
  }

  private getAttackDirection(character: Character, controls: Controls): Vector2 {
    const charCenterX = character.position.x + character.size.x / 2;
    const charCenterY = character.position.y + character.size.y / 2;
    
    const dx = controls.mouseX - charCenterX;
    const dy = controls.mouseY - charCenterY;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return { x: 1, y: 0 };
    
    return { x: dx / length, y: dy / length };
  }

  private createAttackParticles(character: Character, direction: Vector2): void {
    // This will be implemented when we add the particle system to the game state
  }

  private useSpecialAbility(character: Character): void {
    if (character.abilities.length === 0) return;
    
    const ability = character.abilities[0];
    const currentTime = Date.now();
    
    if (character.power >= ability.powerCost && 
        currentTime - ability.lastUsed >= ability.cooldown) {
      
      character.power -= ability.powerCost;
      ability.lastUsed = currentTime;
      ability.effect(character);
      
      // Create special effect particles
      this.createSpecialEffectParticles(character);
    }
  }

  private createSpecialEffectParticles(character: Character): void {
    // This will be implemented when we add the particle system to the game state
  }

  private isInBounds(position: Vector2, arena: { width: number; height: number }): boolean {
    return position.x >= -50 && position.x <= arena.width + 50 &&
           position.y >= -50 && position.y <= arena.height + 50;
  }

  private checkWinConditions(gameState: GameState): void {
    const alivePlayers = gameState.characters.filter(char => char.health > 0);
    
    if (alivePlayers.length === 1) {
      gameState.winner = alivePlayers[0].name;
    } else if (alivePlayers.length === 0) {
      gameState.winner = 'Draw';
    }
  }

  createProjectile(position: Vector2, velocity: Vector2, damage: number, color: string): Projectile {
    return {
      id: `projectile-${Date.now()}-${Math.random()}`,
      position: { ...position },
      velocity: { ...velocity },
      damage,
      size: 8,
      color,
      lifetime: 3
    };
  }

  createParticle(position: Vector2, velocity: Vector2, color: string, lifetime: number): Particle {
    return {
      id: `particle-${Date.now()}-${Math.random()}`,
      position: { ...position },
      velocity: { ...velocity },
      color,
      size: Math.random() * 4 + 2,
      lifetime,
      maxLifetime: lifetime
    };
  }

  addParticleExplosion(gameState: GameState, position: Vector2, color: string, count: number = 10): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = Math.random() * 200 + 100;
      const velocity = {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
      };
      
      const particle = this.createParticle(position, velocity, color, 1 + Math.random());
      gameState.particles.push(particle);
    }
  }
}
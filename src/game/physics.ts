import { Character, Vector2, Platform, Projectile, Particle } from '../types/game';

export class PhysicsEngine {
  private gravity = 800;
  private friction = 0.85;
  private airResistance = 0.98;
  private bounceThreshold = 50;

  updateCharacter(character: Character, deltaTime: number, platforms: Platform[]): void {
    // Apply gravity
    character.velocity.y += this.gravity * deltaTime;

    // Apply air resistance
    character.velocity.x *= this.airResistance;
    character.velocity.y *= this.airResistance;

    // Update position
    character.position.x += character.velocity.x * deltaTime;
    character.position.y += character.velocity.y * deltaTime;

    // Update rotation
    character.rotation += character.angularVelocity * deltaTime;
    character.angularVelocity *= this.friction;

    // Check ground collision
    character.isGrounded = false;
    
    // Check platform collisions
    for (const platform of platforms) {
      if (this.checkCharacterPlatformCollision(character, platform)) {
        this.resolveCharacterPlatformCollision(character, platform);
      }
    }

    // Keep character in bounds
    this.keepInBounds(character, 800, 600);

    // Update weapon position if character has one
    if (character.weapon) {
      this.updateWeaponPosition(character);
    }
  }

  updateProjectile(projectile: Projectile, deltaTime: number): void {
    projectile.velocity.y += this.gravity * deltaTime * 0.5; // Less gravity for projectiles
    projectile.position.x += projectile.velocity.x * deltaTime;
    projectile.position.y += projectile.velocity.y * deltaTime;
    projectile.lifetime -= deltaTime;
  }

  updateParticle(particle: Particle, deltaTime: number): void {
    particle.velocity.y += this.gravity * deltaTime * 0.3; // Even less gravity for particles
    particle.velocity.x *= 0.99;
    particle.velocity.y *= 0.99;
    particle.position.x += particle.velocity.x * deltaTime;
    particle.position.y += particle.velocity.y * deltaTime;
    particle.lifetime -= deltaTime;
  }

  private checkCharacterPlatformCollision(character: Character, platform: Platform): boolean {
    return (
      character.position.x < platform.x + platform.width &&
      character.position.x + character.size.x > platform.x &&
      character.position.y < platform.y + platform.height &&
      character.position.y + character.size.y > platform.y
    );
  }

  private resolveCharacterPlatformCollision(character: Character, platform: Platform): void {
    const charCenterX = character.position.x + character.size.x / 2;
    const charCenterY = character.position.y + character.size.y / 2;
    const platCenterX = platform.x + platform.width / 2;
    const platCenterY = platform.y + platform.height / 2;

    const overlapX = (character.size.x + platform.width) / 2 - Math.abs(charCenterX - platCenterX);
    const overlapY = (character.size.y + platform.height) / 2 - Math.abs(charCenterY - platCenterY);

    if (overlapX > 0 && overlapY > 0) {
      if (overlapX < overlapY) {
        // Horizontal collision
        if (charCenterX < platCenterX) {
          character.position.x = platform.x - character.size.x;
        } else {
          character.position.x = platform.x + platform.width;
        }
        character.velocity.x *= -0.3; // Bounce
      } else {
        // Vertical collision
        if (charCenterY < platCenterY) {
          // Landing on top
          character.position.y = platform.y - character.size.y;
          character.isGrounded = true;
          if (character.velocity.y > this.bounceThreshold) {
            character.velocity.y *= -0.3; // Bounce
          } else {
            character.velocity.y = 0;
          }
        } else {
          // Hitting from below
          character.position.y = platform.y + platform.height;
          character.velocity.y *= -0.3;
        }
      }
    }
  }

  private keepInBounds(character: Character, width: number, height: number): void {
    // Left boundary
    if (character.position.x < 0) {
      character.position.x = 0;
      character.velocity.x *= -0.3;
    }
    
    // Right boundary
    if (character.position.x + character.size.x > width) {
      character.position.x = width - character.size.x;
      character.velocity.x *= -0.3;
    }
    
    // Bottom boundary (ground)
    if (character.position.y + character.size.y > height) {
      character.position.y = height - character.size.y;
      character.isGrounded = true;
      if (character.velocity.y > this.bounceThreshold) {
        character.velocity.y *= -0.3;
      } else {
        character.velocity.y = 0;
      }
    }
    
    // Top boundary
    if (character.position.y < 0) {
      character.position.y = 0;
      character.velocity.y *= -0.3;
    }
  }

  private updateWeaponPosition(character: Character): void {
    if (!character.weapon) return;
    
    const weaponOffset = 30;
    const angle = character.rotation;
    
    character.weapon.position.x = character.position.x + character.size.x / 2 + 
      Math.cos(angle) * weaponOffset;
    character.weapon.position.y = character.position.y + character.size.y / 2 + 
      Math.sin(angle) * weaponOffset;
    character.weapon.rotation = angle;
  }

  checkCharacterCollision(char1: Character, char2: Character): boolean {
    return (
      char1.position.x < char2.position.x + char2.size.x &&
      char1.position.x + char1.size.x > char2.position.x &&
      char1.position.y < char2.position.y + char2.size.y &&
      char1.position.y + char1.size.y > char2.position.y
    );
  }

  resolveCharacterCollision(char1: Character, char2: Character): void {
    const char1CenterX = char1.position.x + char1.size.x / 2;
    const char1CenterY = char1.position.y + char1.size.y / 2;
    const char2CenterX = char2.position.x + char2.size.x / 2;
    const char2CenterY = char2.position.y + char2.size.y / 2;

    const dx = char2CenterX - char1CenterX;
    const dy = char2CenterY - char1CenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const overlap = (char1.size.x + char2.size.x) / 2 - distance;
      if (overlap > 0) {
        const separationX = (dx / distance) * overlap * 0.5;
        const separationY = (dy / distance) * overlap * 0.5;

        char1.position.x -= separationX;
        char1.position.y -= separationY;
        char2.position.x += separationX;
        char2.position.y += separationY;

        // Exchange some velocity
        const relativeVelocityX = char2.velocity.x - char1.velocity.x;
        const relativeVelocityY = char2.velocity.y - char1.velocity.y;
        
        const impulse = 0.3;
        char1.velocity.x += relativeVelocityX * impulse;
        char1.velocity.y += relativeVelocityY * impulse;
        char2.velocity.x -= relativeVelocityX * impulse;
        char2.velocity.y -= relativeVelocityY * impulse;

        // Add some angular velocity for ragdoll effect
        char1.angularVelocity += (Math.random() - 0.5) * 10;
        char2.angularVelocity += (Math.random() - 0.5) * 10;
      }
    }
  }

  applyForce(character: Character, force: Vector2): void {
    character.velocity.x += force.x;
    character.velocity.y += force.y;
  }

  applyImpulse(character: Character, impulse: Vector2): void {
    character.velocity.x += impulse.x;
    character.velocity.y += impulse.y;
    character.angularVelocity += (impulse.x + impulse.y) * 0.1;
  }
}
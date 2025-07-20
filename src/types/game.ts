export interface Vector2 {
  x: number;
  y: number;
}

export interface Character {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  power: number;
  maxPower: number;
  position: Vector2;
  velocity: Vector2;
  rotation: number;
  angularVelocity: number;
  isGrounded: boolean;
  weapon?: Weapon;
  abilities: Ability[];
  color: string;
  size: Vector2;
}

export interface Weapon {
  id: string;
  name: string;
  damage: number;
  reach: number;
  weight: number;
  position: Vector2;
  rotation: number;
  color: string;
}

export interface Ability {
  id: string;
  name: string;
  powerCost: number;
  cooldown: number;
  lastUsed: number;
  effect: (character: Character, target?: Character) => void;
}

export interface GameState {
  characters: Character[];
  projectiles: Projectile[];
  particles: Particle[];
  gameTime: number;
  isPaused: boolean;
  winner?: string;
  arena: Arena;
}

export interface Projectile {
  id: string;
  position: Vector2;
  velocity: Vector2;
  damage: number;
  size: number;
  color: string;
  lifetime: number;
}

export interface Particle {
  id: string;
  position: Vector2;
  velocity: Vector2;
  color: string;
  size: number;
  lifetime: number;
  maxLifetime: number;
}

export interface Arena {
  width: number;
  height: number;
  platforms: Platform[];
  background: string;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface Controls {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  attack: boolean;
  special: boolean;
  mouseX: number;
  mouseY: number;
}

export type GameScreen = 'menu' | 'characterSelect' | 'game' | 'victory';
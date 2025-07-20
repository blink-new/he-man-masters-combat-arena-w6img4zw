import { Character, Weapon, Ability, Vector2 } from '../types/game';

export const createHeMan = (): Character => ({
  id: 'he-man',
  name: 'He-Man',
  health: 100,
  maxHealth: 100,
  power: 0,
  maxPower: 100,
  position: { x: 200, y: 300 },
  velocity: { x: 0, y: 0 },
  rotation: 0,
  angularVelocity: 0,
  isGrounded: false,
  weapon: createPowerSword(),
  abilities: [createGrayskullPower()],
  color: '#FFD700',
  size: { x: 40, y: 60 }
});

export const createSkeletor = (): Character => ({
  id: 'skeletor',
  name: 'Skeletor',
  health: 100,
  maxHealth: 100,
  power: 0,
  maxPower: 100,
  position: { x: 600, y: 300 },
  velocity: { x: 0, y: 0 },
  rotation: 0,
  angularVelocity: 0,
  isGrounded: false,
  weapon: createHavocStaff(),
  abilities: [createDarkMagic()],
  color: '#8B0000',
  size: { x: 40, y: 60 }
});

export const createBeastMan = (): Character => ({
  id: 'beast-man',
  name: 'Beast Man',
  health: 120,
  maxHealth: 120,
  power: 0,
  maxPower: 80,
  position: { x: 600, y: 300 },
  velocity: { x: 0, y: 0 },
  rotation: 0,
  angularVelocity: 0,
  isGrounded: false,
  weapon: createClaws(),
  abilities: [createBeastCall()],
  color: '#8B4513',
  size: { x: 45, y: 65 }
});

export const createTeela = (): Character => ({
  id: 'teela',
  name: 'Teela',
  health: 90,
  maxHealth: 90,
  power: 0,
  maxPower: 120,
  position: { x: 600, y: 300 },
  velocity: { x: 0, y: 0 },
  rotation: 0,
  angularVelocity: 0,
  isGrounded: false,
  weapon: createStaff(),
  abilities: [createMagicBlast()],
  color: '#FF6B35',
  size: { x: 35, y: 55 }
});

const createPowerSword = (): Weapon => ({
  id: 'power-sword',
  name: 'Power Sword',
  damage: 25,
  reach: 50,
  weight: 15,
  position: { x: 0, y: 0 },
  rotation: 0,
  color: '#C0C0C0'
});

const createHavocStaff = (): Weapon => ({
  id: 'havoc-staff',
  name: 'Havoc Staff',
  damage: 20,
  reach: 60,
  weight: 12,
  position: { x: 0, y: 0 },
  rotation: 0,
  color: '#4B0082'
});

const createClaws = (): Weapon => ({
  id: 'claws',
  name: 'Beast Claws',
  damage: 18,
  reach: 30,
  weight: 8,
  position: { x: 0, y: 0 },
  rotation: 0,
  color: '#8B4513'
});

const createStaff = (): Weapon => ({
  id: 'staff',
  name: 'Sorceress Staff',
  damage: 15,
  reach: 55,
  weight: 10,
  position: { x: 0, y: 0 },
  rotation: 0,
  color: '#FFD700'
});

const createGrayskullPower = (): Ability => ({
  id: 'grayskull-power',
  name: 'Power of Grayskull',
  powerCost: 50,
  cooldown: 5000,
  lastUsed: 0,
  effect: (character: Character) => {
    character.health = Math.min(character.maxHealth, character.health + 30);
    if (character.weapon) {
      character.weapon.damage *= 1.5;
    }
  }
});

const createDarkMagic = (): Ability => ({
  id: 'dark-magic',
  name: 'Dark Magic',
  powerCost: 40,
  cooldown: 4000,
  lastUsed: 0,
  effect: (character: Character, target?: Character) => {
    if (target) {
      target.health -= 35;
      target.velocity.x += (target.position.x > character.position.x ? 1 : -1) * 200;
      target.velocity.y -= 100;
    }
  }
});

const createBeastCall = (): Ability => ({
  id: 'beast-call',
  name: 'Beast Call',
  powerCost: 30,
  cooldown: 6000,
  lastUsed: 0,
  effect: (character: Character) => {
    character.velocity.x *= 1.5;
    character.velocity.y -= 150;
    if (character.weapon) {
      character.weapon.damage += 10;
    }
  }
});

const createMagicBlast = (): Ability => ({
  id: 'magic-blast',
  name: 'Magic Blast',
  powerCost: 35,
  cooldown: 3000,
  lastUsed: 0,
  effect: (character: Character, target?: Character) => {
    if (target) {
      const distance = Math.sqrt(
        Math.pow(target.position.x - character.position.x, 2) +
        Math.pow(target.position.y - character.position.y, 2)
      );
      if (distance < 150) {
        target.health -= 25;
        target.velocity.x += (target.position.x > character.position.x ? 1 : -1) * 150;
      }
    }
  }
});

export const CHARACTERS = {
  'he-man': createHeMan,
  'skeletor': createSkeletor,
  'beast-man': createBeastMan,
  'teela': createTeela
};
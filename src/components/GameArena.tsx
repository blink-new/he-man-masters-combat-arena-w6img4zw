import { useEffect, useRef, useState, useCallback } from 'react'
import { Character, GameResult } from '../App'
import { Button } from './ui/button'

interface GameArenaProps {
  player1: Character
  player2: Character
  onGameEnd: (result: GameResult) => void
}

interface Fighter {
  x: number
  y: number
  vx: number
  vy: number
  health: number
  maxHealth: number
  character: Character
  isGrounded: boolean
  facing: 'left' | 'right'
  isAttacking: boolean
  attackCooldown: number
  specialCooldown: number
  stunned: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

const GRAVITY = 0.5
const FRICTION = 0.8
const GROUND_Y = 500
const ARENA_WIDTH = 800
const ARENA_HEIGHT = 600

export default function GameArena({ player1, player2, onGameEnd }: GameArenaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const keysRef = useRef<Set<string>>(new Set())
  const mouseRef = useRef({ x: 0, y: 0, pressed: false })
  
  const [fighter1, setFighter1] = useState<Fighter>({
    x: 200,
    y: GROUND_Y - 60,
    vx: 0,
    vy: 0,
    health: player1.health,
    maxHealth: player1.maxHealth,
    character: player1,
    isGrounded: true,
    facing: 'right',
    isAttacking: false,
    attackCooldown: 0,
    specialCooldown: 0,
    stunned: 0
  })

  const [fighter2, setFighter2] = useState<Fighter>({
    x: 600,
    y: GROUND_Y - 60,
    vx: 0,
    vy: 0,
    health: player2.health,
    maxHealth: player2.maxHealth,
    character: player2,
    isGrounded: true,
    facing: 'left',
    isAttacking: false,
    attackCooldown: 0,
    specialCooldown: 0,
    stunned: 0
  })

  const [particles, setParticles] = useState<Particle[]>([])
  const [gameTime, setGameTime] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const addParticle = useCallback((x: number, y: number, color: string, count: number = 5) => {
    const newParticles: Particle[] = []
    for (let i = 0; i < count; i++) {
      newParticles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10 - 2,
        life: 30,
        maxLife: 30,
        color,
        size: Math.random() * 4 + 2
      })
    }
    setParticles(prev => [...prev, ...newParticles])
  }, [])

  const checkCollision = useCallback((f1: Fighter, f2: Fighter): boolean => {
    const dx = f1.x - f2.x
    const dy = f1.y - f2.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    return distance < 80
  }, [])

  const dealDamage = useCallback((attacker: Fighter, defender: Fighter, damage: number) => {
    const newHealth = Math.max(0, defender.health - damage)
    
    if (defender === fighter1) {
      setFighter1(prev => ({ ...prev, health: newHealth, stunned: 20 }))
    } else {
      setFighter2(prev => ({ ...prev, health: newHealth, stunned: 20 }))
    }

    addParticle(defender.x, defender.y - 30, '#FF0000', 8)

    if (newHealth <= 0) {
      const result: GameResult = {
        winner: attacker.character,
        loser: defender.character,
        winMethod: 'Combat Victory'
      }
      setTimeout(() => onGameEnd(result), 1000)
    }
  }, [fighter1, addParticle, onGameEnd])

  const updateFighter = useCallback((fighter: Fighter, isPlayer1: boolean): Fighter => {
    if (isPaused) return fighter

    const newFighter = { ...fighter }

    // Reduce cooldowns and stun
    newFighter.attackCooldown = Math.max(0, newFighter.attackCooldown - 1)
    newFighter.specialCooldown = Math.max(0, newFighter.specialCooldown - 1)
    newFighter.stunned = Math.max(0, newFighter.stunned - 1)

    if (newFighter.stunned > 0) {
      // Apply physics while stunned
      newFighter.vy += GRAVITY
      newFighter.x += newFighter.vx
      newFighter.y += newFighter.vy
      newFighter.vx *= FRICTION

      if (newFighter.y >= GROUND_Y - 60) {
        newFighter.y = GROUND_Y - 60
        newFighter.vy = 0
        newFighter.isGrounded = true
      } else {
        newFighter.isGrounded = false
      }

      return newFighter
    }

    // Handle input for Player 1 (WASD)
    if (isPlayer1) {
      if (keysRef.current.has('a') || keysRef.current.has('A')) {
        newFighter.vx -= 1
        newFighter.facing = 'left'
      }
      if (keysRef.current.has('d') || keysRef.current.has('D')) {
        newFighter.vx += 1
        newFighter.facing = 'right'
      }
      if ((keysRef.current.has('w') || keysRef.current.has('W')) && newFighter.isGrounded) {
        newFighter.vy = -15
        newFighter.isGrounded = false
      }
      if ((keysRef.current.has('s') || keysRef.current.has('S')) && newFighter.attackCooldown === 0) {
        newFighter.isAttacking = true
        newFighter.attackCooldown = 30
      }
      if ((keysRef.current.has(' ')) && newFighter.specialCooldown === 0) {
        newFighter.specialCooldown = 120
        addParticle(newFighter.x, newFighter.y - 30, newFighter.character.color, 15)
      }
    } else {
      // Simple AI for Player 2
      const dx = fighter1.x - newFighter.x
      const distance = Math.abs(dx)

      if (distance > 100) {
        if (dx > 0) {
          newFighter.vx += 0.8
          newFighter.facing = 'right'
        } else {
          newFighter.vx -= 0.8
          newFighter.facing = 'left'
        }
      }

      if (distance < 120 && newFighter.attackCooldown === 0 && Math.random() < 0.1) {
        newFighter.isAttacking = true
        newFighter.attackCooldown = 30
      }

      if (Math.random() < 0.005 && newFighter.isGrounded) {
        newFighter.vy = -12
        newFighter.isGrounded = false
      }

      if (Math.random() < 0.01 && newFighter.specialCooldown === 0) {
        newFighter.specialCooldown = 120
        addParticle(newFighter.x, newFighter.y - 30, newFighter.character.color, 15)
      }
    }

    // Apply physics
    newFighter.vy += GRAVITY
    newFighter.x += newFighter.vx
    newFighter.y += newFighter.vy
    newFighter.vx *= FRICTION

    // Boundary checks
    newFighter.x = Math.max(50, Math.min(ARENA_WIDTH - 50, newFighter.x))

    if (newFighter.y >= GROUND_Y - 60) {
      newFighter.y = GROUND_Y - 60
      newFighter.vy = 0
      newFighter.isGrounded = true
    } else {
      newFighter.isGrounded = false
    }

    return newFighter
  }, [isPaused, fighter1.x, addParticle])

  const gameLoop = useCallback(() => {
    if (isPaused) return

    setGameTime(prev => prev + 1)

    setFighter1(prev => {
      const updated = updateFighter(prev, true)
      
      // Check for attacks
      if (updated.isAttacking && checkCollision(updated, fighter2)) {
        dealDamage(updated, fighter2, 15 + Math.random() * 10)
      }
      
      updated.isAttacking = false
      return updated
    })

    setFighter2(prev => {
      const updated = updateFighter(prev, false)
      
      // Check for attacks
      if (updated.isAttacking && checkCollision(updated, fighter1)) {
        dealDamage(updated, fighter1, 15 + Math.random() * 10)
      }
      
      updated.isAttacking = false
      return updated
    })

    // Update particles
    setParticles(prev => prev
      .map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        vy: p.vy + 0.2,
        life: p.life - 1
      }))
      .filter(p => p.life > 0)
    )
  }, [isPaused, updateFighter, checkCollision, dealDamage, fighter1, fighter2])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = '#1A1A2E'
    ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT)

    // Draw arena background
    const gradient = ctx.createLinearGradient(0, 0, 0, ARENA_HEIGHT)
    gradient.addColorStop(0, '#2D1B69')
    gradient.addColorStop(1, '#1A1A2E')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT)

    // Draw ground
    ctx.fillStyle = '#8B0000'
    ctx.fillRect(0, GROUND_Y, ARENA_WIDTH, ARENA_HEIGHT - GROUND_Y)

    // Draw arena decorations
    ctx.strokeStyle = '#FFD700'
    ctx.lineWidth = 3
    ctx.strokeRect(20, 20, ARENA_WIDTH - 40, ARENA_HEIGHT - 40)

    // Draw fighters
    const drawFighter = (fighter: Fighter) => {
      ctx.save()
      
      // Fighter body
      ctx.fillStyle = fighter.character.color
      ctx.beginPath()
      ctx.arc(fighter.x, fighter.y - 30, 25, 0, Math.PI * 2)
      ctx.fill()

      // Fighter glow effect
      if (fighter.isAttacking) {
        ctx.shadowColor = fighter.character.color
        ctx.shadowBlur = 20
        ctx.beginPath()
        ctx.arc(fighter.x, fighter.y - 30, 30, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Health bar
      const barWidth = 60
      const barHeight = 6
      const barX = fighter.x - barWidth / 2
      const barY = fighter.y - 70

      ctx.fillStyle = '#333'
      ctx.fillRect(barX, barY, barWidth, barHeight)
      
      const healthPercent = fighter.health / fighter.maxHealth
      ctx.fillStyle = healthPercent > 0.5 ? '#00FF00' : healthPercent > 0.25 ? '#FFFF00' : '#FF0000'
      ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight)

      // Character name
      ctx.fillStyle = '#FFD700'
      ctx.font = '12px Orbitron'
      ctx.textAlign = 'center'
      ctx.fillText(fighter.character.name, fighter.x, fighter.y - 80)

      // Special ability cooldown
      if (fighter.specialCooldown > 0) {
        ctx.fillStyle = '#8B0000'
        ctx.fillRect(barX, barY - 10, barWidth, 4)
        const cooldownPercent = 1 - (fighter.specialCooldown / 120)
        ctx.fillStyle = '#FFD700'
        ctx.fillRect(barX, barY - 10, barWidth * cooldownPercent, 4)
      }

      ctx.restore()
    }

    drawFighter(fighter1)
    drawFighter(fighter2)

    // Draw particles
    particles.forEach(particle => {
      ctx.save()
      const alpha = particle.life / particle.maxLife
      ctx.globalAlpha = alpha
      ctx.fillStyle = particle.color
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    })

    // Draw UI
    ctx.fillStyle = '#FFD700'
    ctx.font = 'bold 24px Orbitron'
    ctx.textAlign = 'center'
    ctx.fillText('MASTERS COMBAT ARENA', ARENA_WIDTH / 2, 50)

    // Draw timer
    const minutes = Math.floor(gameTime / 3600)
    const seconds = Math.floor((gameTime % 3600) / 60)
    ctx.font = '18px Orbitron'
    ctx.fillText(`${minutes}:${seconds.toString().padStart(2, '0')}`, ARENA_WIDTH / 2, 80)

  }, [fighter1, fighter2, particles, gameTime])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key)
      if (e.key === 'Escape') {
        setIsPaused(prev => !prev)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key)
    }

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
    }

    const handleMouseDown = () => {
      mouseRef.current.pressed = true
    }

    const handleMouseUp = () => {
      mouseRef.current.pressed = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  useEffect(() => {
    const animate = () => {
      gameLoop()
      draw()
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameLoop, draw])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={ARENA_WIDTH}
          height={ARENA_HEIGHT}
          className="border-2 border-accent rounded-lg shadow-2xl"
        />
        
        {isPaused && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-accent mb-4">PAUSED</h2>
              <p className="text-lg text-muted-foreground">Press ESC to resume</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-center space-y-2">
        <div className="flex gap-8 justify-center text-sm">
          <div>
            <span className="text-accent font-bold">Player 1:</span> WASD to move, S to attack, SPACE for special
          </div>
          <div>
            <span className="text-accent font-bold">ESC:</span> Pause game
          </div>
        </div>
        
        <Button
          onClick={() => setIsPaused(prev => !prev)}
          variant="outline"
          size="sm"
          className="mt-2"
        >
          {isPaused ? 'Resume' : 'Pause'}
        </Button>
      </div>
    </div>
  )
}
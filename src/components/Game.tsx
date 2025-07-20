import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Sword, Shield, Zap, RotateCcw, Play, Pause } from 'lucide-react'

// Game constants
const CANVAS_WIDTH = 1200
const CANVAS_HEIGHT = 600
const GRAVITY = 0.8
const FRICTION = 0.95
const JUMP_FORCE = -15
const MOVE_FORCE = 2

// Character types
type Character = {
  id: string
  name: string
  color: string
  health: number
  maxHealth: number
  power: number
  maxPower: number
  x: number
  y: number
  vx: number
  vy: number
  width: number
  height: number
  grounded: boolean
  facing: 'left' | 'right'
  attacking: boolean
  blocking: boolean
  weapon: string
}

// Game state type
type GameState = 'menu' | 'playing' | 'paused' | 'victory'

const Game = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const keysRef = useRef<Set<string>>(new Set())
  
  const [gameState, setGameState] = useState<GameState>('menu')
  const [winner, setWinner] = useState<string | null>(null)
  
  // Initialize characters
  const [characters, setCharacters] = useState<Character[]>([
    {
      id: 'heman',
      name: 'He-Man',
      color: '#FFD700',
      health: 100,
      maxHealth: 100,
      power: 0,
      maxPower: 100,
      x: 200,
      y: 400,
      vx: 0,
      vy: 0,
      width: 40,
      height: 60,
      grounded: false,
      facing: 'right',
      attacking: false,
      blocking: false,
      weapon: 'Power Sword'
    },
    {
      id: 'skeletor',
      name: 'Skeletor',
      color: '#8B0000',
      health: 100,
      maxHealth: 100,
      power: 0,
      maxPower: 100,
      x: 900,
      y: 400,
      vx: 0,
      vy: 0,
      width: 40,
      height: 60,
      grounded: false,
      facing: 'left',
      attacking: false,
      blocking: false,
      weapon: 'Havoc Staff'
    }
  ])

  // Physics and collision detection
  const updatePhysics = useCallback((chars: Character[]) => {
    return chars.map(char => {
      const newChar = { ...char }
      
      // Apply gravity
      newChar.vy += GRAVITY
      
      // Apply velocity
      newChar.x += newChar.vx
      newChar.y += newChar.vy
      
      // Apply friction
      newChar.vx *= FRICTION
      
      // Ground collision
      const groundY = CANVAS_HEIGHT - 100
      if (newChar.y + newChar.height > groundY) {
        newChar.y = groundY - newChar.height
        newChar.vy = 0
        newChar.grounded = true
      } else {
        newChar.grounded = false
      }
      
      // Wall collision
      if (newChar.x < 0) {
        newChar.x = 0
        newChar.vx = 0
      }
      if (newChar.x + newChar.width > CANVAS_WIDTH) {
        newChar.x = CANVAS_WIDTH - newChar.width
        newChar.vx = 0
      }
      
      return newChar
    })
  }, [])

  // Handle input
  const handleInput = useCallback(() => {
    setCharacters(prevChars => {
      const newChars = [...prevChars]
      const keys = keysRef.current
      
      // Player 1 (He-Man) controls: WASD
      const heman = newChars[0]
      if (keys.has('a') || keys.has('A')) {
        heman.vx -= MOVE_FORCE
        heman.facing = 'left'
      }
      if (keys.has('d') || keys.has('D')) {
        heman.vx += MOVE_FORCE
        heman.facing = 'right'
      }
      if ((keys.has('w') || keys.has('W')) && heman.grounded) {
        heman.vy = JUMP_FORCE
      }
      if (keys.has('s') || keys.has('S')) {
        heman.blocking = true
      } else {
        heman.blocking = false
      }
      if (keys.has(' ')) {
        heman.attacking = true
        if (heman.power >= 20) {
          heman.power -= 20
          // Special attack logic here
        }
      } else {
        heman.attacking = false
      }
      
      // Player 2 (Skeletor) controls: Arrow keys
      const skeletor = newChars[1]
      if (keys.has('ArrowLeft')) {
        skeletor.vx -= MOVE_FORCE
        skeletor.facing = 'left'
      }
      if (keys.has('ArrowRight')) {
        skeletor.vx += MOVE_FORCE
        skeletor.facing = 'right'
      }
      if (keys.has('ArrowUp') && skeletor.grounded) {
        skeletor.vy = JUMP_FORCE
      }
      if (keys.has('ArrowDown')) {
        skeletor.blocking = true
      } else {
        skeletor.blocking = false
      }
      if (keys.has('Enter')) {
        skeletor.attacking = true
        if (skeletor.power >= 20) {
          skeletor.power -= 20
          // Special attack logic here
        }
      } else {
        skeletor.attacking = false
      }
      
      // Regenerate power slowly
      heman.power = Math.min(heman.maxPower, heman.power + 0.5)
      skeletor.power = Math.min(skeletor.maxPower, skeletor.power + 0.5)
      
      return newChars
    })
  }, [])

  // Combat system
  const checkCombat = useCallback((chars: Character[]) => {
    const [heman, skeletor] = chars
    
    // Check if characters are close enough for combat
    const distance = Math.abs(heman.x - skeletor.x)
    const attackRange = 80
    
    if (distance < attackRange) {
      // He-Man attacking Skeletor
      if (heman.attacking && !skeletor.blocking) {
        skeletor.health -= 5
        skeletor.vx += heman.facing === 'right' ? 5 : -5
      }
      
      // Skeletor attacking He-Man
      if (skeletor.attacking && !heman.blocking) {
        heman.health -= 5
        heman.vx += skeletor.facing === 'right' ? 5 : -5
      }
    }
    
    return chars
  }, [])

  // Render game
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Clear canvas
    ctx.fillStyle = '#1A1A2E'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    
    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
    gradient.addColorStop(0, '#2D1B69')
    gradient.addColorStop(1, '#1A1A2E')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    
    // Draw ground
    ctx.fillStyle = '#4A4A4A'
    ctx.fillRect(0, CANVAS_HEIGHT - 100, CANVAS_WIDTH, 100)
    
    // Draw characters
    characters.forEach(char => {
      // Character body
      ctx.fillStyle = char.color
      ctx.fillRect(char.x, char.y, char.width, char.height)
      
      // Character outline
      ctx.strokeStyle = '#FFD700'
      ctx.lineWidth = 2
      ctx.strokeRect(char.x, char.y, char.width, char.height)
      
      // Weapon indicator
      if (char.attacking) {
        ctx.fillStyle = '#FFD700'
        const weaponX = char.facing === 'right' ? char.x + char.width : char.x - 20
        ctx.fillRect(weaponX, char.y + 10, 20, 5)
      }
      
      // Blocking indicator
      if (char.blocking) {
        ctx.fillStyle = '#87CEEB'
        const shieldX = char.facing === 'right' ? char.x - 10 : char.x + char.width
        ctx.fillRect(shieldX, char.y, 10, char.height)
      }
      
      // Name label
      ctx.fillStyle = '#FFD700'
      ctx.font = '16px Orbitron'
      ctx.textAlign = 'center'
      ctx.fillText(char.name, char.x + char.width / 2, char.y - 10)
    })
    
    // Draw particles/effects
    ctx.fillStyle = '#FFD700'
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * CANVAS_WIDTH
      const y = Math.random() * 100 + CANVAS_HEIGHT - 100
      ctx.fillRect(x, y, 2, 2)
    }
  }, [characters])

  // Game loop
  const gameLoop = useCallback(() => {
    if (gameState === 'playing') {
      handleInput()
      setCharacters(prevChars => {
        let newChars = updatePhysics(prevChars)
        newChars = checkCombat(newChars)
        
        // Check for victory
        if (newChars[0].health <= 0) {
          setWinner('Skeletor')
          setGameState('victory')
        } else if (newChars[1].health <= 0) {
          setWinner('He-Man')
          setGameState('victory')
        }
        
        return newChars
      })
    }
    
    render()
    animationRef.current = requestAnimationFrame(gameLoop)
  }, [gameState, handleInput, updatePhysics, checkCombat, render])

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key)
      if (e.key === 'Escape') {
        setGameState(prev => prev === 'playing' ? 'paused' : 'playing')
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key)
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Start game loop
  useEffect(() => {
    gameLoop()
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameLoop])

  const startGame = () => {
    setGameState('playing')
    setCharacters(prev => prev.map(char => ({
      ...char,
      health: char.maxHealth,
      power: 0,
      x: char.id === 'heman' ? 200 : 900,
      y: 400,
      vx: 0,
      vy: 0
    })))
    setWinner(null)
  }

  const resetGame = () => {
    setGameState('menu')
    setWinner(null)
  }

  return (
    <div className="w-full h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-gray-900 flex flex-col items-center justify-center p-4">
      {/* Game Title */}
      <div className="text-center mb-6">
        <h1 className="text-6xl font-bold text-yellow-400 glow-text mb-2">
          HE-MAN
        </h1>
        <h2 className="text-3xl font-bold text-red-600 glow-text">
          MASTERS COMBAT ARENA
        </h2>
      </div>

      {/* Game Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-4 border-yellow-400 rounded-lg shadow-2xl game-canvas"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
        
        {/* Game UI Overlay */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          {/* Player 1 UI */}
          <Card className="bg-black/80 border-yellow-400 p-4">
            <div className="text-yellow-400 font-bold mb-2">{characters[0].name}</div>
            <div className="w-48 h-4 bg-gray-700 rounded mb-2">
              <div 
                className="h-full health-bar rounded transition-all duration-300"
                style={{ width: `${(characters[0].health / characters[0].maxHealth) * 100}%` }}
              />
            </div>
            <div className="w-48 h-2 bg-gray-700 rounded">
              <div 
                className="h-full power-bar rounded transition-all duration-300"
                style={{ width: `${(characters[0].power / characters[0].maxPower) * 100}%` }}
              />
            </div>
            <div className="text-xs text-yellow-400 mt-2">
              WASD + Space
            </div>
          </Card>

          {/* Player 2 UI */}
          <Card className="bg-black/80 border-red-600 p-4">
            <div className="text-red-400 font-bold mb-2">{characters[1].name}</div>
            <div className="w-48 h-4 bg-gray-700 rounded mb-2">
              <div 
                className="h-full health-bar rounded transition-all duration-300"
                style={{ width: `${(characters[1].health / characters[1].maxHealth) * 100}%` }}
              />
            </div>
            <div className="w-48 h-2 bg-gray-700 rounded">
              <div 
                className="h-full power-bar rounded transition-all duration-300"
                style={{ width: `${(characters[1].power / characters[1].maxPower) * 100}%` }}
              />
            </div>
            <div className="text-xs text-red-400 mt-2">
              Arrows + Enter
            </div>
          </Card>
        </div>

        {/* Game State Overlays */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <Card className="bg-black/90 border-yellow-400 p-8 text-center">
              <h3 className="text-3xl font-bold text-yellow-400 mb-6">
                BY THE POWER OF GRAYSKULL!
              </h3>
              <p className="text-white mb-6">
                Choose your warrior and enter the arena
              </p>
              <Button 
                onClick={startGame}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-xl"
              >
                <Sword className="mr-2" />
                START BATTLE
              </Button>
              <div className="mt-6 text-sm text-gray-400">
                <p>Player 1: WASD + Space (Attack) + S (Block)</p>
                <p>Player 2: Arrow Keys + Enter (Attack) + Down (Block)</p>
              </div>
            </Card>
          </div>
        )}

        {gameState === 'paused' && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <Card className="bg-black/90 border-yellow-400 p-8 text-center">
              <h3 className="text-3xl font-bold text-yellow-400 mb-6">
                PAUSED
              </h3>
              <div className="space-x-4">
                <Button 
                  onClick={() => setGameState('playing')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="mr-2" />
                  Resume
                </Button>
                <Button 
                  onClick={resetGame}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <RotateCcw className="mr-2" />
                  Main Menu
                </Button>
              </div>
            </Card>
          </div>
        )}

        {gameState === 'victory' && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <Card className="bg-black/90 border-yellow-400 p-8 text-center">
              <h3 className="text-4xl font-bold text-yellow-400 mb-4 glow-text">
                {winner} WINS!
              </h3>
              <p className="text-white mb-6">
                {winner === 'He-Man' ? 'By the power of Grayskull!' : 'Evil triumphs this day!'}
              </p>
              <div className="space-x-4">
                <Button 
                  onClick={startGame}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <RotateCcw className="mr-2" />
                  Fight Again
                </Button>
                <Button 
                  onClick={resetGame}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Main Menu
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Controls Info */}
      <div className="mt-6 text-center text-yellow-400">
        <p className="text-sm">Press ESC to pause • Build power to unleash special attacks</p>
      </div>
    </div>
  )
}

export default Game
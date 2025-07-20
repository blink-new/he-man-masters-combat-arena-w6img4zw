import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Sword, Shield, Zap, RotateCcw, Play, Pause, Smartphone } from 'lucide-react'
import MobileControls from './MobileControls'

// Game constants
const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 400
const GRAVITY = 0.8
const FRICTION = 0.95
const JUMP_FORCE = -15
const MOVE_FORCE = 2

// Visual effects
type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

type ScreenShake = {
  intensity: number
  duration: number
  remaining: number
}

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
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileControls, setShowMobileControls] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const [screenShake, setScreenShake] = useState<ScreenShake>({ intensity: 0, duration: 0, remaining: 0 })
  const [comboCount, setComboCount] = useState(0)
  const [lastHitTime, setLastHitTime] = useState(0)
  
  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768
      setIsMobile(mobile)
      setShowMobileControls(mobile)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
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
      x: 150,
      y: 250,
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
      x: 600,
      y: 250,
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

  // Particle system functions
  const createParticles = useCallback((x: number, y: number, color: string, count: number = 5) => {
    const newParticles: Particle[] = []
    for (let i = 0; i < count; i++) {
      newParticles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10 - 2,
        life: 1,
        maxLife: 1,
        color,
        size: Math.random() * 4 + 2
      })
    }
    setParticles(prev => [...prev, ...newParticles])
  }, [])

  const createScreenShake = useCallback((intensity: number, duration: number) => {
    setScreenShake({ intensity, duration, remaining: duration })
  }, [])

  // Handle mobile input
  const handleMobileInput = useCallback((input: string, pressed: boolean) => {
    if (pressed) {
      keysRef.current.add(input)
    } else {
      keysRef.current.delete(input)
    }
    
    // Map mobile inputs to game actions
    if (input === 'attack') {
      if (pressed) {
        keysRef.current.add(' ')
      } else {
        keysRef.current.delete(' ')
      }
    }
  }, [])

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
      const groundY = CANVAS_HEIGHT - 80
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
      
      // Player 2 (Skeletor) - Simple AI
      const skeletor = newChars[1]
      const distance = Math.abs(heman.x - skeletor.x)
      
      // AI movement
      if (distance > 100) {
        if (heman.x > skeletor.x) {
          skeletor.vx += MOVE_FORCE * 0.8
          skeletor.facing = 'right'
        } else {
          skeletor.vx -= MOVE_FORCE * 0.8
          skeletor.facing = 'left'
        }
      }
      
      // AI jumping
      if (Math.random() < 0.01 && skeletor.grounded) {
        skeletor.vy = JUMP_FORCE
      }
      
      // AI attacking
      if (distance < 80 && Math.random() < 0.1) {
        skeletor.attacking = true
        if (skeletor.power >= 20) {
          skeletor.power -= 20
        }
      } else {
        skeletor.attacking = false
      }
      
      // AI blocking
      if (heman.attacking && distance < 100 && Math.random() < 0.3) {
        skeletor.blocking = true
      } else {
        skeletor.blocking = false
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
        const damage = heman.power >= 50 ? 15 : 8 // More damage with high power
        skeletor.health -= damage
        skeletor.vx += heman.facing === 'right' ? 8 : -8
        
        // Create hit effects
        createParticles(skeletor.x + skeletor.width/2, skeletor.y + skeletor.height/2, '#FF4444', 8)
        createScreenShake(5, 200)
        
        // Combo system
        const currentTime = Date.now()
        if (currentTime - lastHitTime < 1000) {
          setComboCount(prev => prev + 1)
        } else {
          setComboCount(1)
        }
        setLastHitTime(currentTime)
        
        // Haptic feedback for mobile
        if ('vibrate' in navigator && isMobile) {
          navigator.vibrate(damage > 10 ? 100 : 50)
        }
      }
      
      // Skeletor attacking He-Man
      if (skeletor.attacking && !heman.blocking) {
        const damage = skeletor.power >= 50 ? 15 : 8
        heman.health -= damage
        heman.vx += skeletor.facing === 'right' ? 8 : -8
        
        // Create hit effects
        createParticles(heman.x + heman.width/2, heman.y + heman.height/2, '#4444FF', 8)
        createScreenShake(5, 200)
        
        // Haptic feedback for mobile
        if ('vibrate' in navigator && isMobile) {
          navigator.vibrate(damage > 10 ? 100 : 50)
        }
      }
      
      // Blocking effects
      if ((heman.attacking && skeletor.blocking) || (skeletor.attacking && heman.blocking)) {
        const blockX = distance < 40 ? (heman.x + skeletor.x) / 2 : (heman.facing === 'right' ? skeletor.x : heman.x)
        createParticles(blockX, Math.min(heman.y, skeletor.y) + 30, '#FFD700', 6)
        createScreenShake(2, 100)
        
        if ('vibrate' in navigator && isMobile) {
          navigator.vibrate(30)
        }
      }
    }
    
    return chars
  }, [createParticles, createScreenShake, lastHitTime, isMobile])

  // Render game
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Apply screen shake
    let shakeX = 0, shakeY = 0
    if (screenShake.remaining > 0) {
      shakeX = (Math.random() - 0.5) * screenShake.intensity
      shakeY = (Math.random() - 0.5) * screenShake.intensity
      ctx.save()
      ctx.translate(shakeX, shakeY)
    }
    
    // Clear canvas
    ctx.fillStyle = '#1A1A2E'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    
    // Draw animated background gradient
    const time = Date.now() * 0.001
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
    gradient.addColorStop(0, `hsl(${240 + Math.sin(time) * 10}, 70%, ${20 + Math.sin(time * 0.5) * 5}%)`)
    gradient.addColorStop(1, '#1A1A2E')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    
    // Draw ground with texture
    ctx.fillStyle = '#4A4A4A'
    ctx.fillRect(0, CANVAS_HEIGHT - 80, CANVAS_WIDTH, 80)
    
    // Ground texture lines
    ctx.strokeStyle = '#666666'
    ctx.lineWidth = 1
    for (let i = 0; i < CANVAS_WIDTH; i += 40) {
      ctx.beginPath()
      ctx.moveTo(i, CANVAS_HEIGHT - 80)
      ctx.lineTo(i + 20, CANVAS_HEIGHT)
      ctx.stroke()
    }
    
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
      ctx.font = isMobile ? '12px Orbitron' : '16px Orbitron'
      ctx.textAlign = 'center'
      ctx.fillText(char.name, char.x + char.width / 2, char.y - 10)
    })
    
    // Draw particles
    particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife
      ctx.globalAlpha = alpha
      ctx.fillStyle = particle.color
      ctx.fillRect(particle.x - particle.size/2, particle.y - particle.size/2, particle.size, particle.size)
    })
    ctx.globalAlpha = 1
    
    // Draw combo counter
    if (comboCount > 1) {
      ctx.fillStyle = '#FFD700'
      ctx.font = isMobile ? '20px Orbitron' : '32px Orbitron'
      ctx.textAlign = 'center'
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 2
      ctx.strokeText(`${comboCount}x COMBO!`, CANVAS_WIDTH/2, 60)
      ctx.fillText(`${comboCount}x COMBO!`, CANVAS_WIDTH/2, 60)
    }
    
    // Draw background particles/effects
    ctx.fillStyle = '#FFD700'
    ctx.globalAlpha = 0.3
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * CANVAS_WIDTH
      const y = Math.random() * 60 + CANVAS_HEIGHT - 80
      ctx.fillRect(x, y, 2, 2)
    }
    ctx.globalAlpha = 1
    
    // Restore canvas if screen shake was applied
    if (screenShake.remaining > 0) {
      ctx.restore()
    }
  }, [characters, isMobile, particles, comboCount, screenShake.remaining, screenShake.intensity])

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
      
      // Update particles
      setParticles(prevParticles => 
        prevParticles
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vy: particle.vy + 0.2, // gravity
            life: particle.life - 0.02
          }))
          .filter(particle => particle.life > 0)
      )
      
      // Update screen shake
      setScreenShake(prev => ({
        ...prev,
        remaining: Math.max(0, prev.remaining - 16) // 60fps = ~16ms per frame
      }))
      
      // Reset combo if too much time has passed
      if (Date.now() - lastHitTime > 2000) {
        setComboCount(0)
      }
    }
    
    render()
    animationRef.current = requestAnimationFrame(gameLoop)
  }, [gameState, handleInput, updatePhysics, checkCombat, render, lastHitTime])

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
      x: char.id === 'heman' ? 150 : 600,
      y: 250,
      vx: 0,
      vy: 0
    })))
    setWinner(null)
    setParticles([])
    setScreenShake({ intensity: 0, duration: 0, remaining: 0 })
    setComboCount(0)
    setLastHitTime(0)
  }

  const resetGame = () => {
    setGameState('menu')
    setWinner(null)
  }

  const toggleMobileControls = () => {
    setShowMobileControls(!showMobileControls)
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-gray-900 flex flex-col items-center justify-center p-2 md:p-4 overflow-hidden">
      {/* Game Title */}
      <div className="text-center mb-2 md:mb-6">
        <h1 className={`${isMobile ? 'text-3xl' : 'text-6xl'} font-bold text-yellow-400 glow-text mb-1 md:mb-2`}>
          HE-MAN
        </h1>
        <h2 className={`${isMobile ? 'text-lg' : 'text-3xl'} font-bold text-red-600 glow-text`}>
          MASTERS COMBAT ARENA
        </h2>
      </div>

      {/* Mobile Controls Toggle */}
      {isMobile && (
        <div className="mb-2">
          <Button
            onClick={toggleMobileControls}
            variant="outline"
            size="sm"
            className="border-yellow-400 text-yellow-400"
          >
            <Smartphone className="w-4 h-4 mr-2" />
            {showMobileControls ? 'Hide' : 'Show'} Touch Controls
          </Button>
        </div>
      )}

      {/* Game Canvas */}
      <div className="relative w-full max-w-4xl">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-2 md:border-4 border-yellow-400 rounded-lg shadow-2xl game-canvas w-full h-auto"
          style={{ 
            maxWidth: '100%', 
            height: 'auto',
            touchAction: 'none' // Prevent scrolling on touch
          }}
        />
        
        {/* Game UI Overlay */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
          {/* Player 1 UI */}
          <Card className="bg-black/80 border-yellow-400 p-2 md:p-4">
            <div className="text-yellow-400 font-bold mb-1 text-xs md:text-sm">{characters[0].name}</div>
            <div className={`${isMobile ? 'w-24 h-2' : 'w-48 h-4'} bg-gray-700 rounded mb-1`}>
              <div 
                className="h-full health-bar rounded transition-all duration-300"
                style={{ width: `${(characters[0].health / characters[0].maxHealth) * 100}%` }}
              />
            </div>
            <div className={`${isMobile ? 'w-24 h-1' : 'w-48 h-2'} bg-gray-700 rounded`}>
              <div 
                className="h-full power-bar rounded transition-all duration-300"
                style={{ width: `${(characters[0].power / characters[0].maxPower) * 100}%` }}
              />
            </div>
            {comboCount > 1 && (
              <div className="text-yellow-400 font-bold text-xs md:text-sm mt-1">
                {comboCount}x COMBO!
              </div>
            )}
            {!isMobile && (
              <div className="text-xs text-yellow-400 mt-2">
                WASD + Space
              </div>
            )}
          </Card>

          {/* Player 2 UI */}
          <Card className="bg-black/80 border-red-600 p-2 md:p-4">
            <div className="text-red-400 font-bold mb-1 text-xs md:text-sm">{characters[1].name}</div>
            <div className={`${isMobile ? 'w-24 h-2' : 'w-48 h-4'} bg-gray-700 rounded mb-1`}>
              <div 
                className="h-full health-bar rounded transition-all duration-300"
                style={{ width: `${(characters[1].health / characters[1].maxHealth) * 100}%` }}
              />
            </div>
            <div className={`${isMobile ? 'w-24 h-1' : 'w-48 h-2'} bg-gray-700 rounded`}>
              <div 
                className="h-full power-bar rounded transition-all duration-300"
                style={{ width: `${(characters[1].power / characters[1].maxPower) * 100}%` }}
              />
            </div>
            {!isMobile && (
              <div className="text-xs text-red-400 mt-2">
                AI Controlled
              </div>
            )}
          </Card>
        </div>

        {/* Game State Overlays */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <Card className="bg-black/90 border-yellow-400 p-4 md:p-8 text-center mx-4">
              <h3 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-yellow-400 mb-4 md:mb-6`}>
                BY THE POWER OF GRAYSKULL!
              </h3>
              <p className="text-white mb-4 md:mb-6 text-sm md:text-base">
                Choose your warrior and enter the arena
              </p>
              <Button 
                onClick={startGame}
                className="bg-red-600 hover:bg-red-700 text-white px-4 md:px-8 py-2 md:py-3 text-lg md:text-xl"
              >
                <Sword className="mr-2" />
                START BATTLE
              </Button>
              {!isMobile && (
                <div className="mt-6 text-sm text-gray-400">
                  <p>Player 1: WASD + Space (Attack) + S (Block)</p>
                  <p>Player 2: AI Controlled</p>
                </div>
              )}
              {isMobile && (
                <div className="mt-4 text-xs text-gray-400">
                  <p>Use touch controls to fight!</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {gameState === 'paused' && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <Card className="bg-black/90 border-yellow-400 p-4 md:p-8 text-center mx-4">
              <h3 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-yellow-400 mb-4 md:mb-6`}>
                PAUSED
              </h3>
              <div className="space-x-2 md:space-x-4">
                <Button 
                  onClick={() => setGameState('playing')}
                  className="bg-green-600 hover:bg-green-700"
                  size={isMobile ? 'sm' : 'default'}
                >
                  <Play className="mr-2" />
                  Resume
                </Button>
                <Button 
                  onClick={resetGame}
                  className="bg-red-600 hover:bg-red-700"
                  size={isMobile ? 'sm' : 'default'}
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
            <Card className="bg-black/90 border-yellow-400 p-4 md:p-8 text-center mx-4">
              <h3 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-yellow-400 mb-4 glow-text`}>
                {winner} WINS!
              </h3>
              <p className="text-white mb-4 md:mb-6 text-sm md:text-base">
                {winner === 'He-Man' ? 'By the power of Grayskull!' : 'Evil triumphs this day!'}
              </p>
              <div className="space-x-2 md:space-x-4">
                <Button 
                  onClick={startGame}
                  className="bg-green-600 hover:bg-green-700"
                  size={isMobile ? 'sm' : 'default'}
                >
                  <RotateCcw className="mr-2" />
                  Fight Again
                </Button>
                <Button 
                  onClick={resetGame}
                  className="bg-red-600 hover:bg-red-700"
                  size={isMobile ? 'sm' : 'default'}
                >
                  Main Menu
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Mobile Touch Controls */}
      {showMobileControls && gameState === 'playing' && (
        <MobileControls onInput={handleMobileInput} player={1} />
      )}

      {/* Controls Info */}
      {!isMobile && (
        <div className="mt-6 text-center text-yellow-400">
          <p className="text-sm">Press ESC to pause • Build power to unleash special attacks</p>
        </div>
      )}
    </div>
  )
}

export default Game
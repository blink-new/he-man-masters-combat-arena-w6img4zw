import { useEffect, useRef, useState } from 'react'
import { Button } from './ui/button'
import { Sword, Shield, Zap, ArrowUp, ArrowLeft, ArrowRight, ArrowDown } from 'lucide-react'

interface MobileControlsProps {
  onInput: (input: string, pressed: boolean) => void
  player: 1 | 2
}

const MobileControls = ({ onInput, player }: MobileControlsProps) => {
  const [pressedButtons, setPressedButtons] = useState<Set<string>>(new Set())

  const handleButtonPress = (input: string, pressed: boolean) => {
    setPressedButtons(prev => {
      const newSet = new Set(prev)
      if (pressed) {
        newSet.add(input)
        // Add haptic feedback for mobile devices
        if ('vibrate' in navigator && pressed) {
          if (input === 'attack' || input === ' ') {
            navigator.vibrate(50) // Strong vibration for attacks
          } else {
            navigator.vibrate(20) // Light vibration for movement
          }
        }
      } else {
        newSet.delete(input)
      }
      return newSet
    })
    onInput(input, pressed)
  }

  const handleTouchStart = (input: string) => (e: React.TouchEvent) => {
    e.preventDefault()
    handleButtonPress(input, true)
  }

  const handleTouchEnd = (input: string) => (e: React.TouchEvent) => {
    e.preventDefault()
    handleButtonPress(input, false)
  }

  const isPressed = (input: string) => pressedButtons.has(input)

  if (player === 1) {
    return (
      <div className="fixed bottom-4 left-4 right-4 flex justify-between items-end z-50">
        {/* Movement Controls - Left Side */}
        <div className="flex flex-col items-center space-y-2">
          <Button
            className={`w-16 h-16 rounded-full touch-button ${isPressed('w') ? 'bg-yellow-500' : 'bg-gray-700'} border-2 border-yellow-400 text-white`}
            onTouchStart={handleTouchStart('w')}
            onTouchEnd={handleTouchEnd('w')}
            onMouseDown={() => handleButtonPress('w', true)}
            onMouseUp={() => handleButtonPress('w', false)}
            onMouseLeave={() => handleButtonPress('w', false)}
          >
            <ArrowUp className="w-6 h-6" />
          </Button>
          <div className="flex space-x-2">
            <Button
              className={`w-16 h-16 rounded-full touch-button ${isPressed('a') ? 'bg-yellow-500' : 'bg-gray-700'} border-2 border-yellow-400 text-white`}
              onTouchStart={handleTouchStart('a')}
              onTouchEnd={handleTouchEnd('a')}
              onMouseDown={() => handleButtonPress('a', true)}
              onMouseUp={() => handleButtonPress('a', false)}
              onMouseLeave={() => handleButtonPress('a', false)}
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <Button
              className={`w-16 h-16 rounded-full touch-button ${isPressed('d') ? 'bg-yellow-500' : 'bg-gray-700'} border-2 border-yellow-400 text-white`}
              onTouchStart={handleTouchStart('d')}
              onTouchEnd={handleTouchEnd('d')}
              onMouseDown={() => handleButtonPress('d', true)}
              onMouseUp={() => handleButtonPress('d', false)}
              onMouseLeave={() => handleButtonPress('d', false)}
            >
              <ArrowRight className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Action Controls - Right Side */}
        <div className="flex flex-col space-y-2">
          <Button
            className={`w-16 h-16 rounded-full touch-button ${isPressed(' ') ? 'bg-red-500' : 'bg-gray-700'} border-2 border-red-400 text-white`}
            onTouchStart={handleTouchStart(' ')}
            onTouchEnd={handleTouchEnd(' ')}
            onMouseDown={() => handleButtonPress(' ', true)}
            onMouseUp={() => handleButtonPress(' ', false)}
            onMouseLeave={() => handleButtonPress(' ', false)}
          >
            <Zap className="w-6 h-6" />
          </Button>
          <div className="flex space-x-2">
            <Button
              className={`w-16 h-16 rounded-full touch-button ${isPressed('s') ? 'bg-blue-500' : 'bg-gray-700'} border-2 border-blue-400 text-white`}
              onTouchStart={handleTouchStart('s')}
              onTouchEnd={handleTouchEnd('s')}
              onMouseDown={() => handleButtonPress('s', true)}
              onMouseUp={() => handleButtonPress('s', false)}
              onMouseLeave={() => handleButtonPress('s', false)}
            >
              <Shield className="w-6 h-6" />
            </Button>
            <Button
              className={`w-16 h-16 rounded-full touch-button ${isPressed('attack') ? 'bg-red-500' : 'bg-gray-700'} border-2 border-red-400 text-white`}
              onTouchStart={handleTouchStart('attack')}
              onTouchEnd={handleTouchEnd('attack')}
              onMouseDown={() => handleButtonPress('attack', true)}
              onMouseUp={() => handleButtonPress('attack', false)}
              onMouseLeave={() => handleButtonPress('attack', false)}
            >
              <Sword className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Player 2 controls (simplified for AI or second player)
  return (
    <div className="fixed top-4 left-4 right-4 flex justify-between items-start z-50">
      <div className="text-yellow-400 text-sm bg-black/80 px-3 py-2 rounded">
        Player 2: AI Controlled
      </div>
    </div>
  )
}

export default MobileControls
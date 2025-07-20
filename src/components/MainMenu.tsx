import { Button } from './ui/button'

interface MainMenuProps {
  onStartGame: () => void
}

export default function MainMenu({ onStartGame }: MainMenuProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background via-background/90 to-primary/20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 border-2 border-accent rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 border-2 border-primary rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-40 h-40 border-2 border-accent rounded-full animate-pulse delay-2000"></div>
      </div>

      <div className="text-center z-10 space-y-8 max-w-4xl mx-auto px-4">
        {/* Main Title */}
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary animate-pulse">
            HE-MAN
          </h1>
          <h2 className="text-3xl md:text-5xl font-bold text-accent">
            MASTERS COMBAT ARENA
          </h2>
          <div className="w-32 h-1 bg-gradient-to-r from-primary to-accent mx-auto"></div>
        </div>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Enter the ultimate battle arena where the forces of good clash with the powers of evil. 
          Choose your champion and fight for the honor of Grayskull!
        </p>

        {/* Action Buttons */}
        <div className="space-y-4 pt-8">
          <Button
            onClick={onStartGame}
            size="lg"
            className="text-xl px-12 py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            BY THE POWER OF GRAYSKULL!
          </Button>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-4 border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-300"
            >
              HOW TO PLAY
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-4 border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-300"
            >
              SETTINGS
            </Button>
          </div>
        </div>

        {/* Game Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-center">
          <div className="space-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full mx-auto flex items-center justify-center">
              <span className="text-2xl font-bold">⚔️</span>
            </div>
            <h3 className="text-lg font-bold text-accent">PHYSICS COMBAT</h3>
            <p className="text-sm text-muted-foreground">Realistic ragdoll physics and weapon-based fighting</p>
          </div>
          
          <div className="space-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full mx-auto flex items-center justify-center">
              <span className="text-2xl font-bold">🏰</span>
            </div>
            <h3 className="text-lg font-bold text-accent">EPIC ARENAS</h3>
            <p className="text-sm text-muted-foreground">Battle in Castle Grayskull and Snake Mountain</p>
          </div>
          
          <div className="space-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full mx-auto flex items-center justify-center">
              <span className="text-2xl font-bold">⚡</span>
            </div>
            <h3 className="text-lg font-bold text-accent">SPECIAL POWERS</h3>
            <p className="text-sm text-muted-foreground">Unique abilities for each Master of the Universe</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-sm text-muted-foreground">
          Press <span className="text-accent font-bold">SPACE</span> to start • 
          Use <span className="text-accent font-bold">WASD</span> to move • 
          <span className="text-accent font-bold">MOUSE</span> to attack
        </p>
      </div>
    </div>
  )
}
import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Character } from '../App'

interface CharacterSelectProps {
  onCharacterSelect: (player1: Character, player2: Character) => void
}

const characters: Character[] = [
  {
    id: 'he-man',
    name: 'He-Man',
    health: 100,
    maxHealth: 100,
    power: 90,
    speed: 75,
    weapon: 'Power Sword',
    specialAbility: 'Power of Grayskull',
    color: '#FFD700'
  },
  {
    id: 'skeletor',
    name: 'Skeletor',
    health: 100,
    maxHealth: 100,
    power: 85,
    speed: 80,
    weapon: 'Havoc Staff',
    specialAbility: 'Dark Magic',
    color: '#8B0000'
  },
  {
    id: 'beast-man',
    name: 'Beast Man',
    health: 100,
    maxHealth: 100,
    power: 80,
    speed: 85,
    weapon: 'Whip',
    specialAbility: 'Animal Control',
    color: '#8B4513'
  },
  {
    id: 'teela',
    name: 'Teela',
    health: 100,
    maxHealth: 100,
    power: 75,
    speed: 90,
    weapon: 'Staff',
    specialAbility: 'Sorceress Power',
    color: '#FF6347'
  },
  {
    id: 'man-at-arms',
    name: 'Man-At-Arms',
    health: 100,
    maxHealth: 100,
    power: 85,
    speed: 70,
    weapon: 'Mace',
    specialAbility: 'Tech Mastery',
    color: '#4682B4'
  },
  {
    id: 'evil-lyn',
    name: 'Evil-Lyn',
    health: 100,
    maxHealth: 100,
    power: 80,
    speed: 85,
    weapon: 'Crystal Ball',
    specialAbility: 'Teleportation',
    color: '#9932CC'
  }
]

export default function CharacterSelect({ onCharacterSelect }: CharacterSelectProps) {
  const [selectedPlayer1, setSelectedPlayer1] = useState<Character | null>(null)
  const [selectedPlayer2, setSelectedPlayer2] = useState<Character | null>(null)

  const handleCharacterClick = (character: Character) => {
    if (!selectedPlayer1) {
      setSelectedPlayer1(character)
    } else if (!selectedPlayer2 && character.id !== selectedPlayer1.id) {
      setSelectedPlayer2(character)
    } else if (character.id === selectedPlayer1.id) {
      setSelectedPlayer1(null)
      if (selectedPlayer2) {
        setSelectedPlayer1(selectedPlayer2)
        setSelectedPlayer2(null)
      }
    } else if (selectedPlayer2 && character.id === selectedPlayer2.id) {
      setSelectedPlayer2(null)
    }
  }

  const handleStartBattle = () => {
    if (selectedPlayer1 && selectedPlayer2) {
      onCharacterSelect(selectedPlayer1, selectedPlayer2)
    }
  }

  const getCharacterStatus = (character: Character) => {
    if (selectedPlayer1?.id === character.id) return 'player1'
    if (selectedPlayer2?.id === character.id) return 'player2'
    return 'available'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-4">
            CHOOSE YOUR CHAMPION
          </h1>
          <p className="text-xl text-muted-foreground">
            Select two warriors to battle for the fate of Eternia
          </p>
        </div>

        {/* Player Selection Status */}
        <div className="flex justify-center gap-8 mb-8">
          <div className="text-center">
            <h3 className="text-xl font-bold text-accent mb-2">PLAYER 1</h3>
            <div className="w-32 h-32 border-2 border-accent rounded-lg flex items-center justify-center bg-card">
              {selectedPlayer1 ? (
                <div className="text-center">
                  <div className="text-2xl mb-1" style={{ color: selectedPlayer1.color }}>
                    {selectedPlayer1.name === 'He-Man' ? '⚔️' : 
                     selectedPlayer1.name === 'Skeletor' ? '💀' :
                     selectedPlayer1.name === 'Beast Man' ? '🐺' :
                     selectedPlayer1.name === 'Teela' ? '🛡️' :
                     selectedPlayer1.name === 'Man-At-Arms' ? '🔨' : '🔮'}
                  </div>
                  <div className="text-xs font-bold">{selectedPlayer1.name}</div>
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">Select Fighter</div>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <span className="text-4xl font-bold text-primary">VS</span>
          </div>

          <div className="text-center">
            <h3 className="text-xl font-bold text-accent mb-2">PLAYER 2</h3>
            <div className="w-32 h-32 border-2 border-accent rounded-lg flex items-center justify-center bg-card">
              {selectedPlayer2 ? (
                <div className="text-center">
                  <div className="text-2xl mb-1" style={{ color: selectedPlayer2.color }}>
                    {selectedPlayer2.name === 'He-Man' ? '⚔️' : 
                     selectedPlayer2.name === 'Skeletor' ? '💀' :
                     selectedPlayer2.name === 'Beast Man' ? '🐺' :
                     selectedPlayer2.name === 'Teela' ? '🛡️' :
                     selectedPlayer2.name === 'Man-At-Arms' ? '🔨' : '🔮'}
                  </div>
                  <div className="text-xs font-bold">{selectedPlayer2.name}</div>
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">Select Fighter</div>
              )}
            </div>
          </div>
        </div>

        {/* Character Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {characters.map((character) => {
            const status = getCharacterStatus(character)
            return (
              <Card
                key={character.id}
                className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  status === 'player1' ? 'ring-2 ring-accent bg-accent/10' :
                  status === 'player2' ? 'ring-2 ring-primary bg-primary/10' :
                  'hover:ring-2 hover:ring-muted-foreground/50'
                }`}
                onClick={() => handleCharacterClick(character)}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-4xl mb-2" style={{ color: character.color }}>
                    {character.name === 'He-Man' ? '⚔️' : 
                     character.name === 'Skeletor' ? '💀' :
                     character.name === 'Beast Man' ? '🐺' :
                     character.name === 'Teela' ? '🛡️' :
                     character.name === 'Man-At-Arms' ? '🔨' : '🔮'}
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: character.color }}>
                    {character.name}
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Power:</span>
                      <span className="text-accent">{character.power}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Speed:</span>
                      <span className="text-accent">{character.speed}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {character.weapon}
                    </div>
                    <div className="text-xs text-primary">
                      {character.specialAbility}
                    </div>
                  </div>
                  {status !== 'available' && (
                    <div className="mt-2 text-xs font-bold">
                      {status === 'player1' ? 'PLAYER 1' : 'PLAYER 2'}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Start Battle Button */}
        <div className="text-center">
          <Button
            onClick={handleStartBattle}
            disabled={!selectedPlayer1 || !selectedPlayer2}
            size="lg"
            className="text-xl px-12 py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {!selectedPlayer1 || !selectedPlayer2 ? 'SELECT TWO FIGHTERS' : 'ENTER THE ARENA!'}
          </Button>
        </div>
      </div>
    </div>
  )
}
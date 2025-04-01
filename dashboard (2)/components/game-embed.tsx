"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Gamepad2 } from "lucide-react"

interface Game {
  id: string
  name: string
  url: string
  thumbnail: string
}

const SAMPLE_GAMES: Game[] = [
  {
    id: "1",
    name: "2048",
    url: "https://play2048.co/",
    thumbnail: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "2",
    name: "Wordle",
    url: "https://www.nytimes.com/games/wordle/index.html",
    thumbnail: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "3",
    name: "Chess",
    url: "https://www.chess.com/play/online",
    thumbnail: "/placeholder.svg?height=100&width=100",
  },
]

export default function GameEmbed() {
  const [games, setGames] = useState<Game[]>(SAMPLE_GAMES)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [customUrl, setCustomUrl] = useState("")
  const [customName, setCustomName] = useState("")

  // Load games from localStorage on initial render
  useEffect(() => {
    const savedGames = localStorage.getItem("dashboard_games")
    if (savedGames) {
      try {
        setGames(JSON.parse(savedGames))
      } catch (e) {
        console.error("Failed to parse saved games", e)
      }
    }
  }, [])

  // Save games to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("dashboard_games", JSON.stringify(games))
  }, [games])

  const addCustomGame = () => {
    if (!customUrl.trim() || !customName.trim()) return

    try {
      // Basic URL validation
      new URL(customUrl)

      const newGame: Game = {
        id: Date.now().toString(),
        name: customName,
        url: customUrl,
        thumbnail: "/placeholder.svg?height=100&width=100",
      }

      setGames([...games, newGame])
      setCustomUrl("")
      setCustomName("")
    } catch (err) {
      alert("Please enter a valid URL")
    }
  }

  return (
    <div className="flex h-full flex-col">
      <Tabs defaultValue="browse" className="flex-1">
        <TabsList className="mb-4">
          <TabsTrigger value="browse">Browse Games</TabsTrigger>
          <TabsTrigger value="play">Play Game</TabsTrigger>
          <TabsTrigger value="add">Add Game</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="h-full">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {games.map((game) => (
              <Card
                key={game.id}
                className="cursor-pointer overflow-hidden transition-all hover:shadow-md"
                onClick={() => setSelectedGame(game)}
              >
                <CardContent className="p-0">
                  <div className="aspect-video bg-gray-100">
                    <img
                      src={game.thumbnail || "/placeholder.svg"}
                      alt={game.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium">{game.name}</h3>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="play" className="h-full">
          {selectedGame ? (
            <div className="flex h-full flex-col">
              <div className="mb-2">
                <h3 className="text-lg font-medium">{selectedGame.name}</h3>
              </div>
              <div className="flex-1 overflow-hidden rounded border">
                <iframe
                  src={selectedGame.url}
                  className="h-full w-full"
                  sandbox="allow-same-origin allow-scripts allow-forms"
                  referrerPolicy="no-referrer"
                  title={selectedGame.name}
                />
              </div>
            </div>
          ) : (
            <Card className="flex h-full flex-col items-center justify-center p-6">
              <Gamepad2 className="mb-4 h-16 w-16 text-gray-300" />
              <p className="text-center text-gray-500">Select a game from the Browse tab to play</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="add" className="h-full">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Game Name</label>
                  <Input
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Enter game name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Game URL</label>
                  <Input
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://example.com/game"
                  />
                </div>

                <Button onClick={addCustomGame} className="w-full">
                  Add Game
                </Button>

                <p className="text-xs text-gray-500">Note: Some games may not work due to embedding restrictions</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Play, Pause, RotateCcw, Plus, Bell, Trash2, Volume2, VolumeX } from "lucide-react"

interface Timer {
  id: string
  name: string
  duration: number // in seconds
  remaining: number // in seconds
  isRunning: boolean
  createdAt: number
}

export default function CountdownTimer() {
  const [timers, setTimers] = useState<Timer[]>([])
  const [activeTimer, setActiveTimer] = useState<Timer | null>(null)
  const [name, setName] = useState("")
  const [hours, setHours] = useState("")
  const [minutes, setMinutes] = useState("")
  const [seconds, setSeconds] = useState("")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load timers from localStorage on initial render
  useEffect(() => {
    const savedTimers = localStorage.getItem("dashboard_timers")
    if (savedTimers) {
      try {
        const parsedTimers = JSON.parse(savedTimers)
        setTimers(parsedTimers)
      } catch (e) {
        console.error("Failed to parse saved timers", e)
      }
    }

    // Initialize audio
    audioRef.current = new Audio("/alarm.mp3")
    audioRef.current.loop = true

    return () => {
      // Clean up interval on unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      // Clean up audio
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Save timers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("dashboard_timers", JSON.stringify(timers))
  }, [timers])

  // Timer tick effect
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      setTimers((prevTimers) => {
        let timerCompleted = false

        const updatedTimers = prevTimers.map((timer) => {
          if (timer.isRunning) {
            const newRemaining = Math.max(0, timer.remaining - 1)

            // Check if timer just completed
            if (timer.remaining > 0 && newRemaining === 0) {
              timerCompleted = true
            }

            return {
              ...timer,
              remaining: newRemaining,
              isRunning: newRemaining > 0 ? timer.isRunning : false,
            }
          }
          return timer
        })

        // Play sound if a timer just completed
        if (timerCompleted && soundEnabled && audioRef.current) {
          audioRef.current.currentTime = 0
          audioRef.current.play().catch((e) => console.error("Failed to play alarm sound:", e))
        }

        return updatedTimers
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [soundEnabled])

  const createNewTimer = () => {
    const h = Number.parseInt(hours) || 0
    const m = Number.parseInt(minutes) || 0
    const s = Number.parseInt(seconds) || 0

    if (h === 0 && m === 0 && s === 0) return

    const totalSeconds = h * 3600 + m * 60 + s

    const newTimer: Timer = {
      id: Date.now().toString(),
      name: name || `Timer ${timers.length + 1}`,
      duration: totalSeconds,
      remaining: totalSeconds,
      isRunning: false,
      createdAt: Date.now(),
    }

    setTimers([...timers, newTimer])
    setActiveTimer(newTimer)
    resetForm()
  }

  const resetForm = () => {
    setName("")
    setHours("")
    setMinutes("")
    setSeconds("")
  }

  const toggleTimer = (id: string) => {
    setTimers(
      timers.map((timer) => {
        if (timer.id === id) {
          return {
            ...timer,
            isRunning: !timer.isRunning,
          }
        }
        return timer
      }),
    )
  }

  const resetTimer = (id: string) => {
    setTimers(
      timers.map((timer) => {
        if (timer.id === id) {
          return {
            ...timer,
            remaining: timer.duration,
            isRunning: false,
          }
        }
        return timer
      }),
    )

    // Stop alarm if it's playing
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  const deleteTimer = (id: string) => {
    setTimers(timers.filter((timer) => timer.id !== id))
    if (activeTimer?.id === id) {
      setActiveTimer(null)
    }
  }

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0"),
    ].join(":")
  }

  const stopAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  return (
    <div className="flex h-full flex-col">
      <Tabs defaultValue="timers" className="flex-1">
        <div className="mb-4 flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="timers">Timers</TabsTrigger>
            <TabsTrigger value="create">Create Timer</TabsTrigger>
          </TabsList>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? "Mute alarm sound" : "Enable alarm sound"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
        </div>

        <TabsContent value="timers" className="h-[calc(100%-48px)]">
          {timers.length === 0 ? (
            <Card className="flex h-full flex-col items-center justify-center p-6">
              <Clock className="mb-4 h-16 w-16 text-gray-300" />
              <p className="text-center text-gray-500">No timers yet. Create a new timer to get started!</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => document.querySelector('[data-value="create"]')?.click()}
              >
                Create Timer
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {timers.map((timer) => {
                const isCompleted = timer.remaining === 0
                return (
                  <Card
                    key={timer.id}
                    className={`overflow-hidden transition-all ${
                      isCompleted ? "border-red-500 bg-red-50 dark:bg-red-950" : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{timer.name}</h3>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteTimer(timer.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="my-4 text-center">
                        <span className={`text-4xl font-bold ${isCompleted ? "text-red-600 dark:text-red-400" : ""}`}>
                          {formatTime(timer.remaining)}
                        </span>
                      </div>

                      <div className="flex justify-center space-x-2">
                        {isCompleted ? (
                          <Button onClick={stopAlarm}>
                            <Bell className="mr-2 h-4 w-4" />
                            Stop Alarm
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant={timer.isRunning ? "outline" : "default"}
                              onClick={() => toggleTimer(timer.id)}
                            >
                              {timer.isRunning ? (
                                <>
                                  <Pause className="mr-2 h-4 w-4" />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <Play className="mr-2 h-4 w-4" />
                                  Start
                                </>
                              )}
                            </Button>
                            <Button variant="outline" onClick={() => resetTimer(timer.id)}>
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Reset
                            </Button>
                          </>
                        )}
                      </div>

                      <div className="mt-2 text-xs text-gray-500">Total: {formatTime(timer.duration)}</div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="h-[calc(100%-48px)]">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Timer Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter timer name" />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Duration</label>
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <label className="mb-1 block text-xs text-gray-500">Hours</label>
                      <Input
                        type="number"
                        min="0"
                        max="23"
                        value={hours}
                        onChange={(e) => setHours(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="mb-1 block text-xs text-gray-500">Minutes</label>
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        value={minutes}
                        onChange={(e) => setMinutes(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="mb-1 block text-xs text-gray-500">Seconds</label>
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        value={seconds}
                        onChange={(e) => setSeconds(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={createNewTimer} className="w-full" disabled={!hours && !minutes && !seconds}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Timer
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


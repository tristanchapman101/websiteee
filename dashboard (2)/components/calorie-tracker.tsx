"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Plus, Trash2, Search, Apple, Settings } from "lucide-react"

// Common food database with calorie information
const FOOD_DATABASE = [
  { name: "Apple", calories: 95, category: "Fruit" },
  { name: "Banana", calories: 105, category: "Fruit" },
  { name: "Orange", calories: 45, category: "Fruit" },
  { name: "Chicken Breast (100g)", calories: 165, category: "Protein" },
  { name: "Salmon (100g)", calories: 208, category: "Protein" },
  { name: "Egg", calories: 78, category: "Protein" },
  { name: "White Rice (100g, cooked)", calories: 130, category: "Carbs" },
  { name: "Potato (medium)", calories: 161, category: "Carbs" },
  { name: "Bread (1 slice)", calories: 79, category: "Carbs" },
  { name: "Pasta (100g, cooked)", calories: 131, category: "Carbs" },
  { name: "Milk (1 cup)", calories: 103, category: "Dairy" },
  { name: "Cheese (30g)", calories: 110, category: "Dairy" },
  { name: "Yogurt (1 cup)", calories: 154, category: "Dairy" },
  { name: "Olive Oil (1 tbsp)", calories: 119, category: "Fats" },
  { name: "Avocado (half)", calories: 161, category: "Fats" },
  { name: "Almonds (1/4 cup)", calories: 207, category: "Fats" },
  { name: "Chocolate Bar (50g)", calories: 270, category: "Sweets" },
  { name: "Ice Cream (1/2 cup)", calories: 137, category: "Sweets" },
  { name: "Soda (12 oz)", calories: 140, category: "Beverages" },
  { name: "Orange Juice (1 cup)", calories: 112, category: "Beverages" },
]

interface Food {
  id: string
  name: string
  calories: number
  category: string
  timestamp: number
}

interface DailyLog {
  date: string
  foods: Food[]
  calorieGoal: number
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#FF6B6B", "#6B8E23", "#483D8B"]

export default function CalorieTracker() {
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [calorieGoal, setCalorieGoal] = useState<number>(2000)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [searchResults, setSearchResults] = useState<typeof FOOD_DATABASE>([])
  const [customFoodName, setCustomFoodName] = useState<string>("")
  const [customFoodCalories, setCustomFoodCalories] = useState<string>("")
  const [customFoodCategory, setCustomFoodCategory] = useState<string>("Other")

  // Load logs from localStorage on initial render
  useEffect(() => {
    const savedLogs = localStorage.getItem("dashboard_calorie_logs")
    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs))
      } catch (e) {
        console.error("Failed to parse saved logs", e)
      }
    }

    const savedGoal = localStorage.getItem("dashboard_calorie_goal")
    if (savedGoal) {
      try {
        setCalorieGoal(Number.parseInt(savedGoal, 10))
      } catch (e) {
        console.error("Failed to parse saved goal", e)
      }
    }
  }, [])

  // Save logs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("dashboard_calorie_logs", JSON.stringify(logs))
  }, [logs])

  // Save calorie goal to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("dashboard_calorie_goal", calorieGoal.toString())
  }, [calorieGoal])

  // Update search results when search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([])
      return
    }

    const results = FOOD_DATABASE.filter((food) => food.name.toLowerCase().includes(searchTerm.toLowerCase()))

    setSearchResults(results)
  }, [searchTerm])

  // Get the current day's log
  const getCurrentDayLog = (): DailyLog => {
    const existingLog = logs.find((log) => log.date === currentDate)

    if (existingLog) {
      return existingLog
    }

    // Create a new log for the current day
    const newLog: DailyLog = {
      date: currentDate,
      foods: [],
      calorieGoal,
    }

    setLogs([...logs, newLog])
    return newLog
  }

  // Add a food item to the current day's log
  const addFood = (name: string, calories: number, category: string) => {
    const currentLog = getCurrentDayLog()

    const newFood: Food = {
      id: Date.now().toString(),
      name,
      calories,
      category,
      timestamp: Date.now(),
    }

    const updatedFoods = [...currentLog.foods, newFood]

    setLogs(logs.map((log) => (log.date === currentDate ? { ...log, foods: updatedFoods } : log)))

    setSearchTerm("")
    setCustomFoodName("")
    setCustomFoodCalories("")
  }

  // Remove a food item from the current day's log
  const removeFood = (id: string) => {
    const currentLog = getCurrentDayLog()

    const updatedFoods = currentLog.foods.filter((food) => food.id !== id)

    setLogs(logs.map((log) => (log.date === currentDate ? { ...log, foods: updatedFoods } : log)))
  }

  // Update the calorie goal
  const updateCalorieGoal = (newGoal: number) => {
    setCalorieGoal(newGoal)

    // Update the goal for the current day's log
    setLogs(logs.map((log) => (log.date === currentDate ? { ...log, calorieGoal: newGoal } : log)))
  }

  // Add a custom food
  const addCustomFood = () => {
    if (!customFoodName.trim() || !customFoodCalories.trim()) return

    const calories = Number.parseInt(customFoodCalories, 10)
    if (isNaN(calories) || calories <= 0) return

    addFood(customFoodName, calories, customFoodCategory)
  }

  // Calculate total calories for the current day
  const calculateTotalCalories = (): number => {
    const currentLog = getCurrentDayLog()
    return currentLog.foods.reduce((total, food) => total + food.calories, 0)
  }

  // Calculate calories by category for the chart
  const getCaloriesByCategory = () => {
    const currentLog = getCurrentDayLog()
    const categories: Record<string, number> = {}

    currentLog.foods.forEach((food) => {
      if (categories[food.category]) {
        categories[food.category] += food.calories
      } else {
        categories[food.category] = food.calories
      }
    })

    return Object.keys(categories).map((category) => ({
      name: category,
      value: categories[category],
    }))
  }

  // Format time
  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const totalCalories = calculateTotalCalories()
  const caloriePercentage = Math.min(100, (totalCalories / calorieGoal) * 100)
  const calorieData = getCaloriesByCategory()

  return (
    <div className="flex h-full flex-col">
      <Tabs defaultValue="log" className="flex-1">
        <div className="mb-4 flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="log">Food Log</TabsTrigger>
            <TabsTrigger value="add">Add Food</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <Input type="date" value={currentDate} onChange={(e) => setCurrentDate(e.target.value)} className="w-auto" />
        </div>

        <TabsContent value="log" className="h-[calc(100%-48px)]">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Daily Calorie Tracker</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {totalCalories} / {calorieGoal} calories
                  </span>
                  <span className="text-sm font-medium">{caloriePercentage.toFixed(0)}%</span>
                </div>
                <Progress
                  value={caloriePercentage}
                  className="h-2"
                  indicatorClassName={caloriePercentage > 100 ? "bg-red-500" : ""}
                />
                <div className="mt-1 text-right text-xs text-gray-500">
                  {calorieGoal - totalCalories > 0
                    ? `${calorieGoal - totalCalories} calories remaining`
                    : `${totalCalories - calorieGoal} calories over limit`}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Today's Food Log</h3>

                {getCurrentDayLog().foods.length === 0 ? (
                  <div className="rounded-md bg-muted p-4 text-center text-sm text-gray-500">
                    <Apple className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                    <p>No foods logged yet today.</p>
                    <p>Add some food to start tracking!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {getCurrentDayLog().foods.map((food) => (
                      <div key={food.id} className="flex items-center justify-between rounded-md border p-3">
                        <div>
                          <div className="font-medium">{food.name}</div>
                          <div className="flex items-center text-xs text-gray-500">
                            <span className="mr-2">{food.category}</span>
                            <span>{formatTime(food.timestamp)}</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-3 font-medium">{food.calories} cal</span>
                          <Button variant="ghost" size="icon" onClick={() => removeFood(food.id)} className="h-8 w-8">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add" className="h-[calc(100%-48px)]">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Search Foods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search for a food..."
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="max-h-[300px] overflow-y-auto">
                  {searchResults.length === 0 && searchTerm.trim() !== "" ? (
                    <div className="rounded-md bg-muted p-4 text-center text-sm text-gray-500">
                      No foods found matching "{searchTerm}"
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {searchResults.map((food, index) => (
                        <div
                          key={index}
                          className="flex cursor-pointer items-center justify-between rounded-md border p-3 hover:bg-muted"
                          onClick={() => addFood(food.name, food.calories, food.category)}
                        >
                          <div>
                            <div className="font-medium">{food.name}</div>
                            <div className="text-xs text-gray-500">{food.category}</div>
                          </div>
                          <div className="flex items-center">
                            <span className="mr-3 font-medium">{food.calories} cal</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Add Custom Food</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Food Name</label>
                    <Input
                      value={customFoodName}
                      onChange={(e) => setCustomFoodName(e.target.value)}
                      placeholder="Enter food name"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Calories</label>
                    <Input
                      type="number"
                      value={customFoodCalories}
                      onChange={(e) => setCustomFoodCalories(e.target.value)}
                      placeholder="Enter calories"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Category</label>
                    <select
                      value={customFoodCategory}
                      onChange={(e) => setCustomFoodCategory(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="Fruit">Fruit</option>
                      <option value="Protein">Protein</option>
                      <option value="Carbs">Carbs</option>
                      <option value="Dairy">Dairy</option>
                      <option value="Fats">Fats</option>
                      <option value="Sweets">Sweets</option>
                      <option value="Beverages">Beverages</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <Button
                    onClick={addCustomFood}
                    disabled={!customFoodName.trim() || !customFoodCalories.trim()}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Food
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="h-[calc(100%-48px)]">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Nutrition Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {totalCalories} / {calorieGoal} calories
                  </span>
                  <span className="text-sm font-medium">{caloriePercentage.toFixed(0)}%</span>
                </div>
                <Progress
                  value={caloriePercentage}
                  className="h-2"
                  indicatorClassName={caloriePercentage > 100 ? "bg-red-500" : ""}
                />
              </div>

              {calorieData.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={calorieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {calorieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} calories`, "Calories"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-[300px] items-center justify-center rounded-md bg-muted">
                  <div className="text-center text-gray-500">
                    <Apple className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                    <p>No data to display</p>
                    <p>Add some food to see statistics</p>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <h3 className="mb-2 font-medium">Nutrition Summary</h3>
                <div className="rounded-md border p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Total Calories</div>
                      <div className="text-lg font-bold">{totalCalories}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Daily Goal</div>
                      <div className="text-lg font-bold">{calorieGoal}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Foods Logged</div>
                      <div className="text-lg font-bold">{getCurrentDayLog().foods.length}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Categories</div>
                      <div className="text-lg font-bold">{calorieData.length}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="h-[calc(100%-48px)]">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Calorie Tracker Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Daily Calorie Goal</label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={calorieGoal}
                      onChange={(e) => updateCalorieGoal(Number.parseInt(e.target.value, 10) || 0)}
                      placeholder="Enter daily calorie goal"
                      min="0"
                      className="flex-1"
                    />
                    <Button variant="outline">
                      <Settings className="mr-2 h-4 w-4" />
                      Update
                    </Button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Recommended daily calorie intake varies based on age, gender, weight, height, and activity level.
                  </p>
                </div>

                <div className="rounded-md bg-muted p-4">
                  <h3 className="mb-2 font-medium">Calorie Guidelines</h3>
                  <ul className="list-disc pl-5 text-sm">
                    <li>Adult females: 1,600–2,400 calories per day</li>
                    <li>Adult males: 2,000–3,000 calories per day</li>
                    <li>Children ages 2 to 8: 1,000–1,400 calories per day</li>
                    <li>Girls ages 9 to 13: 1,400–1,600 calories per day</li>
                    <li>Boys ages 9 to 13: 1,600–2,000 calories per day</li>
                  </ul>
                  <p className="mt-2 text-xs text-gray-500">
                    These are general guidelines. Consult with a healthcare professional for personalized advice.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


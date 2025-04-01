"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { FileText, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"

export default function EssayDetector() {
  const [text, setText] = useState("")
  const [result, setResult] = useState<{
    score: number
    verdict: string
    details: string
  } | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyzeText = () => {
    if (!text.trim()) return

    setIsAnalyzing(true)

    // Simulate analysis
    setTimeout(() => {
      // This is a simplified simulation - a real implementation would use AI models
      const randomScore = Math.random()
      let verdict, details

      if (randomScore < 0.3) {
        verdict = "Likely human-written"
        details = "The text shows natural language patterns and inconsistencies typical of human writing."
      } else if (randomScore < 0.7) {
        verdict = "Possibly AI-generated"
        details = "The text contains some patterns that may indicate AI generation, but also has human-like elements."
      } else {
        verdict = "Likely AI-generated"
        details = "The text shows consistent patterns and structures commonly found in AI-generated content."
      }

      setResult({
        score: randomScore * 100,
        verdict,
        details,
      })

      setIsAnalyzing(false)
    }, 1500)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-medium">AI Essay Detector</h2>
        <p className="text-sm text-gray-500">Paste text to analyze whether it was written by a human or AI</p>
      </div>

      <div className="flex-1 overflow-hidden">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the text you want to analyze..."
          className="h-full min-h-[200px] resize-none"
        />
      </div>

      <div className="mt-4">
        <Button onClick={analyzeText} disabled={!text.trim() || isAnalyzing} className="w-full">
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Analyze Text
            </>
          )}
        </Button>
      </div>

      {result && (
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium">AI Probability</span>
                <span className="text-sm font-medium">{Math.round(result.score)}%</span>
              </div>
              <Progress value={result.score} className="h-2" />
            </div>

            <div className="mb-2 flex items-center">
              {result.score < 30 ? (
                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              ) : result.score < 70 ? (
                <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
              ) : (
                <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">{result.verdict}</span>
            </div>

            <p className="text-sm text-gray-600">{result.details}</p>

            <p className="mt-4 text-xs text-gray-400">
              Note: This is a demonstration. A real implementation would use advanced AI models for more accurate
              detection.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


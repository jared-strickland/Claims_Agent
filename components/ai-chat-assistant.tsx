"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ClaimData } from "@/lib/types"

interface Message {
  id: number
  sender: "ai" | "user"
  text: string | React.ReactNode
}

const conversationFlow = [
  { key: "policyNumber", question: "Hello! I'm here to help you start a new claim. First, what is the policy number?" },
  { key: "claimantName", question: "Got it. Who is the claimant?" },
  { key: "incidentDescription", question: "Thanks. Please describe the incident." },
  { key: "damageType", question: "Understood. What is the damage type? (e.g., Vehicle, Property, Other)" },
  { key: "incidentDate", question: "What was the date of the incident? (YYYY-MM-DD)" },
  { key: "incidentTime", question: "And the time of the incident? (HH:MM)" },
  { key: "confirmation", question: "Thank you. I've filled out the summary on the right. Please review and submit." },
]

export function AiChatAssistant({
  claimData,
  onDataExtracted,
}: {
  claimData: ClaimData
  onDataExtracted: (data: ClaimData) => void
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [currentStep, setCurrentStep] = useState(0)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages([{ id: 1, sender: "ai", text: conversationFlow[0].question }])
  }, [])

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector("div")
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight
    }
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || currentStep >= conversationFlow.length - 1) return

    const userMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: inputValue,
    }

    const currentFlowStep = conversationFlow[currentStep]
    const key = currentFlowStep.key as keyof ClaimData

    const updatedData = { ...claimData, [key]: inputValue.trim() }
    onDataExtracted(updatedData)

    const aiConfirmationText = (
      <span>
        {`Got it. ${key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}: `}
        <span className="font-semibold">{inputValue.trim()}</span>
      </span>
    )

    const nextStep = currentStep + 1
    const nextQuestion = conversationFlow[nextStep].question

    const aiResponse: Message[] = [
      { id: Date.now() + 1, sender: "ai", text: aiConfirmationText },
      { id: Date.now() + 2, sender: "ai", text: nextQuestion },
    ]

    setMessages((prev) => [...prev, userMessage, ...aiResponse])
    setCurrentStep(nextStep)
    setInputValue("")
  }

  return (
    <Card className="flex flex-col h-full max-h-[calc(100vh-6rem)]">
      <CardHeader>
        <CardTitle>AI Chat Assistant</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-gray-900 text-white dark:bg-gray-50 dark:text-gray-900"
                      : "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-100"
                  }`}
                >
                  <div className="text-sm">{message.text}</div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your response..."
            className="flex-1 focus-visible:ring-blue-500"
            disabled={currentStep >= conversationFlow.length - 1}
          />
          <Button type="submit" size="icon" disabled={currentStep >= conversationFlow.length - 1}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

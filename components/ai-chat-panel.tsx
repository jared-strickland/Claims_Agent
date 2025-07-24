"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { nanoid } from "nanoid"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const script = [
  {
    role: "user",
    content:
      "Policyholder: Alex Rivera\nPolicy Number: PL-59843219\nVehicle: 2018 Toyota Corolla, VIN 1NXBR32E88Z123456, Plate AZ 5GHT219\nDate/Time: July 20, 2025 at 3:15 PM\nLocation: Trader Joe's Parking Lot, Phoenix AZ\n\nIncident Description:\nWhile parked in the grocery store lot, the policyholder returned to find a large dent and black scuff marks on the rear-right quarter panel of the vehicle. No witnesses were present and no note was left. This is presumed to be a low-speed hit-and-run.\n\n(Attaching photos of the damage now.)",
    images: ["/damage-photo-1.png", "/damage-photo-2.png", "/damage-photo-3.png"],
    update: {
      status: "Claim Created",
      policyholder: "Alex Rivera",
      incidentDate: "2025-07-20",
      location: "Phoenix, AZ",
      vehicleInfo: {
        makeModel: "2018 Toyota Corolla",
        vin: "1NXBR32E88Z123456",
        licensePlate: "AZ 5GHT219",
      },
      incidentDescription:
        "While parked in the grocery store lot, the policyholder returned to find a large dent and black scuff marks on the rear-right quarter panel of the vehicle. No witnesses were present and no note was left. This is presumed to be a low-speed hit-and-run.",
      damagePhotos: [
        { url: "/damage-photo-1.png", caption: "Damage medium shot (blurry)" },
        { url: "/damage-photo-2.png", caption: "Damage close-up" },
        { url: "/damage-photo-3.png", caption: "Damage wide angle" },
      ],
      history: [
        {
          id: nanoid(),
          timestamp: new Date().toISOString(),
          user: "Alex Rivera (via Agent)",
          role: "agent",
          action: "Claim Submitted",
          notes: "Initial claim filed via AI chat.",
        },
      ],
    },
  },
  {
    role: "assistant",
    content:
      "Thanks. I've processed the summary and images. The extracted data is now visible on the right. I have one clarifying question before suggesting an estimate.",
    update: {
      aiAssessment: {
        incidentType: "Hit-and-run while parked",
        vehicleStatus: "Stationary at time of incident",
        damageArea: "Rear-right quarter panel",
        damageDescription: "Moderate dent with paint transfer",
        suggestedRepair: "Paintless dent repair (PDR) with spot refinishing",
        repairMatchConfidence: 82,
        notes:
          "Image 1 quality is low, reducing overall confidence. Manual review may be required if PDR access is limited.",
        reference: "Estimate sourced from CCC ONE® Total Repair Platform, interpreted by Lizard Insurance Company AI",
      },
      history: [
        {
          id: nanoid(),
          timestamp: new Date().toISOString(),
          user: "AI Assistant",
          role: "AI",
          action: "Initial Analysis Complete",
        },
      ],
    },
  },
  {
    role: "assistant",
    content:
      "I noticed a shadowed area near the panel crease in one of the photos. Is there a second impact point, or is this just lighting?",
  },
  {
    role: "user",
    content: "That's just a reflection from the overhead lights. The damage is confined to the main dent.",
  },
  {
    role: "assistant",
    content:
      "Understood. Based on the confirmed single impact point, I have generated a suggested estimate with several repair options. The claim is now ready for your review before sending to an adjuster.",
    update: {
      status: "AI Estimate Suggested",
      estimate: {
        parts: [],
        labor: { body: { hours: 2.5, rate: 95 }, paint: { hours: 3.0, rate: 95 } },
        materials: { paint: { hours: 3.0, rate: 45 } },
        total: 657.5,
        notes: "Estimate does not include internal damage or structural issues.",
        watermark: "Lizard Insurance Company Internal Estimate",
      },
      aiAssessment: {
        suggestedRepair: "Paintless Dent Repair (PDR)",
        repairMatchConfidence: 92,
        justification: [
          "CCC Database Match: 2018 Toyota Corolla rear quarter panel dent repair - 89% similarity to Case #TC-2018-4472",
          "Mitchell RepairCenter: Quarter panel PDR feasible when dent diameter <6 inches and no paint cracking visible",
          "OEM Toyota Service Manual: 2018 Corolla outer panel thickness 0.7mm - suitable for PDR techniques",
          "Historical Claims Data: Similar impact patterns on Corolla models average 2.3 body hours + 2.8 paint hours",
          "Paint Code Match: 1F7 Classic Silver Metallic confirmed via VIN decode - standard Toyota basecoat/clearcoat system",
        ],
        matchedGuidance: [
          {
            type: "Primary Recommendation",
            confidence: "high",
            source: "OEM Toyota Service Manual #44-2B",
            similarity: 92,
            repairType: "Paintless Dent Repair (PDR)",
            description:
              "Utilize specialized tools to massage the metal back to its original form from behind the panel.",
            justification: "High-confidence match to dent profile; no paint cracking detected in high-res photos.",
            estimate: {
              parts: [],
              labor: { body: { hours: 2.5, rate: 95 }, paint: { hours: 3.0, rate: 95 } },
              materials: { paint: { hours: 3.0, rate: 45 } },
              total: 657.5,
              notes: "Estimate does not include internal damage or structural issues.",
              watermark: "Lizard Insurance Company Internal Estimate",
            },
          },
          {
            type: "Secondary Option",
            confidence: "medium",
            source: "Prior Claim #CL-B7X4F9K1",
            similarity: 74,
            repairType: "Conventional Repair (Fill & Paint)",
            description: "Sand the damaged area, apply body filler, sand to contour, then prime and paint.",
            justification: "Fallback if PDR access is blocked by internal bracing. More costly and time-consuming.",
            estimate: {
              parts: [],
              labor: { body: { hours: 3.5, rate: 95 }, paint: { hours: 3.5, rate: 95 } },
              materials: { paint: { hours: 3.5, rate: 45 } },
              total: 822.5,
              notes: "Estimate assumes no part replacement needed.",
              watermark: "Lizard Insurance Company Internal Estimate",
            },
          },
          {
            type: "Escalation Scenario",
            confidence: "low",
            source: "Internal Alert #IM-102",
            similarity: 45,
            repairType: "Panel Replacement",
            description: "Full replacement of the quarter panel.",
            justification:
              "Only required if hidden structural damage is found during teardown. Low probability based on images.",
            estimate: {
              parts: [{ name: "Rear Quarter Panel", cost: 450 }],
              labor: { body: { hours: 5.0, rate: 95 }, paint: { hours: 4.0, rate: 95 } },
              materials: { paint: { hours: 4.0, rate: 45 } },
              total: 1485.0,
              notes: "Includes cost of OEM replacement part.",
              watermark: "Lizard Insurance Company Internal Estimate",
            },
          },
        ],
      },
      repairRouting: {
        shopName: "Rivera Auto Body, Phoenix AZ",
        routingStatus: "Not Yet Routed",
      },
      history: [
        {
          id: nanoid(),
          timestamp: new Date().toISOString(),
          user: "AI Assistant",
          role: "AI",
          action: "Estimate Generated",
          notes: "Agent confirmed single impact point.",
        },
      ],
    },
  },
]

export function AiChatPanel({ onScriptNavigate }: { onScriptNavigate: (step: number) => void }) {
  const [messages, setMessages] = useState<any[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    handleNavigate(0)
  }, [])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const handleNavigate = (newStep: number) => {
    if (newStep >= 0 && newStep <= script.length) {
      setCurrentStep(newStep)
      setMessages(script.slice(0, newStep))
      onScriptNavigate(newStep - 1)
    }
  }

  return (
    <Card className="flex flex-col h-full shadow-none border-none bg-transparent">
      <CardHeader>
        <CardTitle className="text-slate-800 dark:text-slate-200">AI Assistant (Scripted Demo)</CardTitle>
      </CardHeader>
      <CardContent ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((message) => (
          <div key={nanoid()} className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}>
            <p className="text-xs font-bold mb-1 px-3 text-slate-500 dark:text-slate-400">
              {message.role === "user" ? "Claims Agent" : "AI Assistant"}
            </p>
            <div
              className={`max-w-[85%] p-3 rounded-xl ${
                message.role === "user"
                  ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                  : "bg-blue-600 text-white"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              {message.images && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {message.images.map((imgSrc: string, index: number) => (
                    <Image
                      key={index}
                      src={imgSrc || "/placeholder.svg"}
                      alt={`Damage photo ${index + 1}`}
                      width={80}
                      height={80}
                      className="rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex items-center gap-2 pt-4">
        <Button
          onClick={() => handleNavigate(currentStep - 1)}
          disabled={currentStep <= 0}
          variant="outline"
          className="w-full rounded-xl"
        >
          Previous
        </Button>
        <Button
          onClick={() => handleNavigate(currentStep + 1)}
          disabled={currentStep >= script.length}
          className="w-full rounded-xl bg-blue-600 hover:bg-blue-700"
        >
          {currentStep >= script.length ? "End of Script" : "Next"}
        </Button>
      </CardFooter>
    </Card>
  )
}

export type ClaimStatus =
  | "Claim Created"
  | "AI Estimate Suggested"
  | "Pending Adjuster Review"
  | "Returned to Agent"
  | "Estimate Revised by Adjuster"
  | "Adjustor Approved"
  | "Routed to Repair Shop"
  | "Returned by Repair Shop"
  | "Repair In Progress"
  | "Repair Complete"
  | "Claim Closed"

export type UserRole = "agent" | "adjuster" | "repairShop"

export interface HistoryEvent {
  id: string
  timestamp: string
  user: string
  role: UserRole | "AI"
  action: string
  notes?: string
}

export interface EstimateData {
  parts: { name: string; cost: number }[]
  labor: {
    body: { hours: number; rate: number }
    paint: { hours: number; rate: number }
  }
  materials: {
    paint: { hours: number; rate: number }
  }
  total: number
  notes: string
  watermark: string
}

export interface MatchedGuidance {
  type: "Primary Recommendation" | "Secondary Option" | "Escalation Scenario"
  confidence: "high" | "medium" | "low"
  source: string
  similarity: number
  repairType: string
  description: string
  justification: string
  estimate: EstimateData
}

export interface ClaimData {
  id: string
  policyholder: string
  incidentDate: string
  location: string
  status: ClaimStatus
  vehicleInfo: {
    makeModel: string
    vin: string
    licensePlate: string
  }
  incidentDescription: string
  damagePhotos: {
    url: string
    caption: string
  }[]
  aiAssessment: {
    incidentType: string
    vehicleStatus: string
    damageArea: string
    damageDescription: string
    suggestedRepair: string
    repairMatchConfidence: number
    notes: string
    reference: string
    justification: string[]
    matchedGuidance: MatchedGuidance[]
  }
  estimate: EstimateData
  repairRouting: {
    shopName: string
    routingStatus: string
  }
  adjusterNote: string
  adjusterApproval?: {
    name: string
    date: string
    type: "Approved" | "Revised"
  }
  returnDetails?: {
    note: string
    date: string
  }
  shopReturnDetails?: {
    note: string
    date: string
  }
  history: HistoryEvent[]
}

// =============================================================================
// AI Crime Classifier API Client
// Connects to FastAPI Scikit-Learn backend with intelligent local fallback
// =============================================================================

import type {
  AIClassificationResult,
  AICrimeCategory,
  AIRiskLevel,
  AICategoryMeta,
} from '@/types'

const DEFAULT_BACKEND_URL =
  import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000'

// ── Category Definitions & Metadata ──────────────────────────────────────────

export const AI_CATEGORIES: Record<AICrimeCategory, AICategoryMeta> = {
  Theft: {
    id: 1,
    name: 'Theft',
    icon: '🔓',
    base_risk: 'Medium',
    description: 'Unlawful taking of another person’s personal property, burglary, or larceny.',
    examples: [
      'Someone broke my car window and stole my laptop backpack from the backseat.',
      'Locked electric bicycle was stolen from the bike rack outside the train station.',
    ],
  },
  Assault: {
    id: 2,
    name: 'Assault',
    icon: '⚠️',
    base_risk: 'High',
    description: 'Physical violence, threats of bodily harm, battery, or armed confrontation.',
    examples: [
      'A man threatened me with a knife in the park and punched me in the face.',
      'Two individuals physically attacked a pedestrian at the bus terminal causing bleeding.',
    ],
  },
  'Cyber Crime': {
    id: 3,
    name: 'Cyber Crime',
    icon: '💻',
    base_risk: 'High',
    description: 'Digital crimes including hacking, ransomware, phishing, malware, or database leaks.',
    examples: [
      'Enterprise server was encrypted by LockBit ransomware demanding 10 Bitcoin payment.',
      'Hacker breached our customer SQL database and leaked confidential user credentials.',
    ],
  },
  Fraud: {
    id: 4,
    name: 'Fraud',
    icon: '💳',
    base_risk: 'Medium',
    description: 'Deception for financial gain, including identity theft, wire scams, or fake schemes.',
    examples: [
      'Victim was tricked into wiring $85,000 to an offshore escrow account by a scammer.',
      'Unauthorized clone of my credit card was used to withdraw funds after skimmer install.',
    ],
  },
  Vandalism: {
    id: 5,
    name: 'Vandalism',
    icon: '🪓',
    base_risk: 'Low',
    description: 'Willful destruction, defacement, or damaging of public or private property.',
    examples: [
      'Teenagers spray painted graffiti all over the school wall and smashed exterior windows.',
      'All four car tires were slashed with a knife and the door was keyed from front to back.',
    ],
  },
}

// ── Client-side Heuristic Fallback (Active if Python API server is offline) ────

const CRITICAL_KEYWORDS = [
    'gun', 'guns', 'firearm', 'shot', 'shooting', 'knife', 'stab', 'stabbed',
    'bleeding', 'blood', 'unconscious', 'hostage', 'choked', 'hospital', 'murder', 'kill',
]

const HIGH_KEYWORDS = [
    'punched', 'kicked', 'beaten', 'robbery', 'armed', 'ransomware', 'breach',
    'zero-day', 'wire transfer', 'life savings', 'fracture', 'broken bones',
]

const CATEGORY_VOCABULARY: Record<AICrimeCategory, string[]> = {
  Theft: [
    'stole', 'stolen', 'steal', 'theft', 'robbed', 'robbery', 'burglar', 'burglary',
    'break-in', 'broke into', 'backpack', 'laptop', 'wallet', 'purse', 'bicycle',
    'bike', 'shoplifter', 'pickpocket', 'catalytic', 'converter', 'carjack', 'loot',
  ],
  Assault: [
    'attack', 'attacked', 'attacker', 'punch', 'punched', 'hit', 'struck', 'beaten',
    'beat', 'fight', 'knife', 'stab', 'stabbed', 'shot', 'gun', 'threatened', 'choked',
    'bleeding', 'hospital', 'injuries', 'bruised', 'slashed', 'ambushed', 'physical',
  ],
  'Cyber Crime': [
    'hacked', 'hacker', 'ransomware', 'malware', 'phishing', 'trojan', 'ddos',
    'database', 'credential', 'leak', 'breached', 'exploit', 'bitcoin', 'crypto',
    'metamask', 'wallet drained', 'zero-day', 'spyware', 'botnet', 'server', 'injection',
  ],
  Fraud: [
    'fraud', 'scam', 'scammer', 'wired', 'wire transfer', 'impersonated', 'credit card',
    'identity theft', 'fake', 'ponzi', 'scheme', 'embezzled', 'forged', 'counterfeit',
    'gift card', 'deposit', 'bounced', 'refund', 'irs', 'unauthorized transaction',
  ],
  Vandalism: [
    'graffiti', 'spray paint', 'tagged', 'smashed', 'shattered', 'slashed tires',
    'keyed', 'defaced', 'broken window', 'destroyed', 'brick', 'vandalized',
    'arson', 'tire', 'bus stop', 'monument', 'scratched', 'trash',
  ],
}

function clientSideClassify(text: string): AIClassificationResult {
  const lower = text.toLowerCase()
  const scores: Record<AICrimeCategory, number> = {
    Theft: 0.1,
    Assault: 0.1,
    'Cyber Crime': 0.1,
    Fraud: 0.1,
    Vandalism: 0.1,
  }

  // Count keyword occurrences
  for (const [cat, words] of Object.entries(CATEGORY_VOCABULARY) as [AICrimeCategory, string[]][]) {
    for (const w of words) {
      if (lower.includes(w)) {
        scores[cat] += 1.2
      }
    }
  }

  // Softmax normalization
  const sumScores = Object.values(scores).reduce((a, b) => a + b, 0)
  const probabilities: Record<AICrimeCategory, number> = {
    Theft: Math.round((scores.Theft / sumScores) * 1000) / 1000,
    Assault: Math.round((scores.Assault / sumScores) * 1000) / 1000,
    'Cyber Crime': Math.round((scores['Cyber Crime'] / sumScores) * 1000) / 1000,
    Fraud: Math.round((scores.Fraud / sumScores) * 1000) / 1000,
    Vandalism: Math.round((scores.Vandalism / sumScores) * 1000) / 1000,
  }

  let bestCat: AICrimeCategory = 'Theft'
  let maxP = -1
  for (const [cat, p] of Object.entries(probabilities) as [AICrimeCategory, number][]) {
    if (p > maxP) {
      maxP = p
      bestCat = cat
    }
  }

  // Risk evaluation
  const detectedCritical = CRITICAL_KEYWORDS.filter(k => lower.includes(k))
  const detectedHigh = HIGH_KEYWORDS.filter(k => lower.includes(k))

  let riskLevel: AIRiskLevel = 'Low'
  if (detectedCritical.length > 0 || (bestCat === 'Assault' && maxP > 0.4)) {
    riskLevel = 'Critical'
  } else if (detectedHigh.length > 0 || bestCat === 'Assault' || bestCat === 'Cyber Crime') {
    riskLevel = 'High'
  } else if (bestCat === 'Fraud' || bestCat === 'Theft') {
    riskLevel = 'Medium'
  }

  const riskFactors = Array.from(new Set([...detectedCritical, ...detectedHigh])).slice(0, 5)
  const meta = AI_CATEGORIES[bestCat]

  return {
    category: bestCat,
    categoryId: meta.id,
    categoryIcon: meta.icon,
    riskLevel,
    confidence: Math.max(0.65, Math.min(0.98, maxP + 0.2)),
    probabilities,
    riskFactors,
    explanation: `Classified as ${bestCat} (${Math.round(maxP * 100)}% confidence) based on local ML pattern matching. Risk evaluated as ${riskLevel}.`,
  }
}

// ── API Methods ────────────────────────────────────────────────────────────────

export async function checkAIServerHealth(): Promise<{
  online: boolean
  categories?: string[]
  samples?: number
  version?: string
}> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 1200)

    const res = await fetch(`${DEFAULT_BACKEND_URL}/api/health`, {
      signal: controller.signal,
    })
    clearTimeout(timer)

    if (res.ok) {
      const data = await res.json()
      return {
        online: true,
        categories: data.categories,
        samples: data.total_training_samples,
        version: data.scikit_learn_version,
      }
    }
  } catch {
    // Server is unreachable, offline mode
  }
  return { online: false }
}

export async function classifyCrimeDescription(
  description: string
): Promise<AIClassificationResult & { isLocalFallback?: boolean }> {
  const clean = description.trim()
  if (!clean) {
    return {
      category: 'Theft',
      categoryId: 1,
      categoryIcon: '🔓',
      riskLevel: 'Low',
      confidence: 0,
      probabilities: {
        Theft: 0.2,
        Assault: 0.2,
        'Cyber Crime': 0.2,
        Fraud: 0.2,
        Vandalism: 0.2,
      },
      riskFactors: [],
      explanation: 'Please provide a crime description to analyze.',
    }
  }

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 2000)

    const res = await fetch(`${DEFAULT_BACKEND_URL}/api/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: clean }),
      signal: controller.signal,
    })
    clearTimeout(timer)

    if (res.ok) {
      const data = await res.json()
      return {
        category: data.category as AICrimeCategory,
        categoryId: data.category_id,
        categoryIcon: data.category_icon,
        riskLevel: data.risk_level as AIRiskLevel,
        confidence: data.confidence,
        probabilities: data.probabilities,
        riskFactors: data.risk_factors,
        explanation: data.explanation,
        isLocalFallback: false,
      }
    }
  } catch (err) {
    console.debug('FastAPI server offline, switching to client ML fallback', err)
  }

  // Graceful client fallback
  const fallback = clientSideClassify(clean)
  return {
    ...fallback,
    isLocalFallback: true,
  }
}

// =============================================================================
// AIClassifierPage — Dedicated AI Crime Classifier & Risk Assessment Lab
// Scikit-Learn + FastAPI integration with multi-class probability breakdown
// =============================================================================

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sparkles, ShieldAlert, Cpu, CheckCircle2, Server,
  ArrowRight, RefreshCw, BarChart3, Info, ExternalLink, Zap,
} from 'lucide-react'
import {
  classifyCrimeDescription,
  checkAIServerHealth,
  AI_CATEGORIES,
} from '@/api/aiClassifier'
import type { AIClassificationResult, AICrimeCategory } from '@/types'

const PRESET_SCENARIOS: { label: string; category: AICrimeCategory; text: string }[] = [
  {
    label: 'Car Break-in',
    category: 'Theft',
    text: 'Someone smashed my car passenger window overnight and took my backpack containing a MacBook Pro, passport, and company keys.',
  },
  {
    label: 'Armed Stabbing Assault',
    category: 'Assault',
    text: 'A suspect ambushed a pedestrian with a large hunting knife near the subway exit, slashing the victim and causing severe blood loss and hospital admission.',
  },
  {
    label: 'Enterprise Ransomware',
    category: 'Cyber Crime',
    text: 'LockBit ransomware encrypted our internal hospital database servers and the hackers are demanding 15 Bitcoin to decrypt patient medical records.',
  },
  {
    label: 'Elderly Wire Scam',
    category: 'Fraud',
    text: 'A scammer impersonating an IRS federal agent tricked an elderly victim into wiring $45,000 from their retirement savings to avoid non-existent arrest.',
  },
  {
    label: 'Community Center Vandalism',
    category: 'Vandalism',
    text: 'Vandals spray painted vulgar graffiti tags across the exterior brick walls and shattered all the front glass doors of the public community center.',
  },
]

const RISK_CONFIG: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  Low:      { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80', border: 'rgba(34, 197, 94, 0.3)', glow: 'rgba(34, 197, 94, 0.2)' },
  Medium:   { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)', glow: 'rgba(245, 158, 11, 0.2)' },
  High:     { bg: 'rgba(249, 115, 22, 0.15)', text: '#fb923c', border: 'rgba(249, 115, 22, 0.3)', glow: 'rgba(249, 115, 22, 0.2)' },
  Critical: { bg: 'rgba(239, 68, 68, 0.2)',  text: '#f87171', border: 'rgba(239, 68, 68, 0.4)', glow: 'rgba(239, 68, 68, 0.3)' },
}

export function AIClassifierPage() {
  const navigate = useNavigate()

  const [description, setDescription] = useState(PRESET_SCENARIOS[0].text)
  const [result, setResult]           = useState<(AIClassificationResult & { isLocalFallback?: boolean }) | null>(null)
  const [loading, setLoading]         = useState(false)
  const [serverStatus, setServerStatus] = useState<{ online: boolean; version?: string; samples?: number } | null>(null)

  // Check health on mount
  useEffect(() => {
    checkAIServerHealth().then(s => setServerStatus(s))
  }, [])

  // Auto-analyze initial preset on mount
  useEffect(() => {
    handleClassify(PRESET_SCENARIOS[0].text)
  }, [])

  async function handleClassify(textToAnalyze?: string) {
    const text = (textToAnalyze !== undefined ? textToAnalyze : description).trim()
    if (!text) return

    setLoading(true)
    try {
      const res = await classifyCrimeDescription(text)
      setResult(res)
    } finally {
      setLoading(false)
    }
  }

  const risk = result ? RISK_CONFIG[result.riskLevel] : RISK_CONFIG.Low

  return (
    <div className="page" style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #cba6f7, #89b4fa)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#11111b',
                  boxShadow: '0 4px 16px rgba(203, 166, 247, 0.35)',
                }}
              >
                <Sparkles size={22} />
              </div>
              <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#cdd6f4' }}>
                AI Crime Classifier & Risk Engine
              </h1>
            </div>
            <p style={{ margin: 0, color: '#a6adc8', fontSize: '0.95rem' }}>
              Machine Learning classification powered by Scikit-Learn TF-IDF, Logistic Regression, and multi-factor risk assessment.
            </p>
          </div>

          {/* Backend server status */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.5rem 1rem',
              borderRadius: '12px',
              background: serverStatus?.online ? 'rgba(34, 197, 94, 0.1)' : 'rgba(250, 204, 21, 0.1)',
              border: `1px solid ${serverStatus?.online ? 'rgba(34, 197, 94, 0.25)' : 'rgba(250, 204, 21, 0.25)'}`,
            }}
          >
            <Server size={16} color={serverStatus?.online ? '#4ade80' : '#facc15'} />
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: serverStatus?.online ? '#4ade80' : '#facc15' }}>
                {serverStatus?.online ? 'FastAPI Backend Online' : 'Local ML Engine Active'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#a6adc8' }}>
                {serverStatus?.online
                  ? `Scikit-Learn ${serverStatus.version || '1.9'} • 125 samples`
                  : 'FastAPI offline, running browser fallback'}
              </div>
            </div>
            {serverStatus?.online && (
              <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#89b4fa', marginLeft: '0.3rem', display: 'flex', alignItems: 'center' }}
                title="Open FastAPI Swagger Docs"
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      </motion.div>

      {/* Preset Buttons */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.8rem', color: '#a6adc8', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={13} className="text-yellow" />
          <span>Quick Benchmark Scenarios:</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {PRESET_SCENARIOS.map(sc => (
            <button
              key={sc.label}
              type="button"
              className="btn btn-outline"
              style={{
                fontSize: '0.8rem',
                padding: '0.4rem 0.8rem',
                background: description === sc.text ? 'rgba(137, 180, 250, 0.15)' : 'rgba(30, 30, 46, 0.6)',
                borderColor: description === sc.text ? '#89b4fa' : 'rgba(137, 180, 250, 0.2)',
                color: description === sc.text ? '#89b4fa' : '#cdd6f4',
              }}
              onClick={() => {
                setDescription(sc.text)
                handleClassify(sc.text)
              }}
            >
              <span>{AI_CATEGORIES[sc.category]?.icon}</span>
              <span>{sc.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Input & Output */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Left Column: Input */}
        <motion.div
          className="card"
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            background: 'linear-gradient(135deg, rgba(30, 30, 46, 0.9), rgba(24, 24, 37, 0.9))',
            border: '1px solid rgba(137, 180, 250, 0.2)',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <label style={{ fontWeight: 700, fontSize: '0.95rem', color: '#cdd6f4' }}>
              Crime Incident Description
            </label>
            <span style={{ fontSize: '0.75rem', color: '#a6adc8' }}>
              {description.length} characters
            </span>
          </div>

          <textarea
            className="form-input form-textarea"
            rows={7}
            placeholder="Type or paste any crime description to classify its category, assess threat risk, and calculate confidence..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={{
              width: '100%',
              fontSize: '0.9rem',
              lineHeight: 1.5,
              resize: 'vertical',
              marginBottom: '1rem',
            }}
          />

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              onClick={() => handleClassify()}
              disabled={loading || !description.trim()}
            >
              {loading ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    style={{ display: 'inline-flex' }}
                  >
                    <RefreshCw size={16} />
                  </motion.span>
                  Classifying with Scikit-Learn…
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Classify Incident
                </>
              )}
            </button>

            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setDescription('')
                setResult(null)
              }}
              disabled={loading || !description}
            >
              Clear
            </button>
          </div>
        </motion.div>

        {/* Right Column: Results */}
        <motion.div
          className="card"
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            background: 'linear-gradient(135deg, rgba(30, 30, 46, 0.9), rgba(24, 24, 37, 0.9))',
            border: '1px solid rgba(137, 180, 250, 0.2)',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#cdd6f4', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={18} className="text-lavender" />
              ML Prediction & Assessment
            </h3>
            {result?.isLocalFallback && (
              <span style={{ fontSize: '0.7rem', color: '#facc15', background: 'rgba(250, 204, 21, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                Browser Engine
              </span>
            )}
          </div>

          {result ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Primary Cards: Category, Risk, Confidence */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {/* Category */}
                <div
                  style={{
                    background: 'rgba(17, 17, 27, 0.6)',
                    padding: '0.85rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(137, 180, 250, 0.1)',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: '#a6adc8', textTransform: 'uppercase' }}>
                    Category
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <span style={{ fontSize: '1.3rem' }}>{result.categoryIcon}</span>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: '#cdd6f4' }}>
                      {result.category}
                    </span>
                  </div>
                </div>

                {/* Risk Level */}
                <div
                  style={{
                    background: 'rgba(17, 17, 27, 0.6)',
                    padding: '0.85rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(137, 180, 250, 0.1)',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: '#a6adc8', textTransform: 'uppercase' }}>
                    Risk Level
                  </div>
                  <div style={{ marginTop: '6px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        background: risk.bg,
                        color: risk.text,
                        border: `1px solid ${risk.border}`,
                        boxShadow: `0 0 10px ${risk.glow}`,
                      }}
                    >
                      <ShieldAlert size={12} />
                      {result.riskLevel}
                    </span>
                  </div>
                </div>

                {/* Confidence */}
                <div
                  style={{
                    background: 'rgba(17, 17, 27, 0.6)',
                    padding: '0.85rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(137, 180, 250, 0.1)',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: '#a6adc8', textTransform: 'uppercase' }}>
                    Confidence
                  </div>
                  <div style={{ marginTop: '2px' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#89b4fa' }}>
                      {(result.confidence * 100).toFixed(1)}%
                    </div>
                    <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${result.confidence * 100}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #89b4fa, #cba6f7)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Class Probability Distribution */}
              <div
                style={{
                  background: 'rgba(17, 17, 27, 0.4)',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(137, 180, 250, 0.08)',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#a6adc8', marginBottom: '0.6rem' }}>
                  Multi-Class Probability Distribution
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(Object.entries(result.probabilities) as [AICrimeCategory, number][]).map(([cat, prob]) => {
                    const pct = Math.round(prob * 100)
                    const isTop = cat === result.category
                    return (
                      <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                        <span style={{ width: '105px', color: isTop ? '#cdd6f4' : '#a6adc8', fontWeight: isTop ? 700 : 400 }}>
                          {AI_CATEGORIES[cat]?.icon} {cat}
                        </span>
                        <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            style={{
                              height: '100%',
                              background: isTop ? 'linear-gradient(90deg, #89b4fa, #cba6f7)' : 'rgba(205, 214, 244, 0.25)',
                              borderRadius: '4px',
                            }}
                          />
                        </div>
                        <span style={{ width: '42px', textAlign: 'right', color: isTop ? '#89b4fa' : '#6c7086', fontFamily: 'monospace', fontWeight: isTop ? 700 : 400 }}>
                          {pct}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Detected Indicators */}
              {result.riskFactors && result.riskFactors.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#a6adc8', marginBottom: '0.4rem' }}>
                    Detected Threat & Urgency Factors:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {result.riskFactors.map(factor => (
                      <span
                        key={factor}
                        style={{
                          background: 'rgba(250, 179, 135, 0.1)',
                          border: '1px solid rgba(250, 179, 135, 0.25)',
                          color: '#fab387',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontFamily: 'monospace',
                        }}
                      >
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Explanation */}
              <div style={{ fontSize: '0.82rem', color: '#a6adc8', background: 'rgba(137, 180, 250, 0.05)', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #89b4fa' }}>
                <span style={{ fontWeight: 600, color: '#cdd6f4' }}>Model Insight: </span>
                {result.explanation}
              </div>

              {/* Action Button: Proceed to on-chain submission */}
              <button
                type="button"
                className="btn btn-primary"
                style={{
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  background: 'linear-gradient(135deg, #cba6f7, #89b4fa)',
                  color: '#11111b',
                  fontWeight: 700,
                }}
                onClick={() => {
                  navigate('/submit', {
                    state: {
                      initialDescription: description,
                      initialCrimeType: result.categoryId,
                    },
                  })
                }}
              >
                <span>Submit as Anonymous On-Chain Report</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#6c7086', padding: '2rem' }}>
              <Cpu size={36} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '0.88rem' }}>Enter a description and click "Classify Incident" to view AI prediction.</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Crime Categories Knowledge Reference Card */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'rgba(30, 30, 46, 0.6)',
          border: '1px solid rgba(137, 180, 250, 0.15)',
          borderRadius: '16px',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Info size={18} className="text-lavender" />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#cdd6f4' }}>
            Supported Crime Taxonomy & Baseline Risk Weights
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {Object.entries(AI_CATEGORIES).map(([catName, meta]) => {
            const riskConfig = RISK_CONFIG[meta.base_risk] || RISK_CONFIG.Medium
            return (
              <div
                key={catName}
                style={{
                  background: 'rgba(17, 17, 27, 0.5)',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(137, 180, 250, 0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '1.4rem' }}>{meta.icon}</span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: riskConfig.bg,
                      color: riskConfig.text,
                      border: `1px solid ${riskConfig.border}`,
                    }}
                  >
                    {meta.base_risk} Risk
                  </span>
                </div>
                <div style={{ fontWeight: 700, color: '#cdd6f4', marginBottom: '0.3rem', fontSize: '0.92rem' }}>
                  {meta.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#a6adc8', lineHeight: 1.4 }}>
                  {meta.description}
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}

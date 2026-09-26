// =============================================================================
// AICrimeAssistant Component
// Interactive Scikit-Learn AI Assistant for real-time category prediction,
// risk level assessment, and confidence visualization.
// =============================================================================

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, ShieldAlert, Cpu, CheckCircle2, ChevronDown, ChevronUp,
  Server, Zap, BarChart2,
} from 'lucide-react'
import {
  classifyCrimeDescription,
  checkAIServerHealth,
  AI_CATEGORIES,
} from '@/api/aiClassifier'
import type { AIClassificationResult, AICrimeCategory, CrimeTypeKey } from '@/types'

interface AICrimeAssistantProps {
  description: string
  currentCategory: CrimeTypeKey
  onSelectCategory: (categoryId: CrimeTypeKey) => void
  onSetDescription?: (text: string) => void
}

const RISK_BADGE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Low:      { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80', border: 'rgba(34, 197, 94, 0.3)' },
  Medium:   { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' },
  High:     { bg: 'rgba(249, 115, 22, 0.15)', text: '#fb923c', border: 'rgba(249, 115, 22, 0.3)' },
  Critical: { bg: 'rgba(239, 68, 68, 0.2)',  text: '#f87171', border: 'rgba(239, 68, 68, 0.4)' },
}

export function AICrimeAssistant({
  description,
  currentCategory,
  onSelectCategory,
  onSetDescription,
}: AICrimeAssistantProps) {
  const [result, setResult]         = useState<(AIClassificationResult & { isLocalFallback?: boolean }) | null>(null)
  const [loading, setLoading]       = useState(false)
  const [serverOnline, setServerOnline] = useState<boolean | null>(null)
  const [expanded, setExpanded]     = useState(true)
  const [showProbs, setShowProbs]   = useState(false)

  // Check backend server health on mount
  useEffect(() => {
    let mounted = true
    checkAIServerHealth().then(status => {
      if (mounted) setServerOnline(status.online)
    })
    return () => { mounted = false }
  }, [])

  // Debounced auto-classification when user types description
  useEffect(() => {
    if (!description.trim() || description.trim().length < 15) {
      setResult(null)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await classifyCrimeDescription(description)
        setResult(res)
      } finally {
        setLoading(false)
      }
    }, 450)

    return () => clearTimeout(timer)
  }, [description])

  const riskStyle = result ? RISK_BADGE_STYLES[result.riskLevel] : RISK_BADGE_STYLES.Low
  const isMatch = result && currentCategory === result.categoryId

  return (
    <motion.div
      className="ai-assistant-widget"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'linear-gradient(135deg, rgba(30, 30, 46, 0.95), rgba(24, 24, 37, 0.95))',
        border: '1px solid rgba(137, 180, 250, 0.2)',
        borderRadius: '16px',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #cba6f7, #89b4fa)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#11111b',
              boxShadow: '0 2px 10px rgba(203, 166, 247, 0.4)',
            }}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#cdd6f4' }}>
                AI Crime Classifier Assistant
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 'rgba(203, 166, 247, 0.15)',
                  color: '#cba6f7',
                  border: '1px solid rgba(203, 166, 247, 0.3)',
                  fontWeight: 600,
                }}
              >
                Scikit-Learn ML
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#a6adc8' }}>
              Real-time category prediction & risk assessment
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Server status badge */}
          <span
            style={{
              fontSize: '0.7rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: serverOnline ? '#4ade80' : '#facc15',
              background: serverOnline ? 'rgba(34, 197, 94, 0.1)' : 'rgba(250, 204, 21, 0.1)',
              padding: '3px 8px',
              borderRadius: '8px',
              border: `1px solid ${serverOnline ? 'rgba(34, 197, 94, 0.2)' : 'rgba(250, 204, 21, 0.2)'}`,
            }}
          >
            <Server size={11} />
            {serverOnline ? 'FastAPI Online' : 'Local ML Engine'}
          </span>

          <button
            type="button"
            className="btn btn-ghost"
            style={{ padding: '4px', height: 'auto', color: '#a6adc8' }}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(137, 180, 250, 0.1)', paddingTop: '1rem' }}>
              {/* Quick sample prompt pills if description is empty */}
              {(!description.trim() || description.length < 15) && onSetDescription && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#a6adc8', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Zap size={12} className="text-yellow" />
                    <span>Try testing with quick sample reports:</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {Object.entries(AI_CATEGORIES).map(([cat, meta]) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => onSetDescription(meta.examples[0])}
                        style={{
                          background: 'rgba(49, 50, 68, 0.6)',
                          border: '1px solid rgba(137, 180, 250, 0.2)',
                          borderRadius: '8px',
                          padding: '3px 8px',
                          color: '#cdd6f4',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span>{meta.icon}</span> {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading state */}
              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#89b4fa', fontSize: '0.82rem', padding: '0.5rem 0' }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    style={{ display: 'inline-flex' }}
                  >
                    <Cpu size={16} />
                  </motion.div>
                  <span>Scikit-Learn model analyzing description...</span>
                </div>
              )}

              {/* Classification result display */}
              {result && !loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {/* Top results row */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                      gap: '0.75rem',
                      background: 'rgba(17, 17, 27, 0.6)',
                      padding: '0.85rem',
                      borderRadius: '12px',
                      border: '1px solid rgba(137, 180, 250, 0.1)',
                    }}
                  >
                    {/* Category prediction */}
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#a6adc8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Predicted Category
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span style={{ fontSize: '1.2rem' }}>{result.categoryIcon}</span>
                        <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#cdd6f4' }}>
                          {result.category}
                        </span>
                      </div>
                    </div>

                    {/* Confidence score */}
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#a6adc8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Confidence Score
                      </div>
                      <div style={{ marginTop: '2px' }}>
                        <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#89b4fa' }}>
                          {(result.confidence * 100).toFixed(1)}%
                        </span>
                        <div
                          style={{
                            width: '100%',
                            height: '6px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '3px',
                            marginTop: '4px',
                            overflow: 'hidden',
                          }}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, result.confidence * 100)}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            style={{
                              height: '100%',
                              background: 'linear-gradient(90deg, #89b4fa, #cba6f7)',
                              borderRadius: '3px',
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Risk level */}
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#a6adc8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Assessed Risk Level
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 10px',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            background: riskStyle.bg,
                            color: riskStyle.text,
                            border: `1px solid ${riskStyle.border}`,
                          }}
                        >
                          <ShieldAlert size={14} />
                          {result.riskLevel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Suggestion apply bar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      background: isMatch ? 'rgba(34, 197, 94, 0.08)' : 'rgba(203, 166, 247, 0.08)',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '10px',
                      border: `1px solid ${isMatch ? 'rgba(34, 197, 94, 0.2)' : 'rgba(203, 166, 247, 0.25)'}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
                      {isMatch ? (
                        <>
                          <CheckCircle2 size={16} className="text-green" />
                          <span style={{ color: '#a6e3a1', fontWeight: 500 }}>
                            Category matched: form is set to <strong>{result.category}</strong>
                          </span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} className="text-lavender" />
                          <span style={{ color: '#cdd6f4' }}>
                            AI suggests setting category to <strong>{result.category}</strong>
                          </span>
                        </>
                      )}
                    </div>

                    {!isMatch && (
                      <button
                        type="button"
                        onClick={() => onSelectCategory(result.categoryId as CrimeTypeKey)}
                        style={{
                          background: 'linear-gradient(135deg, #cba6f7, #89b4fa)',
                          color: '#11111b',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '5px 12px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <CheckCircle2 size={13} />
                        Apply Category
                      </button>
                    )}
                  </div>

                  {/* Detected risk factors */}
                  {result.riskFactors && result.riskFactors.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', fontSize: '0.75rem' }}>
                      <span style={{ color: '#a6adc8' }}>Detected Indicators:</span>
                      {result.riskFactors.map(f => (
                        <span
                          key={f}
                          style={{
                            background: 'rgba(49, 50, 68, 0.5)',
                            padding: '2px 7px',
                            borderRadius: '6px',
                            color: '#fab387',
                            border: '1px solid rgba(250, 179, 135, 0.2)',
                            fontFamily: 'monospace',
                            fontSize: '0.72rem',
                          }}
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Toggle probability distribution breakdown */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowProbs(!showProbs)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#89b4fa',
                        fontSize: '0.76rem',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <BarChart2 size={12} />
                      {showProbs ? 'Hide Category Probabilities' : 'View Full Class Probability Distribution'}
                    </button>

                    {showProbs && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          marginTop: '0.6rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.4rem',
                          background: 'rgba(17, 17, 27, 0.5)',
                          padding: '0.75rem',
                          borderRadius: '8px',
                        }}
                      >
                        {(Object.entries(result.probabilities) as [AICrimeCategory, number][]).map(([cat, prob]) => {
                          const pct = Math.round(prob * 100)
                          const isTop = cat === result.category
                          return (
                            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}>
                              <span style={{ width: '90px', color: isTop ? '#cdd6f4' : '#a6adc8', fontWeight: isTop ? 700 : 400 }}>
                                {AI_CATEGORIES[cat]?.icon} {cat}
                              </span>
                              <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div
                                  style={{
                                    width: `${pct}%`,
                                    height: '100%',
                                    background: isTop ? '#89b4fa' : 'rgba(205, 214, 244, 0.3)',
                                    borderRadius: '3px',
                                  }}
                                />
                              </div>
                              <span style={{ width: '38px', textAlign: 'right', color: isTop ? '#89b4fa' : '#6c7086', fontFamily: 'monospace' }}>
                                {pct}%
                              </span>
                            </div>
                          )
                        })}
                      </motion.div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

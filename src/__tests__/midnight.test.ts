import { describe, it, expect, vi } from 'vitest'
import { isLaceInstalled, generateMockReports } from '@/api/midnight'

// Mock window.midnight
vi.stubGlobal('window', {
  midnight: undefined,
})

describe('isLaceInstalled', () => {
  it('returns false when window.midnight is undefined', () => {
    expect(isLaceInstalled()).toBe(false)
  })

  it('returns false when mnLace is not present', () => {
    Object.assign(window, { midnight: {} })
    expect(isLaceInstalled()).toBe(false)
  })

  it('returns true when mnLace is present', () => {
    Object.assign(window, {
      midnight: {
        mnLace: {
          apiVersion: '1.0.0',
          name: 'Lace',
          enable: vi.fn(),
        },
      },
    })
    expect(isLaceInstalled()).toBe(true)
  })
})

describe('generateMockReports', () => {
  it('generates the requested number of reports', () => {
    const reports = generateMockReports(5)
    expect(reports).toHaveLength(5)
  })

  it('generates reports with valid crime types (0-7)', () => {
    const reports = generateMockReports(8)
    for (const r of reports) {
      expect(r.crimeType).toBeGreaterThanOrEqual(0)
      expect(r.crimeType).toBeLessThanOrEqual(7)
    }
  })

  it('generates reports with boolean hasEvidence', () => {
    const reports = generateMockReports(8)
    for (const r of reports) {
      expect(typeof r.hasEvidence).toBe('boolean')
    }
  })

  it('generates reports with valid status codes (0-3)', () => {
    const reports = generateMockReports(8)
    for (const r of reports) {
      expect(r.status).toBeGreaterThanOrEqual(0)
      expect(r.status).toBeLessThanOrEqual(3)
    }
  })

  it('each report has a unique id', () => {
    const reports = generateMockReports(10)
    const ids = reports.map((r) => r.id.toString())
    const unique = new Set(ids)
    expect(unique.size).toBe(reports.length)
  })
})

import { describe, it, expect } from 'vitest'
import { defineConfig, VERSION } from '../src/index'

describe('@mineproj/core scaffold', () => {
  it('defineConfig returns its input', () => {
    const cfg = defineConfig({ site: { title: 'x' } })
    expect(cfg.site.title).toBe('x')
  })

  it('exposes a version', () => {
    expect(VERSION).toBe('0.0.0')
  })
})

import { describe, it, expect } from 'vitest'
import { renderMarkdown } from '../../../app/utils/render-markdown'

describe('renderMarkdown', () => {
  it('returns empty string for empty input', () => {
    expect(renderMarkdown('')).toBe('')
  })

  it('returns empty string for null input', () => {
    expect(renderMarkdown(null as any)).toBe('')
  })

  it('returns empty string for undefined input', () => {
    expect(renderMarkdown(undefined as any)).toBe('')
  })

  it('converts ### header to bold', () => {
    expect(renderMarkdown('### Header')).toBe('<strong>Header</strong>')
  })

  it('converts ## header to styled bold', () => {
    expect(renderMarkdown('## Header')).toBe(
      '<strong class="text-sm uppercase tracking-wide">Header</strong>'
    )
  })

  it('converts # header to text-base bold', () => {
    expect(renderMarkdown('# Header')).toBe(
      '<strong class="text-base">Header</strong>'
    )
  })

  it('converts **bold** to strong', () => {
    expect(renderMarkdown('**bold**')).toBe('<strong>bold</strong>')
  })

  it('converts *italic* to em', () => {
    expect(renderMarkdown('*italic*')).toBe('<em>italic</em>')
  })

  it('converts markdown links to anchor tags', () => {
    const result = renderMarkdown('[text](https://example.com)')
    expect(result).toBe(
      '<a href="https://example.com" class="text-blue-600 hover:underline" target="_blank">text</a>'
    )
  })

  it('converts bullet points to bullet characters', () => {
    expect(renderMarkdown('- item')).toBe('• item')
  })

  it('converts double newlines to paragraph breaks', () => {
    expect(renderMarkdown('first\n\nsecond')).toBe(
      'first</p><p class="mt-2">second'
    )
  })

  it('converts single newlines to br tags', () => {
    expect(renderMarkdown('line1\nline2')).toBe('line1<br>line2')
  })

  it('composes all transforms correctly', () => {
    const input = '## Title\n\n**bold** and *italic*\n- bullet'
    const result = renderMarkdown(input)
    expect(result).toContain('<strong class="text-sm uppercase tracking-wide">Title</strong>')
    expect(result).toContain('<strong>bold</strong>')
    expect(result).toContain('<em>italic</em>')
    expect(result).toContain('• bullet')
  })

  it('passes plain text through unchanged', () => {
    expect(renderMarkdown('just plain text')).toBe('just plain text')
  })

  it('handles bold within a sentence', () => {
    expect(renderMarkdown('this is **important** stuff')).toBe(
      'this is <strong>important</strong> stuff'
    )
  })
})

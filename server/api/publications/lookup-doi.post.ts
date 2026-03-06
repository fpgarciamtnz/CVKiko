import type { PublicationData } from '~/utils/brick-types'
import { normalizeDoi, DOI_REGEX } from '~/utils/brick-types'

interface CrossrefAuthor {
  given?: string
  family?: string
  name?: string
}

interface CrossrefDateParts {
  'date-parts'?: number[][]
}

interface CrossrefMessage {
  'title'?: string[]
  'author'?: CrossrefAuthor[]
  'type'?: string
  'container-title'?: string[]
  'published'?: CrossrefDateParts
  'published-print'?: CrossrefDateParts
  'published-online'?: CrossrefDateParts
  'created'?: CrossrefDateParts
  'abstract'?: string
  'DOI'?: string
  'URL'?: string
  'is-referenced-by-count'?: number
}

const TYPE_MAP: Record<string, PublicationData['publicationType']> = {
  'journal-article': 'journal',
  'proceedings-article': 'conference',
  'book': 'book',
  'book-chapter': 'book',
  'monograph': 'book',
  'edited-book': 'book',
  'posted-content': 'article',
  'peer-review': 'journal',
  'patent': 'patent'
}

function extractDate(message: CrossrefMessage): string {
  const sources = [
    message.published,
    message['published-print'],
    message['published-online'],
    message.created
  ]

  for (const source of sources) {
    const parts = source?.['date-parts']?.[0]
    if (parts && parts.length >= 1) {
      const year = parts[0]
      const month = parts[1] ? String(parts[1]).padStart(2, '0') : '01'
      return `${year}-${month}`
    }
  }

  return ''
}

function stripJatsXml(html: string): string {
  return html
    .replace(/<jats:[^>]*>/g, '')
    .replace(/<\/jats:[^>]*>/g, '')
    .replace(/<[^>]+>/g, '')
    .trim()
}

function formatAuthors(authors?: CrossrefAuthor[]): string[] {
  if (!authors || authors.length === 0) return ['']

  return authors.map((a) => {
    if (a.name) return a.name
    const parts = [a.given, a.family].filter(Boolean)
    return parts.join(' ')
  }).filter(name => name.length > 0)
}

export default defineEventHandler(async (event) => {
  const { doi: rawDoi } = await readBody<{ doi: string }>(event)

  if (!rawDoi) {
    throw createError({
      statusCode: 400,
      message: 'DOI is required'
    })
  }

  const doi = normalizeDoi(rawDoi)

  if (!DOI_REGEX.test(doi)) {
    return { found: false as const, error: 'Invalid DOI format. Expected format: 10.xxxx/...' }
  }

  try {
    const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
      headers: {
        'User-Agent': 'CVKiko/1.0 (https://github.com/fpgarcia; mailto:contact@fpgarcia.dev)'
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        return { found: false as const, error: 'DOI not found in Crossref database' }
      }
      return { found: false as const, error: `Crossref API error (${response.status})` }
    }

    const json = await response.json() as { message: CrossrefMessage }
    const message = json.message

    const data: Partial<PublicationData> = {
      title: message.title?.[0] ?? '',
      authors: formatAuthors(message.author),
      publicationType: TYPE_MAP[message.type ?? ''] ?? 'other',
      publicationName: message['container-title']?.[0] ?? '',
      date: extractDate(message),
      abstract: message.abstract ? stripJatsXml(message.abstract) : '',
      doi: message.DOI ?? doi,
      url: message.URL ?? '',
      citations: message['is-referenced-by-count'] ?? 0
    }

    return { found: true as const, data }
  } catch (error) {
    const err = error instanceof Error ? error.message : 'Unknown error'
    console.error('DOI lookup error:', err)
    return { found: false as const, error: 'Failed to fetch DOI metadata. Please try again.' }
  }
})

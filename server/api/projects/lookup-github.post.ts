import { generateObject } from 'ai'
import { z } from 'zod'
import type { ProjectData } from '~/utils/brick-types'
import { parseGitHubUrl } from '~/utils/brick-types'

interface GitHubRepo {
  name: string
  description: string | null
  topics: string[]
  homepage: string | null
  created_at: string
  fork: boolean
}

interface GitHubLanguages {
  [language: string]: number
}

const GITHUB_API = 'https://api.github.com'

async function fetchGitHub<T>(path: string): Promise<{ data: T | null, status: number }> {
  const response = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'CVKiko/1.0'
    }
  })
  if (!response.ok) return { data: null, status: response.status }
  return { data: await response.json() as T, status: response.status }
}

async function fetchReadme(owner: string, repo: string): Promise<string> {
  const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/readme`, {
    headers: {
      'Accept': 'application/vnd.github.raw',
      'User-Agent': 'CVKiko/1.0'
    }
  })
  if (!response.ok) return ''
  return await response.text()
}

const AIProjectSchema = z.object({
  description: z.string().describe('1-2 sentence project overview suitable for a CV. Be concise and professional.'),
  problem: z.string().describe('What problem does this project solve? One sentence.'),
  features: z.array(z.string()).describe('2-4 key features of the project. Short, action-oriented bullet points.'),
  outcome: z.string().describe('Impact or results achieved. If unclear from README, describe the project\'s value proposition.'),
  role: z.string().describe('Likely role based on the repo (e.g., "Creator", "Lead Developer", "Contributor"). Default to "Creator" for personal projects.')
})

export default defineEventHandler(async (event) => {
  const { url } = await readBody<{ url: string }>(event)

  if (!url) {
    throw createError({ statusCode: 400, message: 'GitHub URL is required' })
  }

  const parsed = parseGitHubUrl(url)
  if (!parsed) {
    return { found: false as const, error: 'Invalid GitHub URL. Expected format: https://github.com/owner/repo' }
  }

  const { owner, repo } = parsed

  try {
    // Fetch repo metadata, README, and languages in parallel
    const [repoResult, readme, languagesResult] = await Promise.all([
      fetchGitHub<GitHubRepo>(`/repos/${owner}/${repo}`),
      fetchReadme(owner, repo),
      fetchGitHub<GitHubLanguages>(`/repos/${owner}/${repo}/languages`)
    ])

    if (!repoResult.data) {
      if (repoResult.status === 404) {
        return { found: false as const, error: 'Repository not found. Make sure it\'s a public repository.' }
      }
      if (repoResult.status === 403) {
        return { found: false as const, error: 'GitHub API rate limit exceeded. Please try again later.' }
      }
      return { found: false as const, error: `GitHub API error (${repoResult.status})` }
    }

    const repoData = repoResult.data
    const languages = languagesResult.data ?? {}

    // Build technologies deterministically from languages + topics
    const techFromLanguages = Object.keys(languages)
    const techFromTopics = (repoData.topics ?? []).filter(
      topic => !techFromLanguages.some(lang => lang.toLowerCase() === topic.toLowerCase())
    )
    const technologies = [...techFromLanguages, ...techFromTopics]

    // Build links
    const links: ProjectData['links'] = [
      { label: 'GitHub', url: `https://github.com/${owner}/${repo}` }
    ]
    if (repoData.homepage) {
      links.push({ label: 'Demo', url: repoData.homepage })
    }

    // Extract date (YYYY-MM format from created_at)
    const date = repoData.created_at ? repoData.created_at.substring(0, 7) : ''

    // Use AI to extract structured fields from README
    let aiFields: { description: string, problem: string, features: string[], outcome: string, role: string } = {
      description: repoData.description ?? '',
      problem: '',
      features: [''],
      outcome: '',
      role: 'Creator'
    }

    const readmeForAI = readme.substring(0, 6000)

    if (readmeForAI || repoData.description) {
      try {
        const model = getModel(event)
        const { object } = await generateObject({
          model,
          schema: AIProjectSchema,
          system: `You are a CV writing assistant. Extract project information from the provided GitHub repository data. Be concise, professional, and write in a tone suitable for a CV/resume. Do not make up facts — only use information present in the provided data.`,
          prompt: `Repository: ${owner}/${repo}
Description: ${repoData.description ?? 'None'}
Languages: ${Object.keys(languages).join(', ') || 'None'}
Topics: ${(repoData.topics ?? []).join(', ') || 'None'}
Is fork: ${repoData.fork}

README content:
${readmeForAI || '(No README available)'}`
        })
        aiFields = object
      } catch (aiError) {
        console.error('AI extraction failed, using fallback:', aiError)
        // Keep the deterministic fallback values
      }
    }

    const data: Partial<ProjectData> = {
      name: repoData.name,
      description: aiFields.description,
      problem: aiFields.problem,
      features: aiFields.features.length > 0 ? aiFields.features : [''],
      technologies,
      outcome: aiFields.outcome,
      role: aiFields.role,
      links,
      isPersonal: !repoData.fork,
      date
    }

    return { found: true as const, data }
  } catch (error) {
    const err = error instanceof Error ? error.message : 'Unknown error'
    console.error('GitHub lookup error:', err)
    return { found: false as const, error: 'Failed to fetch GitHub repository data. Please try again.' }
  }
})

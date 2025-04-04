import { getInput, setFailed } from '@actions/core'
import { context, getOctokit } from '@actions/github'
import type { Context } from '@actions/github/lib/context'

export const run = async (): Promise<void> => {
  try {
    const githubToken = getInput('githubToken')
    const language = getInput('language')
    const octokit = getOctokit(githubToken)

    const prNumber = context.payload.pull_request?.number
    if (!prNumber) throw new Error('Invalid PR number')
    const repo = context.repo.repo
    const owner = context.repo.owner
    const { base, head } = getBaseAndHeadRevision(context)
    if (!base || !head) return

    const compareResult = await octokit.rest.repos.compareCommits({
      owner,
      repo,
      base,
      head
    })

    const newScripts =
      compareResult.data.files?.filter(
        file =>
          file.status === 'added' &&
          (file.filename.includes('script/') ||
            file.filename.includes('scripts/'))
      ) || []

    if (newScripts.length > 0) {
      await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body: commentBody(
          language,
          newScripts.map(file => file.filename)
        )
      })
    }
  } catch (error) {
    if (error instanceof Error) setFailed(error.message)
  }
}

const getBaseAndHeadRevision = (context: Context) => {
  if (context.payload.action === 'opened') {
    const base = context.payload.pull_request?.base.ref
    const head = context.sha
    return { base, head }
  } else if (context.payload.action === 'synchronize') {
    const base = context.payload.before
    const head = context.payload.after
    return { base, head }
  } else {
    return { base: null, head: null }
  }
}

const commentBody = (language: string, filenames: string[]) => {
  const filenamesComment = `${filenames.map(filename => `- ${filename}`).join('\n')}`
  switch (language) {
    case 'jp':
      return `# 以下のスクリプトが追加されています！実行を忘れないようにしましょう！\n\n
      ${filenamesComment}\n
      # スクリプト実行による副作用についても要チェック！！`

    case 'en':
      return `# The following scripts have been added! Don't forget to run them!\n
        ${filenamesComment}`

    default:
      return ''
  }
}

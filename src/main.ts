import { getInput, setFailed } from '@actions/core'
import { context, getOctokit } from '@actions/github'

export const run = async (): Promise<void> => {
  try {
    const githubToken = getInput('githubToken')
    const language = getInput('language')
    const octokit = getOctokit(githubToken)

    const prNumber = context.payload.pull_request?.number
    if (!prNumber) throw new Error('Invalid PR number')
    const repo = context.repo.repo
    const owner = context.repo.owner
    const baseBranch = context.payload.pull_request?.base.ref

    const compareResult = await octokit.rest.repos.compareCommits({
      owner,
      repo,
      base: baseBranch,
      head: context.sha
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

const commentBody = (language: string, filenames: string[]) => {
  const filenamesComment = `${filenames.map(filename => `- ${filename}`).join('\n')}`
  switch (language) {
    case 'jp':
      return `# 以下のスクリプトが追加されています！実行を忘れないようにしましょう！\n
      ${filenamesComment}`

    case 'en':
      return `# The following scripts have been added! Don't forget to run them!\n
        ${filenamesComment}`

    default:
      return ''
  }
}

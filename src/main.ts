import * as core from '@actions/core'
import * as github from '@actions/github'

(async () => {
  try {
    // Get GitHub Personal Access Token from action workflow
    const gitHubToken = core.getInput('github-token')
    const octokit = github.getOctokit(gitHubToken)

    // Get target org name and team name
    const targetOrganizationName = core.getInput('target-organization-name')
    const targetTeamName = core.getInput('target-team-name')

    // Get members
    const listMembersInOrgResponse = await octokit.rest.teams.listMembersInOrg({
      team_slug: targetTeamName,
      org: targetOrganizationName
    })

    // Extract member names
    const users = listMembersInOrgResponse.data.map((item) => item.login)

    // Get PR related information from action workflow
    const prRepoOwner = core.getInput('pr-repo-owner')
    const prRepoName = core.getInput('pr-repo-name')
    const prNumber = parseInt(core.getInput('pr-number'))
    const prAuthor = core.getInput('pr-author')

    // Pick random reviewer except author. (PR author cannot be assigned as reviewer)
    const reviewerCandidates = users.filter((item) => item !== prAuthor)
    if (reviewerCandidates.length === 0) {
      throw Error("There is no available reviewers!")
    }
    const selectedReviewer = reviewerCandidates[Math.floor(Math.random() * reviewerCandidates.length)]

    // Assign random reviewer
    await octokit.rest.pulls.requestReviewers({
      owner: prRepoOwner,
      repo: prRepoName,
      pull_number: prNumber,
      reviewers: [selectedReviewer]
    })

  } catch (error: any) {
    core.setFailed(error.message)
  }
})()

const {
  getCurrentBranch,
  getRepoName,
  getLastCommitAuthor,
  getLastCommitMessage,
} = require('./lib/git');
const { getLatestReleases, generateDraft, updateReleaseDescription } = require('./lib/github');
const {
  formatRepoName,
  getCurrentVersion,
  incrementMinorVersion,
  getLastDraft,
  validateCommitMessage,
  formatMessageWithAuthor,
  generateNewReleaseDescription,
} = require('./lib/util');

const { releaseBranch, developmentBranch, githubToken } = require('./lib/environment');

(async function entrypoint() {
  const currentBranch = await getCurrentBranch();
  if (![releaseBranch, developmentBranch].includes(currentBranch)) {
    console.log(
      `⏭ Skipping release note scribe because current branch ${currentBranch} not in the release branches: ${releaseBranch} or ${developmentBranch}`,
    );
    process.exit(78);
  }

  if (currentBranch === developmentBranch) {
    // Edit / create draft release
    const repoName = await formatRepoName(getRepoName());
    const versionBeingDrafted = await incrementMinorVersion(getCurrentVersion());
    let lastDraft = await getLastDraft(getLatestReleases());
    if (!lastDraft) {
      await generateDraft({ version: versionBeingDrafted, repoName, githubToken });
      lastDraft = await getLastDraft(getLatestReleases());
    }
    const message = await formatMessageWithAuthor(getLastCommitMessage(), getLastCommitAuthor());
    validateCommitMessage(message, lastDraft.body);

    await updateReleaseDescription({
      githubToken,
      version: versionBeingDrafted,
      releaseNotes: generateNewReleaseDescription(message, lastDraft.body),
      draftId: lastDraft.id,
      repoName,
    });
  }

  process.exit(0);
}());

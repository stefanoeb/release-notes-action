const {
  getCurrentBranch,
  getLastCommitAuthor,
  getLastCommitMessage,
  getCurrentBranch,
} = require('./lib/git');
const { getLatestReleases, generateDraft, updateReleaseDescription } = require('./lib/github');
const {
  getCurrentVersion,
  incrementMinorVersion,
  getLastDraft,
  validateCommitMessage,
  formatMessageWithAuthor,
  generateNewReleaseDescription,
} = require('./lib/util');

const { releaseBranch, developmentBranch } = require('./lib/environment');

(async function entrypoint() {
  const currentBranch = await getCurrentBranch();
  if (![releaseBranch, developmentBranch].includes(currentBranch)) {
    console.log(
      `⏭ Skipping release note scribe because current branch ${currentBranch} not in the release branches: ${releaseBranch} or ${developmentBranch}`,
    );
    process.exit(78); // 78 is skip status on the checks API
  }

  if (currentBranch === developmentBranch) {
    // Edit / create draft release
    try {
      const branch = await getCurrentBranch();
      const versionBeingDrafted = incrementMinorVersion(await getCurrentVersion());
      let lastDraft = getLastDraft(await getLatestReleases());
      if (!lastDraft) {
        await generateDraft(versionBeingDrafted);
        lastDraft = getLastDraft(await getLatestReleases());
      }
      const message = formatMessageWithAuthor(
        await getLastCommitMessage(branch),
        await getLastCommitAuthor(branch),
      );
      validateCommitMessage(message, lastDraft.body);

      await updateReleaseDescription({
        version: versionBeingDrafted,
        releaseNotes: generateNewReleaseDescription(message, lastDraft.body),
        draftId: lastDraft.id,
      });
    } catch (e) {
      console.log('🚨 Error on the release note scribe: ', e);
      process.exit(1);
    }
  }

  console.log('👌 Finished');
  process.exit(0);
})();

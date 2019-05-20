const { getCurrentBranch, getLastCommitAuthor, getLastCommitMessage } = require('./lib/git');
const { getLatestReleases, generateDraft, updateReleaseDescription } = require('./lib/github');
const {
  getCurrentVersion,
  incrementMinorVersion,
  getSpecificVersionDraft,
  validateCommitMessage,
  formatMessageWithAuthor,
  generateNewReleaseDescription,
} = require('./lib/util');

const { releaseBranch, developmentBranch } = require('./lib/environment');

(async function entrypoint() {
  console.log('🖋 RELEASE NOTE SCRIBE 🖋');
  try {
    const currentBranch = await getCurrentBranch();
    if (![releaseBranch, developmentBranch].includes(currentBranch)) {
      console.log(
        `⏭ Skipping release note scribe because current branch ${currentBranch} not in the release branches: ${releaseBranch} or ${developmentBranch}`,
      );
      process.exit(78); // 78 is skip status on the checks API
    }

    if (currentBranch === developmentBranch) {
      // Edit / create draft release
      const versionBeingDrafted = incrementMinorVersion(await getCurrentVersion());
      let lastDraft = getSpecificVersionDraft(await getLatestReleases(), versionBeingDrafted);
      if (!lastDraft) {
        await generateDraft(versionBeingDrafted, currentBranch);
        lastDraft = getSpecificVersionDraft(await getLatestReleases(), versionBeingDrafted);
      }
      const message = formatMessageWithAuthor(
        await getLastCommitMessage(currentBranch),
        await getLastCommitAuthor(currentBranch),
      );
      validateCommitMessage(message, lastDraft.body);

      await updateReleaseDescription({
        version: versionBeingDrafted,
        releaseNotes: generateNewReleaseDescription(message, lastDraft.body),
        draftId: lastDraft.id,
        branch: currentBranch,
      });
    }

    if (currentBranch === releaseBranch) {
      const currentVersion = await getCurrentVersion();
      const currentVersionOnDev = `${currentVersion}-dev`;
      let lastDraft = getSpecificVersionDraft(await getLatestReleases(), currentVersionOnDev);
      if (!lastDraft) {
        await generateDraft(currentVersion, currentBranch);
        lastDraft = getSpecificVersionDraft(await getLatestReleases(), currentVersion);
      }
      const message = formatMessageWithAuthor(
        await getLastCommitMessage(currentBranch),
        await getLastCommitAuthor(currentBranch),
      );
      validateCommitMessage(message, lastDraft.body);

      await updateReleaseDescription({
        version: currentVersion,
        releaseNotes: generateNewReleaseDescription(message, lastDraft.body),
        draftId: lastDraft.id,
        branch: currentBranch,
        draft: false,
      });
    }

    console.log('👌 Finished');
    process.exit(0);
  } catch (e) {
    console.log('🚨 Error on the release note scribe for draft: ', e);
    process.exit(1);
  }
}());

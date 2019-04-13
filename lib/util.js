const fs = require('fs');
const { prettifyRelease } = require('pretty-release');

function formatRepoName(gitRepoUrl) {
  return `${gitRepoUrl}`
    .replace('https://github.com/', '')
    .replace('git@github.com:', '')
    .replace('.git', '')
    .trim();
}

async function getCurrentVersion() {
  // Supports only js projects w/ semver
  if (fs.existsSync('./package.json')) {
    return JSON.parse(fs.readFileSync('./package.json')).version;
  }
  return '0.0.0 (placeholder)';
}

function incrementMinorVersion(currentVersion) {
  const currentVersionSplit = currentVersion.split('.');
  const placeholderVersion = `${currentVersionSplit[0]}.${(
    Number(currentVersionSplit[1]) + 1
  ).toString()}.0`;
  return `${placeholderVersion}-dev`;
}

function getLastDraft(lastReleases) {
  return lastReleases.find(release => release.draft).draft;
}

async function generateNewReleaseDescription(message, lastReleaseDescription) {
  return prettifyRelease(`${lastReleaseDescription}\n - ${message}`)
    .replace(/"/g, '\\"')
    .replace(/'/g, '`')
    .replace(/\n\n/g, '\\n')
    .replace(/\r\n/g, '\\n')
    .replace(/\n/g, '\\n');
}

function formatMessageWithAuthor(commitMessage, author) {
  return `${commitMessage
    .split('\n\n')[0]
    .trim()
    .replace(/"/g, '\\"')
    .replace(/'/g, '`')} (${author})`;
}

function validateCommitMessage(commitMessage, latestReleaseDescription) {
  if (commitMessage.startsWith('Merge branch')) {
    console.log('⏭ Skipping release note scribe because is a merge commit');
    process.exit(78);
  }
  if (latestReleaseDescription.includes(commitMessage)) {
    console.log('⏭ Skipping release note scribe because message is already inside the description');
    process.exit(78);
  }
}

module.exports = {
  formatRepoName,
  getCurrentVersion,
  incrementMinorVersion,
  getLastDraft,
  generateNewReleaseDescription,
  formatMessageWithAuthor,
  validateCommitMessage,
};

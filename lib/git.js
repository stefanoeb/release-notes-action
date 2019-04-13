const { execSync } = require('child_process');

async function getCurrentBranch() {
  return execSync('git rev-parse --abbrev-ref HEAD')
    .toString()
    .trim();
}

async function getCurrentCommitMessage(branchName) {
  return execSync(`git log --oneline -1 '${branchName}' --pretty=format:%s`).toString();
}

async function getRepoName() {
  return execSync('git config --get remote.origin.url');
}

async function getLastCommitMessage(branch) {
  return execSync(`git log --oneline -1 '${branch}' --pretty=format:%s`).toString();
}

async function getLastCommitAuthor() {
  return execSync("git --no-pager show -s --format='%an <%ae>'")
    .toString()
    .split('<')[0]
    .trim();
}

module.exports = {
  getCurrentBranch,
  getCurrentCommitMessage,
  getRepoName,
  getLastCommitMessage,
  getLastCommitAuthor,
};

const githubToken = process.env.GITHUB_TOKEN;
const releaseBranch = process.env.RELEASE_BRANCH || 'master';
const developmentBranch = process.env.DEVELOPMENT_BRANCH || 'develop';

module.exports = {
  githubToken,
  releaseBranch,
  developmentBranch,
};

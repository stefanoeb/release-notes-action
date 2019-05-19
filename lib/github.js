const { execSync } = require('child_process');
const axios = require('axios');

const { formatRepoName } = require('./util');
const { getRepoName } = require('./git');
const { githubToken } = require('./environment');

const apiClient = axios.create({
  baseURL: `https://api.github.com/repos/${formatRepoName(getRepoName())}/`,
  headers: {
    Authorization: `token ${githubToken}`,
  },
});
async function getLatestReleases() {
  try {
    const releases = await apiClient.get('/releases');
    if (releases.length === 0) {
      console.log('📭 No releases found so far in your repo.');
    }
    return releases;
  } catch (e) {
    console.log('❌ getLatestReleases: the following error has occured: ', e);
    return process.exit(1);
  }
}

async function generateDraft({ version, repoName, githubToken }) {
  console.log(`release-manager: 🗒️ Create draft ${version} from branch: develop`);
  const response = execSync(
    `curl -sH 'Authorization: token ${githubToken}' -d '{
        "tag_name": "",
        "target_commitish": "develop",
        "name": "${version}",
        "body": "**In this release:**",
        "draft": true,
        "prerelease": false
    }' 'https://api.github.com/repos/${repoName}/releases'`,
    { encoding: 'utf8' },
  );
  if (JSON.parse(response).errors !== undefined) {
    console.log(`❌ generateDraft: the following error has occured: \n${response}`);
    process.exit(1);
  }
  console.log(` ✅ New draft created successfully for version ${version}`);
}

async function updateReleaseDescription({
  githubToken, version, releaseNotes, repoName, draftId,
}) {
  const response = execSync(
    `curl -sH 'Authorization: token ${githubToken}' -d '{
        "tag_name": "",
        "target_commitish": "develop",
        "name": "${version}",
        "body": "${releaseNotes}",
        "draft": true,
        "prerelease": false
    }' 'https://api.github.com/repos/${repoName}/releases/${draftId}'`,
    { encoding: 'utf8' },
  );
  if (
    JSON.parse(response).errors !== undefined
    || JSON.parse(response).message === 'Problems parsing JSON'
  ) {
    console.log('❌ : There was an error trying to update the draft description');
    process.exit(1);
  }
}

module.exports = {
  getLatestReleases,
  generateDraft,
  updateReleaseDescription,
};

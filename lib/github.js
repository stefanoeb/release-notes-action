const { execSync } = require('child_process');

async function getLatestReleases(accessToken, repoFullName) {
  return JSON.parse(
    execSync(
      `curl -sH 'Authorization: token ${accessToken}' 'https://api.github.com/repos/${repoFullName}/releases'`,
    ),
  );
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

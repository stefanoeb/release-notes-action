const axios = require('axios');

const { formatRepoName } = require('./util');
const { getRepoName } = require('./git');
const { githubToken } = require('./environment');

async function getApiClient() {
  return axios.create({
    baseURL: `https://api.github.com/repos/${formatRepoName(await getRepoName())}/`,
    headers: {
      Authorization: `token ${githubToken}`,
    },
  });
}

async function getLatestReleases() {
  try {
    const apiClient = await getApiClient();
    const { data: releases } = await apiClient.get('/releases');
    return releases;
  } catch (e) {
    console.log('❌ getLatestReleases: the following error has occured: ', e);
    return process.exit(1);
  }
}

async function generateDraft(version, branch) {
  console.log(`🗒️ Creating draft for ${version}`);

  try {
    const apiClient = await getApiClient();
    await apiClient.post('/releases', {
      tag_name: '',
      target_commitish: branch,
      name: version,
      body: '**In this release:**',
      draft: true,
      prerelease: false,
    });
    console.log(`✅ New draft created successfully for version ${version}`);
  } catch (e) {
    console.log('❌ generateDraft: the following error has occured: ', e);
    process.exit(1);
  }
}

async function updateReleaseDescription({
  version, releaseNotes, draftId, branch,
}) {
  try {
    const apiClient = await getApiClient();
    await apiClient.post(`/releases/${draftId}`, {
      tag_name: '',
      target_commitish: branch,
      name: version,
      body: releaseNotes,
      draft: true,
      prerelease: false,
    });
    console.log(`✅ Updated draft description for version ${version}`);
  } catch (e) {
    console.log('❌ generateDraft: the following error has occured: ', e);
    process.exit(1);
  }
}

module.exports = {
  getLatestReleases,
  generateDraft,
  updateReleaseDescription,
};

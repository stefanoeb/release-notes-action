workflow "New workflow" {
  on = "push"
  resolves = ["Release note scribe", "ESLint"]
}

action "Release note scribe" {
  uses = "./"
  secrets = ["GITHUB_TOKEN"]
}

action "ESLint" {
  uses = "hallee/eslint-action@master"
  secrets = ["GITHUB_TOKEN"]
}

workflow "New workflow" {
  on = "push"
  resolves = ["Release note scribe"]
}

action "Release note scribe" {
  uses = "./"
  secrets = ["GITHUB_TOKEN"]
}

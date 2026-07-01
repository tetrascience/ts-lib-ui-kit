export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Allow JIRA-key-prefixed subjects (e.g. "feat: SW-1234 Add validation"),
    // which the default subject-case rule rejects as start-case. Matches the
    // commit convention documented in AGENTS.md.
    "subject-case": [0],
  },
};

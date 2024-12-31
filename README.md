# detect-new-script-action

Adds a comment to the PR when a file is added under the following directory.

- `script/`
- `scripts/`

## Usage:

The action works only with `pull_request` event.

### Inputs

- githubToken - The GITHUB_TOKEN secret.
- language - The language of message.

## Example

```
name: Comment detected new scripts

on:
  pull_request:

jobs:
  detect_new_script_action:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: kk0000-kk/detect-new-script-action@v1
        with:
          githubToken: ${{ secrets.GITHUB_TOKEN }}
          language: jp
```

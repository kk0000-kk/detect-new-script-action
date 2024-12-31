# detect-new-script-action

Comment detected new scripts.

## Usage:

The action works only with `pull_request` event.

### Inputs

- githubToken - The GITHUB_TOKEN secret.
- langueage - The language of message.

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

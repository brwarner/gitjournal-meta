# gitjournal-metadata README

A simple extension that adds the same created/modified YAML metadata to markdown files as you work.

By default the extension is turned off. Enable it with `gitjournal.metadata.enable` in your workspace.

## Features

Anytime a markdown file is saved in a workspace where this extension is enabled, a `modified` and `created` field will be added to its YAML header.

The `modified` field is updated to the current time anytime the file is saved.

The `created` field will only be updated if it does not exist. It'll be set to the time of the git commit the file was created on or, if the file is not in git, the creation time from the local filesystem.

The names of these fields and the file extensions they'll be added to can be configured in settings.

## Commands

* `Add Creation Date` will add the creation date from either git or the filesystem to the currently open file
* `Add GitJournal Dates from Git to All` will request creation and modified date information from git for the entire workspace and add these dates to any files missing them. **Warning: This will open all the files for edit in your workspace.**

## Extension Settings

* `gitjournal.metadata.enable` is the extension enabled (best to set this on a workspace-by-workspace basis)
* `gitjournal.metadata.extensions` array of extensions to operate on (default is just `md` files)
* `gitjournal.metadata.modifiedFieldName` what to name the `modified` field in YAML
* `gitjournal.metadata.createdFieldName` what to name the `created` field in YAML

## Known Issues

When using Save All, sometimes the extension will change the active text editor.

## Release Notes

* **v0.0.4** Fixed issue with deleting tables: <https://github.com/brwarner/gitjournal-meta/issues/2>
* **v0.0.3** Fixed crash due to improper moment.js import

# gitjournal-metadata README

A simple extension that adds the same created/modified YAML metadata to markdown files as you work.

By default the extension is turned off. Enable it with `gitjournal.metadata.on` in your workspace.

## Features

Anytime a markdown file is saved in a workspace where this extension is enabled, a `modified` and `created` field will be added to its YAML header.

The `modified` field is updated to the current time anytime the file is saved.

The `created` field will only be updated if it does not exist. It'll be set to the time of the git commit the file was created on or, if the file is not in git, the creation time from the local filesystem.

The names of these fields and the file extensions they'll be added to can be configured in settings.

## Extension Settings

* `gitjournal.metadata.on` is the extension enabled (best to set this on a workspace-by-workspace basis)
* `gitjournal.metadata.extensions` array of extensions to operate on (default is just `md` files)
* `gitjournal.metadata.modifiedFieldName` what to name the `modified` field in YAML
* `gitjournal.metadata.createdFieldName` what to name the `created` field in YAML

## Known Issues

When using Save All, sometimes the extension will change the active text editor.

## Release Notes

No releases yet.
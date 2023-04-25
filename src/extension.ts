import * as vscode from 'vscode';
import { parseMarkdownDocument, writeYamlHeaderIntoDocument } from './markdown';
import { getCreatedFieldName, getModifiedFieldName, isMetadataExtension, isMetadataEnabled } from './config';
import moment from 'moment';
import { getCreatedMoment, getCreatedMoments } from './creation';
import * as fs from 'fs';
import path = require('path');

/** Extension entry point */
export function activate(context: vscode.ExtensionContext) {

	// Register add creation date command
	let subscription = vscode.commands.registerTextEditorCommand('gitjournal-metadata.add-created-date', async (editor) => {
		// Get creation moment from disk or git
		const created = await getCreatedMoment(editor.document.uri);

		// Get formatted created date
		const formattedCreatedDate = created.format();
		
		// Write it into the document header
		const { header } = parseMarkdownDocument(editor.document);
		header[getCreatedFieldName()] = formattedCreatedDate;
		writeYamlHeaderIntoDocument(editor.document, header);

	});
	context.subscriptions.push(subscription);

	// Register add creation date to all command
	subscription = vscode.commands.registerCommand('gitjournal.metadata.add-created-date-all', async () => {
		const CREATED = getCreatedFieldName();
		const MODIFIED = getModifiedFieldName();

		// Get workspace directory
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
		if(!workspaceFolder) { return; }

		// Get git timestamps for folder
		const stamps = await getCreatedMoments(workspaceFolder);

		// Iterate over paths found
		for(const [filename, info] of stamps.entries())
		{
			// Ignore extensions we don't care about
			if(!isMetadataExtension(filename)) { continue; }

			// Open and read doc
			// const text = await fs.promises.readFile(path.join(workspaceFolder, filename))
			const doc = await vscode.workspace.openTextDocument(path.join(workspaceFolder, filename));
			const { header } = parseMarkdownDocument(doc);

			// Ignore if it already has a created header
			if(CREATED in header && MODIFIED in header) { continue; }

			// Otherwise, make an edit
			if(!(CREATED in header)) {
				header[CREATED] = info.created.format();
			}
			if(!(MODIFIED in header)) {
				header[MODIFIED] = info.modified.format();
			}
			await writeYamlHeaderIntoDocument(doc, header);
		}
	});
	context.subscriptions.push(subscription);

	// Register a handler to run when we're about to save a text document
	subscription = vscode.workspace.onWillSaveTextDocument(willSaveTextDocumentEvent => {
		const MODIFIED = getModifiedFieldName();
		const CREATED = getCreatedFieldName();
		const document = willSaveTextDocumentEvent.document;

		// Don't bother on non-modified documents
		if(!document.isDirty) { return; }

		// Ignore if we're not on
		if(!isMetadataEnabled() || !isMetadataExtension(document)) { return; }

		// Parse document
		const { header } = parseMarkdownDocument(document);

		// Change header modified date
		header[MODIFIED] = moment().format();

		// If new document, add created date too
		let getCreationPromise: Promise<moment.Moment>|undefined;
		if(!(CREATED in header)) {
			getCreationPromise = getCreatedMoment(document.uri);
		}

		// Write back
		const promise = getCreationPromise ? getCreationPromise.then(moment => { 
			header[CREATED] = moment.format();
			return writeYamlHeaderIntoDocument(document, header);
		}) : writeYamlHeaderIntoDocument(document, header);
		willSaveTextDocumentEvent.waitUntil(promise);
	});
	context.subscriptions.push(subscription);
}

// This method is called when your extension is deactivated
export function deactivate() {}

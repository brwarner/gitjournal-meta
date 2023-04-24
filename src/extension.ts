import * as vscode from 'vscode';
import { parseMarkdownDocument, writeYamlHeaderIntoDocument } from './markdown';
import { getCreatedPropertyName, getModifiedPropertyName, isMetadataExtension, isMetadataOn } from './config';
import * as moment from 'moment';
import { getCreatedMoment } from './creation';

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
		header[getCreatedPropertyName()] = formattedCreatedDate;
		writeYamlHeaderIntoDocument(editor.document, header);

	});
	context.subscriptions.push(subscription);

	// Register a handler to run when we're about to save a text document
	subscription = vscode.workspace.onWillSaveTextDocument(willSaveTextDocumentEvent => {
		const MODIFIED = getModifiedPropertyName();
		const CREATED = getCreatedPropertyName();
		const document = willSaveTextDocumentEvent.document;

		// Don't bother on non-modified documents
		if(!document.isDirty) { return; }

		// Ignore if we're not on
		if(!isMetadataOn() || !isMetadataExtension(document)) { return; }

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

import path = require('path');
import * as vscode from 'vscode';

function config() 
{
    return vscode.workspace.getConfiguration();
}

/**
 * Returns true if the extension is on for this workspace
 */
export function isMetadataOn(): boolean
{
	return config().get<boolean>('gitjournal.metadata.on') ?? false;
}

/**
 * Checks if a filename or document is managed by this extension
 */
export function isMetadataExtension(file: string|vscode.TextDocument): boolean
{
    // Get filename
    const fileName = typeof file === "string" ? file : file.fileName;

    // Check if the config contains that filename
    return config().get<string[]>("gitjournal.metadata.extensions")?.includes(path.extname(fileName).substring(1)) ?? false;
}

/**
 * Returns the name of the yaml property for the modified date
 */
export function getModifiedPropertyName(): string
{
    return config().get<string>('gitjournal.metadata.modifiedPropertyName') ?? 'modified';
}

/**
 * Returns the name of the yaml property for the created date
 */
export function getCreatedPropertyName(): string
{
    return config().get<string>('gitjournal.metadata.createdPropertyName') ?? 'modified';
}
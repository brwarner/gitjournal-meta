import * as vscode from 'vscode';
import * as yaml from 'yaml';

// Matches a markdown document with yaml front matter
const MARKDOWN_WITH_YAML_MATCHER = /^---\s+(?<yaml>.+?)\n+---(?<markdown>.*)$/s;
const YAML_MATCHER = /^---\s+.+?\n+---/s;

/**
 * Given a text document, split out the yaml header and parse it
 * @param document Text document to parse
 * @returns Markdown content and parsed Yaml header
 */
export function parseMarkdownDocument(document: vscode.TextDocument|string): { header: any, content: string }
{
    // Get document text
    const text = typeof document === "string" ? document : document.getText();

    // Test it against our frontdown matcher
    const match = text.match(MARKDOWN_WITH_YAML_MATCHER);
    if(!match || !match.groups) { 
        return { 
            header: { }, 
            content: text
        };
    }

    // Parse yaml
    const parsedYaml = yaml.parse(match.groups['yaml'].trim());

    // Return
    return { 
        header: parsedYaml,
        content: match.groups['markdown']
    };
}

function getYamlHeaderRange(document: vscode.TextDocument): vscode.Range
{
    // Get text
    const text = document.getText();

    // Create a range covering the existing yaml (if it exists)
    let yamlRange = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0));
    const match = text.match(YAML_MATCHER);
    if(match) { 
        // Create range encompassing the yaml
        yamlRange = new vscode.Range(document.positionAt(0), document.positionAt(match[0].length));
    }

    return yamlRange;
}

function replaceYamlHeader(edit: vscode.TextEditorEdit, existingRange: vscode.Range, header: any)
{
    // Create new yaml header text
    const newHeaderText = `---\n${yaml.stringify(header)}---${existingRange.isEmpty ? '\n\n' : ''}`;

    // Process edit
    edit.replace(existingRange, newHeaderText);
}

export function writeYamlHeaderIntoEdit(document: vscode.TextDocument, edit: vscode.TextEditorEdit, header: any)
{
    const range = getYamlHeaderRange(document);
    replaceYamlHeader(edit, range, header);
}

/**
 * Write a new YAML header into a text document, replacing an existing one if it exists
 * @param document Document to write yaml header into
 * @param header Header object to stringify and write
 * @returns Promise to complete edit
 */
export function writeYamlHeaderIntoDocument(document: vscode.TextDocument, header: any): Thenable<boolean>
{
    // Get range of existing header
    const yamlRange = getYamlHeaderRange(document);

    // Replace the header with a new one
    return vscode.window.showTextDocument(document)
        .then(editor => editor.edit(edit => replaceYamlHeader(edit, yamlRange, header)));
}
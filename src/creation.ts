import * as vscode from 'vscode';
import * as moment from 'moment';
import * as git from 'git-date-extractor';
import * as fs from 'fs';

export async function getCreatedMoment(uri: vscode.Uri): Promise<moment.Moment>
{
    // Get workspace folder and relative filename
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri)?.uri.fsPath;
    const filename = workspaceFolder ? vscode.workspace.asRelativePath(uri) : uri.fsPath;

    // Return value
    let created: moment.Moment|undefined = undefined;

    // Try to get the date from git
    try
    {
        // Get stamp for file
        const stamps = await git.getStamps({
            projectRootPath: workspaceFolder,
            files: [filename]
        });

        // Get filestamp as moment
        const time = stamps[filename]?.created;
        if(typeof time === "number") { 
            created = moment(time*1000);
        }
    }
    catch(err) { }

    // On failure, try to get the date from the filesystem
    if(!created) {
        const stat = await fs.promises.stat(uri.fsPath);
        created = moment(stat.birthtime);
    }

    return created;
}
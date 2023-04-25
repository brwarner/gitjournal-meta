import * as vscode from 'vscode';
import moment from 'moment';
import * as git from 'git-date-extractor';
import * as fs from 'fs';

export interface StampInfo
{
    created: moment.Moment;
    modified: moment.Moment;
}

export async function getCreatedMoments(path: string): Promise<Map<string, StampInfo>>
{
    try
    {
        // Get time stamps
        const stamps = await git.getStamps({
            projectRootPath: path,
        });

        // Convert them to a map
        const map = new Map<string, StampInfo>();
        for(const key in stamps)
        {
            const created = stamps[key].created;
            const modified = stamps[key].modified;
            if(typeof created === "number" && typeof modified === "number") {
                map.set(key, {
                    created: moment(created*1000),
                    modified: moment(modified*1000)
                });
            }
        }

        return map;
    }
    catch(err)
    {
        // Return an empty map
        return new Map();
    }
}

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
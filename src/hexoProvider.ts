import * as vscode from 'vscode';
import { isHexoProject, fsExist, fsStat, fsReaddir } from './utils';
import * as fs from 'fs';
import * as path from 'path';
import { ArticleTypes } from './commands';
import { HexoCommands } from './extension';

async function getDirFiles(dir: fs.PathLike): Promise<string[]> {
  const exist = (await fsExist(dir)) && ((await fsStat(dir)) as fs.Stats).isDirectory();

  if (!exist) {
    return [];
  }

  return (await fsReaddir(dir)) as string[];
}

export class HexoArticleProvider implements vscode.TreeDataProvider<HexoItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<HexoItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  type = ArticleTypes.post;

  constructor(type: ArticleTypes = ArticleTypes.post) {
    this.type = type;
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: HexoItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  async getChildren(element?: HexoItem): Promise<HexoItem[]> {
    const items: HexoItem[] = [];
    if (!isHexoProject()) {
      return items;
    }

    const postsPath = path.join(vscode.workspace.rootPath as string, 'source', `_${this.type}s`);

    const paths = await getDirFiles(postsPath);

    paths.forEach((p) => {
      if (/\.md$/.test(p)) {
        items.push(new HexoItem(p, path.join(postsPath, p)));
      }
    });

    return items;
  }
}

export class HexoItem extends vscode.TreeItem {
  iconPath = vscode.ThemeIcon.File;

  constructor(label: string, uri: string, collapsibleState?: vscode.TreeItemCollapsibleState) {
    super(label, collapsibleState);

    this.resourceUri = vscode.Uri.file(uri);
    this.command = {
      title: 'open',
      command: HexoCommands.open,
      arguments: [uri],
    };
  }
}
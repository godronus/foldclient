'use strict';
import * as vscode from 'vscode';

export const regionStartTag = new RegExp('#region');
export const regionEndTag = new RegExp('#endregion');

function getAllRegionTags() {
  const textEditor = vscode.window.activeTextEditor;
  const document = textEditor.document;
	let lineNumbers = Array<number>();
	for (let index = 0; index < document.lineCount; index++) {
			const line = document.lineAt(index);
			if (line.text.search(regionStartTag) > -1) lineNumbers.push(line.lineNumber);
	}
  return lineNumbers;
}

function getLineTags(lineStr: string) {
  const lineTags = lineStr.replace(/(\/|#region|{|}|\*)/gi, '');
  return lineTags.split('|').reduce((a,c) => {
    const tag = c.trim();
    if (tag.length) a.push(tag.toLowerCase());
    return a;
  }, [])
}

function isSelectedRegion(lineStr: string, clientOptions: Array<string>) {
  const tags = getLineTags(lineStr);
  return tags.reduce((a,c) => {
    if (a) return a;
    return clientOptions.filter((cOpt) => cOpt === c).length > 0;
  }, false);
}

function testRegionTags() {
  /*
  * test region tags are balanced and nesting is correct
  */
  const textEditor = vscode.window.activeTextEditor;
  const document = textEditor.document;
  let regionTagOrder = Array<Array<string>>();
	for (let index = 0; index < document.lineCount; index++) {
			const line = document.lineAt(index);
			if (line.text.search(regionStartTag) > -1) {
        const startLineTags = getLineTags(line.text);
        if (regionTagOrder.length === 0) { //not nested
          regionTagOrder.push(startLineTags);
        } else { //nested - test tag is valid within surrounding region
          const surroundingRegionTags = regionTagOrder[regionTagOrder.length - 1];
          const nestedTagsExistInSurroundingRegion = startLineTags.reduce((acc, curr) => {
            if (!acc) return acc;
            return surroundingRegionTags.reduce((a, c) => {
              if (a) return a;
              return curr === c;
            }, false);
          }, true);
          if(nestedTagsExistInSurroundingRegion) {
            regionTagOrder.push(startLineTags);
          } else {
            vscode.window.showErrorMessage(`ERROR: (${index + 1}): Nested #region: \n  ${line.text}  \n This #region is surrounded by a #region without sufficient clients, unreachable code`);
            regionTagOrder.push([]);
            break;
          }
        }
      } else if (line.text.search(regionEndTag) > -1) {
        if (regionTagOrder.length === 0) {
          vscode.window.showErrorMessage(`ERROR: (${index + 1}): Fold Client: Unbalanced region tags #endregion:#endregion`);
          regionTagOrder.push([]);
          break;
        } else {
          regionTagOrder.pop();
        }
      }
  }
  if (regionTagOrder.length !== 0) {
    if (regionTagOrder[regionTagOrder.length - 1].length > 0) {
      vscode.window.showErrorMessage('ERROR: Fold Client: Unbalanced region tags #region.length !== #endregion.length');
    }
  }
  return regionTagOrder.length === 0
}

export async function showOnlyNamedSettings() {
  if (!testRegionTags()) return;
  const textEditor = vscode.window.activeTextEditor;
  const document = textEditor.document;
  const foldLines = getAllRegionTags();
  const clientsList = vscode.workspace.getConfiguration('foldclient').get("visibleClients", []).map((s) => s.toLowerCase());
  try {
    for (const lineNumber of foldLines) {
      textEditor.selection = new vscode.Selection(lineNumber, 0, lineNumber, 0);
      const line = document.lineAt(lineNumber);
      if (isSelectedRegion(line.text, clientsList)) {
        await vscode.commands.executeCommand('editor.unfold');
      } else {
        await vscode.commands.executeCommand('editor.fold');
      }
    }
  } catch(error) {
    vscode.window.showErrorMessage('ERROR: Fold Client FAILED!!');
  }
}

export async function unFoldAllRegions() {
  if (!testRegionTags()) return;
  const textEditor = vscode.window.activeTextEditor;
  const foldLines = getAllRegionTags();
  try {
    for (const lineNumber of foldLines) {
      textEditor.selection = new vscode.Selection(lineNumber, 0, lineNumber, 0);
      await vscode.commands.executeCommand('editor.unfold');
    }
  } catch(error) {
    vscode.window.showErrorMessage('ERROR: Fold Client FAILED!!');
  }
}

export  async function foldAllRegions() {
  if (!testRegionTags()) return;
  const textEditor = vscode.window.activeTextEditor;
  const foldLines = getAllRegionTags().reverse(); // work backwards to stop unfolding regions already folded (nesting)
  try {
    for (const lineNumber of foldLines) {
      textEditor.selection = new vscode.Selection(lineNumber, 0, lineNumber, 0);
      await vscode.commands.executeCommand('editor.fold');
    }
  } catch(error) {
    vscode.window.showErrorMessage('ERROR: Fold Client FAILED!!');
  }
}


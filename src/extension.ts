'use strict';
import * as vscode from 'vscode';
import * as foldHelper from './foldHelper';
import * as FoldClient from "./MyFoldingRangeProvider";
import * as IConfiguration from "./IConfiguration";

import { regionStartTag, regionEndTag } from './foldHelper';

const clientList = 'ae | all3 | amc | banijay | cineflix | demo | drg | endemol | itv | keshet | rtv | storylab | sky';

function loadConfiguration() {
  let config: IConfiguration.IConfiguration = Object.assign(
    {},
    IConfiguration.DefaultConfiguration
  );
  return config;
}

function getSupportedLanguages() {
  const supportedLanguages: string[] = [];
  const configuration = loadConfiguration();
  for (let prop in configuration) {
    if (prop.startsWith("[") && prop.endsWith("]")) {
      const languageName = prop.substr(1, prop.length - 2);
      supportedLanguages.push(languageName);
    }
  }
  return supportedLanguages;
}

function registerFoldingRangeProvider() {
  const configuration = loadConfiguration();
  const supportedLanguages = getSupportedLanguages();
  const foldingRangeProvider = new FoldClient.MyFoldingRangeProvider(configuration);
  vscode.languages.registerFoldingRangeProvider(
    supportedLanguages,
    foldingRangeProvider
  );
  return foldingRangeProvider;
}

const foldingRangeProvider = registerFoldingRangeProvider();

export function activate(context: vscode.ExtensionContext) {

  context.subscriptions.push(vscode.commands.registerCommand('godronus-foldClient.all', () => {
    foldHelper.unFoldAllRegions();
  }));

  context.subscriptions.push(vscode.commands.registerCommand('godronus-foldClient.named', () => {
    foldHelper.showOnlyNamedSettings();
  }));

	context.subscriptions.push(vscode.commands.registerCommand('godronus-foldClient.hide', () => {
    foldHelper.foldAllRegions();
  }));

  context.subscriptions.push(vscode.commands.registerCommand('godronus-foldClient.setClients', () => {
    setVisibleClients();
  }));

  context.subscriptions.push(vscode.commands.registerCommand('godronus-foldClient.wrapWithRegion', () => {
    wrapSelectedWithRegion();
  }));

  context.subscriptions.push(vscode.commands.registerCommand('godronus-foldClient.wrapWithAllRegions', () => {
    wrapSelectedWithRegion(clientList);
  }));

  context.subscriptions.push(vscode.commands.registerCommand('godronus-foldClient.commentLines', () => {
    commentSelectedLines();
  }));

  context.subscriptions.push(vscode.commands.registerCommand('godronus-foldClient.cleanRegionComments', () => {
    cleanRegionComments();
  }));

  context.subscriptions.push(vscode.commands.registerCommand('godronus-foldClient.regionsNamed', () => {
    showInputtedClientsRegions();
  }));


  function commentRegionLine(ate, lineNumber, cleanRegionTags = false) {
    return new Promise((resolve, reject) => {
      try {
        ate.edit(edit => {
          const text = ate.document.lineAt(lineNumber).text;
          if (text.search(regionStartTag) === -1 && text.search(regionEndTag) === -1) {
            return resolve(); // Not a region tag row
          }
          const regionTagCommented = text.indexOf('*//*') !== -1;
          let currentText = '*//*', newText = '*/';
          if (!regionTagCommented) {
            // reopen comments for this region tag..
            currentText = '*/'
            newText = cleanRegionTags ? '*/' : '*//*';
          }
          const replacePos = text.indexOf(currentText);
          edit.delete(new vscode.Range(lineNumber, replacePos, lineNumber, replacePos + currentText.length));
          edit.insert(new vscode.Position(lineNumber, replacePos), newText)
        }).then(() => {
          return resolve();
        })
      } catch (error) {
        reject(error);
      }
    });
  }

  function commentRegionTags(ate, startLine, endLine) {
    return new Promise(async (resolve, reject) => {
      try {
        for (let lineNumber = startLine; lineNumber <= endLine; lineNumber += 1) {
          await commentRegionLine(ate, lineNumber);
        }
        return resolve(true);
      } catch (error) {
        return reject(false);
      }
    });
  }

  function commentSelectedLines() {
    let config = loadConfiguration();
    if (vscode.window.activeTextEditor) {
      /* #region Get the configuration for the current language */
      const ate = vscode.window.activeTextEditor;
      const languageId = ate.document.languageId;
      const currentLanguageConfig = config["[" + languageId + "]"];
      if (
        typeof currentLanguageConfig === "undefined" ||
        !currentLanguageConfig
      ) {
        vscode.window.showInformationMessage(
          "folderClient Region Folding. No region folding available for language '" +
          languageId + "'. Check that you have the language extension installed for these files."
        );
        return;
      }
      /* #endregion */

      /* #region Check if there is anything selected. */
      if (ate.selections.length > 1 || ate.selections.length < 1) {
        return;
      }

      const sel = ate.selection;
      if (sel.isEmpty) {
        return;
      }
      /* #endregion */

      commentRegionTags(ate, sel.start.line, sel.end.line)
        .then(() => {
          ate.selections = [sel];
          vscode.commands.executeCommand('editor.action.commentLine').then((fin) => {
            // Commenting finished..
          })
          ate.selections = [sel];
        })
        .catch(() => {
          vscode.window.showInformationMessage('Error Commenting lines..');
        })
    }
  }

  async function cleanRegionComments() {
    let config = loadConfiguration();
    if (vscode.window.activeTextEditor) {
      /* #region Get the configuration for the current language */
      const ate = vscode.window.activeTextEditor;
      const languageId = ate.document.languageId;
      const currentLanguageConfig = config["[" + languageId + "]"];
      if (
        typeof currentLanguageConfig === "undefined" ||
        !currentLanguageConfig
      ) {
        vscode.window.showInformationMessage(
          "folderClient Region Folding. No region folding available for language '" +
          languageId + "'. Check that you have the language extension installed for these files."
        );
        return;
      }
      /* #endregion */

      const lineCount = ate.document.lineCount;
      for (let lineNumber = 0; lineNumber < lineCount; lineNumber += 1) {
        await commentRegionLine(ate, lineNumber, true);
      }
    }
  }

  function setVisibleClients() {
    getClientsListFromUser()
      .then((clientsList) => {
        // Can display any info here after setting list..
        // vscode.window.showInformationMessage('Client List: ' + clientsList);
      })
  }

  function showInputtedClientsRegions() {
    getClientsListFromUser()
      .then((clientsList) => {
        foldHelper.showOnlyNamedSettings();
      })
  }

  function getClientsListFromUser() {
    return new Promise((resolve, reject) => {
      try {
        const config =  vscode.workspace.getConfiguration('foldclient');
        const clientConfigList = config.get("visibleClients", []).map((s) => s.toLowerCase())
        vscode.window.showInputBox({
          value: clientConfigList.join(', '),
          placeHolder: 'Comma seperated list: e.g. itv, rtv, banijay',
        }).then((newClientsStr) => {
          const newClients = newClientsStr.split(',').map((cn) => cn.trim().toLowerCase()).filter((nm) => nm.length);
          config.update("visibleClients", newClients, true).then(() => {
            return resolve(newClients);
          })
        });
      } catch (error) {
        vscode.window.showInformationMessage(error.toString());
        return reject(false);
      }
    });
  }


  function wrapSelectedWithRegion(clients = '') {
    let config = loadConfiguration();
    if (vscode.window.activeTextEditor) {
      /* #region Get the configuration for the current language */
      var ate = vscode.window.activeTextEditor;
      const languageId = ate.document.languageId;
      const currentLanguageConfig = config["[" + languageId + "]"];
      if (
        typeof currentLanguageConfig === "undefined" ||
        !currentLanguageConfig
      ) {
        vscode.window.showInformationMessage(
          "folderClient Region Folding. No region folding available for language '" +
          languageId + "'. Check that you have the language extension installed for these files."
        );
        return;
      }
      /* #endregion */

      /* #region Check if there is anything selected. */
      if (ate.selections.length > 1 || ate.selections.length < 1) {
        return;
      }

      var sel = ate.selection;
      if (sel.isEmpty) {
        return;
      }
      /* #endregion */

      var linePrefix = ate.document.getText(
        new vscode.Range(new vscode.Position(sel.start.line, 0), sel.start)
      );
      var addPrefix = "";
      if (/^\s+$/.test(linePrefix)) {
        addPrefix = linePrefix;
      }
      var eol = getEOLStr(ate.document.eol);

      //Get the position of [NAME] in the fold start template.
      let regionStartTemplate = currentLanguageConfig.foldStart;
      const idx = regionStartTemplate.indexOf("[NAME]");
      const nameInsertionIndex = idx < 0 ? 0 : regionStartTemplate.length - "[NAME]".length - idx;
      const regionStartText = regionStartTemplate.replace("[NAME]", clients);

      ate
        .edit(edit => {
          //Insert the #region, #endregion tags
          edit.insert(
            sel.end,
            eol + addPrefix + currentLanguageConfig.foldEnd
          );
          edit.insert(sel.start, regionStartText + eol + addPrefix);
        })
        .then(edit => {
          //Now, move the selection point to the [NAME] position.
          var sel = ate.selection;
          var newLine = sel.start.line - 1;
          var newChar =
            ate.document.lineAt(newLine).text.length - nameInsertionIndex;
          var newStart = sel.start.translate(
            newLine - sel.start.line,
            newChar - sel.start.character
          );
          var newSelection = new vscode.Selection(newStart, newStart);
          ate.selections = [newSelection];

          //Format the document
          vscode.commands.executeCommand(
            "editor.action.formatDocument",
            "editorHasDocumentFormattingProvider && editorTextFocus",
            true
          );
        });
    }
  }

  /* #endregion */

  /* #region  Subscribe to configuration changes */
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      foldingRangeProvider.configuration = loadConfiguration();
    })
  );
  /* #endregion */

}

var getEOLStr = function(eol: vscode.EndOfLine) {
  if (eol === vscode.EndOfLine.CRLF) {
    return "\r\n";
  }
  return "\n";
};

export function deactivate() {
}

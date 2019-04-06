export interface ILanguageConfiguration {
  foldEnd: string;
  foldEndRegex: string;
  foldStart: string;
  foldStartRegex: string;
}

export interface IConfiguration {
  [languageName: string]: ILanguageConfiguration;
}

export let DefaultConfiguration :IConfiguration = {
  "[css]": {
    foldEnd: "/* #endregion */",
    foldEndRegex: "/\\*[\\s]*#endregion",
    foldStart: "/* #region  [NAME] */",
    foldStartRegex: "^[\\s]*/\\*[\\s]*#region[\\s]*(.*)[\\s]*\\*/[\\s]*$"
  },
  "[html]": {
    foldEnd: "<!-- #endregion -->",
    foldEndRegex: "\\<!--[\\s]*#endregion",
    foldStart: "<!-- #region [NAME] -->",
    foldStartRegex: "\\<!--[\\s]*#region[\\s]*(.*)"
  },
  "[javascript]": {
    foldEnd: "/* #endregion */",
    foldEndRegex: "/\\*[\\s]*#endregion",
    foldStart: "/* #region  [NAME] */",
    foldStartRegex: "^[\\s]*/\\*[\\s]*#region[\\s]*(.*)[\\s]*\\*/[\\s]*$"
  },
  "[javascriptreact]": {
    foldEnd: "/* #endregion */",
    foldEndRegex: "/\\*[\\s]*#endregion",
    foldStart: "/* #region  [NAME] */",
    foldStartRegex: "^[\\s]*/\\*[\\s]*#region[\\s]*(.*)[\\s]*\\*/[\\s]*$"
  },
  "[json]": {
    foldEnd: "/* #endregion */",
    foldEndRegex: "/\\*[\\s]*#endregion",
    foldStart: "/* #region  [NAME] */",
    foldStartRegex: "^[\\s]*/\\*[\\s]*#region[\\s]*(.*)[\\s]*\\*/[\\s]*$"
  },
  "[less]": {
    foldEnd: "/* #endregion */",
    foldEndRegex: "/\\*[\\s]*#endregion",
    foldStart: "/* #region  [NAME] */",
    foldStartRegex: "^[\\s]*/\\*[\\s]*#region[\\s]*(.*)[\\s]*\\*/[\\s]*$"
  },
  "[markdown]": {
    foldEnd: "<!-- #endregion -->",
    foldEndRegex: "\\<!--[\\s]*#endregion",
    foldStart: "<!-- #region [NAME] -->",
    foldStartRegex: "\\<!--[\\s]*#region[\\s]*(.*)"
  },
  "[typescript]": {
    foldEnd: "/* #endregion */",
    foldEndRegex: "/\\*[\\s]*#endregion",
    foldStart: "/* #region  [NAME] */",
    foldStartRegex: "^[\\s]*/\\*[\\s]*#region[\\s]*(.*)[\\s]*\\*/[\\s]*$"
  }
};

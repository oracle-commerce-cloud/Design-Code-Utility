"use strict"

const Promise = require("bluebird")

const constants = require("./constants").constants
const classify = require("./classifier").classify
const endPointTransceiver = require("./endPointTransceiver")
const error = require("./logger").error
const exists = require("./utils").exists
const grabAllApplicationJavaScript = require("./applicationJavaScriptGrabber").grabAllApplicationJavaScript
const grabAllThemes = require("./themeGrabber").grabAllThemes
const grabTextSnippetsForLocaleDirectory = require("./textSnippetGrabber").grabTextSnippetsForLocaleDirectory
const grabCommonTextSnippets = require("./textSnippetGrabber").grabCommonTextSnippets
const grabAllStacks = require("./stackGrabber").grabAllStacks
const grabAllElements = require("./elementGrabber").grabAllElements
const grabFramework = require("./frameworkGrabber").grabFramework
const grabFrameworkDirectory = require("./frameworkGrabber").grabFrameworkDirectory
const grabAllWidgets = require("./widgetGrabber").grabAllWidgets
const grabGlobalElement = require("./globalElementGrabber").grabGlobalElement
const grabSpecificStack = require("./stackGrabber").grabSpecificStack
const grabSpecificTheme = require("./themeGrabber").grabSpecificTheme
const grabSpecificWidget = require("./widgetGrabber").grabSpecificWidget
const grabWidgetElements = require("./widgetElementGrabber").grabWidgetElements
const info = require("./logger").info
const mkdirIfNotExists = require("./utils").mkdirIfNotExists
const packageVersion = require('../package.json').version
const PuttingFileType = require("./puttingFileType").PuttingFileType
const removeTree = require("./utils").removeTree
const writeMetadata = require("./metadata").writeMetadata

/**
 * User only wants to grab certain things.
 * @param directory
 * @return a BlueBird promise
 */
const refresh = Promise.method(directory => {

  // Call the grabber that matches the directory. This should normally return a BlueBird promise but if the endpoints
  // are not supported (rare these days) or the directory type is unrecognized, the return value could be null.
  const promise = callMatchingGrabber(directory)

  if (promise) {
    return promise.then(() => info("allDone"))
  }
})

/**
 * Find the grabber for the directory type and call it.
 * @param directory
 * @returns A Bluebird promise unless something went wrong.
 */
function callMatchingGrabber(directory) {

  // First of all, see what the path looks like. We only do directories we can recognize.
  // Note that the directory may not exist yet.
  switch (classify(directory)) {

    case PuttingFileType.APPLICATION_LEVEL_JAVASCRIPT_DIRECTORY:
      return grabAllApplicationJavaScript()
    case PuttingFileType.GLOBAL_SNIPPETS_DIRECTORY:
      return grabCommonTextSnippets()
    case PuttingFileType.GLOBAL_SNIPPETS_LOCALE_DIRECTORY:
      return grabTextSnippetsForLocaleDirectory(directory)
    case PuttingFileType.STACKS_DIRECTORY:
      return grabAllStacks()
    case PuttingFileType.STACK:
      return grabSpecificStack(directory)
    case PuttingFileType.THEMES_DIRECTORY:
      return grabAllThemes()
    case PuttingFileType.THEME:
      return grabSpecificTheme(directory)
    case PuttingFileType.GLOBAL_ELEMENTS_DIRECTORY:
      return grabAllElements(false)
    case PuttingFileType.GLOBAL_ELEMENT:
      return grabGlobalElement(directory)
    case PuttingFileType.WIDGETS_DIRECTORY:
      return grabAllWidgets().then(() => grabWidgetElements())
    case PuttingFileType.WIDGET:
      return grabSpecificWidget(directory).then(() => grabWidgetElements(directory))
    case PuttingFileType.FRAMEWORK_DIRECTORY:
      return grabFrameworkDirectory(directory)
    default:
      error("unsupportedDirectoryType", {directory})
  }
}

/**
 * Grab everything the user can normally change.
 * @return {PromiseLike<void | never>}
 */
function grabAllModifiableContent() {

  return grabFramework()
    .then(grabAllStacks)
    .then(grabAllWidgets)
    .then(grabCommonTextSnippets)
    .then(grabAllElements)
    .then(grabAllThemes)
    .then(grabAllApplicationJavaScript)
    .then(() => info("allDone"));
}

/**
 * Entry point. Grabs all it can from the server.
 * @returns {Promise.<T>}
 */
function grab(node, clean) {

  // See if we want to start afresh.
  clean && clearExistingDirs()

  // Create tracking directory first if it does not already exist.
  mkdirIfNotExists(constants.trackingDir)

  // Store basic info in the tracking directory.
  storeNodeInfo(node, endPointTransceiver.commerceCloudVersion)

  // User wants the complete works. Need to wait for everything to finish. They may also want the framework.
  return grabAllModifiableContent()
}

/**
 * Store high level info about the grab in the tracking directory - including the node package version.
 * @param node
 */
function storeNodeInfo(node, commerceCloudVersion) {
  writeMetadata(constants.configMetadataJson, {node, commerceCloudVersion, packageVersion})
}

/**
 * Before we grab anything, get rid of what is already there.
 */
function clearExistingDirs() {
  [
    constants.trackingDir,
    constants.globalDir,
    constants.widgetsDir,
    constants.elementsDir,
    constants.stacksDir,
    constants.themesDir,
    constants.textSnippetsDir,
    constants.frameworkDir

  ].forEach(directory => exists(directory) && removeTree(directory)) // Make sure directory is actually there first.
}

exports.grab = grab
exports.refresh = refresh

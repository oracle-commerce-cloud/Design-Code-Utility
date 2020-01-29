"use strict"

const constants = require("./constants").constants
const isDirectory = require("./utils").isDirectory
const PuttingFileType = require("./puttingFileType").PuttingFileType
const resolvePath = require("./utils").resolvePath
const splitFromBaseDir = require("./utils").splitFromBaseDir

const classifiers = [
  path => {
    const subDir = splitFromBaseDir(path)[1]

    return subDir.startsWith(constants.frameworkDir) && isDirectory(path)
      && PuttingFileType.FRAMEWORK_DIRECTORY
  },

  path => {
    const subDir = splitFromBaseDir(path)[1]

    return subDir.startsWith(constants.frameworkDir) && !isDirectory(path)
      && PuttingFileType.FRAMEWORK_FILE
  },

  path => {
    const subDir = splitFromBaseDir(path)[1]

    return subDir.startsWith(constants.globalDir) && path.endsWith(".js")
      && PuttingFileType.APPLICATION_LEVEL_JAVASCRIPT
  },

  path => {
    const subDir = splitFromBaseDir(path)[1]

    return subDir.startsWith(`${constants.elementsDir}/`) && path.endsWith(constants.elementTemplate)
      && PuttingFileType.GLOBAL_ELEMENT_TEMPLATE
  },

  path => {
    const subDir = splitFromBaseDir(path)[1]

    return subDir.startsWith(`${constants.elementsDir}/`) && path.endsWith(constants.elementJavaScript)
      && PuttingFileType.GLOBAL_ELEMENT_JAVASCRIPT
  },

  path => {
    const subDir = splitFromBaseDir(path)[1]

    return subDir.startsWith(`${constants.elementsDir}/`) && path.endsWith(constants.userElementMetadata)
      && PuttingFileType.GLOBAL_ELEMENT_METADATA
  },

  path => /global$/.test(path) && PuttingFileType.APPLICATION_LEVEL_JAVASCRIPT_DIRECTORY,
  path => /snippets\/[^/]+$/.test(path) && PuttingFileType.GLOBAL_SNIPPETS_LOCALE_DIRECTORY,
  path => /snippets$/.test(path) && PuttingFileType.GLOBAL_SNIPPETS_DIRECTORY,

  path => /widget$/.test(path) && PuttingFileType.WIDGETS_DIRECTORY,
  path => /.*widget\/[^/]+$/.test(path) && isDirectory(resolvePath(path)) && PuttingFileType.WIDGET,
  path => /.*widget\/[^/]+\/display.template/.test(path) && PuttingFileType.WIDGET_BASE_TEMPLATE,
  path => /.*widget\/[^/]+\/widget.less/.test(path) && PuttingFileType.WIDGET_BASE_LESS,
  path => /.*widget\/[^/]+\/js\/[^/]+.js/.test(path) && PuttingFileType.WIDGET_JAVASCRIPT,
  path => /.*widget\/[^/]+\/module\/js\/[^/]+.js/.test(path) && PuttingFileType.WIDGET_MODULE_JAVASCRIPT,
  path => /.*widget\/[^/]+\/locales\/[^/]+\/ns\.[\w|-]+\.json/.test(path) && PuttingFileType.WIDGET_BASE_SNIPPETS,
  path => /.*widget\/[^/]+\/instances\/[^/]+\/locales\/[^/]+\/ns\.[\w|-]+\.json/.test(path) && PuttingFileType.WIDGET_INSTANCE_SNIPPETS,
  path => /.*widget\/[^/]+\/config\/locales\/\w+\.json/.test(path) && PuttingFileType.WIDGET_CONFIG_SNIPPETS,
  path => /.*widget\/[^\/]+\/element\/[^\/]*$/.test(path) && PuttingFileType.WIDGET_ELEMENT,
  path => path.endsWith(constants.displayTemplate) && PuttingFileType.WIDGET_INSTANCE_TEMPLATE,
  path => path.endsWith(constants.webContentTemplate) && PuttingFileType.WEB_CONTENT_TEMPLATE,
  path => path.endsWith(constants.widgetLess) && PuttingFileType.WIDGET_INSTANCE_LESS,
  path => path.endsWith(constants.userWidgetMetadata) && PuttingFileType.WIDGET_METADATA_JSON,
  path => path.endsWith(constants.userWidgetInstanceMetadata) && PuttingFileType.WIDGET_INSTANCE_METADATA_JSON,
  path => path.endsWith(constants.userConfigMetadataJson) && PuttingFileType.WIDGET_CONFIG_JSON,

  path => /stack$/.test(path) && PuttingFileType.STACKS_DIRECTORY,
  path => /stack\/[^/]+$/.test(path) && PuttingFileType.STACK,
  path => /.*stack\/[^/]+\/stack.template$/.test(path) && PuttingFileType.STACK_BASE_TEMPLATE,
  path => /.*stack\/[^/]+\/stack.less$/.test(path) && PuttingFileType.STACK_BASE_LESS,
  path => /.*stack\/[^/]+\/stack-variables.less$/.test(path) && PuttingFileType.STACK_BASE_VARIABLES_LESS,
  path => /.*stack\/[^/]+\/locales\/[^/]+\/[\w|-]+\.json/.test(path) && PuttingFileType.STACK_BASE_SNIPPETS,
  path => /.*stack\/[^/]+\/config\/locales\/\w+\.json/.test(path) && PuttingFileType.STACK_CONFIG_SNIPPETS,
  path => path.endsWith(constants.stackVariablesLess) && PuttingFileType.STACK_INSTANCE_VARIABLES_LESS,
  path => path.endsWith(constants.stackLess) && PuttingFileType.STACK_INSTANCE_LESS,
  path => path.endsWith(constants.stackTemplate) && PuttingFileType.STACK_INSTANCE_TEMPLATE,
  path => path.endsWith(constants.userStackMetadata) && PuttingFileType.STACK_METADATA_JSON,
  path => path.endsWith(constants.userStackInstanceMetadata) && PuttingFileType.STACK_INSTANCE_METADATA_JSON,

  path => /element\/[^/]+$/.test(path) && PuttingFileType.GLOBAL_ELEMENT,
  path => /element$/.test(path) && PuttingFileType.GLOBAL_ELEMENTS_DIRECTORY,
  path => path.endsWith(constants.elementTemplate) && PuttingFileType.ELEMENT_TEMPLATE,
  path => {
    const subDir = splitFromBaseDir(path)[1]
    return subDir.startsWith(`${constants.widgetsDir}/`) && path.endsWith(`/${constants.elementJavaScript}`) && PuttingFileType.ELEMENT_JAVASCRIPT
  },
  path => path.endsWith(constants.userElementMetadata) && PuttingFileType.ELEMENT_METADATA,
  path => path.endsWith(constants.userElementInstancesMetadataJson) && PuttingFileType.ELEMENT_INSTANCE_METADATA,

  path => path.endsWith(constants.themeAdditionalStyles) && PuttingFileType.THEME_ADDITIONAL_STYLES,
  path => path.endsWith(constants.themeVariables) && PuttingFileType.THEME_VARIABLES,
  path => path.endsWith(constants.themeStyles) && PuttingFileType.THEME_STYLES,
  path => /.*theme\/[^/]+$/.test(path) && PuttingFileType.THEME,
  path => /theme$/.test(path) && PuttingFileType.THEMES_DIRECTORY,

  path => path.endsWith(constants.snippetsJson) && PuttingFileType.GLOBAL_SNIPPETS,

  path => /.*widget\/[^/]+\/instances\/[^/]+$/.test(path) && isDirectory(resolvePath(path))
    && PuttingFileType.WIDGET_INSTANCE,

  path => /.*stack\/[^/]+\/instances\/[^/]+$/.test(path) && isDirectory(resolvePath(path))
    && PuttingFileType.STACK_INSTANCE
]

exports.classify = function (path) {

  return classifiers.map(f => f(path)).find(e => !!e)
}

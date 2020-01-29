"use strict"

const mockery = require('./mockery')

const constants = require('../constants').constants
const PuttingFileType = require("../puttingFileType").PuttingFileType

describe("Grabber", () => {

  const self = this

  beforeEach(() => {

    mockery.use(jasmine.createSpy)

    mockery.mockModules(self,
      '../utils', '../optionsUtils', '../logger', '../metadata', '../classifier',
      "../applicationJavaScriptGrabber", "../themeGrabber", "../textSnippetGrabber", "../stackGrabber",
      "../globalElementGrabber", "../widgetElementGrabber", "../elementGrabber", "../widgetGrabber",
      "../frameworkGrabber")

    self.applicationJavaScriptGrabber.grabAllApplicationJavaScript.returnsPromise({})
    self.themeGrabber.grabAllThemes.returnsPromise({})
    self.textSnippetGrabber.grabCommonTextSnippets.returnsPromise({})
    self.stackGrabber.grabAllStacks.returnsPromise({})
    self.elementGrabber.grabAllElements.returnsPromise({})
    self.widgetGrabber.grabAllWidgets.returnsPromise({})
    self.frameworkGrabber.grabFramework.returnsPromise({})

    self.optionsUtils.checkMetadata.returnsTrue()

    self.grabber = mockery.require("../grabber")
  })

  afterEach(mockery.stopAll)

  const grabbers = () => [
    self.applicationJavaScriptGrabber.grabAllApplicationJavaScript,
    self.themeGrabber.grabAllThemes,
    self.textSnippetGrabber.grabCommonTextSnippets,
    self.stackGrabber.grabAllStacks,
    self.elementGrabber.grabAllElements,
    self.widgetGrabber.grabAllWidgets,
    self.frameworkGrabber.grabFramework
  ]

  const directories = () => [
    constants.globalDir,
    constants.widgetsDir,
    constants.elementsDir,
    constants.stacksDir,
    constants.themesDir,
    constants.textSnippetsDir
  ]

  it("should let you grab everything", (done) => {

    self.utils.exists.returnsTrue()

    self.grabber.grab("http://localhost:8080", true).then(() => {

      grabbers().forEach(grabber => expect(grabber).toHaveBeenCalled())

      expect(self.utils.mkdirIfNotExists).toHaveBeenCalledWith(constants.trackingDir)

      expect(self.logger.info).toHaveBeenCalledWith("allDone")

      directories().forEach(directory =>
        expect(self.utils.exists).toHaveBeenCalledWith(directory) &&
        expect(self.utils.removeTree).toHaveBeenCalledWith(directory))

      done()
    })
  })

  it("should warn you if you try to refresh something silly", () => {

    self.grabber.refresh("sillyDir")

    expect(self.logger.error).toHaveBeenCalledWith("unsupportedDirectoryType", {directory: "sillyDir"})
  })

  it("should let you refresh directories", done => {

    self.classifier.classify.returns(PuttingFileType.APPLICATION_LEVEL_JAVASCRIPT_DIRECTORY)
    self.grabber.refresh("global")
    expect(self.applicationJavaScriptGrabber.grabAllApplicationJavaScript).toHaveBeenCalled()

    self.classifier.classify.returns(PuttingFileType.GLOBAL_SNIPPETS_DIRECTORY)
    self.grabber.refresh("snippets")
    expect(self.textSnippetGrabber.grabCommonTextSnippets).toHaveBeenCalled()

    self.classifier.classify.returns(PuttingFileType.GLOBAL_SNIPPETS_LOCALE_DIRECTORY)
    self.grabber.refresh("snippets/en")
    expect(self.textSnippetGrabber.grabTextSnippetsForLocaleDirectory).toHaveBeenCalledWith("snippets/en")

    self.classifier.classify.returns(PuttingFileType.STACKS_DIRECTORY)
    self.grabber.refresh("stack")
    expect(self.stackGrabber.grabAllStacks).toHaveBeenCalled()

    self.classifier.classify.returns(PuttingFileType.STACK)
    self.grabber.refresh("stack/fred")
    expect(self.stackGrabber.grabSpecificStack).toHaveBeenCalledWith("stack/fred")

    self.classifier.classify.returns(PuttingFileType.THEMES_DIRECTORY)
    self.grabber.refresh("theme")
    expect(self.themeGrabber.grabAllThemes).toHaveBeenCalled()

    self.classifier.classify.returns(PuttingFileType.THEME)
    self.grabber.refresh("theme/Fuzzy")
    expect(self.themeGrabber.grabSpecificTheme).toHaveBeenCalledWith("theme/Fuzzy")

    self.classifier.classify.returns(PuttingFileType.GLOBAL_ELEMENTS_DIRECTORY)
    self.grabber.refresh("element")
    expect(self.elementGrabber.grabAllElements).toHaveBeenCalledWith(false)

    self.classifier.classify.returns(PuttingFileType.GLOBAL_ELEMENT)
    self.grabber.refresh("element/Dazzle")
    expect(self.globalElementGrabber.grabGlobalElement).toHaveBeenCalledWith("element/Dazzle")

    self.classifier.classify.returns(PuttingFileType.WIDGETS_DIRECTORY)
    self.widgetGrabber.grabAllWidgets.returnsPromise({})
    self.widgetElementGrabber.grabWidgetElements.returnsPromise({})

    self.grabber.refresh("widget").then(() => {

      expect(self.widgetGrabber.grabAllWidgets).toHaveBeenCalled()
      expect(self.widgetElementGrabber.grabWidgetElements).toHaveBeenCalled()
    }).then(() => {

      self.classifier.classify.returns(PuttingFileType.WIDGET)
      self.widgetGrabber.grabSpecificWidget.returnsPromise({})
      self.widgetElementGrabber.grabWidgetElements.returnsPromise({})

      return self.grabber.refresh("widget/jim").then(() => {
        expect(self.widgetGrabber.grabSpecificWidget).toHaveBeenCalledWith("widget/jim")
        expect(self.widgetElementGrabber.grabWidgetElements).toHaveBeenCalled()

        done()
      })
    })
  })
})

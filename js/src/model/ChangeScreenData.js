/**
 * ChangeScreenData
 * @param {number} index
 * @constructor
 */
App.ChangeScreenData = function ChangeScreenData(index)
{
    this.allocated = false;
    this.poolIndex = index;

    this.screenName = App.ScreenName.ADD_TRANSACTION;
    this.screenMode = App.ScreenMode.ADD;
    this.updateData = null;
    this.headerLeftAction = App.HeaderAction.CANCEL;
    this.headerRightAction = App.HeaderAction.CONFIRM;
    this.headerName = App.ScreenTitle.ADD_TRANSACTION;
    this.backSteps = 1;
    this.updateBackScreen = false;
};

/**
 * Update
 * @param {number} screenName
 * @param {number} screenMode
 * @param {Object} updateData
 * @param {number} headerLeftAction
 * @param {number} headerRightAction
 * @param {string} headerName
 * @param {number} [backSteps=1]
 * @param {boolean} [updateBackScreen=false]
 * @returns {App.ChangeScreenData}
 */
App.ChangeScreenData.prototype.update = function update(screenName,screenMode,updateData,headerLeftAction,headerRightAction,headerName,backSteps,updateBackScreen)
{
    this.screenName = isNaN(screenName) ? App.ScreenName.ADD_TRANSACTION : screenName;
    this.screenMode = screenMode || App.ScreenMode.ADD;
    this.updateData = updateData;
    this.headerLeftAction = headerLeftAction || App.HeaderAction.CANCEL;
    this.headerRightAction = headerRightAction || App.HeaderAction.CONFIRM;
    this.headerName = headerName || App.ScreenTitle.ADD_TRANSACTION;
    this.backSteps = backSteps || 1;
    this.updateBackScreen = updateBackScreen;

    return this;
};

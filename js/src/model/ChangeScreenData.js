/**
 * ChangeScreenData
 * @type {{screenName: number, screenMode: number, updateData: null, headerLeftAction: number, headerRightAction: number, headerName: null, reset: Function}}
 */
App.ChangeScreenData = {
    screenName:7,
    screenMode:1,
    updateData:null,
    headerLeftAction:2,
    headerRightAction:3,
    headerName:null,
    update:function update(screenName,screenMode,updateData,headerLeftAction,headerRightAction,headerName)
    {
        this.screenName = screenName || App.ScreenName.ADD_TRANSACTION;
        this.screenMode = screenMode || App.ScreenMode.SELECT;
        this.updateData = updateData;
        this.headerLeftAction = headerLeftAction || App.HeaderAction.CANCEL;
        this.headerRightAction = headerRightAction || App.HeaderAction.CONFIRM;
        this.headerName = headerName || App.ScreenTitle.ADD_TRANSACTION;

        return this;
    }
};

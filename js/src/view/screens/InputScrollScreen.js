/**
 * @class InputScrollScreen
 * @extends Screen
 * @param {Object} layout
 * @constructor
 */
App.InputScrollScreen = function InputScrollScreen(layout)
{
    App.Screen.call(this,layout,0.4);

    //TODO also disable header actions if input is focused and soft keyboard shown

    //TODO add other 'scroll-' properties into TweenProxy?
    this._scrollTween = new App.TweenProxy(0.5,App.Easing.outExpo,0,App.ModelLocator.getProxy(App.ModelName.EVENT_LISTENER_POOL));
    this._scrollState = App.TransitionState.HIDDEN;
    this._scrollInput = null;
    this._scrollPosition = 0;
    this._inputPadding = Math.round(10 * layout.pixelRatio);
};

App.InputScrollScreen.prototype = Object.create(App.Screen.prototype);
App.InputScrollScreen.prototype.constructor = App.InputScrollScreen;

/**
 * On tick
 * @private
 */
App.InputScrollScreen.prototype._onTick = function _onTick()
{
    App.Screen.prototype._onTick.call(this);

    if (this._scrollTween.isRunning()) this._onScrollTweenUpdate();
};

/**
 * On scroll tween update
 * @private
 */
App.InputScrollScreen.prototype._onScrollTweenUpdate = function _onScrollTweenUpdate()
{
    var TransitionState = App.TransitionState;
    if (this._scrollState === TransitionState.SHOWING)
    {
        this._pane.y = -Math.round((this._scrollPosition + this._container.y) * this._scrollTween.progress);
    }
    else if (this._scrollState === TransitionState.HIDING)
    {
        this._pane.y = -Math.round((this._scrollPosition + this._container.y) * (1 - this._scrollTween.progress));
    }
};

/**
 * On scroll tween complete
 * @private
 */
App.InputScrollScreen.prototype._onScrollTweenComplete = function _onScrollTweenComplete()
{
    var TransitionState = App.TransitionState;

    this._onScrollTweenUpdate();

    if (this._scrollState === TransitionState.SHOWING)
    {
        this._scrollState = TransitionState.SHOWN;

        this._scrollInput.enable();
        this._scrollInput.focus();
    }
    else if (this._scrollState === TransitionState.HIDING)
    {
        this._scrollState = TransitionState.HIDDEN;

        this._pane.enable();

        App.ViewLocator.getViewSegment(App.ViewName.APPLICATION_VIEW).scrollTo(0);
    }
};

/**
 * Focus budget
 * @param {boolean} [immediate=false] Flag if input should be focused immediately without tweening
 * @private
 */
App.InputScrollScreen.prototype._focusInput = function _focusInput(immediate)
{
    var TransitionState = App.TransitionState;
    if (this._scrollState === TransitionState.HIDDEN || this._scrollState === TransitionState.HIDING)
    {
        this._scrollState = TransitionState.SHOWING;

        this._pane.disable();

        if (immediate)
        {
            this._scrollPosition = 0;

            this._onScrollTweenComplete();
        }
        else
        {
            this._scrollPosition = this._scrollInput.y - this._inputPadding;

            this._scrollTween.start();
        }
    }
};

/**
 * On budget field blur
 * @private
 */
App.InputScrollScreen.prototype._onInputBlur = function _onInputBlur()
{
    var TransitionState = App.TransitionState;
    if (this._scrollState === TransitionState.SHOWN || this._scrollState === TransitionState.SHOWING)
    {
        this._scrollState = TransitionState.HIDING;

        this._scrollInput.disable();

        if (this._scrollPosition  > 0)
        {
            this._scrollTween.restart();
        }
        else
        {
            this._pane.resetScroll();
            this._onScrollTweenComplete();
        }
    }
};

/**
 * Reset screen scroll
 */
App.InputScrollScreen.prototype.resetScroll = function resetScroll()
{
    if (this._scrollInput) this._scrollInput.blur();

    this._scrollTween.stop();

    this._pane.y = 0;
    this._pane.resetScroll();

    App.ViewLocator.getViewSegment(App.ViewName.APPLICATION_VIEW).scrollTo(0);
};

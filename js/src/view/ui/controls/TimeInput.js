/**
 * @class TimeInput
 * @extends Input
 * @param {string} placeholder
 * @param {number} fontSize
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @param {boolean} displayIcon
 * @constructor
 */
App.TimeInput = function TimeInput(placeholder,fontSize,width,height,pixelRatio,displayIcon)
{
    App.Input.call(this,placeholder,fontSize,width,height,pixelRatio,displayIcon);

    this._inputProxy = document.getElementById("numberInputProxy");
};

App.TimeInput.prototype = Object.create(App.Input.prototype);
App.TimeInput.prototype.constructor = App.TimeInput;

/**
 * Render
 * @private
 */
App.TimeInput.prototype._render = function _render()
{
    var r = this._pixelRatio;

    this._renderBackground(false,r);

    this._updateAlignment();

    this._textField.y = Math.round(9 * r);
};

/**
 * Update text
 * @param {boolean} [finish=false]
 * @private
 */
App.TimeInput.prototype._updateText = function _updateText(finish)
{
    App.Input.prototype._updateText.call(this,finish);

    this._updateAlignment();
};

/**
 * Format the text input
 * @param {boolean} [finish=false]
 * @private
 */
App.TimeInput.prototype._format = function _format(finish)
{
    if (this._inputProxy.value.length === 0) return "";

    var value = this._inputProxy.value.replace(/\D/g,""),
        hours = value.substr(0,2),
        minutes = value.substr(2,2);

    if (hours.length === 2 && parseInt(hours,10) > 24) hours = "24";
    else if (minutes.length === 1 && parseInt(minutes,10) > 5) minutes = "5";
    else if (minutes.length >= 2 && parseInt(minutes,10) > 59) minutes = "59";

    if (finish)
    {
        if (hours.length === 1) hours += "0";

        if (minutes.length === 0) minutes += "00";
        else if (minutes.length === 1) minutes += "0";
    }

    if (minutes.length > 0) value = hours + ":" + minutes;
    else value = hours;

    this._inputProxy.value = value;

    return value;
};

/**
 * Update text's alignment
 * @private
 */
App.TimeInput.prototype._updateAlignment = function _updateAlignment()
{
    this._textField.x = Math.round((this._width - this._textField.width) / 2);
};

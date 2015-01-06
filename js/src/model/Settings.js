/**
 * @class Settings
 * @type {{_startOfWeek: number, setStartOfWeek: Function,getStartOfWeek:Function}}
 */
App.Settings = {
    _startOfWeek:0,// 0 = Sun, ..., 6 = Sat

    /**
     * Set start of a week
     * @param {number} value
     */
    setStartOfWeek:function setStartOfWeek(value)
    {
        if (value >= 0 && value <= 6) this._startOfWeek = value;
    },

    /**
     * Return start of a week
     * @returns {number}
     */
    getStartOfWeek:function getStartOfWeek()
    {
        return this._startOfWeek;
    }
};

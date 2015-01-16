/**
 * GraphicUtils
 * @type {{drawRect: Function,drawRects:Function}}
 */
App.GraphicUtils = {
    /**
     * Draw rectangle into graphics passed in
     * @param {PIXI.Graphics} graphics
     * @param {number} color
     * @param {number} alpha
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     */
    drawRect:function drawRect(graphics,color,alpha,x,y,width,height)
    {
        graphics.clear();
        graphics.beginFill(color,alpha);
        graphics.drawRect(x,y,width,height);
        graphics.endFill();
    },

    /**
     * Draw multiple rectangles
     * @param {PIXI.Graphics} graphics
     * @param {number} color
     * @param {number} alpha
     * @param {Array.<number>} data
     * @param {boolean} clear
     * @param {boolean} end
     */
    drawRects:function drawRects(graphics,color,alpha,data,clear,end)
    {
        if (clear) graphics.clear();
        graphics.beginFill(color,alpha);

        var i = 0,
            l = data.length;

        for (;i<l;) graphics.drawRect(data[i++],data[i++],data[i++],data[i++]);

        if (end) graphics.endFill();
    }
};

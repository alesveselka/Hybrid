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
    },
    /**
     * Draw arc
     * @param {PIXI.Graphics} graphics
     * @param {PIXI.Point} center
     * @param {number} width
     * @param {number} height
     * @param {number} thickness
     * @param {number} startAngle
     * @param {number} endAngle
     * @param {number} smoothSteps
     * @param {number} lineColor
     * @param {number} lineAlpha
     * @param {number} lineThickness
     * @param {number} fillColor
     * @param {number} fillAlpha
     */
    drawArc:function drawArc(graphics,center,width,height,thickness,startAngle,endAngle,smoothSteps,lineColor,lineAlpha,lineThickness,fillColor,fillAlpha)
    {
        startAngle -= 90;
        endAngle -= 90;

        var angle = startAngle,
            degToRad = Math.PI / 180,
            radians = angle * degToRad,
            radiusX = width / 2,
            radiusY = height / 2,
            centerX = center.x,
            centerY = center.y,
            i = 0;

        graphics.clear();
        graphics.lineStyle(lineThickness,lineColor,lineAlpha);
        graphics.beginFill(fillColor,fillAlpha);
        graphics.moveTo(centerX+Math.cos(radians)*radiusX,centerY+Math.sin(radians)*radiusY);

        for (;i<smoothSteps;)
        {
            angle = startAngle + ((endAngle - startAngle) / smoothSteps) * i++;
            radians = angle * degToRad;
            graphics.lineTo(centerX+Math.cos(radians)*radiusX,centerY+Math.sin(radians)*radiusY);
        }

        radians = endAngle * degToRad;
        graphics.lineTo(centerX+Math.cos(radians)*radiusX,centerY+Math.sin(radians)*radiusY);

        for (i=smoothSteps;i>=0;)
        {
            angle = startAngle + ((endAngle - startAngle) / smoothSteps) * i--;
            radians = angle * degToRad;
            graphics.lineTo(centerX+Math.cos(radians)*(radiusX-thickness),centerY+Math.sin(radians)*(radiusY-thickness));
        }

        graphics.endFill();
    }
};

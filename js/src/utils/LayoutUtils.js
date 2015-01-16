/**
 * LayoutUtils
 * @type {{update: Function}}
 */
App.LayoutUtils = {
    /**
     * Update layout
     * @param {Array.<{x:number,y:number,boundingBox:Rectangle}>} items
     * @param direction
     */
    update:function update(items,direction)
    {
        var i = 0,
            l = items.length,
            item = null,
            position = 0,
            Direction = App.Direction;

        if (direction === Direction.X)
        {
            for (;i<l;)
            {
                item = items[i++];
                item.x = position;
                position = Math.round(position + item.boundingBox.width);
            }
        }
        else if (direction === Direction.Y)
        {
            for (;i<l;)
            {
                item = items[i++];
                item.y = position;
                position = Math.round(position + item.boundingBox.height);
            }
        }
    }
};

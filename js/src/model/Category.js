App.Category = function Category(data,collection,parent,eventListenerPool)
{
    this._data = data;
    this._account = parent;
    this.name = data.name;
    this.color = data.color;
    this.icon = data.icon;
    this.subCategories = data.subCategories;
    //this.budget = budget;
};

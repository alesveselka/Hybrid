App.Category = function Category(data,collection,parent,eventListenerPool)
{
    this.id = data[0];
    this.name = data[1];
    this.color = data[2];
    this.icon = data[3];
    this.subCategories = data[4];
    this.budget = data[5];
};

// Dependencies uuid: https://www.npmjs.com/package/uuid

var ItemTracked = function(x, y, width, height){
  var itemTracked = {};
  // set properties
  itemTracked.x = x;
  itemTracked.y = y;
  itemTracked.width = width;
  itemTracked.height = height;
  // Am I available to be matched?
  itemTracked.available = true;
  // Should I be deleted?
  itemTracked.delete = false;
  // Assign an unique id to each Item tracked
  itemTracked.id = new uuidv4();
  // Give me a new location / size
  itemTracked.update = function(x, y, width, height){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  return itemTracked;
};


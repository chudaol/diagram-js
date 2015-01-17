'use strict';


/**
* Service that allow replacing elements
*/
function Replace(modeling) {

  this._modeling = modeling;
}

module.exports = Replace;

Replace.$inject = [ 'modeling' ];

Replace.prototype.replaceElement = function(oldElement, newElementData) {

  var modeling = this._modeling;

  var newElement = null;

  if (oldElement.waypoints) {
    // TODO
    // modeling.replaceConnection
  } else {
    // set center of element for modeling API
    // if no new width / height is given use old elements size
    newElementData.x = oldElement.x + (newElementData.width || oldElement.width) / 2;
    newElementData.y = oldElement.y + (newElementData.height || oldElement.height) / 2;

    newElement = modeling.replaceShape(oldElement, newElementData);
  }

  return newElement;
};

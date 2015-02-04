'use strict';

var forEach = require('lodash/collection/forEach'),
    assign = require('lodash/object/assign'),
    domEvent = require('min-dom/lib/event'),
    domify = require('min-dom/lib/domify'),
    domClasses = require('min-dom/lib/classes'),
    domAttr = require('min-dom/lib/attr'),
    domRemove = require('min-dom/lib/remove');


function PopupMenu(eventBus, canvas) {

  this._eventBus = eventBus;
  this._canvas  = canvas;
}

PopupMenu.$inject = [ 'eventBus', 'canvas' ];

module.exports = PopupMenu;

PopupMenu.prototype.open = function(position, entries, options) {

  var outer = this,
      canvas = this._canvas;

  var parent = canvas.getContainer();

  //------------------------
  function PopupMenuInstance() {

    var self = this;

    this._actions = {};

    var _options = {
      className: 'popup-menu',
      entryClassName: 'entry'
    };
    assign(_options, options);

    var container = this._container = domify('<div>');

    assign(container.style, {
      position: 'absolute',
      left: position.x + 'px',
      top: position.y  + 'px'
    });
    domClasses(container).add(_options.className);

    forEach(entries, function(entry) {

      var entryContainer = domify('<div>');
      domClasses(entryContainer).add(entry.className || _options.entryClassName);
      if (entry.style) {
        domAttr(entryContainer, 'style', entry.style);
      }
      if (entry.action) {
        domAttr(entryContainer, 'data-action', entry.action.name);
        self._actions[entry.action.name] = entry.action.handler;
      }

      entryContainer.textContent = entry.label;

      container.appendChild(entryContainer);
    });

    domEvent.bind(container, 'click', function(event) {
      self.trigger(event);
    });

    // apply canvas zoom level
    var zoom = canvas.zoom();

    container.style.transformOrigin = 'top left';
    container.style.transform = 'scale(' + zoom + ')';

    parent.appendChild(container);

    this.bindHandlers();
  }

  PopupMenuInstance.prototype.close = function() {
    this.unbindHandlers();
    domRemove(this._container);
  };

  PopupMenuInstance.prototype.bindHandlers = function() {

    var self = this;

    this._closeHandler = function() {
      self.close();
    };

    outer._eventBus.once('contextPad.close', this._closeHandler);
    outer._eventBus.once('canvas.viewbox.changed', this._closeHandler);
  };

  PopupMenuInstance.prototype.unbindHandlers = function() {

    outer._eventBus.off('contextPad.close', this._closeHandler);
    outer._eventBus.off('canvas.viewbox.changed', this._closeHandler);
  };

  // TODO add Testcase
  PopupMenuInstance.prototype.trigger = function(event) {

    var element = event.target,
        actionName = element.getAttribute('data-action');

    var action = this._actions[actionName];

    if (action) {
      action();
    }

    // silence other actions
    event.preventDefault();
  };

  var instance = new PopupMenuInstance(position, entries, parent, options);

  return instance;
};

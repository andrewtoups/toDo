
var toDoListApp = (function(){

//general utilities

var utils = {
  template: function(source, context){
    source = $(source).html();
    var template = Handlebars.compile(source);
    context = (!context) ? {} : context;
    var html = template(context);
    return html;
  }
};

// card manager

var cardStack = {
    cards: [],
};

// event listeners

var addListeners = {
// listeners loaded on page load:
  init: function(){
    $('.card')

// initial task prompt
      .on('submit', '.new-task', function(event){
        event.preventDefault();
        var text = $('input').val();
        $('main').empty();
        new toDoList(text);
      });

//cancel text editing
    $('body')
      .click(function(event){
        if (event.target.className === "highlight" ||
            event.target.className === "taskName"){
          return;
        }
        $('.editing').attr('class', 'default');
      });

//     $('#debug')
// //debug button
//       .click(function(){
//         $('.check').attr('class', 'check debug');
//       });

  },

//listeners associated with toDoList
  list: function(self) {
    $(self.container)
// main task prompt
      .on('submit', '.new-task', function(event) {
        event.preventDefault();
        var text = $(self.container).find('input').val();
        var field = $(self.container).find('.new-todo');
        $(field).val('').attr('placeholder', 'Anything else?');
        new toDoListItem(text, self);
      })
// show all button
      .on('click', '.show-all', function(){
        self.displayAll();
      })
// show active button
      .on('click', '.show-active', function(){
        self.filterList('default');
      })
// show completed button
      .on('click', '.show-completed', function() {
        self.filterList('completed');
      })
// clear all completed button
      .on('click', '.clear', function() {
        self.killCompleted();
      });
  },

//listeners associated with toDoListItem
  item: function(self){
    $(self.item)

// checkbox
      .on('click', '.check', function(){
        if (self.context.taskState !== 'completed'){
          self.changeState('completed');
        } else {
          self.changeState('default');
        }
      })

// editor
      .on('click', '.highlight, p', function(){
        self.changeState('editing');
      })

// input form
      .on('submit', '.item-input', function(event){
        event.preventDefault();
        var text = $(self.item).find('input').val();
        self.changeTask(text);
        self.changeState('default');
      })

// delete button
      .on('click', '.delete', function() {
        self.kill();
      });
  },
  debug: function(self){
    $(self.item).add(self.container)
      .on('click', '.debug', function (){
        console.log(self);
      });
  }
};

///////
////////////////
///

//constructors:

var toDoList = function(seed){
// set properties
  this.items = [];
  this.container = this.displayList(); // assign page element as property

// set focus
  $(this.container).find('.new-todo').focus();

// add event listeners
  addListeners.list(this);
  // addListeners.debug(this);

// if list is created with a string, make a new list item with that string
  if (seed !== undefined && typeof seed === 'string'){
    new toDoListItem(seed, this);
  }
};

toDoList.prototype = {

  displayList : function(){
    var html = utils.template('#card');
    return $(html).appendTo('main').slideDown();
  },

  updateCount : function(){
    var count = this.items.length; // count total items in array
    for (var index = 0; index < this.items.length; index++){
      if (this.items[index].context.taskState === 'completed'){ // subtract completed tasks from count
        count--;
      }
    }
    var message = count === 1 ? " item" : " items";
    $(this.container).find('.incomplete-items').text(count + message);
    return count;
  },

  changeGreeting: function(message){
    $(this.container).find('.new-todo').attr('placeholder', message);
  },

  manageGreeting: function(count){
    if (count === 0) {
      this.changeGreeting('What needs to be done?');
    } else {
      this.changeGreeting('Anything else?');
    }
  },

  displayAll: function(){
    for (var index = 0; index < this.items.length; index++){
      this.items[index].show();
    }
  },

  filterList: function(state){
    for (var index = 0; index < this.items.length; index++){
      if (this.items[index].context.taskState !== state){
        this.items[index].hide();
      } else {
        this.items[index].show();
      }
    }
  },

  killCompleted: function(){
    for (var index = this.items.length - 1; index >= 0; index--){
      if (this.items[index].context.taskState === 'completed'){
        this.items[index].kill();
      }
    }
  }
};

///////
////////////////
///

var toDoListItem = function(taskName, listObj){
  //set properties:
  this.context = {
    taskState: 'default',
    taskName: taskName
  };
  this.parent = listObj; // assign list object that created list item as property
  this.list = $(listObj.container).find('.items'); //assign <ul> page element as property
  this.item = this.displayItem(); //assign page element as property

//constructor tasks:
  this.parent.items.push(this); //send to parent's array
  $(this.item).find('input').attr('value', this.context.taskName); //create text for input field

//add event listeners:
  addListeners.item(this);
  // addListeners.debug(this);
};

toDoListItem.prototype = {

  displayItem: function () {
    var html = utils.template('#item', this.context); // create handlebars template
    return $(html).hide().appendTo(this.list).slideDown('ease', (function(){  // slide it in
      var count = this.parent.updateCount(); // update count after it's created
      this.parent.manageGreeting(count);
    }).bind(this));
  },

  changeState: function(state) {
    $(this.item).find('article').attr('class', state);
    this.context.taskState = state;
    var count = this.parent.updateCount();
    this.parent.manageGreeting(count);
  },

  changeTask: function(task){
    $(this.item).find('p').text(task);
    $(this.item).find('input').attr('placeholder', task);
  },

  hide: function(){
    $(this.item).slideUp('ease');
  },

  show: function(){
    $(this.item).slideDown('ease');
  },

  kill: function(){
    var index = this.parent.items.indexOf(this);
    this.parent.items.splice(index, 1);
    var count = this.parent.updateCount();
    this.parent.manageGreeting(count);
    $(this.item).slideUp('ease', function (){
      $(this).remove();
    });
  }
};

addListeners.init(); // start dummy card to prompt list creation
})();

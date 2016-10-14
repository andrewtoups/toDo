
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

// event listeners

var addListeners = {
// listeners loaded on page load:
  init: function(){

// if there is no stored data, display dummy prompt
    if (localStorage.getItem('list items') === null) {
    $('.card')

// initial task prompt
      .on('submit', '.new-task', function(event){
        event.preventDefault();
        var text = $('input').val();
        $('main').empty();
        var seed = [{
          taskName: text,
        }];
        new toDoList(seed);
      });
    } // if there is stored data, populate list based on data
    else {
      var seed = JSON.parse(localStorage.getItem('list items'));
      new toDoList(seed);
    }
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
        $(self.item).find('input').focus();
      })

// input form
      .on('submit', '.item-input', function(event){
        event.preventDefault();
        var text = $(self.item).find('input').val();
        self.changeTask(text);
        self.changeState('default');
      })

// cancel text input
      .on('blur', 'input', function(){
        $(self.item).find('.item-input').trigger('submit');
      })

// delete button
      .on('click', '.delete', function() {
        self.kill();
      });
  },
  // debug: function(self){
  //   $(self.item).add(self.container)
  //     .on('click', '.debug', function (){
  //       console.log(self);
  //     });
  // }
};

///////
////////////////
///

//constructors:

var toDoList = function(seed){
// set properties
  this.items = [];
  this.container = this.displayList(); // assign page element as property

// default seed is empty array"
  seed = (!seed) ? [] : seed;

// set focus
  $(this.container).find('.new-todo').focus();

// add event listeners
  addListeners.list(this);

// populate based on starting list data
  this.populate(seed);
};

toDoList.prototype = {

  displayList : function(){
    var html = utils.template('#card');
    return $(html).appendTo('main').slideDown();
  },

  populate : function(seed) { //fill list with starting data
    for (var index = 0; index < seed.length; index++){
      new toDoListItem(seed[index].taskName, this, seed[index].taskState);
    }
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

var toDoListItem = function(taskName, listObj, taskState){
  //set properties:
  taskState = (!taskState) ? 'default' : taskState;
  this.context = {
    taskState: taskState,
    taskName: taskName
  };
  this.parent = listObj; // assign list object that created list item as property
  this.list = $(listObj.container).find('.items'); //assign <ul> page element as property
  this.item = this.displayItem(); //assign page element as property

//constructor tasks:
  this.parent.items.push(this); //send to parent's array
  this.store();
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
      this.parent.manageGreeting(count); // send count to change greeting if needed
    }).bind(this));
  },

  store: function() { // send full array of items to local storages
    var listData = [];
    for (var index = 0; index < this.parent.items.length; index++){
      listData.push(this.parent.items[index].context);
    }
    localStorage.setItem('list items', JSON.stringify(listData));
  },

  changeState: function(state) {
    $(this.item).find('article').attr('class', state);
    this.context.taskState = state;
    var count = this.parent.updateCount();
    this.parent.manageGreeting(count);
    this.store();
  },

  changeTask: function(task){
    $(this.item).find('p').text(task);
    $(this.item).find('input').attr('placeholder', task);
    this.store();
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
    this.store();
    this.parent.manageGreeting(count);
    $(this.item).slideUp('ease', function (){
      $(this).remove();
    });
  }
};

addListeners.init(); // start dummy card to prompt list creation
})();

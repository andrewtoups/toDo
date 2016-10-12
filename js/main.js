
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
  init: function(){
    $('.card')
    // initial task prompt
      .on('submit', '.new-task', function(event){
        event.preventDefault();
        var text = $('input').val();
        $('main').empty();
        new toDoList(text);
      });
    $('#debug') //debug button
      .click(function(){
        $('.check').attr('class', 'check debug');
      });
  },
  list: function(self) {
    $(self.container)
    // main task prompt
      .on('submit', '.new-task', function(event) {
        event.preventDefault();
        var text = $(self.container).find('input').val();
        var field = $(self.container).find('.new-todo');
        $(field).val('').attr('placeholder', 'Anything else?');
        new toDoListItem(text, self);
        console.log(self.items);
      });
  },
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
        console.log('in listener');
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

//constructors:

var toDoList = function(seed){
  this.items = [];
  this.container = this.displayList();
  addListeners.list(this);
  addListeners.debug(this);
  // if list is created with a string, make a new list item with that string
  if (seed !== undefined && typeof seed === 'string'){
    new toDoListItem(seed, this);
    $(this.container).find('.new-todo').attr('placeholder', 'Anything else?');
  }
};

toDoList.prototype = {
  displayList : function(){
    var html = utils.template('#card');
    return $(html).appendTo('main').slideDown();
  }
};

var toDoListItem = function(taskName, listObj){
  //get starting context
  this.context = {
    taskState: 'default',
    taskName: taskName
  };
  this.parent = listObj;
  this.list = $(listObj.container).find('.items');
  this.item = this.displayItem(); //html element
  this.parent.items.push(this); //send to parent's array
  $(this.item).find('input').attr('value', this.context.taskName);
  addListeners.item(this);
  addListeners.debug(this);
};

toDoListItem.prototype = {

  displayItem: function () {
    var html = utils.template('#item', this.context); // create handlebars template
    return $(html).hide().appendTo(this.list).slideDown('ease', (function(){  // slide it in
      console.log(this.parent.items.length); // update count after it's created
    }).bind(this));
  },

  changeState: function(state) {
    $(this.item).find('article').attr('class', state);
    this.context.taskState = state;
  },

  changeTask: function(task){
    $(this.item).find('p').text(task);
    $(this.item).find('input').attr('placeholder', task);
  },

  kill: function(){
    var index = this.parent.items.indexOf(this);
    this.parent.items.splice(index, 1);
    $(this.item).slideUp('ease', function (){
      $(this).remove();
    });
    console.log(this.parent.items);
    console.log(this.parent.items.length); // update count
  }
};

addListeners.init();

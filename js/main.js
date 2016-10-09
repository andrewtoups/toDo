



function displayItem(taskName){
  var source = $("#item").html();
  var template = Handlebars.compile(source);
  var context = {
    buttonClass: 'check',
    taskState: '',
    taskName: taskName,
  };
  var html = template(context);
  $(html).appendTo('.items');
}

displayItem("new Task!");


function load_animations(targeturl)
{
  $.getJSON( targeturl+"/get_animations", function( data ) {
  
    // load list form blinkenpoi
    var items = [];
    $.each( data, function( key, val ) {
      if(val=="EOF") return false;
      items.push( "<li><a href=\""+targeturl+ "/run/"  + val + "\">"+val+"</a></li>" );
    });
   

  // append entries to webinterface
    $( "<ul/>", {
      "class": "animation_list",
      html: items.join( "" )
    }).appendTo( "#content" );



    // modify a links to use ajax in the background
    $( ".animation_list" ).find( "a" ).click (function (event) {
      $.ajax({
        type: "GET", // or GET
        url: this.href,
      });
      event.preventDefault(); // stop the browser following the link
    });




  });
}

$().ready(function() {
   

  $("#targethost").val(window.location.hostname);


  $( "#targetrefreshbutton").click (function (event) {
   alert("clicky");
   target=$("#targethost").val();
   load_animations("http://"+target);
  
  });

  // exec stuff here once document is loaded  
  target=$("#targethost").val();
  load_animations("http://"+target);

});
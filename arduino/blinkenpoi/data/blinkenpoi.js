// we store availabe poi data globally.
available_pois=[];
available_anims={};
scanner_counter=0;


function load_animations(ip)
{


  var xqrc= $.getJSON( "http://"+ip+"/get_info", function( data ) {
  


    add_stick_to_list(data,ip);

/*
    // load list form blinkenpoi
    var items = [];
    $.each( data, function( key, val ) {
      if(key=="EOF") return false;
      items.push( "<li><a href=\"http://"+ip+ "/run/"  + key + "\">"+key+" ("+ val +")</a></li>" );
      //available_pois[data["ip"]]["animations"].push(val);

    });
   

  // append entries to webinterface
    $( "<ul/>", {
      "class": "local_animation_list",
      html: items.join( "" )
    }).appendTo( "#content" );
*/
  });
  

  xqrc.always(function() {
    // modify a links to use ajax in the background
    $( ".local_animation_list" ).find( "a" ).click (function (event) {
      $.ajax({
        type: "GET", // or GET
        url: this.href,
      });
      event.preventDefault(); // stop the browser following the link
    });
  });
  



}





function scan_iprange(ip)
{
  ip=$("#ip").val();

  var myRegexp = /([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)/g;
  var match = myRegexp.exec(ip);
  targetIPs=[];
  for(i =0;i<15;i++)
  {
   targetip=match[1]+"."+match[2]+"."+match[3]+"."+i;
   targetIPs.push(targetip);
  }

  // asynchrones json pull
  $.each( targetIPs, function( key, val ) {
      get_info(val);
    });





}


function add_stick_to_list(data,ip)
{
    // load list from blinkenpoi
    var items = [];

    info_item = "<p class=\"name\">"+data["name"]+"</p> <p class=\"version\">"+data["version"]+"</p> <p class=\"ip\">"+data["ip"]+"</p> <p class=\"liste\">TOGGLE ANIMATIONS</p> <p style=\"display:none\" class=\"animations\">";
    
    $.each(data["animations"], function(key,val){
      if(key=="EOF") return;
      info_item += "<a href='http://"+ip+"/run/"+key+"'> "+key+" ("+ (val/25) +")</a>"; 
      
      // add to global anim list
      available_anims[key]=1;

    })
    info_item += "</p>";
  

    items.push(info_item);
    available_pois[data["ip"]]=data;


  // append entries to webinterface
    $( "<li/>", {
      html: items.join( "" )
    }).appendTo( "#target_list" );


}


function get_info(ip)
{
  //$("#info").html("Currently scanning: " + targeturl);
  var xqrc = $.getJSON( "http://"+ip+"/get_info", function( data ) {
    add_stick_to_list(data,ip);


  });




  
  xqrc.always(function() {
    scanner_counter+=1;
    console.log(scanner_counter);
    if(scanner_counter==3)
    {
     //scanner_counter=0;
    //scan is done here

    console.log("scanning done");

    create_animlist();


    // laoding verstecken
    $("#loading").hide();

    // modify a links to use ajax in the background
    $( ".animation_list" ).find( "a" ).click (function (event) {
      $.ajax({
        type: "GET", // or GET
        url: this.href,
      });
      event.preventDefault(); // stop the browser following the link
    });
  
    // modify a links to use ajax in the background
    $( "#target_list" ).find( "a" ).click (function (event) {
      $.ajax({
        type: "GET", // or GET
        url: this.href,
      });
      event.preventDefault(); // stop the browser following the link
    });  
  
    // modify a links to use ajax in the background
    $( "#target_list" ).find( "p.liste" ).click (function (event) {
     var target = $( event.target );
     //console.log("x: " ,target.parent());
     target.parent().find("p.animations").toggle();
  
  // $( "ul" ).click( handler ).find( "ul" ).hide();

//target.val("HIDE ANIMATIONS");
     console.log("click");


     event.preventDefault(); // stop the browser following the link
    });
  }


  });

  return false;
}




function create_animlist()
{


  

//  console.log("lets make the animlist");
//  console.log(available_anims);

  var items = [];
  $.each( available_anims, function( key, val ) {
    items.push( "<li><a href=\"#"+key + "\">"+key+"</a></li>" );
  });

  // append entries to webinterface
  $( "<ul/>", {
    "class": "anim_masstargets",
    html: items.join( "" )
  }).appendTo( "#animationlist" );




    // modify a links to use ajax in the background
    $( "#animationlist" ).find( "a" ).click (function (event) {
      console.log("do mass action for: " + this.href);
      playonall(this.href);
      event.preventDefault(); // stop the browser following the link
    });



}




function playonall(anim)
{

  var res = anim.split("#");
//  console.log(res[1])
//  console.log("playall called");
//  console.log(available_pois);
  for (var ip in available_pois) 
  {
    var target = "http://" + ip +"/run/"+res[1];
//    console.log(target);

    $.ajax({
      type: "GET", // or GET
      url: target,
    });
  }
  






   

}










var anim_content = new Uint8Array(1); // the body of the new file...



function build_anim_data()
{

  var a_size= 3*25*colcount;
  console.log("building animation buffer of size: # " + a_size);
  anim_content = new Uint8Array(a_size); // the body of the new file...

  var index_counter=0;
  for (var i = 0; i < colcount; i++)
  {
   // run for each column
   for (var j = 0; j < 25; j++)
   {
    var id="#row_"+j+"_col_"+i;
    //console.log(id);
    var bgcol = $(id).css("background-color");
    //var rgb = hexToRgb(hex);

    var rgb = bgcol.match(/\d+/g);

  
    //console.log(rgb[0] ," ", rgb[1]," ",rgb[2] );





    anim_content[index_counter] =   parseInt(rgb[0], 16),
    anim_content[index_counter+1] = parseInt(rgb[1], 16),
    anim_content[index_counter+2] = parseInt(rgb[2], 16)  
    index_counter+=3;
  }
  }

  console.log(anim_content);


}

function transmit_anim()
{
  build_anim_data();
  

  var formData = new FormData();

  // JavaScript file-like object
  var filename="test.poi";

  var test = new Blob([anim_content], { type: "application/octet-stream"});
  
  formData.append("filename", test,filename);
  
  var request = new XMLHttpRequest();
  request.open("POST", "http://10.0.0.14/edit.html");
  request.send(formData);




}




function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// global detection if mousebutton is pressed.. ugly but works
var down = false;
$(document).mousedown(function() {
    down = true;
}).mouseup(function() {
    down = false;  
});






function change_color_mouseover(target)
{
if(down)
{
  color=$(target).css("background-color");
  var rgb = color.match(/\d+/g);

  if(rgb[0]==0 && rgb[1]==0 && rgb[2]==0 )
  {
    $(target).css("background-color",$("#color").val());
  } 
  else
  {   
   $(target).css("background-color","#000000");
  } 
}
}


function change_color_onclick(target)
{

    color=$(target).css("background-color");
    var rgb = color.match(/\d+/g);
  
    if(rgb[0]==0 && rgb[1]==0 && rgb[2]==0 )
    {
      $(target).css("background-color",$("#color").val());
    } 
    else
    {   
     $(target).css("background-color","#000000");
    } 
}




// adds columns to the editor
var colcount=0;
function addcolumn()
{
 
 for(i =0;i<25;i++)
 {
  
  var id="row_"+i+"_col_"+colcount;


  $( "<td class=\"col_"+colcount+"\" id=\""+id+"\"></td>").appendTo( "#row" + i );

 
   $("#"+id).mouseover(function(){
    change_color_mouseover(event.target);
   });
     
   $("#"+id).click(function(){
    change_color_onclick(event.target);
   });


 }
 colcount+=1;
 
}






$().ready(function() {
   

//  $("#targethost").val(window.location.hostname);
  $("#targethost").val("10.0.0.14");

  $( "#targetrefreshbutton").click (function (event) {
   target=$("#targethost").val();
   load_animations(target);
  
  });


  // exec stuff here once document is loaded  
  target=$("#targethost").val();
  // load_animations("http://"+target);



  //console.log(available_pois);

  $( "#scan").click (function (event) {
    $("#loading").show();
    scan_iprange(target);
    $( "#scancontent").remove();
   });



   $( "#transmit_anim").click (function (event) {
    transmit_anim();
      });



    $( "#addcolumn").click (function (event) {
      addcolumn();
        });
   



});
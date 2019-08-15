// we store availabe poi data globally.
available_pois=[];
available_anims=[];
scanner_counter=0;

active_ips =[];


function load_animations(ip,firstload=false)
{



  var xqrc= $.getJSON( "http://"+ip+"/get_info", function( data ) {

    // this is the data for the local stick
    if(firstload)
    {
       $("#targethost").val(data["ip"]);
       $("#animationtarget").val(data["ip"]); 
       $("#ip").val(data["ip"]);

       $("#myip").html(data["ip"]);
       $("#myhostname").html(data["name"]);

    }

    add_stick_to_list(data,ip);
    create_animlist();

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
  for(i =0;i<255;i++)
  {
   targetip=match[1]+"."+match[2]+"."+match[3]+"."+i;
   targetIPs.push(targetip);
  }

  // asynchrones json pull
  $.each( targetIPs, function( key, val ) {
      get_info(val);
    });





}
function toggleAnimationlist(e){
  console.log(e);
  if(e.parentNode.childNodes[1].style.display=="block"){
    e.parentNode.childNodes[1].style.display="none";
    e.textContent = "Show";
  }else{
    e.parentNode.childNodes[1].style.display="block";
    e.textContent = "Hide";
  }
}

function add_stick_to_list(data,ip)
{

  if(available_pois[data["ip"]])
  {
   console.log("already in list, returning");
   return;
  }
   // add entry to list of active ips, this can be set with the checkboxes..
   active_ips.push(data["ip"]);


    // load list from blinkenpoi
    var items = [];

    info_item = "<div class='col-1'><input class='activate_ip' type='checkbox' checked='checked' value='"+data["ip"]+"' />"+
                "</div><div class='name col-2'>"+data["name"]+
                "</div> <div class='version col-2'>"+
                data["version"]+"</div> <div class='ip col-3'>"+
                data["ip"]+
                "</div> <div class='liste col-4'>"+
                "<button onclick='toggleAnimationlist(this)' class='toggle-animations'>Show</button>"+
                "<div style='display:none' class='animations'> ";

    $.each(data["animations"], function(key,val){
      if(key=="EOF") return;
      info_item += "<p><a class='runanim' href='http://"+ data["ip"] +"/run/"+key+"'> "+key+" ("+ (val/25) +")</a> <a class='download' href='http://"+ data["ip"] +"/animations/"+key+"' alt='Download Animation'>DOWN</a> <a class='distribute' href='http://"+ data["ip"] +"/animations/"+key+" alt='Distribute this Animation to all other active Pois'>DIST</a> </p>";

      // add to global anim list
available_anims.push(key);

//      available_anims[key]=1;

    })
    info_item += "</div></div>";



    items.push(info_item);
    available_pois[data["ip"]]=data;


   selector = data["ip"];
   selector = selector.replace(/\./g,'');

  // append entries to webinterface
    $( "<li/>", {
      class: selector,
      html: items.join( "" )
    }).appendTo( "#target_list" );


//hier JS einfuegen



    // modify a links to use ajax in the background
    $( "#target_list li."+selector ).find( "a.runanim" ).click (function (event) {
      $.ajax({
        type: "GET", // or GET
        url: this.href,
      });
      event.preventDefault(); // stop the browser following the link
    });



    // attach distribute action to this link 
    $( "#target_list li."+selector ).find( "a.distribute" ).click (function (event) {
      console.log("We should download the animation from the stick and save it to a BLOB buffer and then go trough the list of active sticks and send the data again.");

      event.preventDefault(); // stop the browser following the link
    });


    // attach distribute action to this link
    $( "#target_list li."+selector ).find( ".activate_ip" ).change(function (event) {
        if($(this).is(":checked")) {
            console.log("add ip to active");
            active_ips.push($(this).val());
        }
        else
        {   
            console.log("remove ip from active list");
            for (i=0;i<active_ips.length;i++)
            {
             if(active_ips[i] == $(this).val()) active_ips.splice(i, 1);
            } 
        }
        console.log(active_ips);

    });



/*
    // modify a links to use ajax in the background
    $( "#target_list" ).find( "div.liste" ).click (function (event) {
     var target = $( event.target );
     //console.log("x: " ,target.parent());
     target.parent().find("div.animations").toggle();

  // $( "ul" ).click( handler ).find( "ul" ).hide();

//target.val("HIDE ANIMATIONS");
     console.log("click");


     event.preventDefault(); // stop the browser following the link
    });
*/
















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
create_animlist();

    if(scanner_counter==254)
    {
     //scanner_counter=0;
    //scan is done here

    console.log("scanning done");

//    create_animlist();


    // laoding verstecken
    $("#loading").hide();
    $( "#scancontent").show();

    // modify a links to use ajax in the background
    $( ".animation_list" ).find( "a" ).click (function (event) {
      $.ajax({
        type: "GET", // or GET
        url: this.href,
      });
      event.preventDefault(); // stop the browser following the link
    });


  }


  });

  return false;
}




function create_animlist()
{




  console.log("lets make the animlist");
  console.log(available_anims);

const unique = (value, index, self) => {
    return self.indexOf(value) === index;
}

 available_anims = available_anims.filter(unique);
  available_anims.sort();

  var items = [];
  $.each( available_anims, function( key, val ) {
    items.push( "<li class='animation row'><a class='col-10' href=\"#"+val + "\">"+val+"</a></li>" );
  });


// clear list
$("#animationlist").empty();

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

  // play on all active ips (those with a checkbox selected)
  active_ips.forEach(function(ip){
        var target = "http://" + ip +"/run/"+res[1];
        console.log("playnonall(): " , target);

        $.ajax({
         type: "GET", // or GET
         url: target,
         timeout: 500,
         success: function(e){
           // TODO add animation on list entries green flash
           console.log("STARTED ON: ", target)
         },
         error: function(e){
           // TODO: add animations on list items RED flash
           console.log("FAILED ON:", target)
         },

        });


    });

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

/*
    var r = parseInt(rgb[0], 16);
    var g = parseInt(rgb[1], 16);
    var b = parseInt(rgb[2], 16);

    console.log("r: " , rgb[0] );
    console.log("g: " , rgb[1] );
    console.log("b: " , rgb[2] );
    console.log("---" );
*/

    anim_content[index_counter] =   rgb[0];
    anim_content[index_counter+1] = rgb[1];
    anim_content[index_counter+2] = rgb[2];
    index_counter+=3;
  }
  }

  console.log(anim_content);


}

function transmit_anim()
{
  build_anim_data();

  var formData = new FormData();
  var test = new Blob([anim_content], { type: "application/octet-stream"});

  var filename=$("#filename").val()+".poi";
  formData.append("filename", test,filename);

  var target=$("#animationtarget").val();

  var request = new XMLHttpRequest();
  request.open("POST", "http://"+target+"/edit.html");
  request.send(formData);
}



function mass_transmit_anim()
{
  build_anim_data();

  var formData = new FormData();
  var test = new Blob([anim_content], { type: "application/octet-stream"});

  var filename=$("#filename").val()+".poi";
  formData.append("filename", test,filename);


 // TODO convert to .ajax, add error and success handlers
  active_ips.forEach(function(ip){
   console.log("sending animation data to: ", ip);
   var request = new XMLHttpRequest();
   request.open("POST", "http://"+ip+"/edit.html");
   request.send(formData);
  });
}





function download_anim()
{
  build_anim_data();

 // var FileSaver = require('file-saver');

  var anim_blob = new Blob([anim_content], { type: "application/octet-stream"});
  var filename=$("#filename").val()+".poi";

  
  saveAs(anim_blob, filename);

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
    $(target).css("background-color",$("#color").css("background-color"));
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
      $(target).css("background-color",$("#color").css("background-color"));
    }
    else
    {
     $(target).css("background-color","#000000");
    }
}




// adds columns to the editor
var colcount=1;
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


 // stuff in here is executed once document is loaded. binds events to various buttons, loads content via json ans so on..


    if(window.location.port)
    {
        $("#targethost").val(window.location.hostname+":"+window.location.port);
    }
    else
    {
        $("#targethost").val(window.location.hostname);
    }

    target=$("#targethost").val();


    // auto laod animations on first html site access
    load_animations(target,true);

    // fill target for animation upload
    $("#animationtarget").val(target);




   // add one specific ip to list
    $( "#targetrefreshbutton").click (function (event) {
      target=$("#targethost").val();
      load_animations(target);
    });


     // upload anim file to poi
    $( "#uploadbutton").click (function (event) {
      target=$("#animationtarget").val();
      console.log("uploading to: ", target);
      $("#uploadform").attr("action", "http://"+target+"/edit.html");
        /*
           var data = $('#uploadform').serialize();
        $.ajax({
          type: "POST",
          url: "http://"+target+"/edit.html",
          data: data,
          //  success: success,
          dataType:"multipart/form-data" 
        });
        //   $.post("http://"+target+"/edit.html", data);
        event.preventDefault();
        */ 
    });


    // attach scan function to butotn 
    $( "#scan").click (function (event) {
        $("#loading").show();
        scan_iprange(target);
        $("#scancontent").hide();
    });



   $( "#transmit_anim").click (function (event) {
    transmit_anim();
   });

   $( "#mass_transmit_anim").click (function (event) {
    mass_transmit_anim();
   });

   $( "#download_anim").click (function (event) {
    download_anim();
   });

   $( "#addcolumn").click (function (event) {
     addcolumn();
    });

   $(".col_0").mouseover(function(){
     change_color_mouseover(event.target);
   });

   $(".col_0").click(function(){
    change_color_onclick(event.target);
   });
 
   // nav menu

   $("#settings").click(e=>{
    $(".settings").show();
    $(".animator").hide();
   });

   $("#animator").click(e=>{
    $(".animator").show();
    $(".settings").hide();
   });




});

/*
Javascript TODOs


You want to help and improve this this javascript?
Great, thank you.
Please submit pull requests on our github repository.

Whet needs to be done here:

 - save/load list of pois/ips on client somehow (session cookie, local storage?)

 - automatically try to load content from pois found in session/client

 - add some kind of warning / confirm to dangerous actions like:
    -  overwriting existing animations
    -  broadcast/distribute events that affect more than just one poii

 - add some kind of error message if something goes wrong
    -  filename contains wrong characters [a-z0-9_-] only
    -  poi is not reachable during updates

 - str_tolower animation names

 - reload animation list on update

 - remove animation form list on delete

 - animate remove / add of animations with some visual effect (fE jquery .fadeOut)

 - warn that scanning the network takes a long time and disable controls once the scan is started

 - make a nicer animation editor w
  - provide something like 128 nice colors
  - undo/back
  - add and REMOVE row
  - copy color form pixel
  - duplicate last row
  - move content in row one pixel up/down

 I am sure there are 13123123 things i did not think of yet.

 Contribute whatever you think is cool, this project is public domain.

 Always remember: You are riding a meat covered skeleton, on a rock floating trough the voids of space and time at a tremendous speed.
 Be excellent.


 :*
 -flo

*/

// we store availabe poi data globally.
available_pois=[];

// list of animations that are available accumulated on all pois
available_anims=[];

//tbh this is ugly
scanner_counter=0;

// currently selected pois / checkboxes
active_ips =[];

// anim content
var anim_content = new Uint8Array(1); // the body of the new file...




// get JSON from  poi

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

    add_stick_to_list(data);
    create_animlist();

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



// scans 255 ip addresses 1.2.3.X
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

  //async json pull
  $.each( targetIPs, function( key, val ) {
      get_info(val);
    });
}



// adds entries to the DOM
function add_stick_to_list(data)
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
                "</div> <div class='ip col-3'>"+
                data["ip"]+"</div> <div class='version col-2'>"+
                data["version"]+
                "</div> <div class='liste col-4'>"+
                "<button class='toggle-animations'>Show</button></div>"+
                "</div><div style='display:none' class='animations col-12'> ";

    $.each(data["animations"], function(key,val){
      if(key=="EOF") return;
      info_item += "<p><a class='runanim col-8' href='http://"+ data["ip"] +"/run/"+key+"'> "+key+" ("+ (val/25) +")</a>"+
                "<a class='download button' href='http://"+ data["ip"] +"/animations/"+key+"' alt='Download Animation'>"+
                "<img src='icons/download.png' /></a>"+
                "<a class='distribute button' href='"+key+"' alt='Distribute this Animation to all other active Pois'>"+
                "<img src='icons/dist.png' /></a>"+
                "<a class='delete button' href='http://"+ data["ip"] +"/delete/"+key+"' alt='Delete this Animation'><img src='icons/trash.png' /></a></p>";

      // add to global anim list
available_anims.push(key);

//      available_anims[key]=1;

    })
    info_item += "</div>";



    items.push(info_item);
    available_pois[data["ip"]]=data;


   selector = data["ip"];
   selector = selector.replace(/\./g,'');

  // append entries to webinterface
    $( "<li/>", {
      class: selector,
      html: items.join( "" )
    }).appendTo( "#target_list" );



    // show/hide animations liste
    $( "#target_list li."+selector ).find( "button.toggle-animations" ).click (function (e) {

     if($(this).parents().eq(1).find("div.animations").is(":visible"))
     {
        $(this).html("Show");
        $(this).parents().eq(1).find("div.animations").hide();
     }
     else
     {
        $(this).html("Hide");
        $(this).parents().eq(1).find("div.animations").show();

     }

    });


   // the entry is here, add some JS actions now

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
     event.preventDefault();
     animation=$(this).attr("href");
     distribute_animation(data["ip"],animation);

    });

    // attach delete action
    $( "#target_list li."+selector ).find( "a.delete" ).click (function (event) {
     event.preventDefault();
      $.ajax({
        type: "GET", // or GET
        url: this.href,
      });
    });


   // checkboxes to activate entries for mass actions
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
}


// fetch animation and send to all active pois
function distribute_animation(ip,animation)
{

console.log("fetching anim from ip: ", ip ,);
console.log("anim: ", animation);


// get animation
jQuery.ajax({
        url:'http://'+ip+'/animations/'+animation,
        cache:false,
        xhr:function(){// Seems like the only way to get access to the xhr object
            var xhr = new XMLHttpRequest();
            xhr.responseType= 'blob'
            return xhr;
        },
        success: function(data)
        {
         // the animation data is now available in the "data" object
         var fileReader = new FileReader();
         fileReader.onload = function(event)
         {
          anim_content = event.target.result;

          // go trough list of ips and skip ip of original address
          var formData = new FormData();
          var test = new Blob([anim_content], { type: "application/octet-stream"});

          formData.append("filename", test,animation);
          // TODO convert to .ajax, add error and success handlers
          active_ips.forEach(function(remote_ip)
          {
           if(remote_ip == ip)
           {
             console.log("skipping distribution for own ip:" , ip);
             return false;
           }
           var target = "http://" + remote_ip +"/edit.html";
           console.log("sending data to:" , target);

           var request = new XMLHttpRequest();
           request.open("POST", target);
           request.send(formData);
          });
         };
        fileReader.readAsArrayBuffer(data);
    }, // ajax success end

    error:function(){
     //TODO implement info box here
     console.log("Download failed :(");
    }
 });

} // function end




// fetch info from ip via http / json
function get_info(ip)
{
  //$("#info").html("Currently scanning: " + targeturl);
  var xqrc = $.getJSON( "http://"+ip+"/get_info", function( data ) {
    add_stick_to_list(data);
  });



  xqrc.always(function() {
    scanner_counter+=1;
    console.log(scanner_counter);
    create_animlist();


    // this is ugly, can we make this beautiful?
    if(scanner_counter==254)
    {
    console.log("scanning done");


    // loading verstecken
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



// create list of ALL available animations
function create_animlist()
{

  console.log("lets make the animlist");
  console.log(available_anims);

  //only ONE entry per animation
  const unique = (value, index, self) => {
    return self.indexOf(value) === index;
  }

  available_anims = available_anims.filter(unique);
  // alphabetic order
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



// start playback on all active pois
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


// build animation blob from editor data
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

    var rgb = bgcol.match(/\d+/g);


    anim_content[index_counter] =   rgb[0];
    anim_content[index_counter+1] = rgb[1];
    anim_content[index_counter+2] = rgb[2];
    index_counter+=3;
  }
  }

  console.log(anim_content);

}


// send data to one poi
function transmit_anim()
{
//  build_anim_data();

  var formData = new FormData();
  var test = new Blob([anim_content], { type: "application/octet-stream"});

  var filename=$("#filename").val()+".poi";
  formData.append("filename", test,filename);

  var target=$("#animationtarget").val();

  var request = new XMLHttpRequest();
  request.open("POST", "http://"+target+"/edit.html");
  request.send(formData);
}


// send data to all active pois
// TODO implement alarm / confirm that data mitgh be overwritten
function mass_transmit_anim()
{
  //build_anim_data();

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




// download link at anim  maker
function download_anim()
{
  //build_anim_data();
  var anim_blob = new Blob([anim_content], { type: "application/octet-stream"});
  var filename=$("#filename").val()+".poi";
  saveAs(anim_blob, filename);

}



// global detection if mousebutton is pressed.. ugly but works
// TODO: nicer editor
var down = false;
$(document).mousedown(function() {
    down = true;
}).mouseup(function() {
    down = false;
});





// for anim maker
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

build_anim_data();

}

// for animmaker
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


    build_anim_data();

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

 build_anim_data();

}














cropper = false;

// for anim from file
function draw(file){
  var img = new Image();
  img.src = (window.webkitURL ? webkitURL : URL).createObjectURL(file); // URL @ Mozilla, webkitURL @ Chrome

  var canvas = document.getElementById("image_canvas");
  var ctx = canvas.getContext("2d");
  

  img.onload = function() {



      // hide all the stuff
      $("#image_errors").hide();
      $("#image_anim_options").hide();
      
/*
      if (img.height != 25) {
          $("#image_errors").html(`Image needs to have 25 pixels height, but has ${img.height} px`);
          $("#image_errors").show();
          return
      }
*/


      canvas.height = img.height
      canvas.width = img.width
      ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height); // stretch img to canvas size




      $("#image_canvas").show();
      $("#actions").show();

      // $("#info").hide();
      //$("#info").html(`image h=${this.height}, w=${this.width}`);
      //$("#info").show();

      $("#errors").hide();
      $("#btnExportBytes").prop("disabled", false);



      $("#image_anim_options").show();
    

      try
      {
        cropper.destroy(); 
      }
      catch(e) {}



       cropper = new Cropper(canvas, {
        dragMode: 'move',
        restore: false,
        guides: false,
        center: false,
        highlight: true,
        cropBoxMovable: false,
        cropBoxResizable: false,
        toggleDragModeOnDblclick: false,
        viewMode: 1, // ip down movement only

        data:{
            width: img.width,
            height:  25,
            
        },

          crop: function (event) {

     //       console.log("look: " , event.detail.width);
            $("#preview").html(

              cropper.getCroppedCanvas({
                width: 25,
                height: 25,
                minWidth: 25,
                minHeight: 25,
                maxWidth: 250,
                maxHeight: 25,
                fillColor: '#000',
                imageSmoothingEnabled: false,
             
              })
            );

         

        },




    });

    //cropper_pointer = cropper;
    //cropper.destroy();



      // generate animation content
      exportBytes();

     // set name for animation export 
      $("#filename").val(file.name.split(".")[0]);


  }
}




function exportBytes() {
  var canvas = document.getElementById("image_canvas");
  var ctx = canvas.getContext("2d");
  // console.log("export", canvas.height, canvas.width)

  var exportBytesRGBA = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  // console.log("canvas byte array:", exportBytesRGBA.length, exportBytesRGBA);

  // convert canvas rgba array to our rgb (just strip every 4th item)
  var exportBytesRGB = exportBytesRGBA.filter(function(_, i) { return (i + 1) % 4 })
  // console.log("export byte array:", exportBytesRGB.length, exportBytesRGB);


  var a_size= 3*25*canvas.width;
  console.log("building animation buffer of size: # " + a_size);
  anim_content = new Uint8Array(a_size); // the body of the new file...



  // Blinkenpoi wants the bytes column-by-column, but canvas exports row-by-row. Transform now:
  //var exportBytesByColumn = [];

  index_counter=0;
  for (var col=0; col<canvas.width; col++) {
      for (var row=24; row>=0; row--) {

        anim_content[index_counter] =     exportBytesRGB[(col + row * canvas.width) * 3];
        anim_content[index_counter + 1] = exportBytesRGB[(col + row * canvas.width) * 3 + 1];
        anim_content[index_counter + 2] = exportBytesRGB[(col + row * canvas.width) * 3 + 2];
        index_counter+=3;

      }
  }
  //console.log("column-wise export bytes:", anim_content.length, anim_content);
}






















// this is executed once DOM is ready.
// add actions to automatically start in here.
$().ready(function() {


 // stuff in here is executed once document is loaded.
 // binds events to various buttons, loads content via json ans so on..


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



    //animation from picture file choser
     $( "#image_choose").on ("change", function (event) {
      //console.log(this.files);
      draw(this.files[0]);

    });


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
    });


    // attach scan function to button
    $( "#scan").click (function (event) {
        $("#loading").show();
        scan_iprange(target);
        $("#scancontent").hide();
    });



   $( ".transmit_anim").click (function (event) {
    transmit_anim();
   });

   $( ".mass_transmit_anim").click (function (event) {
    mass_transmit_anim();
   });

   $( ".download_anim").click (function (event) {
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

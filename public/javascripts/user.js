"use strict"
$(document).ready(function(){		
    $("#follow-button").click(function(){
    if ($("#follow-button").text() == "Follow"){
        $("#follow-button").animate({ width: '125px'}, () =>{
            $("#follow-button").text("Following").fadeIn(1000)
        });
        $("#follow-button").css("background-color", "rgb(0,0,0,0)");
    }else{
        $("#follow-button").animate({ width: '88.75px' });
            $("#follow-button").text("Follow").fadeIn();
            $("#follow-button").css("background-color", "#007bff");
    }});
});


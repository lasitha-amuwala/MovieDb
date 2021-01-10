"use strict"
//decreases the font size of movie title if the title length causes the title to exceed the height of the div
$(document).ready(function(){		
    let title = $("#movie-title").innerHeight()
    let fontSize = parseInt($("#movie-title").css("font-size"));
    while(title > 100){
        title = $("#movie-title").innerHeight()
        fontSize--;
        $("#movie-title").css("font-size", fontSize)
    }
});
   
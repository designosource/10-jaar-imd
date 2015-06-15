$(document).ready(function() {
    $(".fancybox").fancybox();

    var currentYear = new Date().getFullYear();
    for(var i = 2005; i <= currentYear; i++) {
        if(currentYear == '2005') {
            $('.filter').append("<li class='active'><a href='#'>" + i + "</a></li>");
        } else {
            $('.filter').append("<li><a href='#'>" + i + "</a></li>");
        }
    }
    
    $('#check-it-out').on('click', function() {
        var timeline = $("#timeline").offset().top;
        $('html, body').animate({scrollTop: timeline}, 800);
        return false;
    });

    $('.filter li').on('click', function() {
        var value = $(this).children('a').text();
        var firstPost = $("."+value).first().offset();

        if(firstPost) {
            var offset = firstPost.left;
            var windowOffset = $(".timeline").scrollLeft();
            $('.timeline').animate({scrollLeft: offset + windowOffset}, 1000);
        } else {
            console.log('No post available for this year.');
        }
        return false;
    });

    $('.timeline').scroll(function(){
        var currentYear = new Date().getFullYear();
        var windowOffset = $('.timeline').scrollLeft(); 
        for(var i = 2005; i <= currentYear; i++) {
            if($("."+i).first().offset() != undefined) {
                var firstPost = $("."+i).first().offset().left;
                firstPost = firstPost+windowOffset;
                if(windowOffset >= firstPost) {
                    $('.filter li.active').removeClass('active');
                    $('.filter li a').filter(function(){
                        return $(this).text() == i;
                    }).parent().addClass('active');
                }
            } else {
                console.log('No post available for this year.');
            }
        }
        return false;
    });
    
    function sortTimeline(parent, childSelector, keySelector) {
        var items = parent.children(childSelector).sort(function(a, b) {
            var vA = $(keySelector, a).text();
            vA = vA.split('-');
            vA = new Date(vA[2], vA[1] -1, vA[0]);
            var vB = $(keySelector, b).text();
            vB = vB.split('-');
            vB = new Date(vB[2], vB[1] -1, vB[0]);
            return (vA < vB) ? -1 : (vA > vB) ? 1 : 0;
        });
        parent.append(items);
    }

    var socket = io.connect('http://jubilee-imd.herokuapp.com/');
    socket.on('newObject', function (data) {
        var dateClass = data.date.substr(data.date.length - 4);
        if(data.asset) {
            $('.timeline').append("<div class='entry " + dateClass + "'><a href='data:" + data.asset.content_type + ";base64," + data.asset.base + "' class='fancybox'><div class='header' style='background-image:url(data:" + data.asset.content_type + ";base64," + data.asset.base + ")'></div></a><div class='content'><p class='title'>" + data.title + "</p><p class='date'>" + data.date + "</p><hr><p class='message'>" + data.message + "</p><img class='profielfoto' src='https://graph.facebook.com/" + data.user_id + "/picture'><p class='naam'>" + data.name + "</p></div></div>");
        } else {
            $('.timeline').append("<div class='entry " + dateClass + "'><div class='content'><p class='title'>" + data.title + "</p><p class='date'>" + data.date + "</p><hr><p class='message'>" + data.message + "</p><img class='profielfoto' src='https://graph.facebook.com/" + data.user_id + "/picture'><p class='naam'>" + data.name + "</p></div></div>");
        }
        sortTimeline($('.timeline'), ".entry", 'p.date');
        $(".fancybox").fancybox();
    });
});
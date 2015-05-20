$('#datepicker').datepicker({ dateFormat: 'dd-mm-yy' });

$('#check-it-out').on('click', function(event) {
    event.preventDefault();
    
    var timeline = $("#timeline").offset().top;
    $('body').animate({scrollTop: timeline}, 800);
});

$('.filter li').on('click', function(event) {
    event.preventDefault();
    var value = $(this).children('a').text();
    var firstPost = $("."+value).first().offset();

    if(firstPost) {
        $('.filter li.active').removeClass('active');
        $(this).addClass('active');
        var offset = firstPost.left;
        var windowOffset = $(".timeline").scrollLeft();
        $('.timeline').animate({scrollLeft: offset + windowOffset}, 800);
    } else {
        console.log('No post available for this year.');
    }
});

$('.delete').on('click', function(){
    var postId = $(this).parent().siblings('.post-id').text();
    var post = $(this).parent().parent();

    $.ajax({
        type: "POST",
        url: '/deletepost',
        data: {data: postId},
        success: function(data) {
            post.remove();
            $('#posts-wrapper').prepend("<p class='alert alert-success'>" + data + "</p>");
        }
    });
});
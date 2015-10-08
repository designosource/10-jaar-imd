$(document).ready(function() {
    $('.delete2').on('click', function(){
        var postId = $(this).siblings('.post-id')[0].value;
        var post = $(this).parent().parent();
        console.log("clicked", $(this));
        console.log("id", postId);
        console.log("post", post);
        $.ajax({
            type: "POST",
            url: '/deletepost',
            data: {data: postId},
            success: function(data) {
                post.remove();
                $('#feedback').html("<p class='alert alert-success'>" + data + "</p>");
            }
        });
    });
});
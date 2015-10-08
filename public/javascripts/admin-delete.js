$(document).ready(function() {
    $('.delete').on('click', function(){
        var postId = $(this).parent().siblings('.post-id').text();
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
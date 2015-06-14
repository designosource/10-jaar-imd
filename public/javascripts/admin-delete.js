$(document).ready(function() {
    $('.delete').on('click', function(){
        var postId = $(this).parent().siblings('.post-id').text();
        var post = $(this).parent().parent();

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
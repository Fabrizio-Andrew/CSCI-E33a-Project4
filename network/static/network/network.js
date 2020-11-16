document.addEventListener('DOMContentLoaded', function() {

    // Use the "Post" link to create a new post
    document.querySelector('#newpost').onclick = () => compose();

    // Use the "following" link to get a lists of posts from everyone who the current user follows
    document.querySelector('#following').onclick = () => load_followingposts();

    // Load all posts by default
    load_allposts();
});

function compose() {

    // Clear out post field
    document.querySelector('#newpost-content').value = '';

    // Show new post view
    document.querySelector('#newpost-view').style.display = 'block';

    // Submit post to API endpoint when user clicks "submit"
    document.querySelector('#newpost-form').onsubmit = function() {
        fetch('/newpost', {
            method: 'POST',
            body: JSON.stringify({
                content: document.querySelector('#newpost-content').value
            })
        })
        // Print result
        .then(response => response.json())
        .then(result => {
            console.log(result);
            
            // Hide the new post view
            document.querySelector('#newpost-view').style.display = 'none';
        });
    };
    // Prevent the default load of all posts
    return false;
}

function load_allposts(pagenumber=1) {

    // Fetch all posts
    fetch(`/posts/${pagenumber}`)
    .then(response => response.json())
    .then(package => {
        render_posts(package);

        // Create next page & previous page buttons (if applicable)
        if (package.prevflag === true) {

            var prevbutton = document.createElement('button');
            prevbutton.className = 'btn btn-primary';
            prevbutton.innerHTML = '< Previous';
            prevbutton.onclick = () => load_allposts(package.prevpage);

            document.querySelector('#timeline-view').append(prevbutton);
        }

        if (package.nextflag === true) {

            var nextbutton = document.createElement('button');
            nextbutton.className = 'btn btn-primary';
            nextbutton.innerHTML = 'Next >';
            nextbutton.onclick = () => load_allposts(package.nextpage);

            document.querySelector('#timeline-view').append(nextbutton);
        }
    
    });
}

function load_userposts(username) {

    // Fetch posts belonging to "username"
    fetch(`/posts/${username}`)
    .then(response => response.json())
    .then(package => {
        render_posts(package);

        // Create next page & previous page buttons (if applicable)
        if (package.prevflag === true) {

            var prevbutton = document.createElement('button');
            prevbutton.className = 'btn btn-primary';
            prevbutton.innerHTML = '< Previous';
            prevbutton.onclick = () => load_userposts(package.prevpage);

            document.querySelector('#timeline-view').append(prevbutton);
        }

        if (package.nextflag === true) {
            
            var nextbutton = document.createElement('button');
            nextbutton.className = 'btn btn-primary';
            nextbutton.innerHTML = 'Next >';
            nextbutton.onclick = () => load_userposts(package.nextpage);

            document.querySelector('#timeline-view').append(nextbutton);
        }
    });
}

function load_followingposts() {

    // Hide the profile view. (Other views are hidden/displayed in render_posts())
    document.querySelector('#profile-view').style.display = 'none';

    // Fetch posts belonging to users followed by the requestor
    // NOTE: The word "following" is submitted as a placeholder for the username to the URL dispatcher here.
    fetch(`/posts/following/1`)
    .then(response => response.json())
    .then(package => {
        render_posts(package);

        // Create next page & previous page buttons (if applicable)
        if (package.prevflag === true) {

            var prevbutton = document.createElement('button');
            prevbutton.className = 'btn btn-primary';
            prevbutton.innerHTML = '< Previous';
            prevbutton.onclick = () => load_followingposts(package.prevpage);

            document.querySelector('#timeline-view').append(prevbutton);
        }

        if (package.nextflag === true) {
            
            var nextbutton = document.createElement('button');
            nextbutton.className = 'btn btn-primary';
            nextbutton.innerHTML = 'Next >';
            nextbutton.onclick = () => load_followingposts(package.nextpage);

            document.querySelector('#timeline-view').append(nextbutton);
        }
    });
    return false;
}

function render_posts(package) {

    // Clear timeline view
    document.querySelector('#timeline-view').innerHTML = '';

    // Show timeline view and hide new post view
    document.querySelector('#timeline-view').style.display = 'block';
    document.querySelector('#newpost-view').style.display = 'none';

    // Create div with info/hyperlink for each email in response
    package.response.forEach(function(post) { 

        // Post div
        var div = document.createElement('div');
        div.className = 'post-div';
        div.id = `post_${post.id}`;

        // Poster's username
        var username = document.createElement('a');
        username.className = 'username-line';
        username.href = '';
        username.innerHTML = `User: ${post.poster}`;
        
        // Open user profile when the username is clicked
        username.onclick = () => load_profile(post.poster);

        // Post content
        var content = document.createElement('p');
        content.className = 'post-content';
        content.innerHTML = post.content;

        // Timestamp
        var time = document.createElement('p');
        time.className = 'timestamp';
        time.innerHTML = `${post.timestamp}`;

        // Display likes and Like/Unlike button
        var likesdiv = document.createElement('div')
        like_post(post, package.requestor, likesdiv);
      
        // Append elements to post div and post div to timeline view
        div.append(username, content, time, likesdiv);
        
        // If post belongs to current user, add "edit" button
        if (package.requestor === post.poster) {
            var editlink = document.createElement('a');
            editlink.className = 'editlink'
            editlink.innerHTML = 'Edit';
            editlink.href = '';
            editlink.onclick = () => edit_post(post);
            div.append(editlink);
        }

        // Append this post's div to the timeline view
        document.querySelector('#timeline-view').append(div);

    }); 
}

function edit_post(post) {
    
    // Get the div corresponding to this post and hide all elements within it.
    var div = document.querySelector(`#post_${post.id}`);
    var children = div.childNodes;
    for (var i=0; i<children.length; i++) {
        children[i].style.display = 'none';
    }

    // Create elements for edit form
    textarea = document.createElement('textarea');
    textarea.className = 'form-control';
    textarea.value = post.content;

    submitbutton = document.createElement('input');
    submitbutton.type = 'submit';
    submitbutton.className = 'btn btn-primary';

    // Submit the updated post to /editpost
    submitbutton.onclick = function () {
        fetch('/editpost', {
            method: 'POST',
            body: JSON.stringify({
                post_id: post.id,
                content: textarea.value
            })
        })
        // Print result
        .then(response => response.json())
        .then(result => {
            console.log(result);
        
            // Set the post's content to the new value
            div.querySelector('.post-content').innerHTML = textarea.value;

            // Remove the textarea and submit button
            textarea.remove();
            submitbutton.remove();

            // Unhide post content
            var children = div.childNodes;
            for (var i=0; i<children.length; i++) {
                children[i].style.display = 'block';
            }
        });
    }

    // Append the textarea and submit button to the post's div
    div.append(textarea, submitbutton);
    
    // Prevent the automatic load of all posts
    return false;
}

function like_post(post, user, div) {
    
    // Clear the likes div within this post div
    div.innerHTML = '';

    // Show the likes count
    var likescount = post.likescount;
    var likes = document.createElement('p');
    likes.className = 'likes';
    likes.innerHTML = `Likes: ${likescount}`;

    // Create the like button
    var likebutton = document.createElement('button');
    likebutton.className = 'btn btn-primary';

    // Set the innerHTML based on like status from API 
    if (post.likes.includes(user)) {
        likebutton.innerHTML = 'Unlike';
    } else {
        likebutton.innerHTML = 'Like';
    }

    // When the like button is clicked, call toggle_like function
    likebutton.onclick = function() {
        fetch('/like', {
            method: 'PUT',
            body: JSON.stringify({
                post: post.id
            })
        })
        // Print result
        .then(response => response.json())
        .then(message => {
            console.log(message);

            // Set the likescount and like button text based on server response
            if (message.message === 'Liked') {
                likebutton.innerHTML = 'Unlike';
                likescount++;
            } else if (message.message === 'Unliked') {
                likebutton.innerHTML = 'Like'
                likescount--;
            }

            // Reload the likescount in the UI
            likes.innerHTML = `Likes: ${likescount}`;
        });
    }

    // Append the Likes count and Like/unlike button to this post's likes div
    div.append(likes, likebutton);

}

function load_profile(user) {
    
    // Clear profile view
    document.querySelector('#profile-view').innerHTML = '';

    // Show profile view
    document.querySelector('#profile-view').style.display = 'block';

    // Fetch user profile
    fetch(`/profile/${user}`)
    .then(response => response.json())
    .then(result => {

        // Create elements for profile info    
        // Username
        var username = document.createElement('p');
        username.innerHTML = `${result.response.username}'s Profile Page`;

        // Followers count
        var followers = document.createElement('p');
        followers.innerHTML = `Followers: ${result.response.followerscount}`;

        // Following count
        var following = document.createElement('p');
        following.innerHTML = `Following: ${result.response.followingcount}`;

        // Append these three elements to the profile view
        document.querySelector('#profile-view').append(username, followers, following);

        // Check that this page does not belong to the current user
        if (result.requestor !== result.response.username) {

            // Create follow/unfollow button
            var followbutton = document.createElement('button');
            followbutton.className = "btn btn-primary";
            
            // Check if requestor is in the current profile's list of followers to display button text
            if (result.response.followernames.includes(result.requestor)) {
                followbutton.innerHTML = "UnFollow";
            } else {
                followbutton.innerHTML = "Follow";
            }

            // When the follow button is clicked, call toggle_follow function
            followbutton.onclick = function() {
                fetch('/follow', {
                    method: 'PUT',
                    body: JSON.stringify({
                        target: result.response.username
                    })
                })
                // Print result
                .then(response => response.json())
                .then(message => {
                    console.log(message);
                    // Reload profile page view
                    load_profile(result.response.username);
                });
            }
            
            // Append the follow/unfollow button to the profile view
            document.querySelector('#profile-view').append(followbutton);
        }

        // Get posts for user
        load_userposts(result.response.username);
    });

    // Prevent default load of all posts
    return false;
}
document.addEventListener('DOMContentLoaded', function() {

    // Use the "Post" link to create a new post
    document.querySelector('#newpost').onclick = () => compose();

    document.querySelector('#following').onclick = () => load_followingposts();

    // Load timeline by default
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
    return false;
}

function load_allposts() {

    // Fetch all posts
    fetch('/posts')
    .then(response => response.json())
    .then(result => {
        render_posts(result);
    });
}

function load_userposts(username) {

    // Fetch posts belonging to "username"
    fetch(`/posts/${username}`)
    .then(response => response.json())
    .then(result => {
        render_posts(result);
    });
}

function load_followingposts() {

    // Hide the profile view. (Other views are hidden/displayed in render_posts())
    document.querySelector('#profile-view').style.display = 'none';

    // Fetch posts belonging to users followed by the requestor
    // NOTE: The word "following" is submitted as the username to the URL dispatcher here...  
    // It doesn't matter, because it's not used by the back end in this case.
    fetch(`/posts/following/1`)
    .then(response => response.json())
    .then(result => {
        render_posts(result);
    });
    return false;
}


function render_posts(posts) {

    // Clear timeline view
    document.querySelector('#timeline-view').innerHTML = '';

    // Show timeline view and hide new post view
    document.querySelector('#timeline-view').style.display = 'block';
    document.querySelector('#newpost-view').style.display = 'none';

    // Create div with info/hyperlink for each email in response
    posts.forEach(function(post) { 

        var div = document.createElement('div');
        div.className = 'post-div';

        var username = document.createElement('a');
        username.className = 'username-line';
        username.href = '';
        username.innerHTML = `User: ${post.poster}`;
        
        var content = document.createElement('p');
        content.className = 'post-content';
        content.innerHTML = `${post.content}`;

        var time = document.createElement('p');
        time.className = 'timestamp';
        time.innerHTML = `${post.timestamp}`;

        var likes = document.createElement('p');
        likes.className = 'likes';
        likes.innerHTML = `Likes: ${post.likes}`;


        // Open user profile when the username is clicked
        username.onclick = () => load_profile(post.poster);
        
        // Append elements to post div and post div to timeline view
        div.append(username, content, time, likes);
        document.querySelector('#timeline-view').append(div);
    }); 
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
        var username = document.createElement('p');
        username.innerHTML = `${result.response.username}'s Profile Page`;

        var followers = document.createElement('p');
        followers.innerHTML = `Followers: ${result.response.followerscount}`;

        var following = document.createElement('p');
        following.innerHTML = `Following: ${result.response.followingcount}`;

        // Append these three elements to the profile view
        document.querySelector('#profile-view').append(username, followers, following);

        if (result.requestor !== result.response.username) {

            // Create follow/unfollow button
            var followbutton = document.createElement('button');
            followbutton.className = "btn btn-primary";
            
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

            // Check if requestor is in the current profile's list of followers to display button text
            if (result.response.followernames.includes(result.requestor)) {
                followbutton.innerHTML = "UnFollow";
                console.log("Unfollowed");
            } else {
                followbutton.innerHTML = "Follow";
                console.log("Followed");
            }
            
            // Append the follow/unfollow button to the profile view
            document.querySelector('#profile-view').append(followbutton);
        }

        // Get posts for user
        load_userposts(result.response.username);
    });
    // Prevent default behavior
    return false;
}
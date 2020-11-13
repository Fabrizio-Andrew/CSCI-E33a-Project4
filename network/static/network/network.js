document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#newpost').onclick = () => compose();

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

    // Show timeline view and hide new post view
    document.querySelector('#timeline-view').style.display = 'block';
    document.querySelector('#newpost-view').style.display = 'none';

    // Fetch all posts
    fetch('/posts')
    .then(response => response.json())
    .then(result => {
        render_posts(result);
    });
}

function load_userposts(username) {
    // Show timeline view and hide new post view
    document.querySelector('#timeline-view').style.display = 'block';
    document.querySelector('#newpost-view').style.display = 'none';

    // Fetch all posts
    fetch(`/posts/${username}`)
    .then(response => response.json())
    .then(result => {
        render_posts(result);
    });
}


function render_posts(posts) {

    // Clear timeline view
    document.querySelector('#timeline-view').innerHTML = '';

    // Create div with info/hyperlink for each email in response
    posts.forEach(function(post) { 
        console.log(post);

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
    
    // Show profile view
    document.querySelector('#profile-view').style.display = 'block';

    // Fetch user profile
    fetch(`/profile/${user}`)
    .then(response => response.json())
    .then(result => {

        // Create elements for profile info    
        var username = document.createElement('p');
        username.innerHTML = `${result.username}'s Profile Page`;

        var followers = document.createElement('p');
        followers.innerHTML = `Followers: ${result.followers}`;

        var following = document.createElement('p');
        following.innerHTML = `Following: ${result.following}`;

        document.querySelector('#profile-view').append(username, followers, following);

        // Get posts for user
        load_userposts(result.username);
    });
    return false;
}
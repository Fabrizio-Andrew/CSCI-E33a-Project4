# Read Me

Brief outline of the implementation for each spec:

In general, the application works very similarly to project 3.  Python and Django are used to serve up information to API endpoints - which are then rendered by a JavaScript front end.

1. **NewPost:** Users who are signed in should be able to write a new text-based post by filling in text into a text area and then clicking a button to submit the post.

- The screenshot at the top of this specification shows the “New Post” box at the top of the “All Posts” page. You may choose to do this as well, or you may make the “New Post” feature a separate page.

> This requirement is supported on the front end by the compose() function in network.js - which creates a "New Post" box at the top of the page similar to the example.  On the back end, this requirement is supported by the new_post() function in views.py.


2. **All Posts:** The “All Posts” link in the navigation bar should take the user to a page where they can see all posts from all users, with the most recent posts first.

- Each post should include the username of the poster, the post content itself, the date and time at which the post was made, and the number of “likes” the post has (this will be 0 for all posts until you implement the ability to “like” a post later).
  
> This requirement is supported by the load_allposts() and render_posts() function on the front end.  On the back end, this requirement is supported via the get_posts() function in views.py and the serialize() method in the Post class in models.py.


3. **Profile Page:** Clicking on a username should load that user’s profile page. This page should:

- Display the number of followers the user has, as well as the number of people that the user follows.

- Display all of the posts for that user, in reverse chronological order.

> This requirement is supported by the load_profile() function which creates a profile view at the top of the page - similar to the new post box.  On the back end, profile data is provided by the get_profile() function in views.py and the serialize() method in the User class in models.py.

- For any other user who is signed in, this page should also display a “Follow” or “Unfollow” button that will let the current user toggle whether or not they are following this user’s posts. Note that this only applies to any “other” user: a user should not be able to follow themselves.

> The "follow" requirement is supported by an anonymous function within load_profile() on the front end.  On the back end, the toggle_follow function determines if the requestor is already a follower and follows/unfollows as appropriate.

4. **Following:** The “Following” link in the navigation bar should take the user to a page where they see all posts made by users that the current user follows.

- This page should behave just as the “All Posts” page does, just with a more limited set of posts.
    
- This page should only be available to users who are signed in.

> This requirement is supported by the load_followingposts() function on the front end and the get_posts() function in views.py.  The requirement that the user be signed in is supported both on the front end (the "following" button won't appear for unauthenticated users) and the back end (get_posts() requires a logged-in user to be included in this type of request).

5. **Pagination:** On any page that displays posts, posts should only be displayed 10 on a page. If there are more than ten posts, a “Next” button should appear to take the user to the next page of posts (which should be older than the current page of posts). If not on the first page, a “Previous” button should appear to take the user to the previous page of posts as well.

- See the Hints section for some suggestions on how to implement this.

> Pagination is supported on the back end via Django's Paginator (as the hint specified).  However, I did not user Bootstrap's pagination buttons on the front end.  Instead, I included "next" and "previous" buttons that only display when Django's paginator indicates that a next/previous page is available.

6. **Edit Post:** Users should be able to click an “Edit” button or link on any of their own posts to edit that post.

- When a user clicks “Edit” for one of their own posts, the content of their post should be replaced with a textarea where the user can edit the content of their post.

- The user should then be able to “Save” the edited post. Using JavaScript, you should be able to achieve this without requiring a reload of the entire page.

- For security, ensure that your application is designed such that it is not possible for a user, via any route, to edit another user’s posts.

> This requirement is supported via the edit_post() function on the front end and the edit_post() function in views.py on the back end.  The authentication requirement is supported both on the front end (the edit button does not appear unless the current user is the post's owner) and the back end (the back end function checks that the currently logged-in user is the post's owner).

7. **"Like" and "Unlike":** Users should be able to click a button or link on any post to toggle whether or not they “like” that post.

- Using JavaScript, you should asynchronously let the server know to update the like count (as via a call to fetch) and then update the post’s like count displayed on the page, without requiring a reload of the entire page.

> This requirement is supported by the like_post() function on the front end and toggle_like() in views.py on the back end.  Only the likes count and Like/Unlike button are reloaded upon completion of the transaction.  NOTE: Although the requirement doesn't specifically say so, the like/unlike button only appears for authenticated users - since it's impossible to register a like for an unauthenticated user.
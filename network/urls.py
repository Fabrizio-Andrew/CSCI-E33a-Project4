
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("newpost", views.new_post, name="newpost"),
    path("editpost", views.edit_post, name="editpost"),
    path("posts", views.get_posts, name="posts"),
    path("posts/<str:username>", views.get_posts, name="userposts"),
    path("posts/<str:username>/<int:followflag>", views.get_posts, name="followingposts"),
    path("profile/<str:username>", views.get_profile, name="profile"),
    path("following", views.get_following, name="following"),
    path("follow", views.toggle_follow, name="follow"),
    path("like", views.toggle_like, name="like")
]

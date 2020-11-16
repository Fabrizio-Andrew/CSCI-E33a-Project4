"""
Network Views Module

This module contains functions that support all logic for addiing, removing,
updating, and displaying data associated with the Network app.
"""

import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import JsonResponse
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator

from .models import User, Post


def index(request):
    """
    Render the default view.
    """
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


@csrf_exempt
@login_required
def new_post(request):
    """
    Given a new post's information via POST, create a Post object
    instance in the DB.
    """
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)
    newpost = Post(content=data.get("content", ""),
                   poster=request.user)
    newpost.save()
    return JsonResponse({"message": "Post saved successfully."}, status=201)


@csrf_exempt
@login_required
def edit_post(request):
    """
    Given an existing post's id and updated text, update the Post object's
    content only if the currently logged-in user is the owner of the post.
    """
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # Retrieve the specified Post object
    data = json.loads(request.body)
    post = Post.objects.get(id=data["post_id"])

    # Confirm that the requestor is the owner of the post
    if request.user == post.poster:

        # Update the post content and save
        post.content = data["content"]
        post.save()
        return JsonResponse({"message": "Post updated successfully."}, status=201)

    return JsonResponse({"error": "User is not the author of this post."}, status=400)


def get_posts(request, pagenumber, username='null', followflag=0):
    """
    Returns posts ordered chronologically beginning with the most
    recent and paginated to 10 results-per-page.

    If the "followflag" = 1, the function retrieves only posts
    belonging to users who the currently logged-in user follows.

    If the "followflag" = 0, but a username is submitted, the
    function retrieves only posts belonging to that username.
    NOTE: Usernames are required to be unique according to the
    User class in models.py.

    Otherwise, the function returns all Post objects.
    """

    # Get posts as specified by any submitted filters.
    if followflag == 1:
        user = request.user

        # Get all posts authored by users followed by the requestor
        posts = Post.objects.filter(poster__in=User.objects.filter(followers=user))

    elif username != 'null':
        user = User.objects.get(username=username)
        posts = Post.objects.filter(poster=user)

    else:
        posts = Post.objects.all()

    # Order and paginate the list of posts
    posts = posts.order_by("-timestamp").all()
    serialized = [post.serialize() for post in posts]
    paginated = Paginator(serialized, 10)
    resultspage = paginated.page(pagenumber)

    # Prepare JSON package for response
    package = {
        "requestor": request.user.username,
        "response": resultspage.object_list,
        "nextflag": resultspage.has_next(),
        "prevflag": resultspage.has_previous()
    }

    # If next/previous pages exist, include page numbers in the JSON package
    if resultspage.has_next():
        package['nextpage'] = resultspage.next_page_number()
    if resultspage.has_previous():
        package['prevpage'] = resultspage.previous_page_number()

    return JsonResponse(package, safe=False)


def get_profile(request, username):
    """
    Given a username, return the user's profile info.

    NOTE: Usernames are required to be unique according to the
    User class in models.py.
    """
    user = User.objects.get(username=username)
    return JsonResponse({
        "requestor": request.user.username,
        "response": user.serialize()
    }, safe=False)


@login_required
def get_following(request):
    """
    Return all users who the currently logged-in user follows.
    """
    user = request.user
    return JsonResponse({
        "requestor": request.user.username,
        "user": user.username,
        "following": user.following()
    }, safe=False)


@csrf_exempt
@login_required
def toggle_follow(request):
    """
    Toggle whether the requestor is following the user
    submitted via PUT (the "target").
    """
    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required."}, status=400)

    # Access currently logged-in user and target user
    user = request.user
    data = json.loads(request.body)
    target = User.objects.get(username=data.get("target", ""))

    # If the user already follows the target, unfollow.  Otherwise, follow.
    if User.objects.filter(pk=target.pk, followers__pk=user.pk):
        target.followers.remove(user)
        return JsonResponse({"message": "User unfollowed successfully."}, status=201)
    target.followers.add(user)
    return JsonResponse({"message": "User followed successfully."}, status=201)


@csrf_exempt
@login_required
def toggle_like(request):
    """
    Toggle whether the requestor "likes" a post.
    """
    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required."}, status=400)

    # Access currently logged-in user and the target post
    user = request.user
    data = json.loads(request.body)
    post = Post.objects.get(id=data.get("post", ""))

    # If the user already likes this post, unlike.  Otherwise, like.
    if Post.objects.filter(pk=post.pk, likes__pk=user.pk):
        post.likes.remove(user)
        return JsonResponse({"message": "Unliked"}, status=201)
    post.likes.add(user)
    return JsonResponse({"message": "Liked"}, status=201)

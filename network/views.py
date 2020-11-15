import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from .models import User, Post


def index(request):
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
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)
    print(data)
    post = Post.objects.get(id=data["post_id"])

    # Confirm that the requestor is the owner of the post
    if request.user != post.poster:
        return JsonResponse({"error": "User is not the author of this post."}, status=400)
    
    post.content = data["content"]
    post.save()
    return JsonResponse({"message": "Post updated successfully."}, status=201)


def get_posts(request, username='null', followflag=0):
    """
    Returns all posts ordered chronologically beginning with the most recent.
    """
    if followflag == 1:
        user = request.user

        # Get all posts authored by users followed by the currently logged-in user
        posts = Post.objects.filter(poster__in=User.objects.filter(followers=user))

    elif username != 'null':
        user = User.objects.get(username=username)
        posts = Post.objects.filter(poster=user)

    else:
        posts = Post.objects.all()

    posts = posts.order_by("-timestamp").all()
    return JsonResponse({
        "requestor": request.user.username,
        "response": [post.serialize() for post in posts]
    },
    safe=False)


def get_profile(request, username):
    user = User.objects.get(username=username)
    print(user.serialize())
    return JsonResponse({
        "requestor": request.user.username,
        "response": user.serialize()
    }, 
    safe=False)

@login_required
def get_following(request):
    user = request.user
    return JsonResponse({
        "requestor": request.user.username,
        "user": user.username,
        "following": user.following()
    }, 
    safe=False)

@csrf_exempt
@login_required
def toggle_follow(request):
    """
    Toggle whether the requestor is following the user.
    """
    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required."}, status=400)
    user = request.user
    data = json.loads(request.body)
    target = User.objects.get(username=data.get("target", ""))

    # If the user already follows the target, unfollow.  Otherwise, follow.
    if User.objects.filter(pk=target.pk, followers__pk=user.pk):
        target.followers.remove(user)
        return JsonResponse({"message": "User unfollowed successfully."}, status=201)
    else:
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
    user = request.user
    data = json.loads(request.body)
    post = Post.objects.get(id=data.get("post",""))

    if Post.objects.filter(pk=post.pk, likes__pk=user.pk):
        post.likes.remove(user)
        return JsonResponse({"message": "Unliked"}, status=201)
    else:
        post.likes.add(user)
        return JsonResponse({"message": "Liked"}, status=201)
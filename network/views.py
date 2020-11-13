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

def get_posts(request, username='null'):
    """
    Returns all posts ordered chronologically beginning with the most recent.
    """
    if username != 'null':
        user = User.objects.get(username=username)
        posts = Post.objects.filter(poster=user)
    else:
        posts = Post.objects.all()
    posts = posts.order_by("-timestamp").all()
    for post in posts:
        print(post.serialize())
    return JsonResponse([post.serialize() for post in posts], safe=False)

def get_profile(request, username):
    user = User.objects.get(username=username)
    print(user.serialize())
    return JsonResponse(user.serialize(), safe=False)

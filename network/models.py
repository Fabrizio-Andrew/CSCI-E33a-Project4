from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Contains all data pertaining to users and accounts.
    """
    username = models.CharField(max_length=64, unique=True)
    email = models.EmailField()
    password = models.CharField(max_length=256)
    followers = models.ManyToManyField(
        'User',
        blank=True,
        related_name='peoplefollowing'
    )

    def __str__(self):
        return f"<{self.pk}: {self.username}>"

    def serialize(self):
        """
        Returns a python dict representation of relevant data within a specific
        instance of User.
        """
        followerslist = []
        for follower in self.followers.all():
            followername = follower.username
            followerslist.append(followername)
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "followernames": followerslist,
            "followerscount": len(followerslist),
            "followingcount": len(User.objects.filter(followers=self))
        }


class Post(models.Model):
    """
    Contains all data pertaining to user posts.
    """
    content = models.TextField(max_length=256)
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(
        'User',
        related_name='likers'
    )
    poster = models.ForeignKey(
        'User',
        related_name='poster',
        on_delete=models.CASCADE
    )

    def __str__(self):
        return f"<{self.pk}: post by {self.poster}>"

    def serialize(self):
        """
        Returns a python dict representation of relevant data within a specific
        instance of Post.
        """
        likeslist = []
        for user in self.likes.all():
            likeslist.append(user.username)
        return {
            "id": self.id,
            "content": self.content,
            "timestamp": self.timestamp.strftime("%b %d, %Y %-I:%M %p"),
            "likes": likeslist,
            "likescount": len(self.likes.all()),
            "poster": self.poster.username
        }


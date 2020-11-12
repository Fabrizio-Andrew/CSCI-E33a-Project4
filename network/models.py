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
        return {
            "id": self.id,
            "content": self.content,
            "timestamp": self.timestamp,
            "likes": [user.email for user in self.likes.all()],
            "poster": self.poster.username
        }


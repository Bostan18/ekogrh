from django.utils.timesince import timesince as django_timesince
from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    time_ago = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            "id",
            "type",
            "title",
            "description",
            "icon",
            "link",
            "is_read",
            "created_at",
            "time_ago",
        ]
        read_only_fields = ["id", "created_at", "time_ago"]

    def get_time_ago(self, obj):
        return django_timesince(obj.created_at)

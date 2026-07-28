# Generated migration for LiveStream models

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_remove_userprofile_address_remove_userprofile_city_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='LiveStreamBroadcast',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('video_id', models.CharField(blank=True, help_text='YouTube video ID (e.g. dQw4w9WgXcQ)', max_length=50)),
                ('title', models.CharField(default='Live Show', max_length=255)),
                ('description', models.TextField(blank=True)),
                ('is_live', models.BooleanField(default=False, help_text='Toggle to go live / end stream')),
                ('viewer_count', models.PositiveIntegerField(default=0)),
                ('scheduled_at', models.DateTimeField(blank=True, null=True)),
                ('started_at', models.DateTimeField(blank=True, null=True)),
                ('ended_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('event', models.ForeignKey(
                    blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='livestreams',
                    to='api.event',
                    help_text='Optional: link to a flash sale Event to activate alongside this stream'
                )),
            ],
            options={
                'verbose_name': 'Livestream Broadcast',
                'verbose_name_plural': 'Livestream Broadcasts',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='LiveStreamComment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('display_name', models.CharField(max_length=100)),
                ('message', models.TextField()),
                ('is_pinned', models.BooleanField(default=False)),
                ('is_hidden', models.BooleanField(default=False)),
                ('is_highlighted', models.BooleanField(default=False)),
                ('source', models.CharField(
                    choices=[('site', 'ShopWave Site'), ('youtube', 'YouTube')],
                    default='site',
                    max_length=20
                )),
                ('youtube_comment_id', models.CharField(blank=True, max_length=100)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('broadcast', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='comments',
                    to='api.livestreambroadcast'
                )),
                ('user', models.ForeignKey(
                    blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='livestream_comments',
                    to=settings.AUTH_USER_MODEL
                )),
            ],
            options={
                'verbose_name': 'Livestream Comment',
                'verbose_name_plural': 'Livestream Comments',
                'ordering': ['-created_at'],
            },
        ),
    ]
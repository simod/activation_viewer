# import uuid
# from django.db import models
# from django.utils import timezone
#
#
# class TimeStampedModelMixin(models.Model):
#     """
#     Mixin for timestamped models.
#     """
#     created_at = models.DateTimeField(default=timezone.now, editable=False)
#     started_at = models.DateTimeField(default=timezone.now, editable=False)
#     finished_at = models.DateTimeField(editable=False, null=True)
#
#     class Meta:
#         abstract = True
#
#
# class RunModelMixin(TimeStampedModelMixin):
#     """
#     Mixin for task runs.
#     """
#     id = models.AutoField(primary_key=True, editable=False)
#     uid = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)
#
#     class Meta:
#         abstract = True
#
#
# class LowerCaseCharField(models.CharField):
#     """
#     Defines a charfield which automatically converts all inputs to
#     lowercase and saves.
#     """
#
#     def pre_save(self, model_instance, add):
#         """
#         Converts the string to lowercase before saving.
#         """
#         current_value = getattr(model_instance, self.attname)
#         setattr(model_instance, self.attname, current_value.lower())
#         return getattr(model_instance, self.attname)
#
#
# class ExportRun(RunModelMixin):
#     """
#     ExportRun is the main structure for storing export information.
#     A Job provides information for the ExportRun.
#     Many ExportRuns can map to a Job.
#     Many ExportProviderTasks can map to an ExportRun.
#     Many ExportTasks can map to an ExportProviderTask.
#     """
#     job = models.ForeignKey(Job, related_name='runs')
#     user = models.ForeignKey(User, related_name="runs", default=0)
#     worker = models.CharField(max_length=50, editable=False, default='', null=True)
#     zipfile_url = models.CharField(max_length=1000, db_index=False, blank=True, null=True)
#     status = models.CharField(
#         blank=True,
#         max_length=20,
#         db_index=True,
#         default=''
#     )
#     expiration = models.DateTimeField(default=timezone.now, editable=True)
#     notified = models.DateTimeField(default=None, blank=True, null=True)
#
#     class Meta:
#         managed = True
#         db_table = 'export_runs'
#
#     def __str__(self):
#         return '{0}'.format(self.uid)
#
#
# class ExportProviderTask(models.Model):
#     """
#     The ExportProviderTask stores the task information for a specific provider.
#     """
#     id = models.AutoField(primary_key=True, editable=False)
#     uid = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)
#     name = models.CharField(max_length=50, blank=True)
#     slug = LowerCaseCharField(max_length=40, default='')
#     run = models.ForeignKey(ExportRun, related_name='provider_tasks')
#     status = models.CharField(blank=True, max_length=20, db_index=True)
#
#     class Meta:
#         ordering = ['name']
#         managed = True
#         db_table = 'export_provider_tasks'
#
#     def __str__(self):
#         return 'ExportProviderTask uid: {0}'.format(self.uid)
#
# class ExportTask(models.Model):
#     """
#      An ExportTask holds the information about the process doing the actual work for a task.
#     """
#     id = models.AutoField(primary_key=True, editable=False)
#     uid = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)
#     celery_uid = models.UUIDField(null=True)  # celery task uid
#     name = models.CharField(max_length=50)
#     export_provider_task = models.ForeignKey(ExportProviderTask, related_name='tasks')
#     status = models.CharField(blank=True, max_length=20, db_index=True)
#     progress = models.IntegerField(default=0, editable=False, null=True)
#     created_at = models.DateTimeField(default=timezone.now, editable=False)
#     started_at = models.DateTimeField(editable=False, null=True)
#     estimated_finish = models.DateTimeField(blank=True, editable=False, null=True)
#     finished_at = models.DateTimeField(editable=False, null=True)
#     pid = models.IntegerField(blank=True, default=-1)
#     worker = models.CharField(max_length=100, blank=True, editable=False, null=True)
#     cancel_user = models.ForeignKey(User, null=True, blank=True, editable=False)
#
#     class Meta:
#         ordering = ['created_at']
#         managed = True
#         db_table = 'export_tasks'
#
#     def __str__(self):
#         return 'ExportTask uid: {0}'.format(self.uid)

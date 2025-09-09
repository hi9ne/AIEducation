"""
WSGI config for aieducation project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application
import logging

logger = logging.getLogger(__name__)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aieducation.settings')

application = get_wsgi_application()

# Log the resolved ALLOWED_HOSTS for debugging in production environments
try:
	from django.conf import settings as _settings
	logger.info('Starting WSGI application with ALLOWED_HOSTS=%s', getattr(_settings, 'ALLOWED_HOSTS', None))
except Exception:
	logger.exception('Unable to read Django settings at WSGI startup')

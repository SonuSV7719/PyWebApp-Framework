"""
Backend module for cross-platform Python IPC application.
Contains platform-independent business logic.

The core framework (registry, api, dispatcher, logger, context)
is provided by the pywebapp-native pip package.
User-defined handlers go in handlers.py.
"""

# Import from the framework package to ensure handlers are discovered
from pywebapp.core import register, dispatch, get_logger

__version__ = "1.0.0"

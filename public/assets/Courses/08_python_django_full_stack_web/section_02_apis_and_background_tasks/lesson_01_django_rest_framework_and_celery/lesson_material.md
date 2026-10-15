# Lesson 2.1: DRF & Celery Async Tasks

```python
# tasks.py
from celery import shared_task

@shared_task
def send_enrollment_email(student_email, course_name):
    # Asynchronous non-blocking email dispatch
    pass
```

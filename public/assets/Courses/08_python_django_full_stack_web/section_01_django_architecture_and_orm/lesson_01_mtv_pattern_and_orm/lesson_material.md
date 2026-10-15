# Lesson 1.1: MTV Architecture & Django ORM

```python
from django.db import models

class Course(models.Model):
    title = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
```

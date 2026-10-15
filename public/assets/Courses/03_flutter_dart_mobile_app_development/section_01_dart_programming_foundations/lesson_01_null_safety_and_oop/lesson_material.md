# Lesson 1.1: Sound Null Safety & Modern Dart

## 1. Core Principles
Dart's sound null safety eliminates `NoSuchMethodError` crashes at runtime by verifying variable nullability during compilation.

```dart
// Non-nullable by default
String title = "Flutter Mastery";

// Explicitly nullable
String? description;

// Safe navigation & null coalescing
int charCount = description?.length ?? 0;
```

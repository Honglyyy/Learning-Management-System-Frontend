# Lesson 2.1: Kafka & Microservices

Asynchronous pub/sub decouples service availability: Order Service publishes `OrderCreatedEvent` to Kafka, and Inventory & Payment services process events independently.

# Lesson 2.1: Multi-Stage Production Dockerfiles

## 1. Learning Objectives
- Write efficient multi-stage Dockerfiles that eliminate compilers and build tools from final images.
- Optimize layer caching with order of execution (`COPY package*.json` before `COPY .`).
- Enforce non-root security best practices.

## 2. Production Dockerfile Example (Go Application)
```dockerfile
# Stage 1: Build & Compile
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o server .

# Stage 2: Final Minimal Runtime
FROM alpine:3.19
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /home/appuser
COPY --from=builder /app/server .
USER appuser
EXPOSE 8080
ENTRYPOINT ["./server"]
```

## 3. Key Takeaways
- Multi-stage builds dramatically shrink container size (e.g. from 850MB to 12MB).
- Never run containers as root in production.
- Leverage `.dockerignore` to prevent leaking `.git`, `.env`, and sensitive files into images.

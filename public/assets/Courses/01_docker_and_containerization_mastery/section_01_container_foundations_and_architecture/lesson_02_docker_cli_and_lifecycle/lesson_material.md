# Lesson 1.2: Docker CLI & Container Lifecycle Management

## 1. Learning Objectives
- Master `docker run`, `docker exec`, `docker logs`, `docker inspect`, and `docker stop`.
- Understand detached mode (`-d`), port forwarding (`-p`), and restart policies (`--restart unless-stopped`).

## 2. Practical Container Lifecycle
```bash
# Run Nginx in detached background mode with port forwarding
docker run -d --name web-server -p 8080:80 --restart unless-stopped nginx:alpine

# View running containers
docker ps

# Stream logs in real-time
docker logs -f web-server

# Execute a shell inside the running container
docker exec -it web-server sh

# Clean up container
docker stop web-server && docker rm web-server
```

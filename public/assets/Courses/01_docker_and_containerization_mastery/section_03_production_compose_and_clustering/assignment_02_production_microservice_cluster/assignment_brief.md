# Assignment 2: Production Microservice Cluster Deployment

### Objective
Deploy an end-to-end resilient microservice cluster using Docker Compose with internal network isolation, persistent database storage, and automated health checks.

### Requirements
1. Orchestrate 4 interconnected containers:
   - Nginx Reverse Proxy (publicly exposed on 80/443)
   - Application API (internal network only)
   - PostgreSQL Database (with named persistent volume and health check)
   - Redis Cache
2. Isolate internal database traffic using a private bridge network.
3. Implement automated backup scripts for the persistent PostgreSQL volume.
4. Integrate GitHub Actions workflow for automated image scanning with Trivy.

### Deliverables
- `docker-compose.prod.yml`
- `nginx/nginx.conf`
- GitHub Actions workflow `.github/workflows/ci.yml`
- Runbook documentation explaining zero-downtime container upgrade steps.

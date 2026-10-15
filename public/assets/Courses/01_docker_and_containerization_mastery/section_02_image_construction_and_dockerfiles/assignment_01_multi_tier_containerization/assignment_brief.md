# Assignment 1: Multi-Tier Web Application Containerization

### Objective
Containerize a full-stack polyglot application consisting of a React/Next.js frontend and a Go or Node.js REST API backend.

### Technical Requirements
1. **Multi-Stage Builds**:
   - Both services must use multi-stage Dockerfiles.
   - Final frontend image size must be under 150MB.
   - Final backend image size must be under 30MB.
2. **Security**:
   - Run containers under a non-root user (`USER node` or dedicated `appuser`).
   - Include `.dockerignore` files blocking `.git`, `node_modules`, and `.env*`.
3. **Reproducibility**:
   - Provide a verification script that builds and tests both containers locally.

### Deliverables
- `frontend/Dockerfile` & `backend/Dockerfile`
- `.dockerignore` files
- Architecture diagram and image size audit table in `README.md`

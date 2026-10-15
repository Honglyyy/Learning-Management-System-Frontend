# Lesson 1.1: Virtualization vs. Containerization

## 1. Learning Objectives
- Differentiate between Type-1 / Type-2 Hypervisors and container engines.
- Understand Linux kernel namespaces (PID, NET, MNT, IPC, UTS) and cgroups (CPU, Memory limits).
- Explain why containers achieve sub-second startup times and lower memory footprints.

## 2. Core Concepts
Traditional virtual machines virtualize physical hardware. Each VM requires its own full guest operating system, which consumes gigabytes of RAM, disk space, and significant CPU overhead.

Containers, by contrast, share the host operating system's kernel. Docker utilizes:
- **Namespaces**: Provide process isolation (each container sees its own PID tree, network stack, and mount points).
- **Control Groups (cgroups)**: Enforce hardware resource limits (e.g., limit container to 512MB RAM and 1 CPU core).
- **Union File Systems (Overlay2)**: Enable efficient layer sharing and copy-on-write (CoW) disk usage.

## 3. Essential Docker CLI Commands
```bash
# Check Docker daemon status and host configuration
docker version
docker info

# Run an interactive lightweight alpine container
docker run -it --rm alpine sh

# Inspect process isolation inside the container
ps aux
```

## 4. Key Takeaways
- Containers are isolated processes, not mini virtual machines.
- All containers share the host Linux kernel while maintaining isolated user spaces.
- Containers offer near-native bare-metal execution performance.

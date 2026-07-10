# 🐳 HOW TO RUN DOCKER IMAGES - COMPLETE GUIDE

## 🚀 QUICK START (3 Commands)

```bash
cd c:\Users\prath\OneDrive\Desktop\Minor\Job_Portal

docker build --no-cache -t prathaml/job-portal-backend:latest ./backend

docker-compose -f docker-compose.dev.yml up -d

docker images | findstr job-portal

docker build --no-cache -t prathaml/job-portal-frontend:latest ./frontend

docker rmi job_portal-frontend:latest

docker rmi job_portal-backend:latest

docker-compose -f docker-compose.dev.yml up -d

docker-compose -f docker-compose.dev.yml build --no-cache

# Start both containers
docker-compose up -d

# Check if running
docker-compose ps

# Stop containers (when done)
docker-compose down
```

**That's it!** Your app will be running at:
- Frontend: http://localhost:80
- Backend: http://localhost:8000

---

## 📋 DETAILED GUIDE

### **Prerequisites**
- ✅ Docker installed
- ✅ Docker Desktop running
- ✅ `docker-compose.yml` exists
- ✅ `.env` file configured

---

## 🔄 METHOD 1: Using Docker Compose (RECOMMENDED)

### **Why Docker Compose?**
- Runs both containers together
- Manages networking
- Handles dependencies
- Easiest method

### **Step 1: Navigate to Project**
```bash
cd c:\Users\prath\OneDrive\Desktop\Minor\Job_Portal
```

### **Step 2: Start Containers**
```bash
docker-compose up -d
```

**Output:**
```
Creating network "job-portal-network" with driver "bridge"
Creating job-portal_backend_1 ... done
Creating job-portal_frontend_1 ... done
```

### **Step 3: Check Status**
```bash
docker-compose ps
```

**Output:**
```
NAME                COMMAND              STATUS      PORTS
job-portal_backend_1    npm start        Up 2 seconds   0.0.0.0:8000->8000/tcp
job-portal_frontend_1   nginx -g daemon  Up 1 second    0.0.0.0:80->80/tcp
```

✅ **Both containers running!**

### **Step 4: Access Application**
- **Frontend**: http://localhost:80 (or http://localhost)
- **Backend API**: http://localhost:8000
- **API Health Check**: http://localhost:8000/

### **Step 5: View Logs**
```bash
# View all logs
docker-compose logs

# View backend logs
docker-compose logs backend

# View frontend logs
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f
```

### **Step 6: Stop Containers**
```bash
docker-compose down
```

---

## 🐳 METHOD 2: Run Individual Containers

### **If you want to run containers separately:**

#### **Run Backend Container**
```bash
docker run -d \
  --name job-portal-backend \
  -p 8000:8000 \
  --env-file .env \
  prathaml/job-portal-backend:latest
```

#### **Run Frontend Container**
```bash
docker run -d \
  --name job-portal-frontend \
  -p 80:80 \
  --link job-portal-backend:backend \
  prathaml/job-portal-frontend:latest
```

#### **View Running Containers**
```bash
docker ps
```

#### **Stop Individual Containers**
```bash
docker stop job-portal-backend
docker stop job-portal-frontend

docker rm job-portal-backend
docker rm job-portal-frontend
```

---

## 📦 METHOD 3: Build & Run Locally

### **If Docker images don't exist yet:**

#### **Step 1: Build Backend Image**
```bash
cd backend
docker build -t job-portal-backend:latest .
```

#### **Step 2: Build Frontend Image**
```bash
cd ../frontend
docker build -t job-portal-frontend:latest .
```

#### **Step 3: Run Docker Compose**
```bash
cd ..
docker-compose up -d
```

---

## 🔍 TROUBLESHOOTING

### **Issue: Containers not starting**
```bash
# Check Docker status
docker --version

# Check Docker daemon
docker ps

# View error logs
docker-compose logs
docker-compose logs backend
```

### **Issue: Port already in use**
```bash
# Check what's using port 8000
netstat -ano | findstr :8000

# Kill process using port (Windows)
taskkill /PID <PID> /F

# Or use different port in docker-compose.yml
# Change: "8000:8000" to "8001:8000"
```

### **Issue: Connection refused**
```bash
# Verify containers are running
docker-compose ps

# Check container logs
docker-compose logs backend

# Verify backend is accessible
curl http://localhost:8000/
```

### **Issue: Frontend shows blank page**
```bash
# Check frontend logs
docker-compose logs frontend

# Verify API URL in frontend
# Should point to backend:8000
```

---

## 📝 DOCKER COMPOSE FILE EXPLAINED

```yaml
services:
  backend:
    image: prathaml/job-portal-backend:latest      # Docker image name
    env_file:
      - .env                                         # Environment variables
    ports:
      - "8000:8000"                                 # Host:Container port
    restart: unless-stopped                         # Restart policy
    networks:
      - job-portal-network                          # Network name

  frontend:
    image: prathaml/job-portal-frontend:latest     # Docker image name
    ports:
      - "80:80"                                     # Host:Container port
    depends_on:
      - backend                                     # Wait for backend first
    restart: unless-stopped                         # Restart policy
    networks:
      - job-portal-network                          # Network name

networks:
  job-portal-network:
    driver: bridge                                  # Network type
```

---

## 🔑 USEFUL COMMANDS

### **Container Management**
```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# View container logs
docker logs <container-id>

# Follow logs in real-time
docker logs -f <container-id>

# Enter container shell
docker exec -it <container-id> /bin/bash

# Stop container
docker stop <container-id>

# Remove container
docker rm <container-id>

# Restart container
docker restart <container-id>
```

### **Image Management**
```bash
# List all images
docker images

# Remove image
docker rmi <image-name>

# Pull image from Docker Hub
docker pull <image-name>

# Tag image
docker tag <old-name> <new-name>

# Push image to Docker Hub
docker push <image-name>
```

### **Docker Compose**
```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Rebuild images
docker-compose build

# View logs
docker-compose logs -f

# Execute command in container
docker-compose exec backend npm test
```

---

## 🔗 NETWORK COMMUNICATION

### **Inside Docker Network**
Containers can communicate using service names:

```
Backend Container   → http://backend:8000
Frontend Container  → http://frontend:80
```

### **From Host Machine**
Access using localhost:

```
Backend  → http://localhost:8000
Frontend → http://localhost (or :80)
```

---

## 📊 PORT MAPPING

```
Host Machine         Docker Container
localhost:8000   →   backend:8000
localhost:80     →   frontend:80
```

**To change ports** in `docker-compose.yml`:
```yaml
services:
  backend:
    ports:
      - "9000:8000"      # Now accessible at localhost:9000

  frontend:
    ports:
      - "3000:80"        # Now accessible at localhost:3000
```

---

## 🌍 ENVIRONMENT VARIABLES

### **Backend Environment**
In `backend/.env`:
```
PORT=8000
MONGO_URI=mongodb://...
JWT_SECRET=your-secret
FRONTEND_URL=http://localhost
NODE_ENV=production
```

### **Frontend Environment**
In `frontend/.env`:
```
VITE_API_URL=http://localhost:8000
```

---

## 📈 SCALING

### **Run Multiple Instances**
```bash
# Scale backend to 2 instances
docker-compose up -d --scale backend=2

# Scale frontend to 3 instances
docker-compose up -d --scale frontend=3
```

---

## 🔐 SECURITY TIPS

### **Running Production**
```bash
# Don't expose ports unnecessarily
# Use environment variables for secrets
# Don't run as root

# Check security
docker inspect <container-id>
```

---

## 📱 ACCESSING FROM OTHER MACHINES

### **Get Your Machine IP**
```bash
ipconfig
# Look for IPv4 Address: 192.168.x.x
```

### **Access From Another Machine**
```
Frontend: http://192.168.x.x:80
Backend:  http://192.168.x.x:8000
```

---

## 🧹 CLEANUP

### **Remove Everything**
```bash
# Stop all containers
docker-compose down

# Remove all images
docker rmi $(docker images -q)

# Remove all volumes
docker volume prune

# Remove all networks
docker network prune

# Full cleanup (careful!)
docker system prune -a
```

---

## 📋 QUICK REFERENCE COMMANDS

| Task | Command |
|------|---------|
| Start | `docker-compose up -d` |
| Stop | `docker-compose down` |
| Status | `docker-compose ps` |
| Logs | `docker-compose logs -f` |
| Rebuild | `docker-compose build` |
| Shell | `docker-compose exec backend bash` |
| Restart | `docker-compose restart` |
| Clean | `docker-compose down -v` |

---

## 🎯 WORKFLOW EXAMPLE

### **Development Workflow**
```bash
# 1. Start containers
docker-compose up -d

# 2. Make code changes locally

# 3. View logs to check for errors
docker-compose logs -f

# 4. Restart if needed
docker-compose restart backend

# 5. Test changes at http://localhost

# 6. Stop when done
docker-compose down
```

### **Production Deployment**
```bash
# 1. On production server
docker pull prathaml/job-portal-backend:latest
docker pull prathaml/job-portal-frontend:latest

# 2. Start containers
docker-compose up -d

# 3. Verify running
docker-compose ps

# 4. Check logs
docker-compose logs

# 5. Monitor
docker-compose logs -f
```

---

## 🚀 COMMON SCENARIOS

### **Scenario 1: Local Development**
```bash
cd project-folder
docker-compose up -d
# Make changes
# Changes auto-reflect if volumes are mounted
# Stop: docker-compose down
```

### **Scenario 2: Testing Build**
```bash
# Build fresh images
docker-compose build

# Run with new images
docker-compose up -d

# Test at localhost
# Stop: docker-compose down
```

### **Scenario 3: Production Deployment**
```bash
# Pull latest images
docker pull prathaml/job-portal-backend:latest
docker pull prathaml/job-portal-frontend:latest

# Start containers
docker-compose up -d

# Verify
curl http://localhost:8000/
curl http://localhost/

# Monitor
docker-compose logs -f
```

### **Scenario 4: Update & Redeploy**
```bash
# Stop old containers
docker-compose down

# Pull new images
docker pull prathaml/job-portal-backend:latest
docker pull prathaml/job-portal-frontend:latest

# Start with new images
docker-compose up -d

# Verify
docker-compose ps
```

---

## 📞 QUICK HELP

### **Get Help**
```bash
# Docker help
docker --help

# Docker-compose help
docker-compose --help

# Help for specific command
docker-compose up --help
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] Docker installed (`docker --version`)
- [ ] Docker Desktop running
- [ ] `docker-compose.yml` exists
- [ ] `.env` file configured
- [ ] `Dockerfile` in backend folder
- [ ] `Dockerfile` in frontend folder
- [ ] Ports 8000 and 80 available
- [ ] Run `docker-compose up -d`
- [ ] Check `docker-compose ps`
- [ ] Access http://localhost
- [ ] Check backend at http://localhost:8000/

---

## 🎊 YOU'RE READY!

**To run your Docker containers right now:**

```bash
cd c:\Users\prath\OneDrive\Desktop\Minor\Job_Portal
docker-compose up -d
```

**Your application will be running at:**
- Frontend: http://localhost
- Backend: http://localhost:8000

**To stop:**
```bash
docker-compose down
```

---

## 🔗 USEFUL LINKS

- Docker Docs: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- Docker Hub: https://hub.docker.com/

---

**Status**: ✅ Ready to Run  
**Next**: Execute `docker-compose up -d` anytime!


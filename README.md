# Domain & Server Management Panel  

A web application built with **Django Ninja** (backend) and **HTML, CSS, JavaScript** (frontend) to provide a simple yet powerful management panel for company-owned domains, servers, and hosting services.  

The goal of this project is to centralize the monitoring of all purchased domains and servers in one place, ensuring that nothing expires unnoticed and uptime is continuously monitored.  

---

## ✨ Features  

- **Domain Management**  
  - Add and manage all purchased domains from a single dashboard.  
  - Automatic expiration checks with daily cron jobs.  
  - Notifications/alerts when a domain is close to expiration.  

- **Server & Hosting Management**  
  - Track server and hosting expiration dates just like domains.  
  - Receive alerts before expiration to avoid downtime.  

- **Website Monitoring**  
  - Add website URLs to check their availability.  
  - Get notified if a site goes down.  

- **Authentication**  
  - Simple user authentication for secure access.  

- **Automation**  
  - A scheduled cron job runs daily to check all domains, servers, and hosting records.  
  - Alerts are triggered when an expiration date is approaching or a service is unreachable.  

- **Docker Support**  
  - Fully containerized setup using Docker & Docker Compose.  
  - Quick start with a single command:  
    ```bash
    docker compose up
    ```

---

## 🛠️ Tech Stack  

- **Backend:** Django Ninja (FastAPI-like Django REST framework)  
- **Frontend:** HTML, CSS, JavaScript (vanilla)  
- **Database:** SQLite (default, easily replaceable)  
- **Containerization:** Docker & Docker Compose  
- **Scheduler:** Cron job for automated checks  

---

## 🚀 Getting Started  

### Prerequisites  
- Docker  
- Docker Compose  

### Installation  
Clone the repository:  
```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```
Build and start the application:
```docker
docker compose up
```

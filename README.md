# 🌐 Infrastructure & Domain Management Suite (IDMS)



<p align="center">
  <img src="https://github.com/user-attachments/assets/c5cd7039-7411-4515-807a-2d99bced8e21" width="300" height="300"/>
</p>


An enterprise-grade, open-source centralized panel to monitor, track, and manage digital assets including domains, servers, SSL certificates, and financial records. Built for teams that need to ensure zero downtime and prevent accidental expiration of critical services.

## 🔥 Key Features

### Infrastructure Tracking

* Domain Management: Centralized dashboard for all domains with automatic WHOIS-based or manual expiry tracking.
* Server & Hosting: Keep track of VPS, Dedicated, and Cloud instances across different providers.
* Uptime Monitoring: Real-time website availability checks with instant notifications.

<p align="center">
  <img width="2866" height="1487" style="border-radius: 20px;" alt="Screenshot 2026-02-22 092530" src="https://github.com/user-attachments/assets/a8f35daa-5d99-443b-be81-ac3496e68845" />
</p>

### Security & Compliance

* SSL/TLS Monitoring: Dedicated section for security certificates to prevent "Expired Certificate" browser warnings.
* RBAC (Role-Based Access Control): Granular user management (Admin, Manager, Viewer) to control who can see or edit sensitive data.

### Financial & Document Management

* Billing Tracker: Log every purchase and renewal.
* Invoice Archiving: Upload and associate PDF invoices/receipts with specific domains or servers for easy accounting.

### Automation & Alerts

* Automated Cron Jobs: Daily background tasks to verify status and dates.
* Smart Notifications: Early-warning emails before any service expires (7, 30, and 60-day intervals).

<p align="center">
  <img width="2873" height="1468" style="border-radius: 20px;" alt="Screenshot 2026-02-22 092835" src="https://github.com/user-attachments/assets/2aad8881-21cf-4814-897f-07ba38036d36" />
</p>

## 🛠 Tech Stack

* Backend: [Django Ninja](https://django-ninja.rest-framework.com/) (Fast, Async-ready, Type-safe API)
* Frontend: [React.js](https://www.google.com/search?q=https://react.js) (Modern, Component-based UI)
* Database: SQLite
* Containerization: Docker & Docker Compose
* Task Scheduling: Django Management Commands + System Cron


## 🚀 Installation & Setup

### Prerequisites

* Docker & Docker Compose

### Quick Start

1. Clone the repository:
```bash
git clone https://github.com/MojtabaZarreh/IDMS
cd IDMS
```
2. Run with Docker:
```bash
docker compose up --build
```
3. Access the Application:
* Frontend: http://localhost/
* API Documentation (Swagger): http://localhost:8000/api/docs


## 🔒 Security Note

This application handles sensitive data (passwords, server IPs, and invoices). It is highly recommended to:

* Use HTTPS in production.
* Keep the SECRET_KEY secure.
* Enable Database encryption for the Password Vault module.


## 🤝 Contributing
  
Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

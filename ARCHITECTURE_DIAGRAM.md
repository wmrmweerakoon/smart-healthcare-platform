# Architecture Diagram for SE-128 Smart Healthcare Platform

Please copy the code block below and paste it into the [Mermaid Live Editor](https://mermaid.live).
From there, you can easily tweak colors and click **"Save as PNG"** or **"Save as SVG"** to include in your PDF report!

```mermaid
graph TD
    %% Define Styles
    classDef client fill:#e1f5fe,stroke:#0288d1,stroke-width:2px,color:#01579b;
    classDef gateway fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#e65100;
    classDef service fill:#e8f5e9,stroke:#388e3c,stroke-width:2px,color:#1b5e20;
    classDef db fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#4a148c;
    classDef thirdparty fill:#ffebee,stroke:#d32f2f,stroke-width:2px,color:#b71c1c;

    %% Client Layer
    subgraph "Presentation Layer"
        WebClient["🩺 React Web Client\n(Patient/Doctor/Admin)"]:::client
    end

    %% API Gateway Layer
    subgraph "API Gateway Layer"
        Gateway["🚦 Express API Gateway\n(:5000)\n(Auth Routing & Role Verification)"]:::gateway
    end

    %% Microservices Layer
    subgraph "Microservices Layer"
        Auth["Auth Service :5001"]:::service
        Patient["Patient Service :5002"]:::service
        Doctor["Doctor Service :5003"]:::service
        Appt["Appointment Service :5004"]:::service
        Pay["Payment Service :5005"]:::service
        Notif["Notification Service :5006"]:::service
        AI["AI Service :5007"]:::service
        Admin["Admin Service :5008"]:::service
        Tele["Telemedicine Service :5009"]:::service
    end

    %% Database Layer
    subgraph "Data Layer"
        DB_Auth[("Auth Data")]:::db
        DB_Patient[("Patient Data")]:::db
        DB_Doctor[("Doctor Data")]:::db
        DB_Appt[("Appt Data")]:::db
        DB_Pay[("Payment Data")]:::db
        DB_Notif[("Notif Data")]:::db
    end

    %% External API Layer
    subgraph "External Integrations"
        Stripe["Stripe API\n(Payments)"]:::thirdparty
        Gemini["Google Gemini\n(AI Check)"]:::thirdparty
        Twilio["Twilio/Email\n(Alerts)"]:::thirdparty
        Jitsi["Jitsi Meet\n(Video)"]:::thirdparty
    end

    %% Connections
    WebClient -->|HTTP/REST| Gateway
    
    Gateway --> Auth
    Gateway --> Patient
    Gateway --> Doctor
    Gateway --> Appt
    Gateway --> Pay
    Gateway --> Notif
    Gateway --> AI
    Gateway --> Admin
    Gateway --> Tele

    %% Database Connections
    Auth -.-> DB_Auth
    Patient -.-> DB_Patient
    Doctor -.-> DB_Doctor
    Appt -.-> DB_Appt
    Pay -.-> DB_Pay
    Notif -.-> DB_Notif
    Admin -.-> DB_Auth

    %% External Connections
    Pay --> Stripe
    AI --> Gemini
    Notif --> Twilio
    Tele --> Jitsi
```

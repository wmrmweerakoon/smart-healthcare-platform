# PowerShell Script to Setup environment variables for all services
$services = @(
    "admin-service", "ai-service", "api-gateway", "appointment-service",
    "auth-service", "doctor-service", "notification-service", "patient-service",
    "payment-service", "telemedicine-service"
)

$jwtSecret = "healthcare_jwt_secret_key_2024"
$mongoBase = "mongodb://localhost:27017"

foreach ($service in $services) {
    $path = "services/$service/.env"
    $port = 5000 # Default fallback
    
    # Assign specific ports based on our architecture
    switch ($service) {
        "api-gateway" { $port = 5000 }
        "auth-service" { $port = 5001 }
        "patient-service" { $port = 5002 }
        "doctor-service" { $port = 5003 }
        "appointment-service" { $port = 5004 }
        "payment-service" { $port = 5005 }
        "notification-service" { $port = 5006 }
        "ai-service" { $port = 5007 }
        "admin-service" { $port = 5008 }
        "telemedicine-service" { $port = 5009 }
    }

    $content = "PORT=$port`n"
    
    # Add JWT Secret to all
    $content += "JWT_SECRET=$jwtSecret`n"

    # Add Mongo URI to data-bearing services
    if ($service -ne "api-gateway") {
        $content += "MONGO_URI=$mongoBase/healthcare-$($service.Replace('-service',''))`n"
    }

    # Special URLs for Gateway and Admin
    if ($service -eq "api-gateway") {
        $content += "AUTH_SERVICE_URL=http://localhost:5001`n"
        $content += "PATIENT_SERVICE_URL=http://localhost:5002`n"
        $content += "DOCTOR_SERVICE_URL=http://localhost:5003`n"
        $content += "APPOINTMENT_SERVICE_URL=http://localhost:5004`n"
        $content += "PAYMENT_SERVICE_URL=http://localhost:5005`n"
        $content += "NOTIFICATION_SERVICE_URL=http://localhost:5006`n"
        $content += "AI_SERVICE_URL=http://localhost:5007`n"
        $content += "ADMIN_SERVICE_URL=http://localhost:5008`n"
        $content += "VIDEO_SERVICE_URL=http://localhost:5009`n"
    }

    if ($service -eq "admin-service") {
        $content += "AUTH_SERVICE_URL=http://localhost:5001`n"
        $content += "APPOINTMENT_SERVICE_URL=http://localhost:5004`n"
        $content += "PAYMENT_SERVICE_URL=http://localhost:5005`n"
    }

    if ($service -eq "telemedicine-service") {
        $content += "JITSI_DOMAIN=meet.jit.si`n"
        $content += "NOTIFICATION_SERVICE_URL=http://localhost:5006`n"
    }

    if ($service -eq "notification-service") {
        $content += "AUTH_SERVICE_URL=http://localhost:5001`n"
        $content += "TWILIO_ACCOUNT_SID=`n"
        $content += "TWILIO_AUTH_TOKEN=`n"
        $content += "TWILIO_PHONE_NUMBER=`n"
        $content += "SMTP_HOST=smtp.ethereal.email`n"
        $content += "SMTP_PORT=587`n"
        $content += "SMTP_USER=`n"
        $content += "SMTP_PASS=`n"
    }

    if ($service -eq "ai-service") {
        $content += "GOOGLE_AI_KEY=AIzaSyBHu6Wx3W077B6R6TeHAR_cUI3pVyPUfOo`n"
    }

    # Write the file
    Set-Content -Path $path -Value $content
    Write-Host "✅ Generated .env for $service" -ForegroundColor Green
}

Write-Host "`nAll setup! Your friend can now run each service locally." -ForegroundColor Cyan

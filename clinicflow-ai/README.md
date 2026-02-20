# clinicflow-ai

Spring Boot project created with Gradle.

## Requirements
- Java 17
- Spring Web
- Spring Data JPA
- Validation
- Lombok
- H2 (development)

## Run
```bash
./gradlew bootRun
```

Windows:
```powershell
.\gradlew.bat bootRun
```

## Endpoint
- GET `/health`
- Response: `{"status":"ok"}`

## H2 Console
- URL: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:clinicflowdb`
- User: `sa`
- Password: (empty)
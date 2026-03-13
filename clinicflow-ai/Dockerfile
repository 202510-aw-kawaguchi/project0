FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /app

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

RUN chmod +x ./mvnw ./.mvn/apache-maven/bin/mvn ./.mvn/apache-maven/bin/mvnDebug ./.mvn/apache-maven/bin/mvnyjp

COPY src/ src/

RUN ./mvnw -DskipTests package

FROM eclipse-temurin:17-jre-jammy AS runtime
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 10000

ENTRYPOINT ["java", "-Dserver.port=10000", "-jar", "/app/app.jar"]

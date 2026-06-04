# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom.xml and download dependencies first (cached layer)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build package
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Runtime image
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy the built jar from stage 1
COPY --from=build /app/target/*.jar app.jar

# Expose server port (Render/Koyeb sets PORT automatically)
EXPOSE 8082

# JVM flags optimized for free tiers (512MB RAM limits):
# -XX:+UseSerialGC: minimizes GC memory overhead
# -Xss256k: reduces stack memory footprint per thread
# -Xms128m -Xmx256m: constrains the JVM heap memory
ENTRYPOINT ["java", "-XX:+UseSerialGC", "-Xss256k", "-Xms128m", "-Xmx256m", "-jar", "app.jar"]

package lk.ac.pdn.sms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
@EnableAsync
public class SmsUopApplication {

    public static void main(String[] args) {
        try {
            // Debug: Print working directory
            System.out.println("Working directory: " + System.getProperty("user.dir"));

            // Load environment variables from the .env file
            Dotenv dotenv = Dotenv.configure()
                    .ignoreIfMissing()
                    .load();

            System.out.println(".env file loaded check.");

            // Get environment variables with fallback to system environment
            String dbUrl = getEnvValue(dotenv, "DB_URL");
            String dbUsername = getEnvValue(dotenv, "DB_USERNAME");
            String dbPassword = getEnvValue(dotenv, "DB_PASSWORD");

            // Validate required environment variables
            validateRequiredEnvVars(dbUrl, dbUsername, dbPassword);

            // Set system properties for Spring Boot
            System.setProperty("spring.datasource.url", dbUrl);
            System.setProperty("spring.datasource.username", dbUsername);
            System.setProperty("spring.datasource.password", dbPassword);

            System.out.println("Database configuration set. Starting application...");

            SpringApplication.run(SmsUopApplication.class, args);

        } catch (Exception e) {
            System.err.println("Failed to start application: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }

    private static String getEnvValue(Dotenv dotenv, String key) {
        String value = dotenv.get(key);
        if (value == null) {
            value = System.getenv(key);
        }
        return value;
    }

    private static void validateRequiredEnvVars(String dbUrl, String dbUsername, String dbPassword) {
        StringBuilder missingVars = new StringBuilder();

        if (dbUrl == null || dbUrl.trim().isEmpty()) missingVars.append("DB_URL ");
        if (dbUsername == null || dbUsername.trim().isEmpty()) missingVars.append("DB_USERNAME ");
        if (dbPassword == null || dbPassword.trim().isEmpty()) missingVars.append("DB_PASSWORD ");

        if (missingVars.length() > 0) {
            throw new IllegalStateException(
                    "Missing required environment variables: " + missingVars.toString().trim() +
                            "\nPlease check your .env file."
            );
        }
    }
}
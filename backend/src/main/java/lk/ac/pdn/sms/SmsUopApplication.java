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
            // Load .env file
            Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

            String dbUrl = getEnvValue(dotenv, "DB_URL");
            String dbUsername = getEnvValue(dotenv, "DB_USERNAME");
            String dbPassword = getEnvValue(dotenv, "DB_PASSWORD");

            // Only set properties if values exist to avoid NullPointerException
            if (dbUrl != null) System.setProperty("spring.datasource.url", dbUrl);
            if (dbUsername != null) System.setProperty("spring.datasource.username", dbUsername);
            if (dbPassword != null) System.setProperty("spring.datasource.password", dbPassword);

            SpringApplication.run(SmsUopApplication.class, args);

        } catch (Exception e) {
            System.err.println("Failed to start application: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static String getEnvValue(Dotenv dotenv, String key) {
        String value = dotenv.get(key);
        if (value == null || value.trim().isEmpty()) {
            value = System.getenv(key);
        }
        return value;
    }
}
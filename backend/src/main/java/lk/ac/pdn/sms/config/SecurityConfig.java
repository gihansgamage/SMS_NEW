package lk.ac.pdn.sms.config;

import lk.ac.pdn.sms.service.CustomOAuth2UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public SecurityConfig(CustomOAuth2UserService customOAuth2UserService) {
        this.customOAuth2UserService = customOAuth2UserService;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authz -> authz
                        // Public Endpoints
                        .requestMatchers(HttpMethod.GET, "/api/societies/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/societies/register").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/societies/renewal").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/events/request").permitAll()
                        .requestMatchers("/api/validation/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/oauth2/**").permitAll()

                        // Static Resources
                        .requestMatchers("/error", "/favicon.ico").permitAll()

                        // Role Based Access
                        .requestMatchers("/api/admin/vc/**").hasRole("VICE_CHANCELLOR")
                        .requestMatchers("/api/admin/ar/**").hasRole("ASSISTANT_REGISTRAR")
                        .requestMatchers("/api/admin/dean/**").hasRole("DEAN")
                        .requestMatchers("/api/admin/po/**").hasRole("PREMISES_OFFICER")
                        .requestMatchers("/api/admin/ss/**").hasRole("STUDENT_SERVICE")
                        .requestMatchers("/api/admin/**").hasAnyRole("VICE_CHANCELLOR", "ASSISTANT_REGISTRAR", "DEAN", "STUDENT_SERVICE", "PREMISES_OFFICER")

                        .anyRequest().authenticated()
                )
                // OAUTH2 LOGIN ONLY
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService)
                        )
                        .successHandler(oauth2AuthenticationSuccessHandler())
                        .failureHandler((request, response, exception) -> {
                            response.sendRedirect(frontendUrl + "/admin/login?error=auth_failed");
                        })
                )
                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .logoutSuccessHandler((request, response, authentication) -> {
                            response.sendRedirect(frontendUrl + "/");
                        })
                        .permitAll()
                );

        return http.build();
    }

    @Bean
    public AuthenticationSuccessHandler oauth2AuthenticationSuccessHandler() {
        return (request, response, authentication) -> {
            String targetUrl = frontendUrl.endsWith("/") ? frontendUrl + "admin" : frontendUrl + "/admin";
            response.sendRedirect(targetUrl);
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList(frontendUrl, "http://localhost:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
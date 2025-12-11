package lk.ac.pdn.sms.service;

import lk.ac.pdn.sms.entity.AdminUser;
import lk.ac.pdn.sms.repository.AdminUserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final AdminUserRepository adminUserRepository;

    public CustomOAuth2UserService(AdminUserRepository adminUserRepository) {
        this.adminUserRepository = adminUserRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = new DefaultOAuth2UserService().loadUser(userRequest);
        String email = oAuth2User.getAttribute("email");

        System.out.println("🚀 LOGIN ATTEMPT: " + email);

        // Strictly check the database
        AdminUser adminUser = adminUserRepository.findByEmail(email).orElse(null);

        if (adminUser == null) {
            System.out.println("❌ FAILURE: User " + email + " not found in admin_users table.");
            throw new OAuth2AuthenticationException("Unauthorized: Email not registered in system.");
        }

        if (!Boolean.TRUE.equals(adminUser.getIsActive())) {
            throw new OAuth2AuthenticationException("Unauthorized: User account is inactive.");
        }

        System.out.println("✅ SUCCESS: User " + email + " logged in as " + adminUser.getRole());

        String roleName = adminUser.getRole().name();
        return createOAuth2User(oAuth2User, roleName, adminUser.getId(), adminUser.getName(), adminUser.getFaculty());
    }

    private OAuth2User createOAuth2User(OAuth2User oAuth2User, String role, Long id, String name, String faculty) {
        List<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + role)
        );
        Map<String, Object> attributes = oAuth2User.getAttributes().entrySet().stream()
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        attributes.put("id", id);
        attributes.put("role", role);
        attributes.put("name", name);
        attributes.put("faculty", faculty);

        return new DefaultOAuth2User(authorities, attributes, "email");
    }
}
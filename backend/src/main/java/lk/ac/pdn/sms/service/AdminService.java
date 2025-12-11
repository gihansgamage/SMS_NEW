package lk.ac.pdn.sms.service;

import lk.ac.pdn.sms.dto.AdminUserManagementDto;
import lk.ac.pdn.sms.entity.*;
import lk.ac.pdn.sms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private SocietyRepository societyRepository;

    @Autowired
    private SocietyRegistrationRepository registrationRepository;

    @Autowired
    private SocietyRenewalRepository renewalRepository;

    @Autowired
    private EventPermissionRepository eventPermissionRepository;

    @Autowired
    private ActivityLogService activityLogService;

    @Autowired
    private EmailService emailService;

    // --- Helper for Controller ---
    public AdminUser getAdminFromAuth(Authentication authentication) {
        if (authentication == null) return null;
        String email;
        if (authentication.getPrincipal() instanceof OAuth2User) {
            email = ((OAuth2User) authentication.getPrincipal()).getAttribute("email");
        } else {
            email = authentication.getName();
        }
        return adminUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Admin not found with email: " + email));
    }

    public Map<String, Object> getDashboardStats(AdminUser admin) {
        Map<String, Object> dashboardData = new HashMap<>();

        dashboardData.put("totalSocieties", societyRepository.count());
        dashboardData.put("activeSocieties", societyRepository.countByStatus(Society.SocietyStatus.ACTIVE));
        dashboardData.put("currentYearRegistrations", registrationRepository.countByYear(LocalDate.now().getYear()));
        dashboardData.put("currentYearRenewals", renewalRepository.countByYear(LocalDate.now().getYear()));

        int pendingCount = 0;

        if (admin.getRole() != null) {
            switch (admin.getRole()) {
                case DEAN:
                    String faculty = admin.getFaculty() != null ? admin.getFaculty() : "";
                    pendingCount += registrationRepository.findByStatusAndApplicantFaculty(
                            SocietyRegistration.ApprovalStage.PENDING_DEAN, faculty).size();
                    pendingCount += renewalRepository.findByStatusAndApplicantFaculty(
                            SocietyRenewal.RenewalStatus.PENDING_DEAN, faculty).size();
                    pendingCount += eventPermissionRepository.findByStatusAndApplicantFaculty(
                            EventPermission.EventStatus.PENDING_DEAN, faculty).size();
                    break;
                case ASSISTANT_REGISTRAR:
                    pendingCount += registrationRepository.countByStatus(SocietyRegistration.ApprovalStage.PENDING_AR);
                    pendingCount += renewalRepository.countByStatus(SocietyRenewal.RenewalStatus.PENDING_AR);
                    pendingCount += eventPermissionRepository.countByStatus(EventPermission.EventStatus.PENDING_AR);
                    break;
                case VICE_CHANCELLOR:
                    pendingCount += registrationRepository.countByStatus(SocietyRegistration.ApprovalStage.PENDING_VC);
                    pendingCount += renewalRepository.countByStatus(SocietyRenewal.RenewalStatus.PENDING_VC);
                    pendingCount += eventPermissionRepository.countByStatus(EventPermission.EventStatus.PENDING_VC);
                    break;
                case PREMISES_OFFICER:
                    pendingCount += eventPermissionRepository.countByStatus(EventPermission.EventStatus.PENDING_PREMISES);
                    break;
                case STUDENT_SERVICE:
                    pendingCount = 0;
                    break;
            }
        }

        dashboardData.put("pendingApprovals", pendingCount);
        dashboardData.put("upcomingEvents", eventPermissionRepository.findUpcomingApprovedEvents());
        dashboardData.put("adminInfo", admin);

        return dashboardData;
    }

    public AdminUser createAdminUser(AdminUserManagementDto dto) {
        if (adminUserRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Admin with this email already exists");
        }
        AdminUser admin = new AdminUser();
        admin.setName(dto.getName());
        admin.setEmail(dto.getEmail());
        admin.setRole(dto.getRole());
        admin.setFaculty(dto.getFaculty());
        admin.setIsActive(true);
        return adminUserRepository.save(admin);
    }

    public List<AdminUser> getAllAdminUsers() {
        return adminUserRepository.findAll();
    }

    public AdminUser toggleUserActive(Long id) {
        AdminUser admin = adminUserRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        admin.setIsActive(!admin.getIsActive());
        return adminUserRepository.save(admin);
    }

    public Page<ActivityLog> getActivityLogs(String userFilter, String actionFilter, Pageable pageable) {
        return activityLogService.getActivityLogs(userFilter, actionFilter, pageable);
    }

    public Page<Object> getAdminSocieties(Integer year, String status, Pageable pageable) {
        return societyRepository.findAll(pageable).map(society -> {
            Map<String, Object> societyData = new HashMap<>();
            societyData.put("society", society);
            return societyData;
        });
    }

    public void sendBulkEmail(String subject, String body, List<String> recipients, String senderName) {
        activityLogService.logActivity("Bulk Email Sent", "To " + recipients.size() + " recipients", senderName);
        System.out.println("DEBUG: Sending Bulk Email [" + subject + "] from " + senderName);
        // Implementation for actual email sending loop using emailService would go here
    }
}
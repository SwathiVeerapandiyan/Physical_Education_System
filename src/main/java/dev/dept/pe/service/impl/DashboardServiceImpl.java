package dev.dept.pe.service.impl;

import dev.dept.pe.dto.DashboardStatsDto;
import dev.dept.pe.repository.UserFormRepository;
import dev.dept.pe.repository.UserRepository;
import dev.dept.pe.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final UserFormRepository userFormRepository;

    @Autowired
    public DashboardServiceImpl(UserRepository userRepository,
                                 UserFormRepository userFormRepository) {
        this.userRepository = userRepository;
        this.userFormRepository = userFormRepository;
    }

    @Override
    public DashboardStatsDto getDashboardStats() {
        long totalUsers      = userRepository.count();
        long totalCandidates = userFormRepository.count();
        long totalMale       = userFormRepository.countByGenderIgnoreCase("male");
        long totalFemale     = userFormRepository.countByGenderIgnoreCase("female");

        return new DashboardStatsDto(totalUsers, totalCandidates, totalMale, totalFemale);
    }
}

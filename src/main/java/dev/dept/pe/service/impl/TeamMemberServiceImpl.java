package dev.dept.pe.service.impl;

import dev.dept.pe.dto.TeamMemberDto;
import dev.dept.pe.exception.ResourceNotFoundException;
import dev.dept.pe.model.TeamMember;
import dev.dept.pe.model.UserForm;
import dev.dept.pe.repository.TeamMemberRepository;
import dev.dept.pe.repository.TeamRepository;
import dev.dept.pe.repository.UserFormRepository;
import dev.dept.pe.service.TeamMemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TeamMemberServiceImpl implements TeamMemberService {

    private final TeamMemberRepository teamMemberRepository;
    private final TeamRepository teamRepository;
    private final UserFormRepository userFormRepository;

    @Autowired
    public TeamMemberServiceImpl(TeamMemberRepository teamMemberRepository,
                                 TeamRepository teamRepository,
                                 UserFormRepository userFormRepository) {
        this.teamMemberRepository = teamMemberRepository;
        this.teamRepository = teamRepository;
        this.userFormRepository = userFormRepository;
    }

    @Override
    public TeamMemberDto create(TeamMemberDto dto) {
        if (dto.getTeamId() == null || !teamRepository.existsById(dto.getTeamId())) {
            throw new ResourceNotFoundException("Team not found with ID: " + dto.getTeamId());
        }

        if (dto.getStudentId() == null) {
            var users = userFormRepository.findAll();
            if (!users.isEmpty() && (dto.getStudentName() == null || dto.getStudentName().trim().isEmpty())) {
                dto.setStudentId(users.get(0).getId());
                dto.setStudentName(users.get(0).getName());
            } else {
                UserForm created = createDefaultStudent(dto.getStudentName());
                dto.setStudentId(created.getId());
                dto.setStudentName(created.getName());
            }
        } else {
            var userOpt = userFormRepository.findById(dto.getStudentId());
            if (userOpt.isEmpty()) {
                UserForm created = createDefaultStudent(dto.getStudentName());
                dto.setStudentId(created.getId());
                dto.setStudentName(created.getName());
            } else {
                if (dto.getStudentName() == null || dto.getStudentName().trim().isEmpty()) {
                    dto.setStudentName(userOpt.get().getName());
                }
            }
        }

        if (teamMemberRepository.findByTeamIdAndStudentId(dto.getTeamId(), dto.getStudentId()).isPresent()) {
            throw new IllegalArgumentException("Student is already a member of this team.");
        }

        TeamMember entity = mapToEntity(dto);
        if (entity.getJoinedDate() == null) {
            entity.setJoinedDate(LocalDate.now());
        }
        TeamMember saved = teamMemberRepository.save(entity);
        return mapToDto(saved);
    }

    private UserForm createDefaultStudent(String name) {
        UserForm user = new UserForm();
        String safeName = (name != null && !name.trim().isEmpty()) ? name.trim() : "Player " + (System.currentTimeMillis() % 1000);
        user.setName(safeName);
        long rand = System.currentTimeMillis();
        user.setEmail("player_" + rand + "@pe.edu");
        user.setPassword("player123");
        user.setBatch("2026");
        user.setGender("General");
        user.setDob(LocalDate.of(2002, 1, 1));
        user.setMobileNo(1000000000L + (rand % 8000000000L));
        return userFormRepository.save(user);
    }

    @Override
    public TeamMemberDto getById(Long id) {
        TeamMember entity = teamMemberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team member not found with ID: " + id));
        return mapToDto(entity);
    }

    @Override
    public List<TeamMemberDto> getByTeamId(Long teamId) {
        return teamMemberRepository.findByTeamId(teamId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<TeamMemberDto> getByStudentId(Long studentId) {
        return teamMemberRepository.findByStudentId(studentId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(Long id) {
        if (!teamMemberRepository.existsById(id)) {
            throw new ResourceNotFoundException("Team member not found with ID: " + id);
        }
        teamMemberRepository.deleteById(id);
    }

    private TeamMemberDto mapToDto(TeamMember entity) {
        TeamMemberDto dto = new TeamMemberDto();
        dto.setTeamMemberId(entity.getTeamMemberId());
        dto.setTeamId(entity.getTeamId());
        dto.setStudentId(entity.getStudentId());
        dto.setRole(entity.getRole());
        dto.setStudentName(entity.getStudentName());
        if ((dto.getStudentName() == null || dto.getStudentName().isEmpty()) && entity.getStudentId() != null) {
            userFormRepository.findById(entity.getStudentId()).ifPresent(u -> dto.setStudentName(u.getName()));
        }
        dto.setJoinedDate(entity.getJoinedDate());
        return dto;
    }

    private TeamMember mapToEntity(TeamMemberDto dto) {
        TeamMember entity = new TeamMember();
        entity.setTeamMemberId(dto.getTeamMemberId());
        entity.setTeamId(dto.getTeamId());
        entity.setStudentId(dto.getStudentId());
        entity.setRole(dto.getRole());
        entity.setStudentName(dto.getStudentName());
        entity.setJoinedDate(dto.getJoinedDate());
        return entity;
    }
}

package dev.dept.pe.service.impl;

import dev.dept.pe.dto.TeamMemberDto;
import dev.dept.pe.exception.ResourceNotFoundException;
import dev.dept.pe.model.TeamMember;
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
        if (!teamRepository.existsById(dto.getTeamId())) {
            throw new ResourceNotFoundException("Team not found with ID: " + dto.getTeamId());
        }
        if (!userFormRepository.existsById(dto.getStudentId())) {
            throw new ResourceNotFoundException("Student candidate form not found with ID: " + dto.getStudentId());
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
        dto.setJoinedDate(entity.getJoinedDate());
        return dto;
    }

    private TeamMember mapToEntity(TeamMemberDto dto) {
        TeamMember entity = new TeamMember();
        entity.setTeamMemberId(dto.getTeamMemberId());
        entity.setTeamId(dto.getTeamId());
        entity.setStudentId(dto.getStudentId());
        entity.setJoinedDate(dto.getJoinedDate());
        return entity;
    }
}

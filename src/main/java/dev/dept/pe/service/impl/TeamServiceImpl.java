package dev.dept.pe.service.impl;

import dev.dept.pe.dto.TeamDto;
import dev.dept.pe.exception.ResourceNotFoundException;
import dev.dept.pe.model.Team;
import dev.dept.pe.repository.SportsDetailsRepository;
import dev.dept.pe.repository.TeamRepository;
import dev.dept.pe.service.TeamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TeamServiceImpl implements TeamService {

    private final TeamRepository teamRepository;
    private final SportsDetailsRepository sportsDetailsRepository;

    @Autowired
    public TeamServiceImpl(TeamRepository teamRepository, SportsDetailsRepository sportsDetailsRepository) {
        this.teamRepository = teamRepository;
        this.sportsDetailsRepository = sportsDetailsRepository;
    }

    @Override
    public TeamDto create(TeamDto dto) {
        if (!sportsDetailsRepository.existsById(dto.getSportId())) {
            throw new ResourceNotFoundException("Sport not found with ID: " + dto.getSportId());
        }
        Team entity = mapToEntity(dto);
        Team saved = teamRepository.save(entity);
        return mapToDto(saved);
    }

    @Override
    public TeamDto getById(Long id) {
        Team entity = teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with ID: " + id));
        return mapToDto(entity);
    }

    @Override
    public List<TeamDto> getAll() {
        return teamRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<TeamDto> getBySportId(Long sportId) {
        return teamRepository.findBySportId(sportId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public TeamDto update(Long id, TeamDto dto) {
        Team entity = teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with ID: " + id));

        if (!sportsDetailsRepository.existsById(dto.getSportId())) {
            throw new ResourceNotFoundException("Sport not found with ID: " + dto.getSportId());
        }

        entity.setTeamName(dto.getTeamName());
        entity.setSportId(dto.getSportId());

        Team updated = teamRepository.save(entity);
        return mapToDto(updated);
    }

    @Override
    public void delete(Long id) {
        if (!teamRepository.existsById(id)) {
            throw new ResourceNotFoundException("Team not found with ID: " + id);
        }
        teamRepository.deleteById(id);
    }

    private TeamDto mapToDto(Team entity) {
        TeamDto dto = new TeamDto();
        dto.setTeamId(entity.getTeamId());
        dto.setTeamName(entity.getTeamName());
        dto.setSportId(entity.getSportId());
        dto.setCreatedTime(entity.getCreatedTime());
        dto.setUpdatedTime(entity.getUpdatedTime());
        return dto;
    }

    private Team mapToEntity(TeamDto dto) {
        Team entity = new Team();
        entity.setTeamId(dto.getTeamId());
        entity.setTeamName(dto.getTeamName());
        entity.setSportId(dto.getSportId());
        return entity;
    }
}

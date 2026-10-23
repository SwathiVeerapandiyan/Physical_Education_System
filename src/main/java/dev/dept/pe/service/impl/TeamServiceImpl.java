package dev.dept.pe.service.impl;

import dev.dept.pe.dto.TeamDto;
import dev.dept.pe.exception.ResourceNotFoundException;
import dev.dept.pe.model.Team;
import dev.dept.pe.model.Match;
import dev.dept.pe.model.TeamMember;
import dev.dept.pe.model.TournamentRegistration;
import dev.dept.pe.repository.*;
import dev.dept.pe.service.TeamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import dev.dept.pe.model.SportsDetails;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TeamServiceImpl implements TeamService {

    private final TeamRepository teamRepository;
    private final SportsDetailsRepository sportsDetailsRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TournamentRegistrationRepository tournamentRegistrationRepository;
    private final MatchRepository matchRepository;

    @Autowired
    public TeamServiceImpl(TeamRepository teamRepository,
                           SportsDetailsRepository sportsDetailsRepository,
                           TeamMemberRepository teamMemberRepository,
                           TournamentRegistrationRepository tournamentRegistrationRepository,
                           MatchRepository matchRepository) {
        this.teamRepository = teamRepository;
        this.sportsDetailsRepository = sportsDetailsRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.tournamentRegistrationRepository = tournamentRegistrationRepository;
        this.matchRepository = matchRepository;
    }

    @Override
    public TeamDto create(TeamDto dto) {
        if (dto.getSportId() != null) {
            if (!sportsDetailsRepository.existsById(dto.getSportId())) {
                throw new ResourceNotFoundException("Sport not found with ID: " + dto.getSportId());
            }
        } else {
            List<SportsDetails> sports = sportsDetailsRepository.findAll();
            if (!sports.isEmpty()) {
                dto.setSportId(sports.get(0).getSportId());
            } else {
                SportsDetails defaultSport = new SportsDetails();
                defaultSport.setSportName("General Sports");
                defaultSport.setCategory("Outdoor");
                defaultSport.setDescription("Auto-created default sports catalog");
                SportsDetails savedSport = sportsDetailsRepository.save(defaultSport);
                dto.setSportId(savedSport.getSportId());
            }
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

        if (dto.getSportId() != null) {
            if (!sportsDetailsRepository.existsById(dto.getSportId())) {
                throw new ResourceNotFoundException("Sport not found with ID: " + dto.getSportId());
            }
            entity.setSportId(dto.getSportId());
        }

        if (dto.getTeamName() != null) {
            entity.setTeamName(dto.getTeamName());
        }
        entity.setCaptainName(dto.getCaptainName());
        entity.setDepartment(dto.getDepartment());

        Team updated = teamRepository.save(entity);
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!teamRepository.existsById(id)) {
            throw new ResourceNotFoundException("Team not found with ID: " + id);
        }

        // Safely remove dependent records to preserve relational integrity
        try {
            List<TeamMember> members = teamMemberRepository.findByTeamId(id);
            if (members != null && !members.isEmpty()) {
                teamMemberRepository.deleteAll(members);
            }
            List<TournamentRegistration> registrations = tournamentRegistrationRepository.findByTeamId(id);
            if (registrations != null && !registrations.isEmpty()) {
                tournamentRegistrationRepository.deleteAll(registrations);
            }
            List<Match> matches = matchRepository.findAll().stream()
                    .filter(m -> id.equals(m.getTeamOne()) || id.equals(m.getTeamTwo()))
                    .collect(Collectors.toList());
            if (!matches.isEmpty()) {
                matchRepository.deleteAll(matches);
            }
        } catch (Exception ignored) {
        }

        teamRepository.deleteById(id);
    }

    private TeamDto mapToDto(Team entity) {
        TeamDto dto = new TeamDto();
        dto.setTeamId(entity.getTeamId());
        dto.setTeamName(entity.getTeamName());
        dto.setSportId(entity.getSportId());
        dto.setCaptainName(entity.getCaptainName());
        dto.setDepartment(entity.getDepartment());
        dto.setCreatedTime(entity.getCreatedTime());
        dto.setUpdatedTime(entity.getUpdatedTime());
        return dto;
    }

    private Team mapToEntity(TeamDto dto) {
        Team entity = new Team();
        entity.setTeamId(dto.getTeamId());
        entity.setTeamName(dto.getTeamName());
        entity.setSportId(dto.getSportId());
        entity.setCaptainName(dto.getCaptainName());
        entity.setDepartment(dto.getDepartment());
        return entity;
    }
}

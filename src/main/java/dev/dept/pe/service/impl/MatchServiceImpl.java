package dev.dept.pe.service.impl;

import dev.dept.pe.dto.MatchDto;
import dev.dept.pe.exception.ResourceNotFoundException;
import dev.dept.pe.model.Match;
import dev.dept.pe.repository.MatchRepository;
import dev.dept.pe.repository.TeamRepository;
import dev.dept.pe.repository.TournamentRepository;
import dev.dept.pe.service.MatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MatchServiceImpl implements MatchService {

    private final MatchRepository matchRepository;
    private final TournamentRepository tournamentRepository;
    private final TeamRepository teamRepository;

    @Autowired
    public MatchServiceImpl(MatchRepository matchRepository,
                            TournamentRepository tournamentRepository,
                            TeamRepository teamRepository) {
        this.matchRepository = matchRepository;
        this.tournamentRepository = tournamentRepository;
        this.teamRepository = teamRepository;
    }

    @Override
    public MatchDto create(MatchDto dto) {
        if (dto.getTournamentId() != null && !tournamentRepository.existsById(dto.getTournamentId())) {
            throw new ResourceNotFoundException("Tournament not found with ID: " + dto.getTournamentId());
        }
        if (dto.getTeamOne() != null && !teamRepository.existsById(dto.getTeamOne())) {
            throw new ResourceNotFoundException("Team one not found with ID: " + dto.getTeamOne());
        }
        if (dto.getTeamTwo() != null && !teamRepository.existsById(dto.getTeamTwo())) {
            throw new ResourceNotFoundException("Team two not found with ID: " + dto.getTeamTwo());
        }

        Match entity = mapToEntity(dto);
        Match saved = matchRepository.save(entity);
        return mapToDto(saved);
    }

    @Override
    public MatchDto getById(Long id) {
        Match entity = matchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found with ID: " + id));
        return mapToDto(entity);
    }

    @Override
    public List<MatchDto> getAll() {
        return matchRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<MatchDto> getByTournamentId(Long tournamentId) {
        return matchRepository.findByTournamentId(tournamentId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public MatchDto update(Long id, MatchDto dto) {
        Match entity = matchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found with ID: " + id));

        if (dto.getTournamentId() != null && !tournamentRepository.existsById(dto.getTournamentId())) {
            throw new ResourceNotFoundException("Tournament not found with ID: " + dto.getTournamentId());
        }
        if (dto.getTeamOne() != null && !teamRepository.existsById(dto.getTeamOne())) {
            throw new ResourceNotFoundException("Team one not found with ID: " + dto.getTeamOne());
        }
        if (dto.getTeamTwo() != null && !teamRepository.existsById(dto.getTeamTwo())) {
            throw new ResourceNotFoundException("Team two not found with ID: " + dto.getTeamTwo());
        }

        entity.setTournamentId(dto.getTournamentId());
        entity.setTeamOne(dto.getTeamOne());
        entity.setTeamTwo(dto.getTeamTwo());
        entity.setVenue(dto.getVenue());
        entity.setMatchDate(dto.getMatchDate());
        entity.setStatus(dto.getStatus());

        Match updated = matchRepository.save(entity);
        return mapToDto(updated);
    }

    @Override
    public void delete(Long id) {
        if (!matchRepository.existsById(id)) {
            throw new ResourceNotFoundException("Match not found with ID: " + id);
        }
        matchRepository.deleteById(id);
    }

    private MatchDto mapToDto(Match entity) {
        MatchDto dto = new MatchDto();
        dto.setMatchId(entity.getMatchId());
        dto.setTournamentId(entity.getTournamentId());
        dto.setTeamOne(entity.getTeamOne());
        dto.setTeamTwo(entity.getTeamTwo());
        dto.setVenue(entity.getVenue());
        dto.setMatchDate(entity.getMatchDate());
        dto.setStatus(entity.getStatus());
        dto.setCreatedTime(entity.getCreatedTime());
        return dto;
    }

    private Match mapToEntity(MatchDto dto) {
        Match entity = new Match();
        entity.setMatchId(dto.getMatchId());
        entity.setTournamentId(dto.getTournamentId());
        entity.setTeamOne(dto.getTeamOne());
        entity.setTeamTwo(dto.getTeamTwo());
        entity.setVenue(dto.getVenue());
        entity.setMatchDate(dto.getMatchDate());
        entity.setStatus(dto.getStatus());
        return entity;
    }
}

package dev.dept.pe.service.impl;

import dev.dept.pe.dto.TournamentDto;
import dev.dept.pe.exception.ResourceNotFoundException;
import dev.dept.pe.model.Match;
import dev.dept.pe.model.Tournament;
import dev.dept.pe.model.TournamentRegistration;
import dev.dept.pe.repository.MatchRepository;
import dev.dept.pe.repository.TournamentRegistrationRepository;
import dev.dept.pe.repository.TournamentRepository;
import dev.dept.pe.service.TournamentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TournamentServiceImpl implements TournamentService {

    private final TournamentRepository tournamentRepository;
    private final TournamentRegistrationRepository tournamentRegistrationRepository;
    private final MatchRepository matchRepository;

    @Autowired
    public TournamentServiceImpl(TournamentRepository tournamentRepository,
                                 TournamentRegistrationRepository tournamentRegistrationRepository,
                                 MatchRepository matchRepository) {
        this.tournamentRepository = tournamentRepository;
        this.tournamentRegistrationRepository = tournamentRegistrationRepository;
        this.matchRepository = matchRepository;
    }

    @Override
    public TournamentDto create(TournamentDto dto) {
        Tournament entity = mapToEntity(dto);
        Tournament saved = tournamentRepository.save(entity);
        return mapToDto(saved);
    }

    @Override
    public TournamentDto getById(Long id) {
        Tournament entity = tournamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found with ID: " + id));
        return mapToDto(entity);
    }

    @Override
    public List<TournamentDto> getAll() {
        return tournamentRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<TournamentDto> getByStatus(String status) {
        return tournamentRepository.findByStatus(status).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public TournamentDto update(Long id, TournamentDto dto) {
        Tournament entity = tournamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found with ID: " + id));

        entity.setTournamentName(dto.getTournamentName());
        entity.setOrganizer(dto.getOrganizer());
        entity.setVenue(dto.getVenue());
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        entity.setStatus(dto.getStatus());

        Tournament updated = tournamentRepository.save(entity);
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!tournamentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tournament not found with ID: " + id);
        }

        // Safely remove dependent registrations and matches to preserve database integrity
        try {
            List<TournamentRegistration> regs = tournamentRegistrationRepository.findByTournamentId(id);
            if (regs != null && !regs.isEmpty()) {
                tournamentRegistrationRepository.deleteAll(regs);
            }
            List<Match> matches = matchRepository.findByTournamentId(id);
            if (matches != null && !matches.isEmpty()) {
                matchRepository.deleteAll(matches);
            }
        } catch (Exception ignored) {
        }

        tournamentRepository.deleteById(id);
    }

    private TournamentDto mapToDto(Tournament entity) {
        TournamentDto dto = new TournamentDto();
        dto.setTournamentId(entity.getTournamentId());
        dto.setTournamentName(entity.getTournamentName());
        dto.setOrganizer(entity.getOrganizer());
        dto.setVenue(entity.getVenue());
        dto.setStartDate(entity.getStartDate());
        dto.setEndDate(entity.getEndDate());
        dto.setStatus(entity.getStatus());
        dto.setCreatedTime(entity.getCreatedTime());
        dto.setUpdatedTime(entity.getUpdatedTime());
        return dto;
    }

    private Tournament mapToEntity(TournamentDto dto) {
        Tournament entity = new Tournament();
        entity.setTournamentId(dto.getTournamentId());
        entity.setTournamentName(dto.getTournamentName());
        entity.setOrganizer(dto.getOrganizer());
        entity.setVenue(dto.getVenue());
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        entity.setStatus(dto.getStatus());
        return entity;
    }
}

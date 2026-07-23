package dev.dept.pe.service.impl;

import dev.dept.pe.dto.TournamentRegistrationDto;
import dev.dept.pe.exception.ResourceNotFoundException;
import dev.dept.pe.model.TournamentRegistration;
import dev.dept.pe.repository.TeamRepository;
import dev.dept.pe.repository.TournamentRegistrationRepository;
import dev.dept.pe.repository.TournamentRepository;
import dev.dept.pe.service.TournamentRegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TournamentRegistrationServiceImpl implements TournamentRegistrationService {

    private final TournamentRegistrationRepository registrationRepository;
    private final TournamentRepository tournamentRepository;
    private final TeamRepository teamRepository;

    @Autowired
    public TournamentRegistrationServiceImpl(TournamentRegistrationRepository registrationRepository,
                                             TournamentRepository tournamentRepository,
                                             TeamRepository teamRepository) {
        this.registrationRepository = registrationRepository;
        this.tournamentRepository = tournamentRepository;
        this.teamRepository = teamRepository;
    }

    @Override
    public TournamentRegistrationDto create(TournamentRegistrationDto dto) {
        if (!tournamentRepository.existsById(dto.getTournamentId())) {
            throw new ResourceNotFoundException("Tournament not found with ID: " + dto.getTournamentId());
        }
        if (!teamRepository.existsById(dto.getTeamId())) {
            throw new ResourceNotFoundException("Team not found with ID: " + dto.getTeamId());
        }

        TournamentRegistration entity = mapToEntity(dto);
        if (entity.getStatus() == null || entity.getStatus().trim().isEmpty()) {
            entity.setStatus("Pending");
        }
        TournamentRegistration saved = registrationRepository.save(entity);
        return mapToDto(saved);
    }

    @Override
    public TournamentRegistrationDto getById(Long id) {
        TournamentRegistration entity = registrationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament registration not found with ID: " + id));
        return mapToDto(entity);
    }

    @Override
    public List<TournamentRegistrationDto> getByTournamentId(Long tournamentId) {
        return registrationRepository.findByTournamentId(tournamentId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<TournamentRegistrationDto> getByTeamId(Long teamId) {
        return registrationRepository.findByTeamId(teamId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public TournamentRegistrationDto update(Long id, TournamentRegistrationDto dto) {
        TournamentRegistration entity = registrationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament registration not found with ID: " + id));

        if (dto.getStatus() != null && !dto.getStatus().trim().isEmpty()) {
            entity.setStatus(dto.getStatus());
        }

        TournamentRegistration updated = registrationRepository.save(entity);
        return mapToDto(updated);
    }

    @Override
    public void delete(Long id) {
        if (!registrationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tournament registration not found with ID: " + id);
        }
        registrationRepository.deleteById(id);
    }

    private TournamentRegistrationDto mapToDto(TournamentRegistration entity) {
        TournamentRegistrationDto dto = new TournamentRegistrationDto();
        dto.setRegistrationId(entity.getRegistrationId());
        dto.setTournamentId(entity.getTournamentId());
        dto.setTeamId(entity.getTeamId());
        dto.setRegistrationDate(entity.getRegistrationDate());
        dto.setStatus(entity.getStatus());
        return dto;
    }

    private TournamentRegistration mapToEntity(TournamentRegistrationDto dto) {
        TournamentRegistration entity = new TournamentRegistration();
        entity.setRegistrationId(dto.getRegistrationId());
        entity.setTournamentId(dto.getTournamentId());
        entity.setTeamId(dto.getTeamId());
        entity.setStatus(dto.getStatus());
        return entity;
    }
}

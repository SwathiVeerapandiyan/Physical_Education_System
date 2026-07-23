package dev.dept.pe.service.impl;

import dev.dept.pe.dto.SportsDetailsDto;
import dev.dept.pe.exception.ResourceNotFoundException;
import dev.dept.pe.model.SportsDetails;
import dev.dept.pe.repository.SportsDetailsRepository;
import dev.dept.pe.service.SportsDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SportsDetailsServiceImpl implements SportsDetailsService {

    private final SportsDetailsRepository sportsDetailsRepository;

    @Autowired
    public SportsDetailsServiceImpl(SportsDetailsRepository sportsDetailsRepository) {
        this.sportsDetailsRepository = sportsDetailsRepository;
    }

    @Override
    public SportsDetailsDto create(SportsDetailsDto dto) {
        if (sportsDetailsRepository.findBySportName(dto.getSportName()).isPresent()) {
            throw new IllegalArgumentException("Sport already exists with name: " + dto.getSportName());
        }
        SportsDetails entity = mapToEntity(dto);
        SportsDetails saved = sportsDetailsRepository.save(entity);
        return mapToDto(saved);
    }

    @Override
    public SportsDetailsDto getById(Long id) {
        SportsDetails entity = sportsDetailsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sport not found with ID: " + id));
        return mapToDto(entity);
    }

    @Override
    public List<SportsDetailsDto> getAll() {
        return sportsDetailsRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public SportsDetailsDto update(Long id, SportsDetailsDto dto) {
        SportsDetails entity = sportsDetailsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sport not found with ID: " + id));

        entity.setSportName(dto.getSportName());
        entity.setCategory(dto.getCategory());
        entity.setCoachName(dto.getCoachName());
        entity.setDescription(dto.getDescription());

        SportsDetails updated = sportsDetailsRepository.save(entity);
        return mapToDto(updated);
    }

    @Override
    public void delete(Long id) {
        if (!sportsDetailsRepository.existsById(id)) {
            throw new ResourceNotFoundException("Sport not found with ID: " + id);
        }
        sportsDetailsRepository.deleteById(id);
    }

    private SportsDetailsDto mapToDto(SportsDetails entity) {
        return new SportsDetailsDto(
                entity.getSportId(),
                entity.getSportName(),
                entity.getCategory(),
                entity.getCoachName(),
                entity.getDescription(),
                entity.getCreatedTime(),
                entity.getUpdatedTime()
        );
    }

    private SportsDetails mapToEntity(SportsDetailsDto dto) {
        SportsDetails entity = new SportsDetails();
        entity.setSportId(dto.getSportId());
        entity.setSportName(dto.getSportName());
        entity.setCategory(dto.getCategory());
        entity.setCoachName(dto.getCoachName());
        entity.setDescription(dto.getDescription());
        return entity;
    }
}

package dev.dept.pe.service.impl;

import dev.dept.pe.dto.LiveScoreDto;
import dev.dept.pe.exception.ResourceNotFoundException;
import dev.dept.pe.model.LiveScore;
import dev.dept.pe.repository.LiveScoreRepository;
import dev.dept.pe.service.LiveScoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LiveScoreServiceImpl implements LiveScoreService {

    private final LiveScoreRepository repository;

    @Autowired
    public LiveScoreServiceImpl(LiveScoreRepository repository) {
        this.repository = repository;
    }

    @Override
    public LiveScoreDto create(LiveScoreDto dto) {
        LiveScore entity = mapToEntity(dto);
        if (entity.getMatchStatus() == null) entity.setMatchStatus("Scheduled");
        if (entity.getTeamOneScore() == null) entity.setTeamOneScore(0);
        if (entity.getTeamTwoScore() == null) entity.setTeamTwoScore(0);
        LiveScore saved = repository.save(entity);
        return mapToDto(saved);
    }

    @Override
    public List<LiveScoreDto> getAll(String sportType, String status) {
        List<LiveScore> list;
        if (sportType != null && !sportType.trim().isEmpty()) {
            list = repository.findBySportType(sportType.trim());
        } else if (status != null && !status.trim().isEmpty()) {
            list = repository.findByMatchStatus(status.trim());
        } else {
            list = repository.findAll();
        }
        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public LiveScoreDto getById(Long id) {
        LiveScore entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Live score record not found with ID: " + id));
        return mapToDto(entity);
    }

    @Override
    public LiveScoreDto update(Long id, LiveScoreDto dto) {
        LiveScore entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Live score record not found with ID: " + id));

        if (dto.getMatchName() != null) entity.setMatchName(dto.getMatchName());
        if (dto.getSportType() != null) entity.setSportType(dto.getSportType());
        if (dto.getTeamOne() != null) entity.setTeamOne(dto.getTeamOne());
        if (dto.getTeamTwo() != null) entity.setTeamTwo(dto.getTeamTwo());
        if (dto.getTeamOneScore() != null) entity.setTeamOneScore(dto.getTeamOneScore());
        if (dto.getTeamTwoScore() != null) entity.setTeamTwoScore(dto.getTeamTwoScore());
        if (dto.getMatchStatus() != null) entity.setMatchStatus(dto.getMatchStatus());
        if (dto.getVenue() != null) entity.setVenue(dto.getVenue());
        if (dto.getMatchDate() != null) entity.setMatchDate(dto.getMatchDate());
        if (dto.getStartTime() != null) entity.setStartTime(dto.getStartTime());
        if (dto.getWinner() != null) entity.setWinner(dto.getWinner());

        LiveScore updated = repository.save(entity);
        return mapToDto(updated);
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Live score record not found with ID: " + id);
        }
        repository.deleteById(id);
    }

    private LiveScoreDto mapToDto(LiveScore entity) {
        LiveScoreDto dto = new LiveScoreDto();
        dto.setScoreId(entity.getScoreId());
        dto.setMatchName(entity.getMatchName());
        dto.setSportType(entity.getSportType());
        dto.setTeamOne(entity.getTeamOne());
        dto.setTeamTwo(entity.getTeamTwo());
        dto.setTeamOneScore(entity.getTeamOneScore());
        dto.setTeamTwoScore(entity.getTeamTwoScore());
        dto.setMatchStatus(entity.getMatchStatus());
        dto.setVenue(entity.getVenue());
        dto.setMatchDate(entity.getMatchDate());
        dto.setStartTime(entity.getStartTime());
        dto.setWinner(entity.getWinner());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    private LiveScore mapToEntity(LiveScoreDto dto) {
        LiveScore entity = new LiveScore();
        entity.setScoreId(dto.getScoreId());
        entity.setMatchName(dto.getMatchName());
        entity.setSportType(dto.getSportType());
        entity.setTeamOne(dto.getTeamOne());
        entity.setTeamTwo(dto.getTeamTwo());
        entity.setTeamOneScore(dto.getTeamOneScore());
        entity.setTeamTwoScore(dto.getTeamTwoScore());
        entity.setMatchStatus(dto.getMatchStatus());
        entity.setVenue(dto.getVenue());
        entity.setMatchDate(dto.getMatchDate());
        entity.setStartTime(dto.getStartTime());
        entity.setWinner(dto.getWinner());
        return entity;
    }
}

package dev.dept.pe.service;

import dev.dept.pe.dto.LiveScoreDto;

import java.util.List;

public interface LiveScoreService {
    LiveScoreDto create(LiveScoreDto dto);
    List<LiveScoreDto> getAll(String sportType, String status);
    LiveScoreDto getById(Long id);
    LiveScoreDto update(Long id, LiveScoreDto dto);
    void delete(Long id);
}

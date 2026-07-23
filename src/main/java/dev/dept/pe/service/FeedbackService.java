package dev.dept.pe.service;

import dev.dept.pe.dto.FeedbackDto;

import java.util.List;

public interface FeedbackService {
    FeedbackDto create(FeedbackDto dto);
    List<FeedbackDto> getAll(String status, Integer userId);
    FeedbackDto getById(Long id);
    FeedbackDto update(Long id, FeedbackDto dto);
    void delete(Long id);
}

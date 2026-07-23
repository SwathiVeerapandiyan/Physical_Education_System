package dev.dept.pe.service;

import dev.dept.pe.dto.NoticeBoardDto;

import java.util.List;

public interface NoticeBoardService {
    NoticeBoardDto create(NoticeBoardDto dto);
    List<NoticeBoardDto> getAll(String category, Boolean activeOnly);
    NoticeBoardDto getById(Long id);
    NoticeBoardDto update(Long id, NoticeBoardDto dto);
    void delete(Long id);
}

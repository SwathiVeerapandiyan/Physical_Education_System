package dev.dept.pe.service;

import dev.dept.pe.dto.SportsDetailsDto;
import java.util.List;

public interface SportsDetailsService {
    SportsDetailsDto create(SportsDetailsDto dto);
    SportsDetailsDto getById(Long id);
    List<SportsDetailsDto> getAll();
    SportsDetailsDto update(Long id, SportsDetailsDto dto);
    void delete(Long id);
}

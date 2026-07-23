package dev.dept.pe.service;

import dev.dept.pe.dto.HealthFitnessDto;

import java.util.List;

public interface HealthFitnessService {
    HealthFitnessDto create(HealthFitnessDto dto);
    List<HealthFitnessDto> getAll(Integer userId);
    HealthFitnessDto getById(Long id);
    HealthFitnessDto getByUserId(Integer userId);
    HealthFitnessDto update(Long id, HealthFitnessDto dto);
    void delete(Long id);
}

package dev.dept.pe.service;

import dev.dept.pe.dto.EmergencyContactDto;

import java.util.List;

public interface EmergencyContactService {
    EmergencyContactDto create(EmergencyContactDto dto);
    List<EmergencyContactDto> getAll(Integer userId);
    EmergencyContactDto getById(Long id);
    EmergencyContactDto update(Long id, EmergencyContactDto dto);
    void delete(Long id);
}

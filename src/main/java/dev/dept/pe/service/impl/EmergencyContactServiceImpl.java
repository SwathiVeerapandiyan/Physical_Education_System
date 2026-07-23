package dev.dept.pe.service.impl;

import dev.dept.pe.dto.EmergencyContactDto;
import dev.dept.pe.exception.ResourceNotFoundException;
import dev.dept.pe.model.EmergencyContact;
import dev.dept.pe.repository.EmergencyContactRepository;
import dev.dept.pe.service.EmergencyContactService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmergencyContactServiceImpl implements EmergencyContactService {

    private final EmergencyContactRepository repository;

    @Autowired
    public EmergencyContactServiceImpl(EmergencyContactRepository repository) {
        this.repository = repository;
    }

    @Override
    public EmergencyContactDto create(EmergencyContactDto dto) {
        EmergencyContact entity = mapToEntity(dto);
        EmergencyContact saved = repository.save(entity);
        return mapToDto(saved);
    }

    @Override
    public List<EmergencyContactDto> getAll(Integer userId) {
        List<EmergencyContact> list;
        if (userId != null) {
            list = repository.findByUserId(userId);
        } else {
            list = repository.findAll();
        }
        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public EmergencyContactDto getById(Long id) {
        EmergencyContact entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Emergency contact not found with ID: " + id));
        return mapToDto(entity);
    }

    @Override
    public EmergencyContactDto update(Long id, EmergencyContactDto dto) {
        EmergencyContact entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Emergency contact not found with ID: " + id));

        if (dto.getUserId() != null) entity.setUserId(dto.getUserId());
        if (dto.getContactName() != null) entity.setContactName(dto.getContactName());
        if (dto.getRelationship() != null) entity.setRelationship(dto.getRelationship());
        if (dto.getPhoneNumber() != null) entity.setPhoneNumber(dto.getPhoneNumber());
        if (dto.getAlternatePhone() != null) entity.setAlternatePhone(dto.getAlternatePhone());
        if (dto.getEmail() != null) entity.setEmail(dto.getEmail());
        if (dto.getAddress() != null) entity.setAddress(dto.getAddress());
        if (dto.getCity() != null) entity.setCity(dto.getCity());
        if (dto.getState() != null) entity.setState(dto.getState());
        if (dto.getPincode() != null) entity.setPincode(dto.getPincode());

        EmergencyContact updated = repository.save(entity);
        return mapToDto(updated);
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Emergency contact not found with ID: " + id);
        }
        repository.deleteById(id);
    }

    private EmergencyContactDto mapToDto(EmergencyContact entity) {
        EmergencyContactDto dto = new EmergencyContactDto();
        dto.setContactId(entity.getContactId());
        dto.setUserId(entity.getUserId());
        dto.setContactName(entity.getContactName());
        dto.setRelationship(entity.getRelationship());
        dto.setPhoneNumber(entity.getPhoneNumber());
        dto.setAlternatePhone(entity.getAlternatePhone());
        dto.setEmail(entity.getEmail());
        dto.setAddress(entity.getAddress());
        dto.setCity(entity.getCity());
        dto.setState(entity.getState());
        dto.setPincode(entity.getPincode());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    private EmergencyContact mapToEntity(EmergencyContactDto dto) {
        EmergencyContact entity = new EmergencyContact();
        entity.setContactId(dto.getContactId());
        entity.setUserId(dto.getUserId());
        entity.setContactName(dto.getContactName());
        entity.setRelationship(dto.getRelationship());
        entity.setPhoneNumber(dto.getPhoneNumber());
        entity.setAlternatePhone(dto.getAlternatePhone());
        entity.setEmail(dto.getEmail());
        entity.setAddress(dto.getAddress());
        entity.setCity(dto.getCity());
        entity.setState(dto.getState());
        entity.setPincode(dto.getPincode());
        return entity;
    }
}

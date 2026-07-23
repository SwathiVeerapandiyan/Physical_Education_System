package dev.dept.pe.service.impl;

import dev.dept.pe.dto.EquipmentBookingDto;
import dev.dept.pe.exception.ResourceNotFoundException;
import dev.dept.pe.model.EquipmentBooking;
import dev.dept.pe.repository.EquipmentBookingRepository;
import dev.dept.pe.service.EquipmentBookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EquipmentBookingServiceImpl implements EquipmentBookingService {

    private final EquipmentBookingRepository repository;

    @Autowired
    public EquipmentBookingServiceImpl(EquipmentBookingRepository repository) {
        this.repository = repository;
    }

    @Override
    public EquipmentBookingDto create(EquipmentBookingDto dto) {
        EquipmentBooking entity = mapToEntity(dto);
        if (entity.getBookingStatus() == null) {
            entity.setBookingStatus("Pending");
        }
        EquipmentBooking saved = repository.save(entity);
        return mapToDto(saved);
    }

    @Override
    public List<EquipmentBookingDto> getAll(Integer userId, String status) {
        List<EquipmentBooking> list;
        if (userId != null) {
            list = repository.findByUserId(userId);
        } else if (status != null && !status.trim().isEmpty()) {
            list = repository.findByBookingStatus(status.trim());
        } else {
            list = repository.findAll();
        }
        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public EquipmentBookingDto getById(Long id) {
        EquipmentBooking entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment booking not found with ID: " + id));
        return mapToDto(entity);
    }

    @Override
    public EquipmentBookingDto update(Long id, EquipmentBookingDto dto) {
        EquipmentBooking entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment booking not found with ID: " + id));

        if (dto.getUserId() != null) entity.setUserId(dto.getUserId());
        if (dto.getEquipmentName() != null) entity.setEquipmentName(dto.getEquipmentName());
        if (dto.getEquipmentCategory() != null) entity.setEquipmentCategory(dto.getEquipmentCategory());
        if (dto.getQuantity() != null) entity.setQuantity(dto.getQuantity());
        if (dto.getBookingDate() != null) entity.setBookingDate(dto.getBookingDate());
        if (dto.getStartTime() != null) entity.setStartTime(dto.getStartTime());
        if (dto.getEndTime() != null) entity.setEndTime(dto.getEndTime());
        if (dto.getReturnDate() != null) entity.setReturnDate(dto.getReturnDate());
        if (dto.getBookingStatus() != null) entity.setBookingStatus(dto.getBookingStatus());
        if (dto.getApprovedBy() != null) entity.setApprovedBy(dto.getApprovedBy());
        if (dto.getRemarks() != null) entity.setRemarks(dto.getRemarks());

        EquipmentBooking updated = repository.save(entity);
        return mapToDto(updated);
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Equipment booking not found with ID: " + id);
        }
        repository.deleteById(id);
    }

    private EquipmentBookingDto mapToDto(EquipmentBooking entity) {
        EquipmentBookingDto dto = new EquipmentBookingDto();
        dto.setBookingId(entity.getBookingId());
        dto.setUserId(entity.getUserId());
        dto.setEquipmentName(entity.getEquipmentName());
        dto.setEquipmentCategory(entity.getEquipmentCategory());
        dto.setQuantity(entity.getQuantity());
        dto.setBookingDate(entity.getBookingDate());
        dto.setStartTime(entity.getStartTime());
        dto.setEndTime(entity.getEndTime());
        dto.setReturnDate(entity.getReturnDate());
        dto.setBookingStatus(entity.getBookingStatus());
        dto.setApprovedBy(entity.getApprovedBy());
        dto.setRemarks(entity.getRemarks());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    private EquipmentBooking mapToEntity(EquipmentBookingDto dto) {
        EquipmentBooking entity = new EquipmentBooking();
        entity.setBookingId(dto.getBookingId());
        entity.setUserId(dto.getUserId());
        entity.setEquipmentName(dto.getEquipmentName());
        entity.setEquipmentCategory(dto.getEquipmentCategory());
        entity.setQuantity(dto.getQuantity());
        entity.setBookingDate(dto.getBookingDate());
        entity.setStartTime(dto.getStartTime());
        entity.setEndTime(dto.getEndTime());
        entity.setReturnDate(dto.getReturnDate());
        entity.setBookingStatus(dto.getBookingStatus());
        entity.setApprovedBy(dto.getApprovedBy());
        entity.setRemarks(dto.getRemarks());
        return entity;
    }
}

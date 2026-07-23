package dev.dept.pe.service.impl;

import dev.dept.pe.dto.GroundBookingDto;
import dev.dept.pe.exception.ResourceNotFoundException;
import dev.dept.pe.model.GroundBooking;
import dev.dept.pe.repository.GroundBookingRepository;
import dev.dept.pe.service.GroundBookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GroundBookingServiceImpl implements GroundBookingService {

    private final GroundBookingRepository repository;

    @Autowired
    public GroundBookingServiceImpl(GroundBookingRepository repository) {
        this.repository = repository;
    }

    @Override
    public GroundBookingDto create(GroundBookingDto dto) {
        GroundBooking entity = mapToEntity(dto);
        if (entity.getBookingStatus() == null) entity.setBookingStatus("Pending");
        if (entity.getPaymentStatus() == null) entity.setPaymentStatus("Pending");
        GroundBooking saved = repository.save(entity);
        return mapToDto(saved);
    }

    @Override
    public List<GroundBookingDto> getAll(Integer userId, String status) {
        List<GroundBooking> list;
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
    public GroundBookingDto getById(Long id) {
        GroundBooking entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ground booking not found with ID: " + id));
        return mapToDto(entity);
    }

    @Override
    public GroundBookingDto update(Long id, GroundBookingDto dto) {
        GroundBooking entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ground booking not found with ID: " + id));

        if (dto.getUserId() != null) entity.setUserId(dto.getUserId());
        if (dto.getGroundName() != null) entity.setGroundName(dto.getGroundName());
        if (dto.getSportType() != null) entity.setSportType(dto.getSportType());
        if (dto.getBookingDate() != null) entity.setBookingDate(dto.getBookingDate());
        if (dto.getStartTime() != null) entity.setStartTime(dto.getStartTime());
        if (dto.getEndTime() != null) entity.setEndTime(dto.getEndTime());
        if (dto.getDurationHours() != null) entity.setDurationHours(dto.getDurationHours());
        if (dto.getBookingStatus() != null) entity.setBookingStatus(dto.getBookingStatus());
        if (dto.getPaymentAmount() != null) entity.setPaymentAmount(dto.getPaymentAmount());
        if (dto.getPaymentStatus() != null) entity.setPaymentStatus(dto.getPaymentStatus());
        if (dto.getApprovedBy() != null) entity.setApprovedBy(dto.getApprovedBy());
        if (dto.getRemarks() != null) entity.setRemarks(dto.getRemarks());

        GroundBooking updated = repository.save(entity);
        return mapToDto(updated);
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Ground booking not found with ID: " + id);
        }
        repository.deleteById(id);
    }

    private GroundBookingDto mapToDto(GroundBooking entity) {
        GroundBookingDto dto = new GroundBookingDto();
        dto.setBookingId(entity.getBookingId());
        dto.setUserId(entity.getUserId());
        dto.setGroundName(entity.getGroundName());
        dto.setSportType(entity.getSportType());
        dto.setBookingDate(entity.getBookingDate());
        dto.setStartTime(entity.getStartTime());
        dto.setEndTime(entity.getEndTime());
        dto.setDurationHours(entity.getDurationHours());
        dto.setBookingStatus(entity.getBookingStatus());
        dto.setPaymentAmount(entity.getPaymentAmount());
        dto.setPaymentStatus(entity.getPaymentStatus());
        dto.setApprovedBy(entity.getApprovedBy());
        dto.setRemarks(entity.getRemarks());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    private GroundBooking mapToEntity(GroundBookingDto dto) {
        GroundBooking entity = new GroundBooking();
        entity.setBookingId(dto.getBookingId());
        entity.setUserId(dto.getUserId());
        entity.setGroundName(dto.getGroundName());
        entity.setSportType(dto.getSportType());
        entity.setBookingDate(dto.getBookingDate());
        entity.setStartTime(dto.getStartTime());
        entity.setEndTime(dto.getEndTime());
        entity.setDurationHours(dto.getDurationHours());
        entity.setBookingStatus(dto.getBookingStatus());
        entity.setPaymentAmount(dto.getPaymentAmount());
        entity.setPaymentStatus(dto.getPaymentStatus());
        entity.setApprovedBy(dto.getApprovedBy());
        entity.setRemarks(dto.getRemarks());
        return entity;
    }
}

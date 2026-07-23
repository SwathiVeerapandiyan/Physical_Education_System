package dev.dept.pe.service.impl;

import dev.dept.pe.dto.FeedbackDto;
import dev.dept.pe.exception.ResourceNotFoundException;
import dev.dept.pe.model.Feedback;
import dev.dept.pe.repository.FeedbackRepository;
import dev.dept.pe.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository repository;

    @Autowired
    public FeedbackServiceImpl(FeedbackRepository repository) {
        this.repository = repository;
    }

    @Override
    public FeedbackDto create(FeedbackDto dto) {
        Feedback entity = mapToEntity(dto);
        if (entity.getStatus() == null) entity.setStatus("Open");
        Feedback saved = repository.save(entity);
        return mapToDto(saved);
    }

    @Override
    public List<FeedbackDto> getAll(String status, Integer userId) {
        List<Feedback> list;
        if (userId != null) {
            list = repository.findByUserId(userId);
        } else if (status != null && !status.trim().isEmpty()) {
            list = repository.findByStatus(status.trim());
        } else {
            list = repository.findAll();
        }
        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public FeedbackDto getById(Long id) {
        Feedback entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found with ID: " + id));
        return mapToDto(entity);
    }

    @Override
    public FeedbackDto update(Long id, FeedbackDto dto) {
        Feedback entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found with ID: " + id));

        if (dto.getUserId() != null) entity.setUserId(dto.getUserId());
        if (dto.getUserName() != null) entity.setUserName(dto.getUserName());
        if (dto.getEmail() != null) entity.setEmail(dto.getEmail());
        if (dto.getSubject() != null) entity.setSubject(dto.getSubject());
        if (dto.getMessage() != null) entity.setMessage(dto.getMessage());
        if (dto.getRating() != null) entity.setRating(dto.getRating());
        if (dto.getFeedbackType() != null) entity.setFeedbackType(dto.getFeedbackType());
        if (dto.getStatus() != null) entity.setStatus(dto.getStatus());

        Feedback updated = repository.save(entity);
        return mapToDto(updated);
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Feedback not found with ID: " + id);
        }
        repository.deleteById(id);
    }

    private FeedbackDto mapToDto(Feedback entity) {
        FeedbackDto dto = new FeedbackDto();
        dto.setFeedbackId(entity.getFeedbackId());
        dto.setUserId(entity.getUserId());
        dto.setUserName(entity.getUserName());
        dto.setEmail(entity.getEmail());
        dto.setSubject(entity.getSubject());
        dto.setMessage(entity.getMessage());
        dto.setRating(entity.getRating());
        dto.setFeedbackType(entity.getFeedbackType());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    private Feedback mapToEntity(FeedbackDto dto) {
        Feedback entity = new Feedback();
        entity.setFeedbackId(dto.getFeedbackId());
        entity.setUserId(dto.getUserId());
        entity.setUserName(dto.getUserName());
        entity.setEmail(dto.getEmail());
        entity.setSubject(dto.getSubject());
        entity.setMessage(dto.getMessage());
        entity.setRating(dto.getRating());
        entity.setFeedbackType(dto.getFeedbackType());
        entity.setStatus(dto.getStatus());
        return entity;
    }
}

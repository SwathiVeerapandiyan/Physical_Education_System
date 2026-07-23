package dev.dept.pe.service.impl;

import dev.dept.pe.dto.NoticeBoardDto;
import dev.dept.pe.exception.ResourceNotFoundException;
import dev.dept.pe.model.NoticeBoard;
import dev.dept.pe.repository.NoticeBoardRepository;
import dev.dept.pe.service.NoticeBoardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NoticeBoardServiceImpl implements NoticeBoardService {

    private final NoticeBoardRepository repository;

    @Autowired
    public NoticeBoardServiceImpl(NoticeBoardRepository repository) {
        this.repository = repository;
    }

    @Override
    public NoticeBoardDto create(NoticeBoardDto dto) {
        NoticeBoard entity = mapToEntity(dto);
        if (entity.getIsActive() == null) entity.setIsActive(true);
        NoticeBoard saved = repository.save(entity);
        return mapToDto(saved);
    }

    @Override
    public List<NoticeBoardDto> getAll(String category, Boolean activeOnly) {
        List<NoticeBoard> list;
        if (category != null && !category.trim().isEmpty()) {
            list = repository.findByCategory(category.trim());
        } else if (Boolean.TRUE.equals(activeOnly)) {
            list = repository.findByIsActive(true);
        } else {
            list = repository.findAll();
        }
        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public NoticeBoardDto getById(Long id) {
        NoticeBoard entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notice not found with ID: " + id));
        return mapToDto(entity);
    }

    @Override
    public NoticeBoardDto update(Long id, NoticeBoardDto dto) {
        NoticeBoard entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notice not found with ID: " + id));

        if (dto.getTitle() != null) entity.setTitle(dto.getTitle());
        if (dto.getDescription() != null) entity.setDescription(dto.getDescription());
        if (dto.getCategory() != null) entity.setCategory(dto.getCategory());
        if (dto.getPriority() != null) entity.setPriority(dto.getPriority());
        if (dto.getPublishDate() != null) entity.setPublishDate(dto.getPublishDate());
        if (dto.getExpiryDate() != null) entity.setExpiryDate(dto.getExpiryDate());
        if (dto.getAttachmentUrl() != null) entity.setAttachmentUrl(dto.getAttachmentUrl());
        if (dto.getCreatedBy() != null) entity.setCreatedBy(dto.getCreatedBy());
        if (dto.getIsActive() != null) entity.setIsActive(dto.getIsActive());

        NoticeBoard updated = repository.save(entity);
        return mapToDto(updated);
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Notice not found with ID: " + id);
        }
        repository.deleteById(id);
    }

    private NoticeBoardDto mapToDto(NoticeBoard entity) {
        NoticeBoardDto dto = new NoticeBoardDto();
        dto.setNoticeId(entity.getNoticeId());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setCategory(entity.getCategory());
        dto.setPriority(entity.getPriority());
        dto.setPublishDate(entity.getPublishDate());
        dto.setExpiryDate(entity.getExpiryDate());
        dto.setAttachmentUrl(entity.getAttachmentUrl());
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setIsActive(entity.getIsActive());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    private NoticeBoard mapToEntity(NoticeBoardDto dto) {
        NoticeBoard entity = new NoticeBoard();
        entity.setNoticeId(dto.getNoticeId());
        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        entity.setCategory(dto.getCategory());
        entity.setPriority(dto.getPriority());
        entity.setPublishDate(dto.getPublishDate());
        entity.setExpiryDate(dto.getExpiryDate());
        entity.setAttachmentUrl(dto.getAttachmentUrl());
        entity.setCreatedBy(dto.getCreatedBy());
        entity.setIsActive(dto.getIsActive());
        return entity;
    }
}

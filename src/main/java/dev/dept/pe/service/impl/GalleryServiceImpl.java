package dev.dept.pe.service.impl;

import dev.dept.pe.dto.GalleryDto;
import dev.dept.pe.exception.ResourceNotFoundException;
import dev.dept.pe.model.Gallery;
import dev.dept.pe.repository.GalleryRepository;
import dev.dept.pe.service.GalleryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GalleryServiceImpl implements GalleryService {

    private final GalleryRepository galleryRepository;

    @Autowired
    public GalleryServiceImpl(GalleryRepository galleryRepository) {
        this.galleryRepository = galleryRepository;
    }

    @Override
    public GalleryDto create(GalleryDto dto) {
        Gallery entity = mapToEntity(dto);
        if (entity.getIsActive() == null) {
            entity.setIsActive(true);
        }
        Gallery saved = galleryRepository.save(entity);
        return mapToDto(saved);
    }

    @Override
    public List<GalleryDto> getAll(String eventName, Boolean activeOnly) {
        List<Gallery> items;
        boolean hasEvent = eventName != null && !eventName.trim().isEmpty();
        boolean isActiveOnly = Boolean.TRUE.equals(activeOnly);

        if (hasEvent && isActiveOnly) {
            items = galleryRepository.findByIsActiveAndEventNameIgnoreCase(true, eventName.trim());
        } else if (hasEvent) {
            items = galleryRepository.findByEventNameIgnoreCase(eventName.trim());
        } else if (isActiveOnly) {
            items = galleryRepository.findByIsActive(true);
        } else {
            items = galleryRepository.findAll();
        }

        return items.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public GalleryDto getById(Long id) {
        Gallery entity = galleryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gallery item not found with ID: " + id));
        return mapToDto(entity);
    }

    @Override
    public GalleryDto update(Long id, GalleryDto dto) {
        Gallery entity = galleryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gallery item not found with ID: " + id));

        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        entity.setImageUrl(dto.getImageUrl());
        entity.setVideoUrl(dto.getVideoUrl());
        entity.setEventName(dto.getEventName());
        entity.setEventDate(dto.getEventDate());
        entity.setUploadedBy(dto.getUploadedBy());
        if (dto.getIsActive() != null) {
            entity.setIsActive(dto.getIsActive());
        }

        Gallery updated = galleryRepository.save(entity);
        return mapToDto(updated);
    }

    @Override
    public void delete(Long id) {
        if (!galleryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Gallery item not found with ID: " + id);
        }
        galleryRepository.deleteById(id);
    }

    private GalleryDto mapToDto(Gallery entity) {
        GalleryDto dto = new GalleryDto();
        dto.setGalleryId(entity.getGalleryId());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setImageUrl(entity.getImageUrl());
        dto.setVideoUrl(entity.getVideoUrl());
        dto.setEventName(entity.getEventName());
        dto.setEventDate(entity.getEventDate());
        dto.setUploadedBy(entity.getUploadedBy());
        dto.setIsActive(entity.getIsActive());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    private Gallery mapToEntity(GalleryDto dto) {
        Gallery entity = new Gallery();
        entity.setGalleryId(dto.getGalleryId());
        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        entity.setImageUrl(dto.getImageUrl());
        entity.setVideoUrl(dto.getVideoUrl());
        entity.setEventName(dto.getEventName());
        entity.setEventDate(dto.getEventDate());
        entity.setUploadedBy(dto.getUploadedBy());
        entity.setIsActive(dto.getIsActive());
        return entity;
    }
}

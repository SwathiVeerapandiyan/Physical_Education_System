package dev.dept.pe.service;

import dev.dept.pe.dto.GalleryDto;

import java.util.List;

public interface GalleryService {
    GalleryDto create(GalleryDto dto);
    List<GalleryDto> getAll(String eventName, Boolean activeOnly);
    GalleryDto getById(Long id);
    GalleryDto update(Long id, GalleryDto dto);
    void delete(Long id);
}

package dev.dept.pe.service;

import dev.dept.pe.dto.DocumentDetailsDto;

public interface DocumentDetailsService {
    DocumentDetailsDto createDocumentDetails(DocumentDetailsDto dto);
    DocumentDetailsDto getDocumentDetailsById(Long id);
    DocumentDetailsDto getDocumentDetailsByUserFormId(Long userFormId);
    DocumentDetailsDto updateDocumentDetails(Long id, DocumentDetailsDto dto);
    void deleteDocumentDetails(Long id);
}

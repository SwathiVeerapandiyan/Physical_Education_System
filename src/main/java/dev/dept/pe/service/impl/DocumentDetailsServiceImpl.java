package dev.dept.pe.service.impl;

import dev.dept.pe.dto.DocumentDetailsDto;
import dev.dept.pe.exception.ResourceNotFoundException;
import dev.dept.pe.model.DocumentDetails;
import dev.dept.pe.repository.DocumentDetailsRepository;
import dev.dept.pe.repository.UserFormRepository;
import dev.dept.pe.service.DocumentDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class DocumentDetailsServiceImpl implements DocumentDetailsService {

    private final DocumentDetailsRepository documentDetailsRepository;
    private final UserFormRepository userFormRepository;

    @Autowired
    public DocumentDetailsServiceImpl(DocumentDetailsRepository documentDetailsRepository,
                                       UserFormRepository userFormRepository) {
        this.documentDetailsRepository = documentDetailsRepository;
        this.userFormRepository = userFormRepository;
    }

    @Override
    public DocumentDetailsDto createDocumentDetails(DocumentDetailsDto dto) {
        // Validate candidate form existence
        if (!userFormRepository.existsById(dto.getUserFormId())) {
            throw new ResourceNotFoundException("Candidate form not found with ID: " + dto.getUserFormId());
        }

        // Validate uniqueness of userFormId in document details
        if (documentDetailsRepository.findByUserFormId(dto.getUserFormId()).isPresent()) {
            throw new IllegalArgumentException("Document details already exist for candidate ID: " + dto.getUserFormId());
        }

        DocumentDetails documentDetails = mapToEntity(dto);
        DocumentDetails saved = documentDetailsRepository.save(documentDetails);
        return mapToDto(saved);
    }

    @Override
    public DocumentDetailsDto getDocumentDetailsById(Long id) {
        DocumentDetails documentDetails = documentDetailsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document details not found with ID: " + id));
        return mapToDto(documentDetails);
    }

    @Override
    public DocumentDetailsDto getDocumentDetailsByUserFormId(Long userFormId) {
        DocumentDetails documentDetails = documentDetailsRepository.findByUserFormId(userFormId)
                .orElseThrow(() -> new ResourceNotFoundException("Document details not found for candidate ID: " + userFormId));
        return mapToDto(documentDetails);
    }

    @Override
    public DocumentDetailsDto updateDocumentDetails(Long id, DocumentDetailsDto dto) {
        DocumentDetails documentDetails = documentDetailsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document details not found with ID: " + id));

        // Validate candidate form existence
        if (!userFormRepository.existsById(dto.getUserFormId())) {
            throw new ResourceNotFoundException("Candidate form not found with ID: " + dto.getUserFormId());
        }

        // Validate uniqueness if changing the candidate ID reference
        Optional<DocumentDetails> existingOpt = documentDetailsRepository.findByUserFormId(dto.getUserFormId());
        if (existingOpt.isPresent() && !existingOpt.get().getDocumentId().equals(id)) {
            throw new IllegalArgumentException("Document details already exist for candidate ID: " + dto.getUserFormId());
        }

        documentDetails.setUserFormId(dto.getUserFormId());
        documentDetails.setCandidateSignature(dto.getCandidateSignature());
        documentDetails.setParentSignature(dto.getParentSignature());
        documentDetails.setMark12Certificate(dto.getMark12Certificate());
        documentDetails.setTransferCertificate(dto.getTransferCertificate());
        documentDetails.setAdmissionCard(dto.getAdmissionCard());
        documentDetails.setFeeReceipt(dto.getFeeReceipt());
        documentDetails.setFitnessMedicalCertificate(dto.getFitnessMedicalCertificate());
        documentDetails.setCommunityCertificate(dto.getCommunityCertificate());
        documentDetails.setAadharCard(dto.getAadharCard());
        documentDetails.setIncomeCertificate(dto.getIncomeCertificate());
        documentDetails.setSportsCertificate(dto.getSportsCertificate());
        documentDetails.setEligibilityCertificate(dto.getEligibilityCertificate());

        DocumentDetails updated = documentDetailsRepository.save(documentDetails);
        return mapToDto(updated);
    }

    @Override
    public void deleteDocumentDetails(Long id) {
        DocumentDetails documentDetails = documentDetailsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document details not found with ID: " + id));
        documentDetailsRepository.delete(documentDetails);
    }

    private DocumentDetailsDto mapToDto(DocumentDetails entity) {
        DocumentDetailsDto dto = new DocumentDetailsDto();
        dto.setDocumentId(entity.getDocumentId());
        dto.setUserFormId(entity.getUserFormId());
        dto.setCandidateSignature(entity.getCandidateSignature());
        dto.setParentSignature(entity.getParentSignature());
        dto.setMark12Certificate(entity.getMark12Certificate());
        dto.setTransferCertificate(entity.getTransferCertificate());
        dto.setAdmissionCard(entity.getAdmissionCard());
        dto.setFeeReceipt(entity.getFeeReceipt());
        dto.setFitnessMedicalCertificate(entity.getFitnessMedicalCertificate());
        dto.setCommunityCertificate(entity.getCommunityCertificate());
        dto.setAadharCard(entity.getAadharCard());
        dto.setIncomeCertificate(entity.getIncomeCertificate());
        dto.setSportsCertificate(entity.getSportsCertificate());
        dto.setEligibilityCertificate(entity.getEligibilityCertificate());
        dto.setCreatedTime(entity.getCreatedTime());
        dto.setUpdatedTime(entity.getUpdatedTime());
        return dto;
    }

    private DocumentDetails mapToEntity(DocumentDetailsDto dto) {
        DocumentDetails entity = new DocumentDetails();
        entity.setDocumentId(dto.getDocumentId());
        entity.setUserFormId(dto.getUserFormId());
        entity.setCandidateSignature(dto.getCandidateSignature());
        entity.setParentSignature(dto.getParentSignature());
        entity.setMark12Certificate(dto.getMark12Certificate());
        entity.setTransferCertificate(dto.getTransferCertificate());
        entity.setAdmissionCard(dto.getAdmissionCard());
        entity.setFeeReceipt(dto.getFeeReceipt());
        entity.setFitnessMedicalCertificate(dto.getFitnessMedicalCertificate());
        entity.setCommunityCertificate(dto.getCommunityCertificate());
        entity.setAadharCard(dto.getAadharCard());
        entity.setIncomeCertificate(dto.getIncomeCertificate());
        entity.setSportsCertificate(dto.getSportsCertificate());
        entity.setEligibilityCertificate(dto.getEligibilityCertificate());
        return entity;
    }
}

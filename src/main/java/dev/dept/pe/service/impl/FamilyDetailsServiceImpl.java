package dev.dept.pe.service.impl;

import dev.dept.pe.dto.FamilyDetailsDto;
import dev.dept.pe.exception.ResourceNotFoundException;
import dev.dept.pe.model.FamilyDetails;
import dev.dept.pe.repository.FamilyDetailsRepository;
import dev.dept.pe.repository.UserFormRepository;
import dev.dept.pe.service.FamilyDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class FamilyDetailsServiceImpl implements FamilyDetailsService {

    private final FamilyDetailsRepository familyDetailsRepository;
    private final UserFormRepository userFormRepository;

    @Autowired
    public FamilyDetailsServiceImpl(FamilyDetailsRepository familyDetailsRepository,
                                     UserFormRepository userFormRepository) {
        this.familyDetailsRepository = familyDetailsRepository;
        this.userFormRepository = userFormRepository;
    }

    @Override
    public FamilyDetailsDto createFamilyDetails(FamilyDetailsDto dto) {
        // Validate candidate form existence
        if (!userFormRepository.existsById(dto.getUserFormId())) {
            throw new ResourceNotFoundException("Candidate form not found with ID: " + dto.getUserFormId());
        }

        // Validate uniqueness of userFormId in family details
        if (familyDetailsRepository.findByUserFormId(dto.getUserFormId()).isPresent()) {
            throw new IllegalArgumentException("Family details already exist for candidate ID: " + dto.getUserFormId());
        }

        FamilyDetails familyDetails = mapToEntity(dto);
        FamilyDetails saved = familyDetailsRepository.save(familyDetails);
        return mapToDto(saved);
    }

    @Override
    public FamilyDetailsDto getFamilyDetailsById(Long id) {
        FamilyDetails familyDetails = familyDetailsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Family details not found with ID: " + id));
        return mapToDto(familyDetails);
    }

    @Override
    public FamilyDetailsDto getFamilyDetailsByUserFormId(Long userFormId) {
        FamilyDetails familyDetails = familyDetailsRepository.findByUserFormId(userFormId)
                .orElseThrow(() -> new ResourceNotFoundException("Family details not found for candidate ID: " + userFormId));
        return mapToDto(familyDetails);
    }

    @Override
    public FamilyDetailsDto updateFamilyDetails(Long id, FamilyDetailsDto dto) {
        FamilyDetails familyDetails = familyDetailsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Family details not found with ID: " + id));

        // Validate candidate form existence
        if (!userFormRepository.existsById(dto.getUserFormId())) {
            throw new ResourceNotFoundException("Candidate form not found with ID: " + dto.getUserFormId());
        }

        // Validate uniqueness if changing the candidate ID reference
        Optional<FamilyDetails> existingOpt = familyDetailsRepository.findByUserFormId(dto.getUserFormId());
        if (existingOpt.isPresent() && !existingOpt.get().getFamilyId().equals(id)) {
            throw new IllegalArgumentException("Family details already exist for candidate ID: " + dto.getUserFormId());
        }

        familyDetails.setUserFormId(dto.getUserFormId());
        familyDetails.setFatherName(dto.getFatherName());
        familyDetails.setFatherOccupation(dto.getFatherOccupation());
        familyDetails.setMotherName(dto.getMotherName());
        familyDetails.setMotherOccupation(dto.getMotherOccupation());
        familyDetails.setSiblings(dto.getSiblings());
        familyDetails.setSiblingOccupation(dto.getSiblingOccupation());

        FamilyDetails updated = familyDetailsRepository.save(familyDetails);
        return mapToDto(updated);
    }

    @Override
    public void deleteFamilyDetails(Long id) {
        FamilyDetails familyDetails = familyDetailsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Family details not found with ID: " + id));
        familyDetailsRepository.delete(familyDetails);
    }

    private FamilyDetailsDto mapToDto(FamilyDetails entity) {
        FamilyDetailsDto dto = new FamilyDetailsDto();
        dto.setFamilyId(entity.getFamilyId());
        dto.setUserFormId(entity.getUserFormId());
        dto.setFatherName(entity.getFatherName());
        dto.setFatherOccupation(entity.getFatherOccupation());
        dto.setMotherName(entity.getMotherName());
        dto.setMotherOccupation(entity.getMotherOccupation());
        dto.setSiblings(entity.getSiblings());
        dto.setSiblingOccupation(entity.getSiblingOccupation());
        dto.setCreatedTime(entity.getCreatedTime());
        dto.setUpdatedTime(entity.getUpdatedTime());
        return dto;
    }

    private FamilyDetails mapToEntity(FamilyDetailsDto dto) {
        FamilyDetails entity = new FamilyDetails();
        entity.setFamilyId(dto.getFamilyId());
        entity.setUserFormId(dto.getUserFormId());
        entity.setFatherName(dto.getFatherName());
        entity.setFatherOccupation(dto.getFatherOccupation());
        entity.setMotherName(dto.getMotherName());
        entity.setMotherOccupation(dto.getMotherOccupation());
        entity.setSiblings(dto.getSiblings());
        entity.setSiblingOccupation(dto.getSiblingOccupation());
        return entity;
    }
}

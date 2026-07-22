package dev.dept.pe.service;

import dev.dept.pe.dto.FamilyDetailsDto;

public interface FamilyDetailsService {
    FamilyDetailsDto createFamilyDetails(FamilyDetailsDto familyDetailsDto);
    FamilyDetailsDto getFamilyDetailsById(Long id);
    FamilyDetailsDto getFamilyDetailsByUserFormId(Long userFormId);
    FamilyDetailsDto updateFamilyDetails(Long id, FamilyDetailsDto familyDetailsDto);
    void deleteFamilyDetails(Long id);
}

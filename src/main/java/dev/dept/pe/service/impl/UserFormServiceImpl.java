package dev.dept.pe.service.impl;

import dev.dept.pe.dto.UserFormDto;
import dev.dept.pe.exception.ResourceNotFoundException;
import dev.dept.pe.model.UserForm;
import dev.dept.pe.repository.UserFormRepository;
import dev.dept.pe.service.UserFormService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserFormServiceImpl implements UserFormService {

    private final UserFormRepository userFormRepository;

    @Autowired
    public UserFormServiceImpl(UserFormRepository userFormRepository) {
        this.userFormRepository = userFormRepository;
    }

    @Override
    public UserFormDto createUserForm(UserFormDto dto) {
        // Validate duplicates
        if (userFormRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists in forms: " + dto.getEmail());
        }
        if (userFormRepository.findByMobileNo(dto.getMobileNo()).isPresent()) {
            throw new IllegalArgumentException("Mobile number already exists in forms: " + dto.getMobileNo());
        }

        UserForm form = mapToEntity(dto);
        
        // Hash password
        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            form.setPassword(BCrypt.hashpw(dto.getPassword(), BCrypt.gensalt()));
        } else {
            throw new IllegalArgumentException("Password is required for registration");
        }

        UserForm savedForm = userFormRepository.save(form);
        return mapToDto(savedForm);
    }

    @Override
    public UserFormDto getUserFormById(Long id) {
        UserForm form = userFormRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate form not found with ID: " + id));
        return mapToDto(form);
    }

    @Override
    public List<UserFormDto> getAllUserForms() {
        List<UserForm> forms = userFormRepository.findAll();
        return forms.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public UserFormDto updateUserForm(Long id, UserFormDto dto) {
        UserForm form = userFormRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate form not found with ID: " + id));

        // Validate duplicates for email
        Optional<UserForm> existingEmailForm = userFormRepository.findByEmail(dto.getEmail());
        if (existingEmailForm.isPresent() && !existingEmailForm.get().getId().equals(id)) {
            throw new IllegalArgumentException("Email already exists: " + dto.getEmail());
        }

        // Validate duplicates for mobile number
        Optional<UserForm> existingMobileForm = userFormRepository.findByMobileNo(dto.getMobileNo());
        if (existingMobileForm.isPresent() && !existingMobileForm.get().getId().equals(id)) {
            throw new IllegalArgumentException("Mobile number already exists: " + dto.getMobileNo());
        }

        form.setName(dto.getName());
        form.setEmail(dto.getEmail());
        form.setBatch(dto.getBatch());
        form.setGender(dto.getGender());
        form.setDob(dto.getDob());
        form.setRegion(dto.getRegion());
        form.setCommunity(dto.getCommunity());
        form.setMobileNo(dto.getMobileNo());
        form.setBloodGroup(dto.getBloodGroup());
        form.setNationality(dto.getNationality());
        form.setSpecialization(dto.getSpecialization());
        form.setPermanentAddress(dto.getPermanentAddress());
        form.setGuardianAddress(dto.getGuardianAddress());
        form.setPurposeOfStudyingCourse(dto.getPurposeOfStudyingCourse());
        form.setSportsAchievement(dto.getSportsAchievement());
        form.setExtraCurricular(dto.getExtraCurricular());
        form.setOnlineCourse(dto.getOnlineCourse());
        form.setReferredBy(dto.getReferredBy());

        // Update password if provided
        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            form.setPassword(BCrypt.hashpw(dto.getPassword(), BCrypt.gensalt()));
        }

        UserForm updatedForm = userFormRepository.save(form);
        return mapToDto(updatedForm);
    }

    @Override
    public void deleteUserForm(Long id) {
        UserForm form = userFormRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate form not found with ID: " + id));
        userFormRepository.delete(form);
    }

    private UserFormDto mapToDto(UserForm form) {
        UserFormDto dto = new UserFormDto();
        dto.setId(form.getId());
        dto.setName(form.getName());
        dto.setEmail(form.getEmail());
        // Exclude showing hashed password in outbound DTO
        dto.setPassword(null);
        dto.setBatch(form.getBatch());
        dto.setGender(form.getGender());
        dto.setDob(form.getDob());
        dto.setRegion(form.getRegion());
        dto.setCommunity(form.getCommunity());
        dto.setMobileNo(form.getMobileNo());
        dto.setBloodGroup(form.getBloodGroup());
        dto.setNationality(form.getNationality());
        dto.setSpecialization(form.getSpecialization());
        dto.setPermanentAddress(form.getPermanentAddress());
        dto.setGuardianAddress(form.getGuardianAddress());
        dto.setPurposeOfStudyingCourse(form.getPurposeOfStudyingCourse());
        dto.setSportsAchievement(form.getSportsAchievement());
        dto.setExtraCurricular(form.getExtraCurricular());
        dto.setOnlineCourse(form.getOnlineCourse());
        dto.setReferredBy(form.getReferredBy());
        dto.setCreatedTime(form.getCreatedTime());
        dto.setUpdatedTime(form.getUpdatedTime());
        return dto;
    }

    private UserForm mapToEntity(UserFormDto dto) {
        UserForm form = new UserForm();
        form.setId(dto.getId());
        form.setName(dto.getName());
        form.setEmail(dto.getEmail());
        form.setBatch(dto.getBatch());
        form.setGender(dto.getGender());
        form.setDob(dto.getDob());
        form.setRegion(dto.getRegion());
        form.setCommunity(dto.getCommunity());
        form.setMobileNo(dto.getMobileNo());
        form.setBloodGroup(dto.getBloodGroup());
        form.setNationality(dto.getNationality());
        form.setSpecialization(dto.getSpecialization());
        form.setPermanentAddress(dto.getPermanentAddress());
        form.setGuardianAddress(dto.getGuardianAddress());
        form.setPurposeOfStudyingCourse(dto.getPurposeOfStudyingCourse());
        form.setSportsAchievement(dto.getSportsAchievement());
        form.setExtraCurricular(dto.getExtraCurricular());
        form.setOnlineCourse(dto.getOnlineCourse());
        form.setReferredBy(dto.getReferredBy());
        return form;
    }
}

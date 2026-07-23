package dev.dept.pe.service.impl;

import dev.dept.pe.dto.HealthFitnessDto;
import dev.dept.pe.exception.ResourceNotFoundException;
import dev.dept.pe.model.HealthFitness;
import dev.dept.pe.repository.HealthFitnessRepository;
import dev.dept.pe.service.HealthFitnessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HealthFitnessServiceImpl implements HealthFitnessService {

    private final HealthFitnessRepository repository;

    @Autowired
    public HealthFitnessServiceImpl(HealthFitnessRepository repository) {
        this.repository = repository;
    }

    @Override
    public HealthFitnessDto create(HealthFitnessDto dto) {
        HealthFitness entity = mapToEntity(dto);
        calculateBmiIfNeeded(entity);
        HealthFitness saved = repository.save(entity);
        return mapToDto(saved);
    }

    @Override
    public List<HealthFitnessDto> getAll(Integer userId) {
        List<HealthFitness> list;
        if (userId != null) {
            list = repository.findByUserId(userId);
        } else {
            list = repository.findAll();
        }
        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public HealthFitnessDto getById(Long id) {
        HealthFitness entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Health fitness record not found with ID: " + id));
        return mapToDto(entity);
    }

    @Override
    public HealthFitnessDto getByUserId(Integer userId) {
        HealthFitness entity = repository.findFirstByUserIdOrderByCreatedAtDesc(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No health fitness record found for user ID: " + userId));
        return mapToDto(entity);
    }

    @Override
    public HealthFitnessDto update(Long id, HealthFitnessDto dto) {
        HealthFitness entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Health fitness record not found with ID: " + id));

        if (dto.getUserId() != null) entity.setUserId(dto.getUserId());
        if (dto.getHeightCm() != null) entity.setHeightCm(dto.getHeightCm());
        if (dto.getWeightKg() != null) entity.setWeightKg(dto.getWeightKg());
        if (dto.getBloodGroup() != null) entity.setBloodGroup(dto.getBloodGroup());
        if (dto.getHeartRate() != null) entity.setHeartRate(dto.getHeartRate());
        if (dto.getFitnessLevel() != null) entity.setFitnessLevel(dto.getFitnessLevel());
        if (dto.getMedicalConditions() != null) entity.setMedicalConditions(dto.getMedicalConditions());
        if (dto.getAllergies() != null) entity.setAllergies(dto.getAllergies());
        if (dto.getEmergencyNotes() != null) entity.setEmergencyNotes(dto.getEmergencyNotes());
        if (dto.getLastCheckup() != null) entity.setLastCheckup(dto.getLastCheckup());

        if (dto.getBmi() != null) {
            entity.setBmi(dto.getBmi());
        } else {
            calculateBmiIfNeeded(entity);
        }

        HealthFitness updated = repository.save(entity);
        return mapToDto(updated);
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Health fitness record not found with ID: " + id);
        }
        repository.deleteById(id);
    }

    private void calculateBmiIfNeeded(HealthFitness entity) {
        if (entity.getHeightCm() != null && entity.getWeightKg() != null && entity.getHeightCm().doubleValue() > 0) {
            double heightM = entity.getHeightCm().doubleValue() / 100.0;
            double weight = entity.getWeightKg().doubleValue();
            double bmiVal = weight / (heightM * heightM);
            entity.setBmi(BigDecimal.valueOf(bmiVal).setScale(2, RoundingMode.HALF_UP));
        }
    }

    private HealthFitnessDto mapToDto(HealthFitness entity) {
        HealthFitnessDto dto = new HealthFitnessDto();
        dto.setRecordId(entity.getRecordId());
        dto.setUserId(entity.getUserId());
        dto.setHeightCm(entity.getHeightCm());
        dto.setWeightKg(entity.getWeightKg());
        dto.setBmi(entity.getBmi());
        dto.setBloodGroup(entity.getBloodGroup());
        dto.setHeartRate(entity.getHeartRate());
        dto.setFitnessLevel(entity.getFitnessLevel());
        dto.setMedicalConditions(entity.getMedicalConditions());
        dto.setAllergies(entity.getAllergies());
        dto.setEmergencyNotes(entity.getEmergencyNotes());
        dto.setLastCheckup(entity.getLastCheckup());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    private HealthFitness mapToEntity(HealthFitnessDto dto) {
        HealthFitness entity = new HealthFitness();
        entity.setRecordId(dto.getRecordId());
        entity.setUserId(dto.getUserId());
        entity.setHeightCm(dto.getHeightCm());
        entity.setWeightKg(dto.getWeightKg());
        entity.setBmi(dto.getBmi());
        entity.setBloodGroup(dto.getBloodGroup());
        entity.setHeartRate(dto.getHeartRate());
        entity.setFitnessLevel(dto.getFitnessLevel());
        entity.setMedicalConditions(dto.getMedicalConditions());
        entity.setAllergies(dto.getAllergies());
        entity.setEmergencyNotes(dto.getEmergencyNotes());
        entity.setLastCheckup(dto.getLastCheckup());
        return entity;
    }
}

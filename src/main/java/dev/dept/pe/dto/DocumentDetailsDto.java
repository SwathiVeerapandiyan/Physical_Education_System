package dev.dept.pe.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public class DocumentDetailsDto {

    private Long documentId;

    @NotNull(message = "User form ID is required")
    private Long userFormId;

    @Size(max = 255, message = "Candidate signature path must not exceed 255 characters")
    private String candidateSignature;

    @Size(max = 255, message = "Parent signature path must not exceed 255 characters")
    private String parentSignature;

    @Size(max = 255, message = "Mark 12 certificate path must not exceed 255 characters")
    private String mark12Certificate;

    @Size(max = 255, message = "Transfer certificate path must not exceed 255 characters")
    private String transferCertificate;

    @Size(max = 255, message = "Admission card path must not exceed 255 characters")
    private String admissionCard;

    @Size(max = 255, message = "Fee receipt path must not exceed 255 characters")
    private String feeReceipt;

    @Size(max = 255, message = "Fitness medical certificate path must not exceed 255 characters")
    private String fitnessMedicalCertificate;

    @Size(max = 255, message = "Community certificate path must not exceed 255 characters")
    private String communityCertificate;

    @Size(max = 255, message = "Aadhar card path must not exceed 255 characters")
    private String aadharCard;

    @Size(max = 255, message = "Income certificate path must not exceed 255 characters")
    private String incomeCertificate;

    @Size(max = 255, message = "Sports certificate path must not exceed 255 characters")
    private String sportsCertificate;

    @Size(max = 255, message = "Eligibility certificate path must not exceed 255 characters")
    private String eligibilityCertificate;

    private LocalDateTime createdTime;
    private LocalDateTime updatedTime;

    // Constructors
    public DocumentDetailsDto() {
    }

    // Getters and Setters
    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public Long getUserFormId() {
        return userFormId;
    }

    public void setUserFormId(Long userFormId) {
        this.userFormId = userFormId;
    }

    public String getCandidateSignature() {
        return candidateSignature;
    }

    public void setCandidateSignature(String candidateSignature) {
        this.candidateSignature = candidateSignature;
    }

    public String getParentSignature() {
        return parentSignature;
    }

    public void setParentSignature(String parentSignature) {
        this.parentSignature = parentSignature;
    }

    public String getMark12Certificate() {
        return mark12Certificate;
    }

    public void setMark12Certificate(String mark12Certificate) {
        this.mark12Certificate = mark12Certificate;
    }

    public String getTransferCertificate() {
        return transferCertificate;
    }

    public void setTransferCertificate(String transferCertificate) {
        this.transferCertificate = transferCertificate;
    }

    public String getAdmissionCard() {
        return admissionCard;
    }

    public void setAdmissionCard(String admissionCard) {
        this.admissionCard = admissionCard;
    }

    public String getFeeReceipt() {
        return feeReceipt;
    }

    public void setFeeReceipt(String feeReceipt) {
        this.feeReceipt = feeReceipt;
    }

    public String getFitnessMedicalCertificate() {
        return fitnessMedicalCertificate;
    }

    public void setFitnessMedicalCertificate(String fitnessMedicalCertificate) {
        this.fitnessMedicalCertificate = fitnessMedicalCertificate;
    }

    public String getCommunityCertificate() {
        return communityCertificate;
    }

    public void setCommunityCertificate(String communityCertificate) {
        this.communityCertificate = communityCertificate;
    }

    public String getAadharCard() {
        return aadharCard;
    }

    public void setAadharCard(String aadharCard) {
        this.aadharCard = aadharCard;
    }

    public String getIncomeCertificate() {
        return incomeCertificate;
    }

    public void setIncomeCertificate(String incomeCertificate) {
        this.incomeCertificate = incomeCertificate;
    }

    public String getSportsCertificate() {
        return sportsCertificate;
    }

    public void setSportsCertificate(String sportsCertificate) {
        this.sportsCertificate = sportsCertificate;
    }

    public String getEligibilityCertificate() {
        return eligibilityCertificate;
    }

    public void setEligibilityCertificate(String eligibilityCertificate) {
        this.eligibilityCertificate = eligibilityCertificate;
    }

    public LocalDateTime getCreatedTime() {
        return createdTime;
    }

    public void setCreatedTime(LocalDateTime createdTime) {
        this.createdTime = createdTime;
    }

    public LocalDateTime getUpdatedTime() {
        return updatedTime;
    }

    public void setUpdatedTime(LocalDateTime updatedTime) {
        this.updatedTime = updatedTime;
    }
}

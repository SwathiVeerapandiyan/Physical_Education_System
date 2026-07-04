package dev.dept.pe.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "document_details")
public class DocumentDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "document_id")
    private Long documentId;

    @Column(name = "user_form_id", unique = true, nullable = false)
    private Long userFormId;

    @Column(name = "candidate_signature", length = 255)
    private String candidateSignature;

    @Column(name = "parent_signature", length = 255)
    private String parentSignature;

    @Column(name = "mark_12_certificate", length = 255)
    private String mark12Certificate;

    @Column(name = "transfer_certificate", length = 255)
    private String transferCertificate;

    @Column(name = "admission_card", length = 255)
    private String admissionCard;

    @Column(name = "fee_receipt", length = 255)
    private String feeReceipt;

    @Column(name = "fitness_medical_certificate", length = 255)
    private String fitnessMedicalCertificate;

    @Column(name = "community_certificate", length = 255)
    private String communityCertificate;

    @Column(name = "aadhar_card", length = 255)
    private String aadharCard;

    @Column(name = "income_certificate", length = 255)
    private String incomeCertificate;

    @Column(name = "sports_certificate", length = 255)
    private String sportsCertificate;

    @Column(name = "eligibility_certificate", length = 255)
    private String eligibilityCertificate;

    @Column(name = "created_time", insertable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdTime;

    @Column(name = "updated_time", insertable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime updatedTime;

    // Constructors
    public DocumentDetails() {
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

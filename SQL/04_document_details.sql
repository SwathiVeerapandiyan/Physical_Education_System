CREATE TABLE document_details (
                                  document_id SERIAL PRIMARY KEY,
                                  user_form_id INT UNIQUE REFERENCES users_form(id) ON DELETE CASCADE,
                                  candidate_signature VARCHAR(255),
                                  parent_signature VARCHAR(255),
                                  mark_12_certificate VARCHAR(255),
                                  transfer_certificate VARCHAR(255),
                                  admission_card VARCHAR(255),
                                  fee_receipt VARCHAR(255),
                                  fitness_medical_certificate VARCHAR(255),
                                  community_certificate VARCHAR(255),
                                  aadhar_card VARCHAR(255),
                                  income_certificate VARCHAR(255),
                                  sports_certificate VARCHAR(255),
                                  eligibility_certificate VARCHAR(255),
                                  created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                  updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
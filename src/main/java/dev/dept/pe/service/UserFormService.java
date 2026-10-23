package dev.dept.pe.service;

import dev.dept.pe.dto.UserFormDto;
import java.util.List;

public interface UserFormService {
    UserFormDto createUserForm(UserFormDto userFormDto);
    UserFormDto getUserFormById(Long id);
    UserFormDto getUserFormByEmail(String email);
    List<UserFormDto> getAllUserForms();
    UserFormDto updateUserForm(Long id, UserFormDto userFormDto);
    void deleteUserForm(Long id);
}


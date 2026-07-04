package dev.dept.pe.service;

import dev.dept.pe.dto.UserDto;
import java.util.List;

public interface UserService {
    UserDto createUser(UserDto userDto);
    UserDto getUserById(Long userId);
    List<UserDto> getAllUsers();
    UserDto updateUser(Long userId, UserDto userDto);
    UserDto getUserByEmailOrRegisterNo(String username);
}

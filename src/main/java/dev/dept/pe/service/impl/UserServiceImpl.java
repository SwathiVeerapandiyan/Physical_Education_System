package dev.dept.pe.service.impl;

import dev.dept.pe.dto.UserDto;
import dev.dept.pe.exception.ResourceNotFoundException;
import dev.dept.pe.model.User;
import dev.dept.pe.repository.UserRepository;
import dev.dept.pe.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDto createUser(UserDto userDto) {
        // Check duplicate email
        if (userRepository.findByEmail(userDto.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists: " + userDto.getEmail());
        }
        // Check duplicate register number
        if (userRepository.findByRegisterNo(userDto.getRegisterNo()).isPresent()) {
            throw new IllegalArgumentException("Register number already exists: " + userDto.getRegisterNo());
        }

        User user = mapToEntity(userDto);
        
        // Hash password
        if (userDto.getPassword() != null && !userDto.getPassword().trim().isEmpty()) {
            user.setPassword(BCrypt.hashpw(userDto.getPassword(), BCrypt.gensalt()));
        } else {
            throw new IllegalArgumentException("Password is required for user creation");
        }

        User savedUser = userRepository.save(user);
        return mapToDto(savedUser);
    }

    @Override
    public UserDto getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        return mapToDto(user);
    }

    @Override
    public List<UserDto> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public UserDto updateUser(Long userId, UserDto userDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Check if updating email conflicts with another user
        Optional<User> emailUser = userRepository.findByEmail(userDto.getEmail());
        if (emailUser.isPresent() && !emailUser.get().getUserId().equals(userId)) {
            throw new IllegalArgumentException("Email already exists: " + userDto.getEmail());
        }

        // Check if updating register number conflicts with another user
        Optional<User> registerUser = userRepository.findByRegisterNo(userDto.getRegisterNo());
        if (registerUser.isPresent() && !registerUser.get().getUserId().equals(userId)) {
            throw new IllegalArgumentException("Register number already exists: " + userDto.getRegisterNo());
        }

        user.setName(userDto.getName());
        user.setDept(userDto.getDept());
        user.setRegisterNo(userDto.getRegisterNo());
        user.setEmail(userDto.getEmail());
        user.setMobileNo(userDto.getMobileNo());

        // Update password only if provided
        if (userDto.getPassword() != null && !userDto.getPassword().trim().isEmpty()) {
            user.setPassword(BCrypt.hashpw(userDto.getPassword(), BCrypt.gensalt()));
        }

        User updatedUser = userRepository.save(user);
        return mapToDto(updatedUser);
    }

    @Override
    public UserDto getUserByEmailOrRegisterNo(String username) {
        Optional<User> userOpt = userRepository.findByEmail(username);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByRegisterNo(username);
        }
        User user = userOpt.orElseThrow(() -> new ResourceNotFoundException("User not found with username/register number: " + username));
        return mapToDto(user);
    }

    private UserDto mapToDto(User user) {
        UserDto dto = new UserDto();
        dto.setUserId(user.getUserId());
        dto.setName(user.getName());
        dto.setDept(user.getDept());
        dto.setRegisterNo(user.getRegisterNo());
        dto.setEmail(user.getEmail());
        dto.setMobileNo(user.getMobileNo());
        dto.setCreatedTime(user.getCreatedTime());
        dto.setUpdatedTime(user.getUpdatedTime());
        return dto;
    }

    private User mapToEntity(UserDto dto) {
        User user = new User();
        user.setUserId(dto.getUserId());
        user.setName(dto.getName());
        user.setDept(dto.getDept());
        user.setRegisterNo(dto.getRegisterNo());
        user.setEmail(dto.getEmail());
        user.setMobileNo(dto.getMobileNo());
        return user;
    }
}

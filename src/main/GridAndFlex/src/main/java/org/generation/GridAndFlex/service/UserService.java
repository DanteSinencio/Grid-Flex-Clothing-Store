package org.generation.GridAndFlex.service;

import org.generation.GridAndFlex.model.User;
import org.generation.GridAndFlex.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllUserService() {
        return userRepository.findAll();
    }
}

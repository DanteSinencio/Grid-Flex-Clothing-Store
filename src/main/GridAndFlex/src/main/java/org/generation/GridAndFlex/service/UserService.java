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





    public User updateUser(Long id, User user){
        User existingUser = userRepository.findById(id).orElseThrow(()-> new RuntimeException("Usuario no encontrado"));
        existingUser.setNombre(user.getNombre());
        existingUser.setApellido(user.getApellido());
        existingUser.setRoles(user.getRoles());
        existingUser.setCorreo(user.getCorreo());
        existingUser.setContrasena(user.getContrasena());
        existingUser.setTelefono(user.getTelefono());

        return userRepository.save(existingUser);
    }

    public void deleteUser(Long id){
        userRepository.deleteById(id);
    public User findById(Long id){
        return userRepository.findById(id).orElse(null);
    }

    public User addUser(User user){
        return userRepository.save(user);
    }
}


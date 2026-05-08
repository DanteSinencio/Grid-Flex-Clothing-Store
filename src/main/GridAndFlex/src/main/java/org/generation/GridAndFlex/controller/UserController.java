package org.generation.GridAndFlex.controller;

import org.generation.GridAndFlex.model.User;
import org.generation.GridAndFlex.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<User> getAllUsers(){
        return userService.getAllUserService();
    }





    @PutMapping
    public User updateUser(@PathVariable Long id, @RequestBody User user){
        return userService.updateUser(id, user);
    }

    @DeleteMapping
    public void deleteUser(@PathVariable Long id){
        userService.deleteUser(id);
    }

}

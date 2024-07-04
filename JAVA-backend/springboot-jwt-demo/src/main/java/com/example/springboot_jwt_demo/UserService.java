package com.example.springboot_jwt_demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User findByAccount(String account) {
        return userRepository.findByAccount(account);
    }

}


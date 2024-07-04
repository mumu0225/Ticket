package com.example.springboot_jwt_demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

@Service
public class DatabaseService {

    @Autowired
    private DataSource dataSource;

    public boolean checkDatabaseConnection() {
        try (Connection connection = dataSource.getConnection()) {
            return true;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}

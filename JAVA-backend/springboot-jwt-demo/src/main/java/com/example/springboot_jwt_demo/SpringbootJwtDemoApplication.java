package com.example.springboot_jwt_demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

@SpringBootApplication
public class SpringbootJwtDemoApplication {

	public static void main(String[] args) {
		ConfigurableApplicationContext context = SpringApplication.run(SpringbootJwtDemoApplication.class, args);
        DatabaseService databaseService = context.getBean(DatabaseService.class);

        boolean isDatabaseConnected = databaseService.checkDatabaseConnection();
        if (isDatabaseConnected) {
            System.out.println("Database connection is successful.");
        } else {
            System.out.println("Failed to connect to the database.");
        }
	}

}

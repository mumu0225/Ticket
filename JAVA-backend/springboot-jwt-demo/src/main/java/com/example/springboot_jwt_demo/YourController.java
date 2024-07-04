package com.example.springboot_jwt_demo;

import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.apache.shiro.authz.annotation.RequiresRoles;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class YourController {

    @GetMapping("/secure")
    @RequiresPermissions("secure:view")
    public String secure() {
        return "Secure Page";
    }

    @GetMapping("/admin")
    @RequiresRoles("admin")
    public String admin() {
        return "Admin Page";
    }
}

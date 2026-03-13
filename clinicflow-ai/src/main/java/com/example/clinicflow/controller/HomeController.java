package com.example.clinicflow.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "redirect:/todo";
    }

    @GetMapping("/todo")
    public String todo() {
        return "forward:/admin-dashboard.html";
    }
}

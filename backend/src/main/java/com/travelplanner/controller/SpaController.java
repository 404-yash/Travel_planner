package com.travelplanner.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class SpaController {

    private final Resource indexHtml = new ClassPathResource("static/index.html");

    @GetMapping(value = {
        "/",
        "/index.html",
        "/login",
        "/my-bookings",
        "/admin",
        "/trip/**",
        "/about",
        "/spot"
    }, produces = MediaType.TEXT_HTML_VALUE)
    @ResponseBody
    public ResponseEntity<Resource> serveSpa() {
        return ResponseEntity.ok(indexHtml);
    }
}

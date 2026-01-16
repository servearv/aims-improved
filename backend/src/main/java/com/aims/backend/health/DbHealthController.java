package com.aims.backend.health;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

@RestController
public class DbHealthController {

    private final DataSource dataSource;

    public DbHealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping("/health/db")
    public String dbHealth() {
        try (
            Connection conn = dataSource.getConnection();
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT 1");
        ) {
            rs.next();
            return "DB OK";
        } catch (Exception e) {
            return "DB ERROR: " + e.getMessage();
        }
    }
}

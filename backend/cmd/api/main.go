package main

import (
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/yourusername/aims-backend/internal/database" // Import your database package
	"log"
)

func main() {
	// 1. Load .env variables
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// 2. Connect to Database
	database.ConnectDB()

	// 3. Setup Router (Gin)
	r := gin.Default()

	// 4. Define a test route
	r.GET("/health", func(c *gin.Context) {
		// Check if DB is actually pingable
		sqlDB, _ := database.DB.DB()
		err := sqlDB.Ping()
		
		if err != nil {
			c.JSON(500, gin.H{"status": "error", "message": "Database not reachable"})
			return
		}

		c.JSON(200, gin.H{
			"status": "active",
			"message": "AIMS System is running",
		})
	})

	// 5. Start Server
	r.Run(":8080") // Runs on localhost:8080
}

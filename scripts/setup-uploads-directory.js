const fs = require("fs")
const path = require("path")

// Create uploads directory structure
const uploadsDir = path.join(process.cwd(), "public", "uploads")
const reportsDir = path.join(uploadsDir, "reports")

try {
  // Create uploads directory if it doesn't exist
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
    console.log("✅ Created uploads directory")
  }

  // Create reports directory if it doesn't exist
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true })
    console.log("✅ Created reports directory")
  }

  // Create .gitkeep file to ensure directory is tracked
  const gitkeepPath = path.join(reportsDir, ".gitkeep")
  if (!fs.existsSync(gitkeepPath)) {
    fs.writeFileSync(gitkeepPath, "")
    console.log("✅ Created .gitkeep file")
  }

  console.log("🎉 Upload directories setup complete!")
  console.log("📁 Files will be stored in: public/uploads/reports/")
} catch (error) {
  console.error("❌ Error setting up directories:", error)
}

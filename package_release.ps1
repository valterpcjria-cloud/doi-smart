# Release v2.1.28 Packaging

# 1. Create a staging directory
New-Item -Path "release-v2.1.28" -ItemType Directory -Force

# 2. Copy the built frontend (dist) to the staging directory
Copy-Item -Path "dist\*" -Destination "release-v2.1.28\" -Recurse

# 3. Copy the backend files from deploy/ to the staging directory
Copy-Item -Path "deploy\.htaccess" -Destination "release-v2.1.28\"
Copy-Item -Path "deploy\api.php" -Destination "release-v2.1.28\"
Copy-Item -Path "deploy\database.php" -Destination "release-v2.1.28\"
Copy-Item -Path "deploy\update_db_v2_1_20.php" -Destination "release-v2.1.28\"
Copy-Item -Path "config.php" -Destination "release-v2.1.28\"
Copy-Item -Path "deploy\config.example.php" -Destination "release-v2.1.28\"

# 4. Create the zip package
tar -a -c -f deploy-doi-smart-v2.1.28.zip release-v2.1.28/*

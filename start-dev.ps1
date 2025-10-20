# Start server
Start-Process powershell -ArgumentList "npm run dev" -WorkingDirectory "$PSScriptRoot\server"

# Start UI client
Start-Process powershell -ArgumentList "npm run dev" -WorkingDirectory "$PSScriptRoot\ui"

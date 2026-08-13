# Azue OpenAI Configuration
$env:AZURE_OPENAI_BASE_URL = "https://YOUR_RESOURCE_NAME.openai.azure.com/"
$env:AZURE_OPENAI_API_KEY = "YOUR_API_KEY"
$env:AZURE_OPENAI_API_VERSION = "2023-05-15"

Write-Host "Environment variables set for Azure OpenAI." -ForegroundColor Green
Write-Host "You can now run 'pi' in this terminal session." -ForegroundColor Cyan

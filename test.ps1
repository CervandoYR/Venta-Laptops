try {
    $body = @{
        clientId = "client-id-here"
        deviceType = "Laptop"
        deviceBrand = "HP"
        deviceModel = "Pavilion"
        issueReported = "Screen broken"
        totalAmount = 100
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://localhost:3000/api/servicios" -Method Post -Body $body -ContentType "application/json"
} catch {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Host "ERROR RESPONSE:"
    $reader.ReadToEnd()
}

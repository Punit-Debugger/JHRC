$postUri = "https://jhrc.onrender.com/admin/login"
$body = '{"username": "dummy_user", "password": "dummy_password"}'
$status = $null
$headers = $null
$respBody = $null

try {
    $res = Invoke-WebRequest -Uri $postUri -Method Post -Body $body -ContentType "application/json" -UseBasicParsing
    $status = $res.StatusCode
    $headers = $res.Headers
    $respBody = $res.Content
} catch {
    $res = $_.Exception.Response
    if ($res) {
        $status = [int]$res.StatusCode
        $headers = $res.Headers
        $stream = $res.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $respBody = $reader.ReadToEnd()
        $reader.Close()
        $stream.Close()
    } else {
        $status = "Error"
        $respBody = $_.Exception.Message
    }
}

Write-Output "=== POST /admin/login ==="
Write-Output "Status Code: $status"
if ($headers) {
    Write-Output "Content-Length: $($headers['Content-Length'])"
    Write-Output "Content-Type: $($headers['Content-Type'])"
}
Write-Output "Raw Body: $respBody"

# GET test-route
$get1Uri = "https://jhrc.onrender.com/test-route"
try {
    $res1 = Invoke-WebRequest -Uri $get1Uri -Method Get -UseBasicParsing
    $get1Body = $res1.Content
} catch {
    $res = $_.Exception.Response
    if ($res) {
        $stream = $res.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $get1Body = $reader.ReadToEnd()
        $reader.Close()
        $stream.Close()
    } else {
        $get1Body = $_.Exception.Message
    }
}
Write-Output "`n=== GET /test-route ==="
Write-Output "Raw Body: $get1Body"

# GET /
$get2Uri = "https://jhrc.onrender.com/"
try {
    $res2 = Invoke-WebRequest -Uri $get2Uri -Method Get -UseBasicParsing
    $get2Body = $res2.Content
} catch {
    $res = $_.Exception.Response
    if ($res) {
        $stream = $res.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $get2Body = $reader.ReadToEnd()
        $reader.Close()
        $stream.Close()
    } else {
        $get2Body = $_.Exception.Message
    }
}
Write-Output "`n=== GET / ==="
Write-Output "Raw Body: $get2Body"

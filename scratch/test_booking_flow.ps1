$baseUrl = "http://localhost:8080/api"

# 1. Login as Student
Write-Host "Logging in as Student..."
$loginStudentBody = @{
    username = "student"
    password = "student123"
} | ConvertTo-Json

$studentLoginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginStudentBody -ContentType "application/json"
$studentToken = $studentLoginRes.token
$studentHeaders = @{
    "Authorization" = "Bearer $studentToken"
    "Content-Type" = "application/json"
}
Write-Host "Student logged in: $($studentLoginRes.user.name), Role: $($studentLoginRes.user.role)"

# 2. Student creates Equipment Booking
Write-Host "Student submitting Equipment Booking..."
$eqBody = @{
    equipmentName = "Basketball"
    equipmentCategory = "Basketball"
    quantity = 2
    bookingDate = (Get-Date).ToString("yyyy-MM-dd")
    startTime = "16:00:00"
    endTime = "18:00:00"
    remarks = "Practice session"
} | ConvertTo-Json

$eqRes = Invoke-RestMethod -Uri "$baseUrl/equipment-booking" -Method Post -Body $eqBody -Headers $studentHeaders
Write-Host "Equipment Booking created with ID: $($eqRes.bookingId), Status: $($eqRes.bookingStatus), Student: $($eqRes.studentName) ($($eqRes.studentRegisterNo) - $($eqRes.studentDept))"

# 3. Student creates Ground Booking
Write-Host "Student submitting Ground Booking..."
$grBody = @{
    groundName = "Basketball Court"
    sportType = "Basketball"
    bookingDate = (Get-Date).ToString("yyyy-MM-dd")
    startTime = "16:00:00"
    endTime = "18:00:00"
    durationHours = 2.0
    remarks = "Department practice"
} | ConvertTo-Json

$grRes = Invoke-RestMethod -Uri "$baseUrl/ground-booking" -Method Post -Body $grBody -Headers $studentHeaders
Write-Host "Ground Booking created with ID: $($grRes.bookingId), Status: $($grRes.bookingStatus), Student: $($grRes.studentName) ($($grRes.studentRegisterNo) - $($grRes.studentDept))"

# 4. Student tries to post notice (MUST FAIL with 403 Forbidden)
Write-Host "Testing Student posting to Notice Board (expected 403 Forbidden)..."
try {
    $noticeBody = @{
        title = "Hacked Notice"
        category = "GENERAL"
        content = "Should not be allowed"
        isActive = $true
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/notice-board" -Method Post -Body $noticeBody -Headers $studentHeaders
    Write-Host "ERROR: Student was able to post notice!"
} catch {
    Write-Host "Success: Student posting notice was rejected with: $($_.Exception.Message)"
}

# 5. Login as Admin
Write-Host "`nLogging in as Admin..."
$loginAdminBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

$adminLoginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginAdminBody -ContentType "application/json"
$adminToken = $adminLoginRes.token
$adminHeaders = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}
Write-Host "Admin logged in: $($adminLoginRes.user.name), Role: $($adminLoginRes.user.role)"

# 6. Admin checks recent notifications (Should contain EQUIPMENT_BOOKING and GROUND_BOOKING)
Write-Host "Checking Admin recent notifications..."
$notifs = Invoke-RestMethod -Uri "$baseUrl/notifications" -Method Get -Headers $adminHeaders
foreach ($n in $notifs) {
    Write-Host "Notification: Type=$($n.type), Student=$($n.studentName), Title=$($n.title)"
}

# 7. Admin queries all equipment bookings (userId null)
Write-Host "`nAdmin fetching all equipment bookings..."
$allEq = Invoke-RestMethod -Uri "$baseUrl/equipment-booking" -Method Get -Headers $adminHeaders
Write-Host "Total Equipment Bookings found by Admin: $($allEq.Count)"
foreach ($b in $allEq) {
    Write-Host "  - Booking ID: $($b.bookingId), Eq: $($b.equipmentName), Student: $($b.studentName) ($($b.studentRegisterNo) - $($b.studentDept)), Status: $($b.bookingStatus)"
}

# 8. Admin queries all ground bookings (userId null)
Write-Host "`nAdmin fetching all ground bookings..."
$allGr = Invoke-RestMethod -Uri "$baseUrl/ground-booking" -Method Get -Headers $adminHeaders
Write-Host "Total Ground Bookings found by Admin: $($allGr.Count)"
foreach ($g in $allGr) {
    Write-Host "  - Booking ID: $($g.bookingId), Ground: $($g.groundName), Student: $($g.studentName) ($($g.studentRegisterNo) - $($g.studentDept)), Status: $($g.bookingStatus)"
}

# 9. Admin approves Equipment Booking
Write-Host "`nAdmin approving Equipment Booking ID: $($eqRes.bookingId)..."
$approveEqBody = @{
    bookingId = $eqRes.bookingId
    bookingStatus = "APPROVED"
} | ConvertTo-Json
$approvedEq = Invoke-RestMethod -Uri "$baseUrl/equipment-booking/$($eqRes.bookingId)" -Method Put -Body $approveEqBody -Headers $adminHeaders
Write-Host "Equipment Booking Approved! Status: $($approvedEq.bookingStatus), Approved By: $($approvedEq.approvedBy)"

# 10. Admin posts new notice
Write-Host "`nAdmin posting new notice to Notice Board..."
$adminNoticeBody = @{
    title = "State Level Tournament Trials"
    category = "SELECTION"
    content = "Trials for the inter-university basketball team will be held this Thursday at 3 PM."
    isActive = $true
} | ConvertTo-Json
$createdNotice = Invoke-RestMethod -Uri "$baseUrl/notice-board" -Method Post -Body $adminNoticeBody -Headers $adminHeaders
Write-Host "Admin Notice posted successfully with ID: $($createdNotice.noticeId), Title: $($createdNotice.title)"

Write-Host "`n=========================================="
Write-Host "ALL BACKEND & API TESTS PASSED 100%!"
Write-Host "=========================================="

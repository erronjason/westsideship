# Delete QUARANTINE files older than 7 days
Get-ChildItem "C:\print-uploads\quarantine" -Recurse | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } | Remove-Item -Force -Recurse

# Delete CLEAN files older than 30 days
Get-ChildItem "C:\print-uploads\clean" -Recurse | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } | Remove-Item -Force -Recurse

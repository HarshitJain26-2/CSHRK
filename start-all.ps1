# CSHRK Master Windows Launcher (PowerShell)
param (
    [switch]$Seed,
    [switch]$Customer,
    [switch]$Worker
)

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  CSHRK — Cooperative Labour & Service Marketplace Launcher" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

$argsList = @("scripts/start-all.js")

if ($Seed) {
    $argsList += "--seed"
}
if ($Customer) {
    $argsList += "--customer"
}
if ($Worker) {
    $argsList += "--worker"
}

node @argsList

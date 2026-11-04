# Compila o APK usando as ferramentas instaladas em F:\android-toolchain.
# Uso: powershell -ExecutionPolicy Bypass -File .\build-local.ps1
$ErrorActionPreference = 'Stop'
$tc = 'F:\android-toolchain'
$env:JAVA_HOME = "$tc\jdk"
$env:ANDROID_HOME = "$tc\sdk"
# Mantém caches e a chave de assinatura no F: (o C: tem pouco espaço).
# A chave de debug fica em android-home\.android: guarde-a, pois atualizações do app dependem dela.
$env:GRADLE_USER_HOME = "$tc\gradle-home"
$env:ANDROID_USER_HOME = "$tc\android-home\.android"
Set-Location $PSScriptRoot
& "$tc\gradle-8.7\bin\gradle.bat" assembleDebug --no-daemon --console=plain
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Copy-Item 'app\build\outputs\apk\debug\app-debug.apk' 'SimuladoENEM.apk' -Force
"APK pronto: $PSScriptRoot\SimuladoENEM.apk ($([math]::Round((Get-Item 'SimuladoENEM.apk').Length/1MB,1)) MB)"

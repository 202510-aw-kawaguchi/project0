@echo off
setlocal

set BASE_DIR=%CD%
:findBaseDir
if exist "%BASE_DIR%\.mvn" goto baseDirFound
for %%i in ("%BASE_DIR%\..") do set BASE_DIR=%%~fi
if "%BASE_DIR%"=="%CD%" goto baseDirNotFound
goto findBaseDir

:baseDirFound
set MAVEN_BIN=%BASE_DIR%\.mvn\apache-maven\bin\mvn.cmd
if not exist "%MAVEN_BIN%" (
  echo Missing bundled Maven executable: %MAVEN_BIN% 1>&2
  exit /B 1
)

call "%MAVEN_BIN%" -Dmaven.repo.local="%BASE_DIR%\.repo" %*
exit /B %ERRORLEVEL%

:baseDirNotFound
echo Error: .mvn directory not found. 1>&2
exit /B 1

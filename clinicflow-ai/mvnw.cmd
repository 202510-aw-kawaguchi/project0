@echo off
setlocal

set BASE_DIR=%CD%
:findBaseDir
if exist "%BASE_DIR%\.mvn" goto baseDirFound
for %%i in ("%BASE_DIR%\..") do set BASE_DIR=%%~fi
if "%BASE_DIR%"=="%CD%" goto baseDirNotFound
goto findBaseDir

:baseDirFound
set WRAPPER_JAR=%BASE_DIR%\.mvn\wrapper\maven-wrapper.jar
if not exist "%WRAPPER_JAR%" (
  echo Missing Maven wrapper jar: %WRAPPER_JAR% 1>&2
  exit /B 1
)

if not "%JAVA_HOME%"=="" if exist "%JAVA_HOME%\bin\java.exe" (
  set JAVACMD=%JAVA_HOME%\bin\java.exe
) else (
  set JAVACMD=java
)
if "%JAVA_HOME%"=="" set JAVACMD=java

"%JAVACMD%" -Dmaven.multiModuleProjectDirectory="%BASE_DIR%" -classpath "%WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain -Dmaven.repo.local="%BASE_DIR%\.repo" %*
exit /B %ERRORLEVEL%

:baseDirNotFound
echo Error: .mvn directory not found. 1>&2
exit /B 1

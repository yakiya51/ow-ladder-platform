@echo off
setlocal
set "batDir=%~dp0"
wt new-tab -d %batDir% cmd /k "npm run client:dev" ; new-tab -d %batDir% cmd /k "npm run server:dev" ; new-tab -d %batDir% cmd /k "npm run db:browse"

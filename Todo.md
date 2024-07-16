1. Control Panel:
    + 1.1. Columns pool
    + 1.2. Rows pool
    + 1.3. Metrics pool
    + 1.4. Filters
    + 1.5. Subtotals?


!!! Start superset backend !!!

cd /opt/superset && source venv/bin/activate && superset run -p 8088 --with-threads --reload --debugger --debug



!!! Start superset frontend !!!
cd /opt/superset/superset-frontend && npm run dev-server
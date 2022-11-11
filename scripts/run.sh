cd ..
./scripts/luna_js_make.sh
sudo /etc/init.d/nginx start
uwsgi --ini scripts/uwsgi.ini

# 归档js和资源文件，启动nginx服务，启动服务器
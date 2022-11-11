#! /bin/bash
JS=/home/mgc/luna/game/static/js/
JS_SRC=${JS}src/
JS_DIST=${JS}dist/

find $JS_SRC -type f -name '*.js' | sort | xargs cat > ${JS_DIST}game.js

echo yes | python3 manage.py collectstatic

# 整合js文件并将static资源归档到根目录
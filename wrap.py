import sys
src,dst=sys.argv[1],sys.argv[2]
body=open(src,encoding='utf-8').read()
head='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px/1.4 system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style></head><body>'
open(dst,'w',encoding='utf-8').write(head+body+'</body></html>')

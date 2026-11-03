"""Convert a .glb into hero.json (+ textures as .jpg/.png) so it can be served where .glb/.bin are not.
Geometry/animation data is embedded as a base64 data: URI; images become separate files next to the JSON."""
import json,struct,base64,sys,os
src,out=sys.argv[1],sys.argv[2]
b=open(src,'rb').read();n=struct.unpack('<I',b[12:16])[0];j=json.loads(b[20:20+n])
o=20+n;bl=struct.unpack('<I',b[o:o+4])[0];BIN=b[o+8:o+8+bl]
base=os.path.splitext(os.path.basename(out))[0];d=os.path.dirname(out)
img_views=set()
for i,im in enumerate(j.get('images',[])):
    bv=j['bufferViews'][im['bufferView']];data=BIN[bv.get('byteOffset',0):bv.get('byteOffset',0)+bv['byteLength']]
    ext='.jpg' if im.get('mimeType')=='image/jpeg' else '.png';name=f'{base}_tex{i}{ext}'
    open(os.path.join(d,name),'wb').write(data);img_views.add(im['bufferView']);im.pop('bufferView');im.pop('mimeType',None);im['uri']=name
# repack remaining buffer views
new=bytearray();remap={};views=[]
for i,bv in enumerate(j['bufferViews']):
    if i in img_views:continue
    data=BIN[bv.get('byteOffset',0):bv.get('byteOffset',0)+bv['byteLength']]
    while len(new)%4:new.append(0)
    nb=dict(bv);nb['byteOffset']=len(new);new+=data;remap[i]=len(views);views.append(nb)
j['bufferViews']=views
for a in j.get('accessors',[]):
    if 'bufferView' in a:a['bufferView']=remap[a['bufferView']]
j['buffers']=[{'byteLength':len(new),'uri':'data:application/octet-stream;base64,'+base64.b64encode(bytes(new)).decode()}]
json.dump(j,open(out,'w'),separators=(',',':'))
print(out,os.path.getsize(out))

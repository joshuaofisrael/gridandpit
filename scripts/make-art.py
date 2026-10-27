"""Original abstract illustrations for Grid and Pit (no real people, cars, logos or marks)."""
import math, random, sys
from PIL import Image, ImageDraw, ImageFilter
W,H=1280,720
NAVY=(7,19,31); LIME=(210,243,74); WHITE=(244,247,242); RED=(214,64,52); GREY=(60,74,88); AMBER=(240,170,60)
def base(bg):
    im=Image.new("RGB",(W,H),bg); d=ImageDraw.Draw(im); return im,d
def checker(d,x,y,w,h,n,c1=WHITE,c2=NAVY):
    s=h/n
    for i in range(int(w/s)+1):
        for j in range(n):
            d.rectangle([x+i*s,y+j*s,x+(i+1)*s,y+(j+1)*s],fill=c1 if (i+j)%2==0 else c2)
def track(d,seed,color=GREY,width=46,edge=WHITE):
    r=random.Random(seed); pts=[]
    cx,cy=W/2,H/2
    for k in range(9):
        a=2*math.pi*k/9; rr=r.uniform(220,330)
        pts.append((cx+rr*1.6*math.cos(a),cy+rr*0.9*math.sin(a)))
    pts.append(pts[0])
    # smooth by Chaikin
    for _ in range(4):
        q=[]
        for a,b in zip(pts,pts[1:]):
            q+= [(0.75*a[0]+0.25*b[0],0.75*a[1]+0.25*b[1]),(0.25*a[0]+0.75*b[0],0.25*a[1]+0.75*b[1])]
        q.append(q[0]); pts=q
    d.line(pts,fill=edge,width=width+8,joint="curve"); d.line(pts,fill=color,width=width,joint="curve")
    return pts
def grid(d,ox,oy,rows,filled,seed):
    r=random.Random(seed)
    for i in range(rows):
        for side in (0,1):
            x=ox+side*170; y=oy+i*110+side*55
            d.line([(x,y),(x+120,y)],fill=WHITE,width=6); d.line([(x,y),(x,y+40)],fill=WHITE,width=6); d.line([(x+120,y),(x+120,y+40)],fill=WHITE,width=6)
            if filled is None or r.random()<filled:
                d.rounded_rectangle([x+18,y+8,x+102,y+34],radius=10,fill=LIME)
def clock(d,cx,cy,r,hh,mm,label_color=WHITE):
    d.ellipse([cx-r,cy-r,cx+r,cy+r],outline=label_color,width=8)
    for k in range(12):
        a=math.pi*2*k/12; d.line([(cx+0.82*r*math.sin(a),cy-0.82*r*math.cos(a)),(cx+0.95*r*math.sin(a),cy-0.95*r*math.cos(a))],fill=label_color,width=5)
    ah=math.pi*2*((hh%12)+mm/60)/12; am=math.pi*2*mm/60
    d.line([(cx,cy),(cx+0.5*r*math.sin(ah),cy-0.5*r*math.cos(ah))],fill=LIME,width=10)
    d.line([(cx,cy),(cx+0.78*r*math.sin(am),cy-0.78*r*math.cos(am))],fill=WHITE,width=6)
def bars(d,vals,color=LIME):
    m=max(vals); bw=(W-200)/len(vals)
    for i,v in enumerate(vals):
        h=(H-200)*v/m; x=100+i*bw
        d.rectangle([x+8,H-100-h,x+bw-8,H-100],fill=color if i==0 else GREY)
def lights(d,on):
    for i in range(5):
        x=340+i*130; d.rounded_rectangle([x,140,x+100,420],radius=20,fill=(20,20,24))
        for j in range(2):
            c=RED if i<on else (50,20,20)
            d.ellipse([x+18,170+j*120,x+82,234+j*120],fill=c)
def save(im,name,outdir):
    im=im.filter(ImageFilter.GaussianBlur(0.6))
    im.save(f"{outdir}/{name}.webp",quality=82); im.save(f"{outdir}/{name}.avif",quality=60)
def make(kind,seed,name,outdir):
    r=random.Random(seed)
    bg=r.choice([NAVY,(12,28,44),(18,24,30)])
    im,d=base(bg)
    if kind=="track":
        track(d,seed); checker(d,0,H-60,W,60,3)
    elif kind=="dusk":
        for y in range(H):
            t=y/H; d.line([(0,y),(W,y)],fill=(int(20+60*t),int(25+20*t),int(60-20*t)))
        track(d,seed,color=(40,44,52)); d.ellipse([980,80,1120,220],fill=AMBER)
    elif kind=="grid":
        d.rectangle([0,0,W,H],fill=(52,58,64)); grid(d,360,60,6,None if seed%2 else 0.6,seed); d.rectangle([0,0,W,40],fill=LIME)
    elif kind=="pit":
        d.rectangle([0,H*0.55,W,H],fill=(52,58,64))
        for i in range(8):
            x=40+i*155; d.rectangle([x,120,x+130,H*0.55],fill=(30,40,52),outline=WHITE,width=4)
        d.line([(0,H*0.75),(W,H*0.75)],fill=WHITE,width=8); d.line([(0,H*0.9),(W,H*0.9)],fill=LIME,width=8)
    elif kind=="flag":
        checker(d,120,100,W-240,H-200,6)
    elif kind=="bars":
        bars(d,[r.randint(30,100) for _ in range(9)] if seed%3 else [365,242,241,236,233,211,144,105,77])
    elif kind=="clocks":
        for i,(hh,mm) in enumerate([(3,0),(2,0),(1,0),(12,0)]):
            clock(d,190+i*300,360,120,hh+(seed%3),mm)
    elif kind=="lights":
        lights(d,seed%6)
    elif kind=="map":
        pts=track(d,seed,color=bg,width=20,edge=LIME)
        for k,p in enumerate(pts[::len(pts)//10][:10]):
            d.ellipse([p[0]-18,p[1]-18,p[0]+18,p[1]+18],fill=WHITE)
    elif kind=="strip":
        for i in range(40):
            x=r.randint(0,W); h=r.randint(120,420); w=r.randint(40,90)
            d.rectangle([x,H-h-160,x+w,H-160],fill=r.choice([(40,30,70),(30,50,80),(60,30,60)]))
            for k in range(0,h,24):
                if r.random()<0.4: d.rectangle([x+8,H-h-160+k+6,x+18,H-h-160+k+14],fill=AMBER)
        d.rectangle([0,H-160,W,H],fill=(30,32,38)); d.line([(0,H-90),(W,H-90)],fill=WHITE,width=8)
    save(im,name,outdir)
if __name__=="__main__":
    outdir=sys.argv[1]
    for spec in sys.argv[2:]:
        name,kind,seed=spec.split(":"); make(kind,int(seed),name,outdir)

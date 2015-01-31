var SIZEOFBOARD = 840

var c=document.getElementById("board");
var ctx=c.getContext("2d");

var battlefieldXSize = 21;
var battlefieldYSize = 21;
var unitSelected = -1;
document.onkeydown = checkKey;

var zones = 
{
    dot : [0,0],
    crux : [0,0,-1,0,1,0,0,-1,0,1],
    radius3 : [0,-2,1,1,2,0,1,-1,0,2,-1,1,-2,0,-1,-1]
};

var started = 0
var testmode = 0
var tick = 0;
battlefield = createBattlefield(21,21)

cursor =
{
    coords :
    {
        x:0,
        y:0
    },
    currentlyHolded : "radar"
}

enemy = 
[
    {
        name : "cestunetrappe",
        hp:100,
        coords :
        {
            x:5,
            y:5
        },
        direction : 45,
        speed : 0.1
    },
    {
        name : "cestunetrappe2",
        hp:100,
        coords :
        {
            x:8,
            y:10.5
        },
        direction : 450,
        speed : 0.1
    } 
]
enemy = []

bullets = []

particles = []
canon =
[
    {
        coords :
        {
            x:11,
            y:10
        },
        direction : 0,
        reloadRate : 5,
        reloadTick : 0,
        damage : 50
    },
    {
        coords :
        {
            x:10,
            y:9
        },
        direction : 270,
        reloadRate : 5,
        reloadTick : 0,
        damage : 50
    },
    {
        coords :
        {
            x:9,
            y:10
        },
        direction : 180,
        reloadRate : 5,
        reloadTick : 0,
        damage : 50
    },
    {
        coords :
        {
            x:10,
            y:11
        },
        direction : 90,
        reloadRate : 5,
        reloadTick : 0,
        damage : 50
    }
]
battlefield[10][11].isSolid=1
battlefield[11][10].isSolid=1
battlefield[10][9].isSolid=1
battlefield[9][10].isSolid=1


buildingDescription =
{
    radar :     
    {
        buildingPattern : zones.crux,
        color : "blue",
        actionPattern : zones.radius3
    }
}


function createBattlefield(x,y)
{
    var map = [];
    for (var i = 0; i <x; i++)
    {
        map[i] = [];
        for (var j = 0; j < y; j++)
        {
            map[i][j] = {
                            poweredByRadar :0,
                            color : 0,
                            isRadar : 0,
                            isCanon : 0
                        }
        }
    }
    map[10][10]=1
    return map;
}

function makeBulidingAOE(x, y, zone )
{
    var whatToPaint = []
    for (i=0;i<zone.length;i+=2)
    {
        x0 = x+zone[i];
        y0 = y+zone[i+1];
        if (x0>=0 && x0<=20 && y0>=0 && y0<=20)
            whatToPaint.push([x0,y0]);
    }
    return whatToPaint;
}

function affBattlefield()
{
    ctx.beginPath();
    ctx.rect(0,0,SIZEOFBOARD,SIZEOFBOARD);
    ctx.fillStyle="black";
    ctx.fill();

    for (var i = 0; i<battlefieldXSize; i++)
    {
        for (var j = 0; j<battlefieldYSize; j++)
        {

            if(battlefield[j][i].color==0)
            {
                ctx.beginPath();
                ctx.rect(i*40+1,j*40+1,40-2,40-2);
                ctx.fillStyle="white";
                ctx.fill();
            }
            else
            {
                ctx.beginPath();
                ctx.rect(i*40+1,j*40+1,40-2,40-2);
                ctx.fillStyle="grey"; 
                ctx.fill();
            }
            if(battlefield[j][i].isRadar==1)
            {
                ctx.beginPath();
                ctx.rect(j*40+6,i*40+6,30-2,30-2);
                ctx.fillStyle="blue"; 
                ctx.fill();
            }
        }
    }
    target = makeBulidingAOE(cursor.coords.x,cursor.coords.y,buildingDescription[cursor.currentlyHolded].actionPattern)
    for(var i=0;i!=target.length;i++)
    {
        ctx.beginPath();
        ctx.rect(target[i][0]*40,target[i][1]*40,40,40);
        ctx.fillStyle="rgba(220, 20, 60, "+((tick%50)/200+0.5)+")" // 211 211 211
        ctx.fill();
    }
    for(var i=0;i!=enemy.length;i++)
    {
        ctx.beginPath();
        ctx.rect(enemy[i].coords.x*40+6,enemy[i].coords.y*40+6,30-2,30-2);
        ctx.fillStyle="red"; 
        ctx.fill();
        ctx.beginPath();
        ctx.rect(enemy[i].coords.x*40+15+8*Math.cos(enemy[i].direction/180*Math.PI),enemy[i].coords.y*40+15+8*Math.sin(enemy[i].direction/180*Math.PI),10,10);
        ctx.fillStyle="black"; 
        ctx.fill();
    }
    for(var i=0;i!=canon.length;i++)
    {
        ctx.beginPath();
        ctx.rect(canon[i].coords.x*40+6,canon[i].coords.y*40+6,30-2,30-2);
        ctx.fillStyle="green"; 
        ctx.fill();
        ctx.beginPath();
        ctx.rect(canon[i].coords.x*40+15+8*Math.cos(canon[i].direction/180*Math.PI),canon[i].coords.y*40+15+8*Math.sin(canon[i].direction/180*Math.PI),10,10);
        ctx.fillStyle="black"; 
        ctx.fill();
    }
    //for(var i=0;i!=radar.length;i++)
    //    for(var j=0;j!=radar.length;j++)
    //    {
    //        if(Math.sqrt(Math.pow(radar[i].coords.x,2)+Math.pow(radar[i].coords.y,2)-(Math.pow(radar[j].coords.x,2)+Math.pow(radar[j].coords.y,2)))<=1)
    //        {
    //            ctx.beginPath();
    //            ctx.rect(radar[i].coords.x*40+6,radar[i].coords.y*40+6,30-2,30-2);
    //            ctx.fillStyle="blue"; 
    //            ctx.fill();
    //        }
    //    }

    for(var i=0;i!=bullets.length;i++)
    {
        ctx.beginPath();
        ctx.rect(bullets[i].coords.x*40+16,bullets[i].coords.y*40+16,8,8);
        ctx.fillStyle="black"; 
        ctx.fill();
    } 
    for(var i=0;i!=particles.length;i++)
    {
        ctx.beginPath();
        if(particles[i].color=="red")
            ctx.rect(particles[i].coords.x*40+13,particles[i].coords.y*40+13,14,14);
        else
            ctx.rect(particles[i].coords.x*40+15,particles[i].coords.y*40+15,10,10)
        ctx.fillStyle=particles[i].color; 
        ctx.fill();
        /// FIX IT UNTIL YOU MAKE IT
    }

    ctx.beginPath();
    ctx.rect(cursor.coords.x*40+6,cursor.coords.y*40+6,30-2,30-2);
    ctx.fillStyle=buildingDescription[cursor.currentlyHolded].color; 
    ctx.fill();
    target = makeBulidingAOE(cursor.coords.x,cursor.coords.y,buildingDescription[cursor.currentlyHolded].buildingPattern)
    for(var i =0;i!=target.length;i++)
    {
        if(battlefield[target[i][0]][target[i][1]].isSolid == 1)
        {
            for(var j =0;j!=target.length;j++)
            {
                ctx.beginPath();
                ctx.moveTo(target[j][0]*40,target[j][1]*40)
                ctx.lineTo(target[j][0]*40,target[j][1]*40+40);
                ctx.lineTo(target[j][0]*40+40,target[j][1]*40+40);
                ctx.lineTo(target[j][0]*40+40,target[j][1]*40);
                ctx.lineTo(target[j][0]*40,target[j][1]*40)
                ctx.strokeStyle="red";
                ctx.lineWidth = 5;
                ctx.stroke();
            }
            break;
        }
    }
}

function moveEnemies()
{
    for(var i=0;i!=enemy.length;i++)
    {
        enemy[i].coords.x += Math.cos(enemy[i].direction/180*Math.PI)*enemy[i].speed;
        enemy[i].coords.y += Math.sin(enemy[i].direction/180*Math.PI)*enemy[i].speed;
        if(enemy[i].coords.x<-0.5 || enemy[i].coords.x>20.5 ||  enemy[i].coords.y<-0.5 ||  enemy[i].coords.y>20.5)
        {
            enemy[i].direction = (enemy[i].direction+180) % 360
        }
    }
}

function moveBullets()
{
    for(var i=0;i!=bullets.length;i++)
    {
        bullets[i].coords.x += Math.cos(bullets[i].direction/180*Math.PI)*bullets[i].speed;
        bullets[i].coords.y += Math.sin(bullets[i].direction/180*Math.PI)*bullets[i].speed;
    }
    for(var i=bullets.length-1;i>=0;i--)
    {   
        if(bullets[i].coords.x<-0.5 || bullets[i].coords.x>20.5 ||  bullets[i].coords.y<-0.5 ||  bullets[i].coords.y>20.5)
        {
            bullets.splice(i,1)
        }
    }
}

function moveParticles()
{
    for(var i=0;i!=particles.length;i++)
    {
        particles[i].coords.x += Math.cos(particles[i].direction/180*Math.PI)*particles[i].speed;
        particles[i].coords.y += Math.sin(particles[i].direction/180*Math.PI)*particles[i].speed;
        particles[i].lifespan--
    }
    for(var i=particles.length-1;i>=0;i--)
    {   
        if(particles[i].coords.x<-0.5 || particles[i].coords.x>20.5 ||  particles[i].coords.y<-0.5 ||  particles[i].coords.y>20.5 || particles[i].lifespan<=0)
        {
            particles.splice(i,1)
        }
    }
}

function spawnEnemies()
{
    while (Math.random()<0.15 && started==1)
    {
        var x = Math.random()*20;
        var y = Math.random()<0.5?0:20;
        if(Math.random()<0.5)
        {
            var tmp = x;
            x = y;
            y = tmp;
        }
        var direction = Math.atan2(10-y,10-x)/Math.PI*180;
        var speed = 0.1;
        enemy.push(
        {        
            name : "justspawned",
            hp:100,
            coords :
            {
                x:x,
                y:y
            },
            direction:direction ,
            speed : speed
            }
        )
    }
    if(testmode==1)
    {
        enemy.push(
        {        
            name : "justspawned",
            hp:1e+10,
            coords :
            {
                x:5,
                y:5
            },
            direction:0 ,
            speed : 0
            }
        )
        testmode = 0
    }
} 

/// NEEDS TO BE REMOVED LATER ///
function spawnBullets_old()
{
    while (Math.random()<0.1)
    {
        var x = Math.random()*21;
        var y = Math.random()*21;

        var direction = Math.random()*360;
        var speed = 0.2;
        bullets.push(
        {        
            coords :
            {
                x:x,
                y:y
            },
            direction:direction ,
            speed : speed
            }
        )
    }
}

function findNearestEnemy(x,y)
{
    var target = -1;
    var targetDistance = 1000;
    var distanceToThisEnemy;
    for(var i=0;i<enemy.length;i++)
    {    
        distanceToThisEnemy = Math.sqrt(Math.pow(enemy[i].coords.x-x,2)+Math.pow(enemy[i].coords.y-y,2));
        if(distanceToThisEnemy<targetDistance)
        {
            target = i;
            targetDistance = distanceToThisEnemy;
        }
    }
    return target;
}

function moveCanons()
{
    var foundRadar = 0
    for(var i=0;i!=canon.length;i++)
    {
        if(battlefield[canon[i].coords.x][canon[i].coords.y].poweredByRadar==1 && enemy.length>0)
        {
            target = findNearestEnemy(canon[i].coords.x,canon[i].coords.y)
            whereToGo = (180+Math.atan2(canon[i].coords.y-enemy[target].coords.y-0.35,canon[i].coords.x-enemy[target].coords.x-0.35)/Math.PI*180)%360
            if(((canon[i].direction - whereToGo)+360)%360 < 180)
                canon[i].direction= (canon[i].direction-Math.min(10,Math.abs(canon[i].direction - whereToGo))+360)%360
            else
                canon[i].direction= (canon[i].direction + Math.min(10,Math.abs(canon[i].direction - whereToGo)))%360
        }
    }
}

function spawnBullets()
{
    for(var i=0;i!=canon.length;i++)
    {
        canon[i].reloadTick--
        if(canon[i].reloadTick<=0 && enemy.length>0)
        {
            canon[i].reloadTick = canon[i].reloadRate
            //canon[i].direction=(canon[i].direction+45)%360
            var direction = canon[i].direction;
            var damage = canon[i].damage
            var speed = 0.2;
            bullets.push(
            {
            coords :
            {
                x:canon[i].coords.x,
                y:canon[i].coords.y
            },
            direction:direction ,
            speed : speed,
            damage : damage
            }
            )
        }
    }
}  

function renderBulletsCollision()
{
    if(bullets.length!=0)
    {
        for(var i=enemy.length-1;i>=0;i--)
        {
            for(var j = bullets.length-1;j>=0;j--)
            { 
                if(((bullets[j].coords.x>enemy[i].coords.x && bullets[j].coords.x<enemy[i].coords.x+0.7) || (bullets[j].coords.x+0.2>enemy[i].coords.x && bullets[j].coords.x+0.2<enemy[i].coords.x+0.8)) && ((bullets[j].coords.y>enemy[i].coords.y && bullets[j].coords.y<enemy[i].coords.y+0.8) || (bullets[j].coords.y+0.2>enemy[i].coords.y && bullets[j].coords.y+0.2<enemy[i].coords.y+0.8)))
                {
                    enemy[i].hp-=bullets[j].damage
                    bullets.splice(j,1)
                    if(enemy[i].hp<=0 )
                    {   
                        for(var k=0;k<4;k++)
                        particles.push(
                        {
                            coords :
                            {
                                x:enemy[i].coords.x,
                                y:enemy[i].coords.y
                            },
                            direction:(45+k*90+Math.floor(Math.random()*30)-15+360)%360,
                            speed : 0.05,
                            color : "red",
                            lifespan : 10+Math.floor(Math.random()*10)
                        }
                        )
                        //: ARGH. PUT THIS IN A PROPER FUNCTION PLEASE //
                        // WILL DO... LATER.
                        particles.push(
                        {
                            coords :
                            {
                                x:enemy[i].coords.x,
                                y:enemy[i].coords.y
                            },
                            direction:(enemy[i].direction-15+Math.floor(Math.random()*30)+360)%360,
                            speed : 0.01,
                            color : "black",
                            lifespan : 10+Math.floor(Math.random()*10)
                        }
                        )
                        enemy.splice(i,1)
                        i--
                        if(i<0)
                            break;
                    }
                }
            }
        }
    }
}

function place( item, x, y, zone )
{
    for (i=0;i<zone.length;i+=2)
    {
        x0 = x+zone[i];
        y0 = y+zone[i+1];
        if (x0>=0 && x0<=20 && y0>=0 && y0<=20)
            battlefield[x0][y0][item] = 1;
        console.log("Property placed")
        console.log(x0,y0)
    }
}

function placeRadar(x,y)
{
    place( "poweredByRadar", cursor.coords.x,cursor.coords.y, buildingDescription.radar.actionPattern );
    place("isRadar", cursor.coords.x,cursor.coords.y, buildingDescription.radar.buildingPattern )
    place("isSolid", cursor.coords.x,cursor.coords.y, buildingDescription.radar.buildingPattern )
    console.log("doned")
}
function mainLoop()
{
    tick++;
    spawnEnemies();
    moveCanons()
    spawnBullets();
    moveEnemies();
    moveBullets();
    moveParticles();
    renderBulletsCollision()
    affBattlefield();
    requestID = window.requestAnimationFrame(mainLoop);
}

function cursorUp()
{
cursor.coords.y--;
}

function cursorDown()
{
cursor.coords.y++;
}

function cursorLeft()
{
cursor.coords.x--;
}

function cursorRight()
{
cursor.coords.x++;
}

function checkKey(e) {

    e = e || window.event;

    if (e.keyCode == '38' && cursor.coords.y>0)
    {
        cursorUp();
    }
    else if (e.keyCode == '40' && cursor.coords.y<20)
    {
        cursorDown();
    }
    else if (e.keyCode == '37' && cursor.coords.x>0)
    {
        cursorLeft();
    }
    else if (e.keyCode == '39' && cursor.coords.x<20)
    {
        cursorRight();
    }
    else if (e.keyCode == '13')
    {
        placeRadar(cursor.coords.x,cursor.coords.y);
    }
    else if (e.keyCode == '76')
    {
        started=1;
    }
    else if (e.keyCode == '84')
    {
        testmode=1;
    }


    //affBattlefield()
}

//affBattlefield();
requestID = window.requestAnimationFrame(mainLoop);
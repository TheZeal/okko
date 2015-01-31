/*
1 : type
2:
*/

var SIZEOFBOARD = 840

var c=document.getElementById("board");
var ctx=c.getContext("2d");

var battlefieldXSize = 21;
var battlefieldYSize = 21;
var unitSelected = -1;
document.onkeydown = checkKey;





battlefield = createBattlefield(21,21)

cursor =
{
    coords :
    {
        x:0,
        y:0
    }

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

radar = 
[
    {
        coords :
        {
            x:10,
            y:10
        }
    },

]

radar =[]




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
        };
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
    for(var i=0;i!=radar.length;i++)
    {
        ctx.beginPath();
        ctx.rect(radar[i].coords.x*40+6,radar[i].coords.y*40+6,30-2,30-2);
        ctx.fillStyle="blue"; 
        ctx.fill();
    }
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
    ctx.fillStyle="green"; 
    ctx.fill();
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
    while (Math.random()<0.15)
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
                        particles.push(
                        {
                            coords :
                            {
                                x:enemy[i].coords.x,
                                y:enemy[i].coords.y
                            },
                            direction:(enemy[i].direction-15+Math.floor(Math.random()*30)+360)%360,
                            speed : 0.05,
                            color : "black",
                            lifespan : 40+Math.floor(Math.random()*10)
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

function placeRadar(x,y)
{
    battlefield[x][y].isRadar=1;
    battlefield[Math.max(x-1,0)][y].poweredByRadar=1;
    battlefield[x][Math.max(y-1,0)].poweredByRadar=1;
    battlefield[Math.min(x+1,20)][y].poweredByRadar=1;
    battlefield[x][Math.min(y+1,20)].poweredByRadar=1;
    battlefield[x][y].poweredByRadar=1;
    radar.push(
    {
        coords :
        {
            x:cursor.coords.x,
            y:cursor.coords.y
        }
    }
    )
}
function mainLoop()
{
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

    //affBattlefield()
}

//affBattlefield();
requestID = window.requestAnimationFrame(mainLoop);
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
    radius3 : [0,-2,1,1,2,0,1,-1,0,2,-1,1,-2,0,-1,-1],
    crymson : [3,0,2,2,0,3,0,-3,-3,0,-2,-2,2,-2,-2,2],
    knight : [-2,1,-2,-1,-1,2,-1,-2,2,1,2,-1,1,2,1,-2]
};

var started = 0
var testmode = 0
var tick = 0;
var battlefield = createBattlefield(21,21)

function drawSquare(x,y,size,color)
{
    ctx.beginPath();
    ctx.rect(x*40+(40-size)/2,y*40+(40-size)/2,size,size);
    ctx.fillStyle=color;
    ctx.fill();
}

enemy = []
bullets = []
particles = []

cursorDescription =
{
    radar : function(x,y){ drawSquare(x,y,28,"blue") },
    accelerator : function(x,y) { drawSquare(x,y,28,"yellow") },
    tower : function(x,y) { drawSquare(x,y,28,"green"), drawSquare(x+1/4.5,y,10,"black") }
}

cursorDescription_zones = 
{
    radar : zones.crymson,
    accelerator : zones.knight,
    tower : []
}

buildingDescription =
{
    radar : function(tile, x, y)    
    {
        console.log("CALLED")
        tile.name = "radar"
        tile.drawingMethod = function()
        {
            drawSquare(x,y,28,"blue")
        }
        place( "poweredByRadar", x,y, zones.crymson );
        tile.actionPattern = zones.crymson
    },
    accelerator : function(tile, x, y)
    {
        tile.name = "accelerator"
        tile.drawingMethod = function()
        {
            drawSquare(x,y,28,"yellow")
        }
        var target = makeBuildingAOE(x,y,zones.knight)
        for(var i=0;i!=target.length;i++) // TODO : would you kindly create a proper function like place
        {
            battlefield[target[i][0]][target[i][1]].reloadModifier+=5
        }
        tile.actionPattern = zones.knight
    },
    tower : function(tile, x, y)
    {
        tile.name = "tower"
        tile.drawingMethod = function()
        {
            drawSquare(x,y,28,"green")
            drawSquare(x+Math.cos(tile.direction/180*Math.PI)/4.5,y+Math.sin(tile.direction/180*Math.PI)/4.5,10,"black")
        }
        tile.action = function()
        {
            if(tile.poweredByRadar==1 && enemy.length>0)
            {
                var target = findNearestEnemy(x,y)
                var whereToGo = (180+Math.atan2(y-enemy[target].coords.y-0.35,x-enemy[target].coords.x-0.35)/Math.PI*180)%360
                if(((tile.direction - whereToGo)+360)%360 < 180)
                {
                    tile.direction= (tile.direction-Math.min(10,Math.abs(tile.direction - whereToGo))+360)%360
                }
                else
                {
                    tile.direction= (tile.direction + Math.min(10,Math.abs(tile.direction - whereToGo)))%360
                }
            }

            tile.reloadTick--
            if( tile.reloadTick<=0 && enemy.length>0)
            {
                tile.reloadTick =  Math.max(tile.reloadRate - tile.reloadModifier,1)
                var direction = tile.direction;
                var damage = tile.damage
                var speed = 0.5+Math.random()/2;
                bullets.push( // PUT IN PROPER FUNCTION LATER // 
                {
                coords :
                {
                    x:x,
                    y:y
                },
                direction: direction ,
                speed : speed,
                damage : damage
                }
                )
            }
        }
        tile.actionPattern = []
        tile.direction = 0
        tile.reloadRate = 20
        tile.reloadTick = 1
        tile.damage = 50
    }
}

buildingDescription.tower(battlefield[10][13],10,13)
buildingDescription.tower(battlefield[13][10],13,10)
buildingDescription.tower(battlefield[10][7],10,7)
buildingDescription.tower(battlefield[7][10],7,10)
//buildingDescription.radar(battlefield[10][10],10,10)

var cursor =
{
    coords :
    {
        x:15,
        y:5
    },
    held : buildingDescription.radar,
    description : cursorDescription.radar,
    zone : cursorDescription_zones.radar
}
console.log(cursor)


function createBattlefield(x,y)
{
    var map = [];
    for (var i = 0; i <x; i++)
    {
        map[i] = [];
        for (var j = 0; j < y; j++)
        {
            map[i][j] = { //TODO : would you kindly separate this into two distincts lists for premanent and non permanent modifications
                            name : "blank",
                            poweredByRadar : 0,
                            color : "white",
                            action : function(){},
                            actionPattern : [],
                            direction : 0,
                            reloadRate : 0,
                            reloadTick : 0,
                            damage : 0,
                            reloadModifier : 0
                        }
        }
    }
    map[10][10].color="grey" 
    return map;
}

function makeBuildingAOE(x, y, zone )
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
            drawSquare(i,j,38,battlefield[i][j].color)
            if(battlefield[i][j].name !=  "blank")
                battlefield[i][j].drawingMethod(i,j)
        }
    }
    target = makeBuildingAOE(cursor.coords.x,cursor.coords.y,cursor.zone)
    for(var i=0;i!=target.length;i++)
    {
        drawSquare(target[i][0],target[i][1],38,"rgba(72, 91, 139, "+((tick%50)/200+0.5)+")")
    }
    for(var i=0;i!=enemy.length;i++)
    {
        drawSquare(enemy[i].coords.x,enemy[i].coords.y,28,"red")
        drawSquare(enemy[i].coords.x+Math.cos(enemy[i].direction/180*Math.PI)/4.5,enemy[i].coords.y+Math.sin(enemy[i].direction/180*Math.PI)/4.5,10,"black")
    }

    for(var i=0;i!=bullets.length;i++)
    {
        drawSquare(bullets[i].coords.x,bullets[i].coords.y,8,"black")
    } 
    for(var i=0;i!=particles.length;i++)
    {
        drawSquare(particles[i].coords.x,particles[i].coords.y,particles[i].color=="red"?14:10,particles[i].color)
    }

    cursor.description(cursor.coords.x,cursor.coords.y)

    if(battlefield[cursor.coords.x][cursor.coords.y].name!="blank")
    {        
        indicateUnpossiblePlacement(cursor.coords.x,cursor.coords.y)
    }
}

function indicateUnpossiblePlacement(x,y)
{
    ctx.beginPath();
    ctx.moveTo(x*40,y*40)
    ctx.lineTo(x*40,y*40+40);
    ctx.lineTo(x*40+40,y*40+40);
    ctx.lineTo(x*40+40,y*40);
    ctx.lineTo(x*40,y*40)
    ctx.moveTo(x*40+20,y*40)
    ctx.lineTo(x*40,y*40+20)
    ctx.moveTo(x*40+40,y*40)
    ctx.lineTo(x*40,y*40+40)
    ctx.moveTo(x*40+40,y*40+20)
    ctx.lineTo(x*40+20,y*40+40)
    ctx.strokeStyle="red";
    ctx.lineWidth = 5;
    ctx.stroke();
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
    while (Math.random()<0.2 && started==1)
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
            hp:200,
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

function renderBattlefield() // Push one level higher later
{
    for (var i = 0; i<battlefieldXSize; i++)
    {
        for (var j = 0; j<battlefieldYSize; j++)
        {
            battlefield[i][j].action(i,j)
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

function place(item, x, y, zone )
{
    for (var i=0;i<zone.length;i+=2)
    {
        x0 = x+zone[i];
        y0 = y+zone[i+1];
        if (x0>=0 && x0<=20 && y0>=0 && y0<=20)
            battlefield[x0][y0][item] = 1;
    }
}

function placeBuilding( item, x, y )
{
    battlefield[x][y].buildingHeld = item;
}

function placeRadar(x,y)
{
    place( "poweredByRadar", cursor.coords.x,cursor.coords.y, buildingDescription.radar.actionPattern );
    placeBuilding(buildingDescription.radar, cursor.coords.x,cursor.coords.y)
}
var lastDate = new Date();
var max = 0;
function mainLoop()
{
    var newDate = new Date();
    ms = newDate-lastDate;
    lastDate = newDate;
    if (ms>max)
        max = ms;

    requestID = window.requestAnimationFrame(mainLoop);
    {
        tick++;
        spawnEnemies();
        renderBattlefield();
        renderBulletsCollision()
        moveEnemies();
        moveBullets();
        moveParticles();
        affBattlefield();
    }
    ctx.fillText(""+max,10,10);
    ctx.fillText(""+ms,10,30);
    ctx.fillText(""+Math.floor(1000/ms),10,50);
    ctx.fillText(""+Math.floor(1000/max),10,70);
    if ((tick%300)==0)
        max = 0;
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
        if(battlefield[cursor.coords.x][cursor.coords.y].name=="blank")
        {
            cursor.held(battlefield[cursor.coords.x][cursor.coords.y],cursor.coords.x,cursor.coords.y)

        }
    }
    else if (e.keyCode == '76')
    {
        started=1;
    }
    else if (e.keyCode == '84')
    {
        testmode=1;
    }
        else if (e.keyCode == '82')
    {
        cursor.held=buildingDescription.radar;
        cursor.description = cursorDescription.radar
        cursor.zone = cursorDescription_zones.radar
    }
    else if (e.keyCode == '65')
    {
        cursor.held=buildingDescription.accelerator;
        cursor.description = cursorDescription.accelerator
        cursor.zone = cursorDescription_zones.accelerator
    }
    else if (e.keyCode == '81')
    {
        cursor.held=buildingDescription.tower;
        cursor.description = cursorDescription.tower
        cursor.zone = cursorDescription_zones.tower
    }
}

requestID = window.requestAnimationFrame(mainLoop);

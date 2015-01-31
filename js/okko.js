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
        direction : 180,
        speed : 0.1
    } 
]
bullets=
[
]
function createBattlefield(x,y)
{
    var map = [];
    for (var i = 0; i <x; i++)
    {
        map[i] = [];
        for (var j = 0; j < y; j++)
        {
            map[i][j] = 0;
        }
    }
    map[10][10]=1
    return map;
}

function updateMap(x,y,map){
    var newLayer = [];
    for (var i = 0; i <x; i++)
        newLayer[i] = [];
    for (var i = 0; i < x; i++)
    {
        for (var j = 0; j < y; j++)
        {
            
        }
    }
    return newLayer
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

            if(battlefield[j][i]==0)
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
    for(var i=0;i!=bullets.length;i++)
    {
        ctx.beginPath();
        ctx.rect(bullets[i].coords.x*40+16,bullets[i].coords.y*40+16,8,8);
        ctx.fillStyle="grey"; 
        ctx.fill();
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

function spawnEnemies()
{
    while (Math.random()<0.01)
    {
        var x = Math.random()*21;
        var y = Math.random()<0.5?0:21;
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

/// NEEDS TO BE REMOVED LATER
function spawnBullets()
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




function mainLoop()
{
    spawnEnemies();
    spawnBullets();
    moveEnemies();
    moveBullets();
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

    //affBattlefield()
}

//affBattlefield();
requestID = window.requestAnimationFrame(mainLoop);
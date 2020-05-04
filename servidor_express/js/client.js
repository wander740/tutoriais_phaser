
var Client = {};
Client.socket = io.connect();

Client.askNewPlayer = function(){
    Client.socket.emit('newplayer');
};

//
Client.socket.on('newplayer',function(data){
    Game.addNewPlayer(data.id,data.x,data.y);
    
});

Client.socket.on('i',function(data){
    Game.Player(data.id,data.x,data.y);
});

Client.socket.on('allplayers',function(data){
    console.log(data);
    for(var i = 0; i < data.length; i++){
        Game.addNewPlayer(data[i].id,data[i].x,data[i].y);
    }
    
    
});

Client.socket.on('remove',function(id){
    Game.removePlayer(id);
});

Client.socket.on('move',function(data,dire,velo){
    console.log('Aqui4');
    Game.movePlayer(data.id,dire,velo);
});

Client.sendMov = function(dire,velo){
    console.log('Aqui2');
    Client.socket.emit('click',{dire:dire,velo:velo});
};

/*
Client.Moved = function(x,y,dire,velo){
    Client.socket.emit('moved',{x:x,y:y,dire:dire,velo:velo})
};

Client.socket.on('m',function(data,dire,velo){
    Game.m(data.id,dire,velo);
});

Client.stop = function(){
    Client.socket.emit('stop');
}

Client.socket.on('s',function(id){
    Game.s(id);
});*/
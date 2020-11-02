//Eduardo Andre Martinez Romero A00819264
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose');
const axios = require('axios');

const router = express.Router();

app.use(express.json())
app.use(cors())
app.use("/", router);
let pokemons = []
let types = {}
let tablero = {}
let pokemonesguardados = {}

var conn = mongoose.createConnection('mongodb://localhost:27017/Pokemon');

//Define a schema
var Schema = new mongoose.Schema({
    "_id": String,
    data: JSON
})

var user = conn.model('tipos', Schema)

var BaseExistente = false;
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

user.findById("Tipos", function(err, docs) {
    if (err) {
        console.log("Base de datos vacia");
    } else {
        if (docs == null) {
            console.log("Base de datos vacia");
            BaseExistente = false;
        } else {
            BaseExistente = true;
            console.log("Result : ", docs.data)
            types = docs.data
            console.log(types)
            pokemonesguardados = types["pokemon"]
            console.log(pokemonesguardados)
        }
    }
});

//mongoose.connection.close()

function json2array(json){
    var result = [];
    var keys = Object.keys(json);
    keys.forEach(function(key){
        result.push(json[key]);
    });
    return result;
}

function between(min, max) {  
    return Math.floor(
      Math.random() * (max - min) + min
    )
  }


var conn2 = mongoose.createConnection('mongodb://localhost:27017/Tablero');
    
var cartas = conn2.model('cartas', Schema)

//pedirbasededatos();
 function pedirbasededatos(){
    cartas.findById("cartas", async(err, docs)=> {
        if (err) {
            console.log("Base de datos de cartas vacia");
        } else {
            if (docs == null) {
                console.log("Base de datos cartas vacia");
                BaseExistente = false;
            } else {
                BaseExistente = true;
                console.log("Result : ", docs.data)
                tablero = docs.data
                console.log(tablero)
            }
        }
    })

}


function processParams(req) {
    return Object.assign({}, req.body, req.params, req.query)
}
// crear something from data in body
app.get('/pedircartas/:id', async(req, res) => {
     pedirbasededatos()
     setTimeout(() => {
        let params = processParams(req)
        let id = params.id
        console.log("EL ID ES "  + id)
        let pokemones_extraidos = [];
        if(tablero[id.toString()] != null){
            console.log("Ya existe el jugador")
            let nuevosPokemones = tablero[id.toString()]
            pokemones_extraidos = json2array(pokemonesguardados);
            var N = pokemones_extraidos.length;
            console.log("El jugador entro N cantidades" + nuevosPokemones.length)
            for(var i = 0; i<5;i++){
                var Num = between(1, N)
                nuevosPokemones.push(pokemones_extraidos[Num-1])
            }
            console.log("El jugador salio N cantidades" + nuevosPokemones.length)
            tablero[id.toString()] = nuevosPokemones;
            console.log(tablero)
            cartas.findByIdAndUpdate({ "_id": "cartas" }, { data: tablero }, function(err, result) {
                if (err) {
                } else {
                }
            })

            res.send(nuevosPokemones)
        }
        else{
            console.log("No existe jugador")
            console.log("pokemones_guardados")
            console.log(pokemonesguardados)
            pokemones_extraidos = json2array(pokemonesguardados);
            console.log("pokemones_extraidos")
            console.log(pokemones_extraidos)
            let nuevosPokemones = [];
            var N = pokemones_extraidos.length;
            for(var i = 0; i<5;i++){
                var Num = between(1, N)
                console.log("NUmero" +Num )
                console.log(pokemones_extraidos[Num-1] )
                nuevosPokemones.push( pokemones_extraidos[Num-1] )
            }
            console.log("AQUIII")
            console.log(nuevosPokemones)
            
            let nuevo_juego = {};
            nuevo_juego[id.toString()] = nuevosPokemones
            cartas.findByIdAndUpdate({ "_id": "cartas" }, { data: nuevo_juego }, function(err, result) {
                if (err) {
                    //res.send(err)
                } else {
                    if (result == null) {
                        var DATA = { "_id": "cartas", data: nuevo_juego }
                        new cartas(DATA).save(function(err, doc) {})
                    }
                }
            })
            console.log("Nuevos 1 Pokemones")
            console.log(nuevosPokemones)
            console.log("Enviando")
            res.send(nuevosPokemones)
        }},1000)
    })


    // crear something from data in body
app.get('/getcartas/:id', async(req, res) => {
    pedirbasededatos()
    setTimeout(() =>{
    let params = processParams(req)
    let id = params.id
    let pokemones_extraidos = [];
    if(tablero[id.toString()] != null){
        let nuevosPokemones = tablero[id.toString()]
        res.send(nuevosPokemones)
        console.log("Si hay cartas su cantidad es "+ nuevosPokemones.length)
    }
    else{
        let nuevosPokemones = [];
        res.send("No hay cartas")
    }
    },1000)
    
})

app.listen(3003)

const express = require('express')
const app = express()
const handlebars = require('express-handlebars').engine
const bodyParser = require('body-parser')
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');


const serviceAccount = require('./atividadeweb-8e42e-firebase-adminsdk-ecflf-89b6013495.json');

initializeApp({
    credential: cert(serviceAccount)
});
  
const db = getFirestore();

app.engine('handlebars', handlebars({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get('/', function(req, res){
    res.render('primeira_pagina')
})

app.get ('/consulta',  async function(req, res){
    var consulta = await db.collection('pessoas').get();
    const dados = []; 
    

        consulta.forEach(doc => {
            dados.push({id:doc.id,
                data_contato:doc.get('data_contato'),
                nome:doc.get('nome'),
                observacao:doc.get('observacao'),
                origem:doc.get('origem'),
                telefone:doc.get('telefone')
            })
        })

    res.render('consulta', {dados})

})

app.get("/editar/:id", async function(req,res){
    try{
        const doc = db.collection('pessoas').doc(req.params.id);
        const docc = await doc.get();
        if(!docc.exists){
            console.log("erro")
            res.status(404).send("n achou doc")
        }
        
        else{
            res.render("editar", { id:req.params.id, pessoas: docc.data() })
        }
    } catch(error){
        console.error(error)
        res.status(500).send("erro ao buscar doc")
    }
});

app.post('/atualizar/:id', async function(req, res){
 try{
    
    const edit = db.collection('pessoas').doc(req.params.id);
    await edit.update({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    });
    console.log('documento atualizado');
    res.redirect('/consulta')

 } catch(error){
    console.error("erro", error);
    res.status(500).send("erro ao buscar");
 }
}
);


app.post('/cadastrar', function (req, res) {
    var pessoas = db.collection('pessoas').add({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function(){
        console.log('Pessoa cadastrada com sucesso!')
        res.redirect('/')
    })
})

app.get("/excluir/:id", async function(req,res){
    try{

        await db.collection('pessoas').doc(req.params.id).delete();
        console.log('documento excluido com sucesso!');
        res.redirect('/consulta');

    }catch(error){
        console.error("Error deleting document: ", error);
        res.status(500).send("Erro ao excluir documento")
    }
})


app.listen(8081, function(){
    console.log('Servidor ativo!')
})

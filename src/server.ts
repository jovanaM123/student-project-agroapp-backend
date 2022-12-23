import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import cron from 'node-cron';
import nodemailer from 'nodemailer';
const app = express();


app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/projekat', { useNewUrlParser: true });

const connection = mongoose.connection;

connection.once('open', ()=>{
 console.log('Database connected');
});

const router = express.Router();


import Admin from './models/admin';
import Farmer from './models/farmer';
import Firm from './models/firm';
import Garden from './models/garden';
import Magacin from './models/magacin';
import Product from './models/product';
import Comment from './models/comment';
import Rate from './models/rate';
import Courier from './models/courier';
import Plant from './models/plant';
import courier from './models/courier';
import firm from './models/firm';
import { RSA_NO_PADDING } from 'constants';
import plant from './models/plant';
import { isNull } from 'util';

//updejt t i h20 na svakih 1h
cron.schedule('*/58 * * * *', () => {

    Garden.find({}, 
        (err,garden)=>{
            if(err) console.log(err);
            else {
                for(let i=0; i < Object.keys(garden).length; i++){
                  let temperatura: number= +(garden[i].get('temp'));
                    let voda: number= +(garden[i].get('h20'));

                    temperatura = temperatura - 0.5;
                    voda = voda - 1;
                    
                    Garden.updateMany({'name': garden[i].get('name')}, {'temp': temperatura.toString(),
                        'h20': voda.toString()},
                        (err, gard)=> {
                            if(err) console.log(err);
                            else console.log('temperatura i voda smanjene');
                        })
                }

            }
        })

  });

  // za slanje mejlova ako je t i h20 ispod nekog praga
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "agroadm123@gmail.com",
    pass: "Agro123@@"
  }, tls: {
      rejectUnauthorized: false
    }
});
  cron.schedule('*/59 * * * *', () => {
    Garden.find({}, 
        (err,garden)=>{
            if(err) console.log(err);
            else {
                for(let i=0; i < Object.keys(garden).length; i++){
                    let temperatura: number= +(garden[i].get('temp'));
                    let voda: number= +(garden[i].get('h20'));


                    if(temperatura <12 || voda < 75){
                        Farmer.find({'username':garden[i].get('owner')},
                        (err,farmer)=>{
                            if(err) console.log(err);
                            else {
                                let mejl = farmer[0].get('mail')
                                let mailOptions = {
                                    from: "agroadm123@gmail.com",
                                    to: mejl,
                                    subject: `Agrofarm app ;)`,
                                    text: `Zdravo, vas rasadnik zahteva odrzavanje.`
                                  };
                                
                                  transporter.sendMail(mailOptions, function(error, info) {
                                    if (error) {
                                      throw error;
                                    } else {
                                      console.log("Email uspesno poslat!");
                                    }
                                  }); 
                                
                            }
                        })            
                    }
                }
            }
  })
})

//da moze da se sadi
cron.schedule('0 0 */3 * *', () => {

    Plant.findOneAndDelete({'spremna': true}, 
        (err,plant)=>{
            if(err) console.log(err);
            else {
                console.log('obrisana i moze da se zasadi');
                }

            }
        )

  });

  //povecanje napretka svakog dana u 01:00 casova
  cron.schedule('0 1 */1 * *', () => {

    Plant.find({'spremna': false},
        (err,plant)=>{
            if(err) console.log(err);
            else {
                for(let i=0; i < Object.keys(plant).length; i++){
                    let napredak: number = +(plant[i].get('napredak'))
                    if(napredak !== 100){
                        napredak = napredak + 10;
                        Plant.updateMany({'sadnica': plant[i].get('sadnica')},
                                         {'napredak': napredak.toString()},
                        (err,pl)=>{
                            if(err) console.log(err);
                            else console.log('updatejtovan napredak svake od biljaka')
                        })
                    }
                }

            }
        })

  });

  //kurire pogledaj da li su se oslobodili ili ne 
cron.schedule('0 */2 * * *', () => {

    Courier.find({'available': false}, 
        (err,courier)=>{
            if(err) console.log(err);
            else {
                for(let i=0; i < Object.keys(courier).length; i++){
                  let vreme: Date= courier[i].get('notAv');
                  let name: String = courier[i].get('name');
                  let sada = new Date()
                  if(sada.getTime() >= vreme.getTime()){
                    Courier.updateMany({'name': name}, {'available': true},
                    (err, c)=> {
                        if(err) console.log(err);
                        else console.log('kurir je slobodan ponovo');
                    })
                  }                  
                }

            }
        })

  });

//slanje poklona
cron.schedule('0 8 * * Mon', () => {

    Magacin.find({}, 
        (err, magacin)=>{
            if(err) console.log(err);
            else {

                let korisnici: String[] = [];
            
                //sve korisnike uzmem
                for(let i=0; i < Object.keys(magacin).length; i++){
                   if(!korisnici.includes(magacin[i].get('owner'))){
                        korisnici.push(magacin[i].get('owner'));
                    
                } 

                }
                
                
        
                // za svakog nadjem rasadnike
                korisnici.forEach(korisnik => {
                    let rasadnici: String[] = [];

                    for(let i=0; i < Object.keys(magacin).length; i++){
                        if(!rasadnici.includes(magacin[i].get('garden')) && korisnik == magacin[i].get('owner')){
                            rasadnici.push(magacin[i].get('garden'));
                        }
                    }
                    

                    //za svaki rasadnik nadjem firme koje ima
                    rasadnici.forEach(rasadnik => {
                        let preduzeca: String[] = [];

                        for(let i=0; i < Object.keys(magacin).length; i++){
                            if(!preduzeca.includes(magacin[i].get('company')) && korisnik == magacin[i].get('owner')
                            && rasadnik == magacin[i].get('garden')) {
                                preduzeca.push(magacin[i].get('company'));
                            }
                        }
                        


                        //za svaku firmu proverim broj narudzbina 
                        preduzeca.forEach(preduzece => {
                            let brojProizvoda = 0;

                            for(let i=0; i < Object.keys(magacin).length; i++){
                                if(preduzece == magacin[i].get('company') && korisnik == magacin[i].get('owner')
                                && rasadnik == magacin[i].get('garden') && magacin[i].get('arrived') == true) {
                                    brojProizvoda++;
                                }
                            }
                            


                            //ako je broj proizvoda veci od 10 salji nagradu
                            if(brojProizvoda<10){
                                //nadjemo neki proizvod ovog preduzeca 
                                Product.find({'owner': preduzece},
                                (err, product) => {
                                    if(err) console.log(err);
                                    else {
                                        let proizvodi: String[]= [];

                                        for(let i=0; i < Object.keys(product).length; i++){
                                            if(product[i].get('amount') !== '0'){
                                                proizvodi.push(product[i].get('codePr'));
                                            }
                                        }

                                        let poklon = proizvodi[Math.floor(Math.random() * proizvodi.length)];
                                        console.log(poklon)
                                        Product.find({'codePr': poklon},
                                        (err, pr) => {
                                            if(err) console.log(err);
                                            else {
                                                //smanjimo mu kolicinu
                                                let kol = parseInt(pr[0].get('amount'));
                                                let novaKol = kol - 1;

                                                

                                                Product.findOneAndUpdate({'codePr': poklon}, {'amount': novaKol.toString()},
                                                (err, p) => {
                                                    if(err) console.log(err);
                                                    else {
                                                        //ubacimo taj proizvod u magacin u magacin
                                                        //prvo provera da li imamo proizvod

                                                        Magacin.find({'codeOfProd': poklon}, 
                                                            (err, mag)=>{
                                                                if(err) console.log(err);
                                                                else {
                                                                    //ako imamo samo updejtujemo kolicinu
                                                                    if(Object.keys(mag).length!=0){
                                                                        let kolic = parseInt(mag[0].get('amount'));
                                                                        let novaKolic = kolic + 1;



                                                                        Magacin.findOneAndUpdate({'codeOfProd': poklon}, {'amount': novaKolic.toString()},
                                                                        (err, m) => {
                                                                            if(err) console.log(err);
                                                                            else {console.log("Dodat je poklon!")}
                                                                        })

                                                                    } else {
                                                                        
                                                                        //nadji ime od produkta
                                                                        Product.find({'codePr': poklon},
                                                                        (err, pr) => {
                                                                            if(err) console.log(err);
                                                                            else {
                                                                                //dodamo u magacin
                                                                                let datum = new Date();
                                                                                let imePoklona = pr[0].get("name");
                                                                                let tip = pr[0].get("type");

                                                                                Magacin.insertMany({'codeOfProd': poklon, 'name':imePoklona, 'company':preduzece,
                                                                                'amount': '1', 'type': tip, 'arrived': true, 'owner': korisnik,
                                                                                'buy': datum, 'garden': rasadnik},
                                                                                    (err, ma) => {
                                                                                if(err) console.log(err);
                                                                                else {console.log("Dodat je nov poklon!")}
                                                                            })
                                                                            }
                                                                        })                                                                        
                                                                    }
                                                                }
                                                            })                                                        
                                                    }
                                                })  
                                            }
                                        })    

                                    }
                                })


                                
                            }

                        });


                    });

                });
                



            }
        })

  });


router.route('/loginAdm').post(
    (req, res)=>{
        let username = req.body.username;
        let password = req.body.password;
        let type = req.body.type;

        Admin.find({'username':username, 'password':password, 'type':type},
         (err,admin)=>{
            if(err) console.log(err);
            else res.json(admin);
        })
    }
);


router.route('/loginPolj').post(
    (req, res)=>{
        let username = req.body.username;
        let password = req.body.password;
        let type = req.body.type;

        Farmer.find({'username':username, 'password':password, 'type':type,'approved': true},
         (err,farmer)=>{
            if(err) console.log(err);
            else res.json(farmer);
        })
    }
);

router.route('/loginPred').post(
    (req, res)=>{
        let username = req.body.username;
        let password = req.body.password;
        let type = req.body.type;

        Firm.find({'username':username, 'password':password, 'type':type, 'approved': true},
         (err,firm)=>{
            if(err) console.log(err);
            else res.json(firm);
        })
    }
);

router.route('/okUsernamePolj').post(
    (req,res) => {
        let username = req.body.username;

        Farmer.find({'username': username},
         (err,farmer)=> {
            if(err) console.log(err);
            else res.json(farmer);
        });

});

router.route('/okUsernamePred').post(
    (req,res) => {
        let username = req.body.username;

        Firm.find({'username': username},
         (err,firm)=> {
            if(err) console.log(err);
            else res.json(firm);
        });

});

router.route('/registerPolj').post(
    (req, res)=> {
        let farmer = new Farmer(req.body);

        farmer.save()
                .then(farmer => {
                    res.status(200).json({'uspeh':'ok'})
                }).catch(err=>{
                    res.status(400).json({'uspeh':'no'});
                })
    }
);

router.route('/registerPred').post(
    (req, res)=> {
        let firm = new Firm(req.body);

        firm.save()
                .then(firm => {
                    res.status(200).json({'uspeh':'ok'})
                }).catch(err=>{
                    res.status(400).json({'uspeh':'no'});
                })
    }
);

router.route('/zahtevFarmer').get(
    (req, res) => {
        Farmer.find({ 'approved': false }, 
            (err,farmer)=> {
                if(err) console.log(err);
                else res.json(farmer);
            });
    }
);

router.route('/zahtevFirme').get(
    (req, res) => {
        Firm.find({ 'approved': false }, 
            (err,firm)=> {
                if(err) console.log(err);
                else res.json(firm);
            });
    }
);

router.route('/sviFarmeri').get(
    (req, res) => {
        Farmer.find({'approved': true}, 
            (err,farmer)=> {
                if(err) console.log(err);
                else res.json(farmer);
            });
    }
);

router.route('/sveFirme').get(
    (req, res) => {
        Firm.find({ 'approved': true}, 
            (err,firm)=> {
                if(err) console.log(err);
                else res.json(firm);
            });
    }
);

router.route('/prihvPolj').post(
    (req, res) => {
        let username = req.body.username;

        Farmer.findOneAndUpdate({ 'username': username}, { 'approved' : true} ,
        (err,farmer)=> {
            if(err) console.log(err);
            else res.json('ok');
        });
    }
);
router.route('/odbijPolj').post(
    (req, res) => {
        let username = req.body.username;

        Farmer.findOneAndDelete({'username': username},
        (err,farmer)=> {
            if(err) console.log(err);
            else res.json('ok');
        });
    }
);


router.route('/prihvPred').post(
    (req, res) => {
        let username = req.body.username;

        Farmer.findOneAndUpdate({ 'username': username}, { 'approved' : true} ,
        (err,farmer)=> {
            if(err) console.log(err);
            else res.json('ok');
        });
    }
);
router.route('/odbijPred').post(
    (req, res) => {
        let username = req.body.username;

        Firm.findOneAndDelete({ 'username': username},
        (err,firm)=> {
            if(err) console.log(err);
            else res.json('ok');
        });
    }
);



router.route('/okPassPolj').post(
    (req,res) => {
        let username = req.body.username;
        let password = req.body.password;

        Farmer.find({'username':username,'password': password},
         (err,farmer)=> {
            if(err) console.log(err);
            else res.json(farmer);
        });

});
router.route('/okPassPred').post(
    (req,res) => {
        let username = req.body.username;
        let password = req.body.password;

        Firm.find({'username':username,'password': password},
         (err,firm)=> {
            if(err) console.log(err);
            else res.json(firm);
        });

});
router.route('/okPassAdm').post(
    (req,res) => {
        let username = req.body.username;
        let password = req.body.password;

        Admin.find({'username':username,'password': password},
         (err,admin)=> {
            if(err) console.log(err);
            else res.json(admin);
        });

});

router.route('/changePassPolj').post(
    (req, res) => {
        let username = req.body.username;
        let password = req.body.password;

        Farmer.findOneAndUpdate({'username': username}, { 'password': password} ,
        (err,farmer)=> {
            if(err) console.log(err);
            else res.json('ok');
        });
    }
);
router.route('/changePassPred').post(
    (req, res) => {
        let username = req.body.username;
        let password = req.body.password;

        Firm.findOneAndUpdate({'username': username}, { 'password': password} ,
        (err,firm)=> {
            if(err) console.log(err);
            else res.json('ok');
        });
    }
);
router.route('/changePassAdm').post(
    (req, res) => {
        let username = req.body.username;
        let password = req.body.password;

        Admin.findOneAndUpdate({ 'username': username}, { 'password': password} ,
        (err,admin)=> {
            if(err) console.log(err);
            else res.json('ok');
        });
    }
);

router.route('/dohvatiPolj').post(
    (req, res) => {
        let username = req.body.username;

        Farmer.find({'username': username}, 
            (err,farmer)=> {
                if(err) console.log(err);
                else res.json(farmer);
            });
    }
);

router.route('/dohvatiPred').post(
    (req, res) => {
        let username = req.body.username;

        Firm.find({'username': username}, 
            (err,firm)=> {
                if(err) console.log(err);
                else res.json(firm);
            });
    }
);

router.route('/azPolj').post(
    (req, res)=>{
        let userOld = req.body.userOld;
        let item = {
            username: req.body.username,
            lastname: req.body.lastname,
            name: req.body.name,
            mail:  req.body.mail,
            dateOfBirth:  req.body.dateOfBirth,
            cityOfBirth: req.body.cityOfBirth,
            phone: req.body.phone
        };

        Farmer.findOneAndUpdate({'username': userOld}, { $set: item },
         (err,farmer)=>{
            if(err) console.log(err);
            else res.json('ok');
        })
    }
);

router.route('/azPred').post(
    (req, res)=>{
        let userOld = req.body.userOld;
        let item = {
            username: req.body.username,
            name: req.body.name,
            mail:  req.body.mail,
            date:  req.body.date,
            city: req.body.city
        };

        Firm.findOneAndUpdate({'username':userOld}, { $set: item },
        (err,firm)=>{
            if(err) console.log(err);
            else res.json('ok');
        })
    }
);

router.route('/sviRasadnici').post(
    (req,res) => {
        let username = req.body.username;

        Garden.find({'owner': username}, 
        (err, garden) => {
            if(err) console.log(err);
            else res.json(garden);
        })
    }
    );

    router.route('/dodajRasadnik').post(
        (req,res) => {
         let garden = new Garden(req.body);
         
         garden.save()
         .then(garden => {
            res.status(200).json({'uspeh':'ok'})
         })
         .catch(err => {
            res.status(400).json({'uspeh':'nok'})
        })
        }
);


router.route('/okImeRasadnika').post(
    (req,res) => {
        let username = req.body.username;
        let name = req.body.name;

        Garden.find({'owner':username,'name': name},
         (err,garden)=> {
            if(err) console.log(err);
            else res.json(garden);
        });

});

router.route('/sviProizvodi').post(
    (req,res) => {
        let username = req.body.username;

        Magacin.find({'owner': username, 'arrived': true}, 
        (err, magacin) => {
            if(err) console.log(err);
            else res.json(magacin);
        })
    }
);

router.route('/imaPrUMagacinu').post(
    (req,res) => {
        let kod = req.body.kod;

        Magacin.find({'codeOfProd': kod}, 
        (err, magacin) => {
            if(err) console.log(err);
            else res.json(magacin);
        })
    }
);

router.route('/sveNarudzbine').post(
    (req,res) => {
        let username = req.body.username;

        Magacin.find({'owner': username, 'arrived': false}, 
        (err, magacin) => {
            if(err) console.log(err);
            else res.json(magacin);
        })
    }
);



router.route('/brisanjeNarudzbine').post(
    (req,res) => {
        let kod = req.body.kod;

        Magacin.findOneAndDelete({'codeOfProd': kod, 'arrived': false}, 
        (err, magacin) => {
            if(err) console.log(err);
            else res.json('ok');
        })
    }
);


router.route('/sveSadnice').get(
    (req,res) => {
        Product.find({'type': 'sadnica'}, (err, product)=> {
            if(err) console.log(err);
            else res.json(product);
        })
    }
);

router.route('/sviPreparati').get(
    (req,res) => {
        Product.find({'type': 'preparat'}, (err, product)=> {
            if(err) console.log(err);
            else res.json(product);
        })
    }
);
router.route('/sveNarudzbineIkad').post(
    (req,res) => {
        let firma = req.body.firma;

        Magacin.find({'company': firma}, 
        (err, magacin) => {
            if(err) console.log(err);
            else res.json(magacin);
        })
    }
);

router.route('/nazivFirme').post(
    (req,res) => {
        let username = req.body.username;

        Firm.find({'username':username}, (err, firm)=> {
            if(err) console.log(err);
            else res.json(firm);
        })
    }
);


router.route('/sveNar').post(
    (req,res) => {
        let firma = req.body.firma;
        Magacin.find({'company':firma, 'arrived':false}, (err, magacin)=> {
            if(err) console.log(err);
            else res.json(magacin);
        })
    }
);

router.route('/sviPrFirme').post(
    (req,res) => {
        let firma = req.body.firma;
        Product.find({'owner': firma}, (err, product)=> {
            if(err) console.log(err);
            else res.json(product);
        })
    }
);


router.route('/sveFirmineSadnice').post(
    (req, res) => {
        let firma = req.body.firma;

        Product.find({'owner': firma, 'type': 'sadnica'}, (err, product)=> {
            if(err) console.log(err);
            else res.json(product);
        })
    }
)


router.route('/obrisiPrFirme').post(
    (req, res) => {
        let code = req.body.codePr;

        Product.findOneAndDelete({'codePr': code},
        (err,product)=> {
            if(err) console.log(err);
            else res.json('ok');
        });
    }
);

router.route('/sviKomentari').post(
    (req,res)=> {
        let code = req.body.kod;

        Comment.find({'codePr': code}, (err, cmt)=>{
            if(err) console.log(err);
            else res.json(cmt);
        })
    }
);

router.route('/dajOcenu').post(
    (req,res)=> {
        let code = req.body.kod;

        Product.findOne({'codePr': code}, (err, product)=>{
            if(err) console.log(err);
            else res.json(product.get('avRate'));
        })
    }
);

router.route('/grad').post(
    (req,res)=> {
        let name = req.body.name;
        let owner = req.body.owner;

        Garden.findOne({'name': name, 'owner': owner}, (err, product)=>{
            if(err) console.log(err);
            else res.json(product.get('place'));
        })
    }
);


router.route('/imaOcena').post(
    (req, res) => {
        let code = req.body.kod;
        let username = req.body.username;

        Rate.findOne({'codePr': code, 'user': username},
        (err,rate)=> {
            if(err) console.log(err);
            else res.json(rate);
        });
    }
);

router.route('/sveOcene').post(
    (req, res) => {
        let code = req.body.kod;

        Rate.find({'codePr': code},
        (err,rate)=> {
            if(err) console.log(err);
            else res.json(rate);
        });
    }
);

router.route('/imaKom').post(
    (req, res) => {
        let code = req.body.kod;
        let username = req.body.username;

        Comment.findOne({'codePr': code, 'user': username},
        (err,comment)=> {
            if(err) console.log(err);
            else res.json(comment);
        });
    }
);


router.route('/dodajKom').post(
    (req,res) => {
     let kom = new Comment(req.body);
     
     kom.save()
     .then(kom => {
        res.status(200).json({'uspeh':'ok'})
     })
     .catch(err => {
        res.status(400).json({'uspeh':'nok'})
    })
    }
);
router.route('/dodajOcenu').post(
    (req,res) => {
     let oc = new Rate(req.body);
     
     oc.save()
     .then(oc => {
        let kod = req.body.codePr;
        let ocena = req.body.rate;
        let o: number = +(ocena)

        Rate.find({'codePr': kod},
        (err,rate)=> {
            if(err) console.log(err);
            else {
                let brOcena = Object.keys(rate).length
                let zbir: number = 0;

                for(let i=0; i<brOcena; i++) {
                    zbir += +(rate[i].get('rate'))
                }

                zbir = zbir/brOcena;

                Product.findOneAndUpdate({'codePr': kod}, {'avRate': zbir.toString()},
                (err,product)=> {
                    if(err) console.log(err);
                    else {
                     res.status(200).json({'uspeh':'ok'})
                    }
                })
            }
        })

     })
     .catch(err => {
        res.status(400).json({'uspeh':'nok'})
    })
    }
);

router.route('/dodajProizvod').post(
    (req,res) => {
     let oc = new Product(req.body);
     
     oc.save()
     .then(oc => {
        res.status(200).json({'uspeh':'ok'})
     })
     .catch(err => {
        res.status(400).json({'uspeh':'nok'})
    })
    }
);


router.route('/okKod').post(
    (req, res) => {
        let code = req.body.kod;

        Product.findOne({'codePr': code},
        (err,pr)=> {
            if(err) console.log(err);
            else res.json(pr);
        });
    }
);


router.route('/sviKupljeni').post(
    (req, res) => {
        let code = req.body.kod;

        Product.find({'codePr': code},
        (err,pr)=> {
            if(err) console.log(err);
            else res.json(pr);
        });
    }
);


router.route('/dohvatiKol').post(
    (req, res) => {
        let code = req.body.kod;

        Product.find({'codePr': code},
        (err,pr)=> {
            if(err) console.log(err);
            else res.json(pr);
        });
    }
);

router.route('/umanjiKol').post(
    (req, res) => {
        let code = req.body.kod;
        let kol = req.body.kol

        Product.findOneAndUpdate({'codePr': code}, {'amount': kol}, 
        (err,pr)=> {
            if(err) console.log(err);
            else res.json('ok');
        });
    }
);


router.route('/kupiPr').post(
    (req,res) => {
     let oc = new Magacin(req.body);

     oc.save()
     .then(oc => {
        res.status(200).json({'uspeh':'ok'})
     })
     .catch(err => {
        res.status(400).json({'uspeh':'nok'})
    })
    }
);

router.route('/obrisiNarudzbinu').post(
    (req, res) => {
        let code = req.body.kod;
        let amount = req.body.amount;
        let owner = req.body.owner;

        Magacin.findOneAndDelete({'codeOfProd': code,'amount':amount, 'owner':owner, 'arrived': false},
        (err, mag)=> {
            if(err) console.log(err);
            else res.json('ok');
        });
    }
);


router.route('/nisuSlobodni').get(
    (req, res) => {

        Courier.find({'available': true}, 
        (err,pr)=> {
            if(err) console.log(err);
            else res.json(pr);
        });
    }
);

router.route('/dohvatiRasadnik').post(
    (req, res) => {
        let name = req.body.name;
        
        Garden.find({'name': name}, 
        (err,garden)=> {
            if(err) console.log(err);
            else res.json(garden);
        });
    }
);

router.route('/updatejtujT').post(
    (req, res) => {
        let name = req.body.name;
        let temp = req.body.temp;

        Garden.findOneAndUpdate({'name': name}, {'temp': temp}, 
        (err,garden)=> {
            if(err) console.log(err);
            else res.json('ok');
        });
    }
);

router.route('/updatejtujV').post(
    (req, res) => {
        let name = req.body.name;
        let voda = req.body.voda;
        
        Garden.findOneAndUpdate({'name': name}, {'h20': voda}, 
        (err,garden)=> {
            if(err) console.log(err);
            else res.json('ok');
        });
    }
);

router.route('/sadnica').post(
    (req, res) => {
        let username = req.body.username; 
        let name = req.body.name;
        let w = req.body.w;
        let h = req.body.h;

        Plant.find({'garden': name, 'username': username, 'w': w, 'h':h}, 
        (err,plant)=> {
            if(err) console.log(err);
            else res.json(plant);
        });
    }
);

router.route('/sveZasadjene').post(
    (req, res) => {
        let username = req.body.username; 
        let name = req.body.name;

        Plant.find({'garden': name, 'username': username}, 
        (err,plant)=> {
            if(err) console.log(err);
            else res.json(plant);
        });
    }
);

router.route('/preparatiRasadnika').post(
    (req, res) => {
        let owner = req.body.owner; 
        let garden = req.body.garden;
        
        Magacin.find({'garden': garden, 'owner': owner, 'arrived': true, 'type': 'preparat'}, 
        (err,magacin)=> {
            if(err) console.log(err);
            else res.json(magacin);
        });
    }
);

router.route('/preparatiDodaj').post(
    (req, res) => {
        let garden = req.body.garden; 
        let name = req.body.name;
        let sadnica = req.body.sadnica;
        let napredak = req.body.napredak;
        let w = req.body.w;
        let h = req.body.h;

        Plant.findOneAndUpdate({'garden': garden, 'username': name, 'w': w, 'h':h,       
        'sadnica': sadnica}, {'napredak':napredak},
        (err,plant)=> {
            if(err) console.log(err);
            else res.json('ok');
        });
    }
);

router.route('/preparatNapredak').post(
    (req, res) => {
        let garden = req.body.garden; 
        let name = req.body.name;
        let sadnica = req.body.sadnica;
        let w = req.body.w;
        let h = req.body.h;

        Plant.find({'garden': garden, 'username': name, 'sadnica': sadnica, 'w': w, 'h':h},
        (err,plant)=> {
            if(err) console.log(err);
            else res.json(plant);
        });
    }
);

router.route('/izvadiSadnicu').post(
    (req, res) => {
        let garden = req.body.garden; 
        let username = req.body.username;
        let sadnica = req.body.sadnica;
        let w = req.body.w;
        let h = req.body.h;

        Plant.findOneAndUpdate({'garden': garden, 'username': username, 'sadnica': sadnica, 'w': w, 'h':h}, {'spremna': true},
        (err,plant)=> {
            if(err) console.log(err);
            else {

                Garden.find({'owner': username, 'name': garden},
                (err, g)=> {
                    if(err) console.log(err);
                    else {
                        let sadnice: number = +(g[0].get('sadn'));
                        let ukupno: number = +(g[0].get('totalSadn'));
                        sadnice = sadnice - 1;
                        ukupno = ukupno + 1;

                        Garden.findOneAndUpdate({'owner': username, 'name': garden}, 
                            {'sadn': sadnice.toString(), 'totalSadn': ukupno.toString() },
                            (err, ga)=> {
                                if(err) console.log(err);
                                else res.json('ok');
                            })
                        
                    }           
        })

            }
        });
    }
);


router.route('/sadniceRasadnika').post(
    (req,res) => {
        let garden = req.body.garden; 
        let username = req.body.username;

        Magacin.find({'owner': username, 'garden': garden, 'type': 'sadnica', 'arrived': true},
        (err, magacin)=> {
            if(err) console.log(err);
            else res.json(magacin);            
        })
    });


    router.route('/zasadi').post(
        (req,res) => {
         let oc = new Plant(req.body);
    
         oc.save()
         .then(oc => {
            res.status(200).json({'uspeh':'ok'})
         })
         .catch(err => {
            res.status(400).json({'uspeh':'nok'})
        })
        }
    );

    router.route('/smanjiKolicinu').post(
        (req,res) => {
            let garden = req.body.garden; 
            let username = req.body.username;
            let kod = req.body.kod;
            let kol = req.body.kol;

            Magacin.findOneAndUpdate({'owner': username, 'garden': garden, 'codeOfProd': kod,
             'type': 'sadnica', 'arrived': true}, {'amount': kol},
            (err, magacin)=> {
                if(err) console.log(err);
                else res.json('ok');            
            })
        }
    );

    router.route('/porukaPrikaz').post(
        (req,res) => {
            let username = req.body.username;
    
            Garden.find({'owner': username},
            (err, g)=> {
                if(err) console.log(err);
                else res.json(g);            
            })
        });

   router.route('/azurirajRasadnik').post(
        (req,res) => {
            let username = req.body.username;
            let name = req.body.name;

            Garden.find({'owner': username, 'name': name},
                (err, g)=> {
                    if(err) console.log(err);
                    else {
                        let sadnice: number = +(g[0].get('sadn'));
                        let ukupno: number = +(g[0].get('totalSadn'));
                        sadnice = sadnice + 1;
                        ukupno = ukupno - 1;

                        Garden.findOneAndUpdate({'owner': username, 'name': name}, 
                            {'sadn': sadnice.toString(), 'totalSadn': ukupno.toString() },
                            (err, ga)=> {
                                if(err) console.log(err);
                                else res.json('ok');
                            })
                        
                    }           
        })
    });


    router.route('/dodajUMagacin').post(
        (req,res) => {
            let garden = req.body.garden; 
            let username = req.body.username;
            let kod = req.body.kod;

            Magacin.findOneAndUpdate({'owner': username, 'garden': garden, 'codeOfProd': kod},
             {'arrived': true},
            (err, magacin)=> {
                if(err) console.log(err);
                else res.json('ok');            
            })
        }
    );


    router.route('/umanjiKolProdukta').post(
        (req,res) => {
            let amount: number = +(req.body.amount) 
            let kod = req.body.kod;

            Product.find({'codePr': kod},
            (err,product)=> {
                if(err) console.log(err);
                else {
                    let trKol: number = +(product[0].get('amount'))
                    trKol = trKol - amount

                    Product.findOneAndUpdate({'codePr': kod}, {'amount': trKol.toString()},
                    (err,product)=> {
                        if(err) console.log(err);
                        else res.json('ok');
                    })
                } 
            })
        }
    );


    router.route('/zauzmiKurira').post(
        (req, res) => {
            let name = req.body.name;
            let datum = req.body.datum;

            Courier.findOneAndUpdate({'name': name}, {'notAv': datum, 'available': false},
                (err, courier)=> {
                    if(err) console.log(err);
                    else res.json('ok');
                }
            )
        }
    )


    router.route('/mozeDaZasadi').post(
        (req, res) => {
            let w = req.body.w;
            let h = req.body.h;
            let kod = req.body.kod;

            let i = parseInt(w);
            let j = parseInt(h);
   
            Product.find({'codePr': kod},
            (err,product)=> {
                if(err) console.log(err);
                else {
                    let neSme = product[0].get('neSmePored');
                    if(neSme == undefined){
                        res.json('ok')
                    } else {
                        Plant.find({'name': neSme}, 
                        (err,plant)=>{
                            if(err) console.log(err);
                            else {
                                    if(Object.keys(plant).length === 0) {
                                        res.json('ok')
                                    } else {
                                       let w = parseInt(plant[0].get('w'));
                                       let h = parseInt(plant[0].get('h'));
                                        
                                       if((i-1 == w && j == h) || (i == w && j-1 == h) ||
                                       (i+1 == w && j == h) || (i == w && j+1 == h)){
                                        res.json('nok')
                                       } else {
                                        res.json('ok')
                                       }

                                    }
                                
                                }
                
                            }
                        )


                    }
                }
            });

        }
    );





app.use('/', router);
app.listen(4000, () => console.log(`Express server running on port 4000`));
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const node_cron_1 = __importDefault(require("node-cron"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const app = express_1.default();
app.use(cors_1.default());
app.use(body_parser_1.default.json());
mongoose_1.default.connect('mongodb://localhost:27017/projekat', { useNewUrlParser: true });
const connection = mongoose_1.default.connection;
connection.once('open', () => {
    console.log('Database connected');
});
const router = express_1.default.Router();
const admin_1 = __importDefault(require("./models/admin"));
const farmer_1 = __importDefault(require("./models/farmer"));
const firm_1 = __importDefault(require("./models/firm"));
const garden_1 = __importDefault(require("./models/garden"));
const magacin_1 = __importDefault(require("./models/magacin"));
const product_1 = __importDefault(require("./models/product"));
const comment_1 = __importDefault(require("./models/comment"));
const rate_1 = __importDefault(require("./models/rate"));
const courier_1 = __importDefault(require("./models/courier"));
const plant_1 = __importDefault(require("./models/plant"));
//updejt t i h20 na svakih 1h
node_cron_1.default.schedule('*/58 * * * *', () => {
    garden_1.default.find({}, (err, garden) => {
        if (err)
            console.log(err);
        else {
            for (let i = 0; i < Object.keys(garden).length; i++) {
                let temperatura = +(garden[i].get('temp'));
                let voda = +(garden[i].get('h20'));
                temperatura = temperatura - 0.5;
                voda = voda - 1;
                garden_1.default.updateMany({ 'name': garden[i].get('name') }, { 'temp': temperatura.toString(),
                    'h20': voda.toString() }, (err, gard) => {
                    if (err)
                        console.log(err);
                    else
                        console.log('temperatura i voda smanjene');
                });
            }
        }
    });
});
// za slanje mejlova ako je t i h20 ispod nekog praga
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
let transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: "agroadm123@gmail.com",
        pass: "Agro123@@"
    }, tls: {
        rejectUnauthorized: false
    }
});
node_cron_1.default.schedule('*/59 * * * *', () => {
    garden_1.default.find({}, (err, garden) => {
        if (err)
            console.log(err);
        else {
            for (let i = 0; i < Object.keys(garden).length; i++) {
                let temperatura = +(garden[i].get('temp'));
                let voda = +(garden[i].get('h20'));
                if (temperatura < 12 || voda < 75) {
                    farmer_1.default.find({ 'username': garden[i].get('owner') }, (err, farmer) => {
                        if (err)
                            console.log(err);
                        else {
                            let mejl = farmer[0].get('mail');
                            let mailOptions = {
                                from: "agroadm123@gmail.com",
                                to: mejl,
                                subject: `Agrofarm app ;)`,
                                text: `Zdravo, vas rasadnik zahteva odrzavanje.`
                            };
                            transporter.sendMail(mailOptions, function (error, info) {
                                if (error) {
                                    throw error;
                                }
                                else {
                                    console.log("Email uspesno poslat!");
                                }
                            });
                        }
                    });
                }
            }
        }
    });
});
//da moze da se sadi
node_cron_1.default.schedule('0 0 */3 * *', () => {
    plant_1.default.findOneAndDelete({ 'spremna': true }, (err, plant) => {
        if (err)
            console.log(err);
        else {
            console.log('obrisana i moze da se zasadi');
        }
    });
});
//povecanje napretka svakog dana u 01:00 casova
node_cron_1.default.schedule('0 1 */1 * *', () => {
    plant_1.default.find({ 'spremna': false }, (err, plant) => {
        if (err)
            console.log(err);
        else {
            for (let i = 0; i < Object.keys(plant).length; i++) {
                let napredak = +(plant[i].get('napredak'));
                if (napredak !== 100) {
                    napredak = napredak + 10;
                    plant_1.default.updateMany({ 'sadnica': plant[i].get('sadnica') }, { 'napredak': napredak.toString() }, (err, pl) => {
                        if (err)
                            console.log(err);
                        else
                            console.log('updatejtovan napredak svake od biljaka');
                    });
                }
            }
        }
    });
});
//kurire pogledaj da li su se oslobodili ili ne 
node_cron_1.default.schedule('0 */2 * * *', () => {
    courier_1.default.find({ 'available': false }, (err, courier) => {
        if (err)
            console.log(err);
        else {
            for (let i = 0; i < Object.keys(courier).length; i++) {
                let vreme = courier[i].get('notAv');
                let name = courier[i].get('name');
                let sada = new Date();
                if (sada.getTime() >= vreme.getTime()) {
                    courier_1.default.updateMany({ 'name': name }, { 'available': true }, (err, c) => {
                        if (err)
                            console.log(err);
                        else
                            console.log('kurir je slobodan ponovo');
                    });
                }
            }
        }
    });
});
//slanje poklona
node_cron_1.default.schedule('0 8 * * Mon', () => {
    magacin_1.default.find({}, (err, magacin) => {
        if (err)
            console.log(err);
        else {
            let korisnici = [];
            //sve korisnike uzmem
            for (let i = 0; i < Object.keys(magacin).length; i++) {
                if (!korisnici.includes(magacin[i].get('owner'))) {
                    korisnici.push(magacin[i].get('owner'));
                }
            }
            // za svakog nadjem rasadnike
            korisnici.forEach(korisnik => {
                let rasadnici = [];
                for (let i = 0; i < Object.keys(magacin).length; i++) {
                    if (!rasadnici.includes(magacin[i].get('garden')) && korisnik == magacin[i].get('owner')) {
                        rasadnici.push(magacin[i].get('garden'));
                    }
                }
                //za svaki rasadnik nadjem firme koje ima
                rasadnici.forEach(rasadnik => {
                    let preduzeca = [];
                    for (let i = 0; i < Object.keys(magacin).length; i++) {
                        if (!preduzeca.includes(magacin[i].get('company')) && korisnik == magacin[i].get('owner')
                            && rasadnik == magacin[i].get('garden')) {
                            preduzeca.push(magacin[i].get('company'));
                        }
                    }
                    //za svaku firmu proverim broj narudzbina 
                    preduzeca.forEach(preduzece => {
                        let brojProizvoda = 0;
                        for (let i = 0; i < Object.keys(magacin).length; i++) {
                            if (preduzece == magacin[i].get('company') && korisnik == magacin[i].get('owner')
                                && rasadnik == magacin[i].get('garden') && magacin[i].get('arrived') == true) {
                                brojProizvoda++;
                            }
                        }
                        //ako je broj proizvoda veci od 10 salji nagradu
                        if (brojProizvoda < 10) {
                            //nadjemo neki proizvod ovog preduzeca 
                            product_1.default.find({ 'owner': preduzece }, (err, product) => {
                                if (err)
                                    console.log(err);
                                else {
                                    let proizvodi = [];
                                    for (let i = 0; i < Object.keys(product).length; i++) {
                                        if (product[i].get('amount') !== '0') {
                                            proizvodi.push(product[i].get('codePr'));
                                        }
                                    }
                                    let poklon = proizvodi[Math.floor(Math.random() * proizvodi.length)];
                                    console.log(poklon);
                                    product_1.default.find({ 'codePr': poklon }, (err, pr) => {
                                        if (err)
                                            console.log(err);
                                        else {
                                            //smanjimo mu kolicinu
                                            let kol = parseInt(pr[0].get('amount'));
                                            let novaKol = kol - 1;
                                            product_1.default.findOneAndUpdate({ 'codePr': poklon }, { 'amount': novaKol.toString() }, (err, p) => {
                                                if (err)
                                                    console.log(err);
                                                else {
                                                    //ubacimo taj proizvod u magacin u magacin
                                                    //prvo provera da li imamo proizvod
                                                    magacin_1.default.find({ 'codeOfProd': poklon }, (err, mag) => {
                                                        if (err)
                                                            console.log(err);
                                                        else {
                                                            //ako imamo samo updejtujemo kolicinu
                                                            if (Object.keys(mag).length != 0) {
                                                                let kolic = parseInt(mag[0].get('amount'));
                                                                let novaKolic = kolic + 1;
                                                                magacin_1.default.findOneAndUpdate({ 'codeOfProd': poklon }, { 'amount': novaKolic.toString() }, (err, m) => {
                                                                    if (err)
                                                                        console.log(err);
                                                                    else {
                                                                        console.log("Dodat je poklon!");
                                                                    }
                                                                });
                                                            }
                                                            else {
                                                                //nadji ime od produkta
                                                                product_1.default.find({ 'codePr': poklon }, (err, pr) => {
                                                                    if (err)
                                                                        console.log(err);
                                                                    else {
                                                                        //dodamo u magacin
                                                                        let datum = new Date();
                                                                        let imePoklona = pr[0].get("name");
                                                                        let tip = pr[0].get("type");
                                                                        magacin_1.default.insertMany({ 'codeOfProd': poklon, 'name': imePoklona, 'company': preduzece,
                                                                            'amount': '1', 'type': tip, 'arrived': true, 'owner': korisnik,
                                                                            'buy': datum, 'garden': rasadnik }, (err, ma) => {
                                                                            if (err)
                                                                                console.log(err);
                                                                            else {
                                                                                console.log("Dodat je nov poklon!");
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                });
            });
        }
    });
});
router.route('/loginAdm').post((req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let type = req.body.type;
    admin_1.default.find({ 'username': username, 'password': password, 'type': type }, (err, admin) => {
        if (err)
            console.log(err);
        else
            res.json(admin);
    });
});
router.route('/loginPolj').post((req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let type = req.body.type;
    farmer_1.default.find({ 'username': username, 'password': password, 'type': type, 'approved': true }, (err, farmer) => {
        if (err)
            console.log(err);
        else
            res.json(farmer);
    });
});
router.route('/loginPred').post((req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let type = req.body.type;
    firm_1.default.find({ 'username': username, 'password': password, 'type': type, 'approved': true }, (err, firm) => {
        if (err)
            console.log(err);
        else
            res.json(firm);
    });
});
router.route('/okUsernamePolj').post((req, res) => {
    let username = req.body.username;
    farmer_1.default.find({ 'username': username }, (err, farmer) => {
        if (err)
            console.log(err);
        else
            res.json(farmer);
    });
});
router.route('/okUsernamePred').post((req, res) => {
    let username = req.body.username;
    firm_1.default.find({ 'username': username }, (err, firm) => {
        if (err)
            console.log(err);
        else
            res.json(firm);
    });
});
router.route('/registerPolj').post((req, res) => {
    let farmer = new farmer_1.default(req.body);
    farmer.save()
        .then(farmer => {
        res.status(200).json({ 'uspeh': 'ok' });
    }).catch(err => {
        res.status(400).json({ 'uspeh': 'no' });
    });
});
router.route('/registerPred').post((req, res) => {
    let firm = new firm_1.default(req.body);
    firm.save()
        .then(firm => {
        res.status(200).json({ 'uspeh': 'ok' });
    }).catch(err => {
        res.status(400).json({ 'uspeh': 'no' });
    });
});
router.route('/zahtevFarmer').get((req, res) => {
    farmer_1.default.find({ 'approved': false }, (err, farmer) => {
        if (err)
            console.log(err);
        else
            res.json(farmer);
    });
});
router.route('/zahtevFirme').get((req, res) => {
    firm_1.default.find({ 'approved': false }, (err, firm) => {
        if (err)
            console.log(err);
        else
            res.json(firm);
    });
});
router.route('/sviFarmeri').get((req, res) => {
    farmer_1.default.find({ 'approved': true }, (err, farmer) => {
        if (err)
            console.log(err);
        else
            res.json(farmer);
    });
});
router.route('/sveFirme').get((req, res) => {
    firm_1.default.find({ 'approved': true }, (err, firm) => {
        if (err)
            console.log(err);
        else
            res.json(firm);
    });
});
router.route('/prihvPolj').post((req, res) => {
    let username = req.body.username;
    farmer_1.default.findOneAndUpdate({ 'username': username }, { 'approved': true }, (err, farmer) => {
        if (err)
            console.log(err);
        else
            res.json('ok');
    });
});
router.route('/odbijPolj').post((req, res) => {
    let username = req.body.username;
    farmer_1.default.findOneAndDelete({ 'username': username }, (err, farmer) => {
        if (err)
            console.log(err);
        else
            res.json('ok');
    });
});
router.route('/prihvPred').post((req, res) => {
    let username = req.body.username;
    farmer_1.default.findOneAndUpdate({ 'username': username }, { 'approved': true }, (err, farmer) => {
        if (err)
            console.log(err);
        else
            res.json('ok');
    });
});
router.route('/odbijPred').post((req, res) => {
    let username = req.body.username;
    firm_1.default.findOneAndDelete({ 'username': username }, (err, firm) => {
        if (err)
            console.log(err);
        else
            res.json('ok');
    });
});
router.route('/okPassPolj').post((req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    farmer_1.default.find({ 'username': username, 'password': password }, (err, farmer) => {
        if (err)
            console.log(err);
        else
            res.json(farmer);
    });
});
router.route('/okPassPred').post((req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    firm_1.default.find({ 'username': username, 'password': password }, (err, firm) => {
        if (err)
            console.log(err);
        else
            res.json(firm);
    });
});
router.route('/okPassAdm').post((req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    admin_1.default.find({ 'username': username, 'password': password }, (err, admin) => {
        if (err)
            console.log(err);
        else
            res.json(admin);
    });
});
router.route('/changePassPolj').post((req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    farmer_1.default.findOneAndUpdate({ 'username': username }, { 'password': password }, (err, farmer) => {
        if (err)
            console.log(err);
        else
            res.json('ok');
    });
});
router.route('/changePassPred').post((req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    firm_1.default.findOneAndUpdate({ 'username': username }, { 'password': password }, (err, firm) => {
        if (err)
            console.log(err);
        else
            res.json('ok');
    });
});
router.route('/changePassAdm').post((req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    admin_1.default.findOneAndUpdate({ 'username': username }, { 'password': password }, (err, admin) => {
        if (err)
            console.log(err);
        else
            res.json('ok');
    });
});
router.route('/dohvatiPolj').post((req, res) => {
    let username = req.body.username;
    farmer_1.default.find({ 'username': username }, (err, farmer) => {
        if (err)
            console.log(err);
        else
            res.json(farmer);
    });
});
router.route('/dohvatiPred').post((req, res) => {
    let username = req.body.username;
    firm_1.default.find({ 'username': username }, (err, firm) => {
        if (err)
            console.log(err);
        else
            res.json(firm);
    });
});
router.route('/azPolj').post((req, res) => {
    let userOld = req.body.userOld;
    let item = {
        username: req.body.username,
        lastname: req.body.lastname,
        name: req.body.name,
        mail: req.body.mail,
        dateOfBirth: req.body.dateOfBirth,
        cityOfBirth: req.body.cityOfBirth,
        phone: req.body.phone
    };
    farmer_1.default.findOneAndUpdate({ 'username': userOld }, { $set: item }, (err, farmer) => {
        if (err)
            console.log(err);
        else
            res.json('ok');
    });
});
router.route('/azPred').post((req, res) => {
    let userOld = req.body.userOld;
    let item = {
        username: req.body.username,
        name: req.body.name,
        mail: req.body.mail,
        date: req.body.date,
        city: req.body.city
    };
    firm_1.default.findOneAndUpdate({ 'username': userOld }, { $set: item }, (err, firm) => {
        if (err)
            console.log(err);
        else
            res.json('ok');
    });
});
router.route('/sviRasadnici').post((req, res) => {
    let username = req.body.username;
    garden_1.default.find({ 'owner': username }, (err, garden) => {
        if (err)
            console.log(err);
        else
            res.json(garden);
    });
});
router.route('/dodajRasadnik').post((req, res) => {
    let garden = new garden_1.default(req.body);
    garden.save()
        .then(garden => {
        res.status(200).json({ 'uspeh': 'ok' });
    })
        .catch(err => {
        res.status(400).json({ 'uspeh': 'nok' });
    });
});
router.route('/okImeRasadnika').post((req, res) => {
    let username = req.body.username;
    let name = req.body.name;
    garden_1.default.find({ 'owner': username, 'name': name }, (err, garden) => {
        if (err)
            console.log(err);
        else
            res.json(garden);
    });
});
router.route('/sviProizvodi').post((req, res) => {
    let username = req.body.username;
    magacin_1.default.find({ 'owner': username, 'arrived': true }, (err, magacin) => {
        if (err)
            console.log(err);
        else
            res.json(magacin);
    });
});
router.route('/imaPrUMagacinu').post((req, res) => {
    let kod = req.body.kod;
    magacin_1.default.find({ 'codeOfProd': kod }, (err, magacin) => {
        if (err)
            console.log(err);
        else
            res.json(magacin);
    });
});
router.route('/sveNarudzbine').post((req, res) => {
    let username = req.body.username;
    magacin_1.default.find({ 'owner': username, 'arrived': false }, (err, magacin) => {
        if (err)
            console.log(err);
        else
            res.json(magacin);
    });
});
router.route('/brisanjeNarudzbine').post((req, res) => {
    let kod = req.body.kod;
    magacin_1.default.findOneAndDelete({ 'codeOfProd': kod, 'arrived': false }, (err, magacin) => {
        if (err)
            console.log(err);
        else
            res.json('ok');
    });
});
router.route('/sveSadnice').get((req, res) => {
    product_1.default.find({ 'type': 'sadnica' }, (err, product) => {
        if (err)
            console.log(err);
        else
            res.json(product);
    });
});
router.route('/sviPreparati').get((req, res) => {
    product_1.default.find({ 'type': 'preparat' }, (err, product) => {
        if (err)
            console.log(err);
        else
            res.json(product);
    });
});
router.route('/sveNarudzbineIkad').post((req, res) => {
    let firma = req.body.firma;
    magacin_1.default.find({ 'company': firma }, (err, magacin) => {
        if (err)
            console.log(err);
        else
            res.json(magacin);
    });
});
router.route('/nazivFirme').post((req, res) => {
    let username = req.body.username;
    firm_1.default.find({ 'username': username }, (err, firm) => {
        if (err)
            console.log(err);
        else
            res.json(firm);
    });
});
router.route('/sveNar').post((req, res) => {
    let firma = req.body.firma;
    magacin_1.default.find({ 'company': firma, 'arrived': false }, (err, magacin) => {
        if (err)
            console.log(err);
        else
            res.json(magacin);
    });
});
router.route('/sviPrFirme').post((req, res) => {
    let firma = req.body.firma;
    product_1.default.find({ 'owner': firma }, (err, product) => {
        if (err)
            console.log(err);
        else
            res.json(product);
    });
});
router.route('/sveFirmineSadnice').post((req, res) => {
    let firma = req.body.firma;
    product_1.default.find({ 'owner': firma, 'type': 'sadnica' }, (err, product) => {
        if (err)
            console.log(err);
        else
            res.json(product);
    });
});
router.route('/obrisiPrFirme').post((req, res) => {
    let code = req.body.codePr;
    product_1.default.findOneAndDelete({ 'codePr': code }, (err, product) => {
        if (err)
            console.log(err);
        else
            res.json('ok');
    });
});
router.route('/sviKomentari').post((req, res) => {
    let code = req.body.kod;
    comment_1.default.find({ 'codePr': code }, (err, cmt) => {
        if (err)
            console.log(err);
        else
            res.json(cmt);
    });
});
router.route('/dajOcenu').post((req, res) => {
    let code = req.body.kod;
    product_1.default.findOne({ 'codePr': code }, (err, product) => {
        if (err)
            console.log(err);
        else
            res.json(product.get('avRate'));
    });
});
router.route('/grad').post((req, res) => {
    let name = req.body.name;
    let owner = req.body.owner;
    garden_1.default.findOne({ 'name': name, 'owner': owner }, (err, product) => {
        if (err)
            console.log(err);
        else
            res.json(product.get('place'));
    });
});
router.route('/imaOcena').post((req, res) => {
    let code = req.body.kod;
    let username = req.body.username;
    rate_1.default.findOne({ 'codePr': code, 'user': username }, (err, rate) => {
        if (err)
            console.log(err);
        else
            res.json(rate);
    });
});
router.route('/sveOcene').post((req, res) => {
    let code = req.body.kod;
    rate_1.default.find({ 'codePr': code }, (err, rate) => {
        if (err)
            console.log(err);
        else
            res.json(rate);
    });
});
router.route('/imaKom').post((req, res) => {
    let code = req.body.kod;
    let username = req.body.username;
    comment_1.default.findOne({ 'codePr': code, 'user': username }, (err, comment) => {
        if (err)
            console.log(err);
        else
            res.json(comment);
    });
});
router.route('/dodajKom').post((req, res) => {
    let kom = new comment_1.default(req.body);
    kom.save()
        .then(kom => {
        res.status(200).json({ 'uspeh': 'ok' });
    })
        .catch(err => {
        res.status(400).json({ 'uspeh': 'nok' });
    });
});
router.route('/dodajOcenu').post((req, res) => {
    let oc = new rate_1.default(req.body);
    oc.save()
        .then(oc => {
        let kod = req.body.codePr;
        let ocena = req.body.rate;
        let o = +(ocena);
        rate_1.default.find({ 'codePr': kod }, (err, rate) => {
            if (err)
                console.log(err);
            else {
                let brOcena = Object.keys(rate).length;
                let zbir = 0;
                for (let i = 0; i < brOcena; i++) {
                    zbir += +(rate[i].get('rate'));
                }
                zbir = zbir / brOcena;
                product_1.default.findOneAndUpdate({ 'codePr': kod }, { 'avRate': zbir.toString() }, (err, product) => {
                    if (err)
                        console.log(err);
                    else {
                        res.status(200).json({ 'uspeh': 'ok' });
                    }
                });
            }
        });
    })
        .catch(err => {
        res.status(400).json({ 'uspeh': 'nok' });
    });
});
router.route('/dodajProizvod').post((req, res) => {
    let oc = new product_1.default(req.body);
    oc.save()
        .then(oc => {
        res.status(200).json({ 'uspeh': 'ok' });
    })
        .catch(err => {
        res.status(400).json({ 'uspeh': 'nok' });
    });
});
router.route('/okKod').post((req, res) => {
    let code = req.body.kod;
    product_1.default.findOne({ 'codePr': code }, (err, pr) => {
        if (err)
            console.log(err);
        else
            res.json(pr);
    });
});
router.route('/sviKupljeni').post((req, res) => {
    let code = req.body.kod;
    product_1.default.find({ 'codePr': code }, (err, pr) => {
        if (err)
            console.log(err);
        else
            res.json(pr);
    });
});
router.route('/dohvatiKol').post((req, res) => {
    let code = req.body.kod;
    product_1.default.find({ 'codePr': code }, (err, pr) => {
        if (err)
            console.log(err);
        else
            res.json(pr);
    });
});
router.route('/umanjiKol').post((req, res) => {
    let code = req.body.kod;
    let kol = req.body.kol;
    product_1.default.findOneAndUpdate({ 'codePr': code }, { 'amount': kol }, (err, pr) => {
        if (err)
            console.log(err);
        else
            res.json('ok');
    });
});
router.route('/kupiPr').post((req, res) => {
    let oc = new magacin_1.default(req.body);
    oc.save()
        .then(oc => {
        res.status(200).json({ 'uspeh': 'ok' });
    })
        .catch(err => {
        res.status(400).json({ 'uspeh': 'nok' });
    });
});
router.route('/obrisiNarudzbinu').post((req, res) => {
    let code = req.body.kod;
    let amount = req.body.amount;
    let owner = req.body.owner;
    magacin_1.default.findOneAndDelete({ 'codeOfProd': code, 'amount': amount, 'owner': owner, 'arrived': false }, (err, mag) => {
        if (err)
            console.log(err);
        else
            res.json('ok');
    });
});
router.route('/nisuSlobodni').get((req, res) => {
    courier_1.default.find({ 'available': true }, (err, pr) => {
        if (err)
            console.log(err);
        else
            res.json(pr);
    });
});
router.route('/dohvatiRasadnik').post((req, res) => {
    let name = req.body.name;
    garden_1.default.find({ 'name': name }, (err, garden) => {
        if (err)
            console.log(err);
        else
            res.json(garden);
    });
});
router.route('/updatejtujT').post((req, res) => {
    let name = req.body.name;
    let temp = req.body.temp;
    garden_1.default.findOneAndUpdate({ 'name': name }, { 'temp': temp }, (err, garden) => {
        if (err)
            console.log(err);
        else
            res.json('ok');
    });
});
router.route('/updatejtujV').post((req, res) => {
    let name = req.body.name;
    let voda = req.body.voda;
    garden_1.default.findOneAndUpdate({ 'name': name }, { 'h20': voda }, (err, garden) => {
        if (err)
            console.log(err);
        else
            res.json('ok');
    });
});
router.route('/sadnica').post((req, res) => {
    let username = req.body.username;
    let name = req.body.name;
    let w = req.body.w;
    let h = req.body.h;
    plant_1.default.find({ 'garden': name, 'username': username, 'w': w, 'h': h }, (err, plant) => {
        if (err)
            console.log(err);
        else
            res.json(plant);
    });
});
router.route('/sveZasadjene').post((req, res) => {
    let username = req.body.username;
    let name = req.body.name;
    plant_1.default.find({ 'garden': name, 'username': username }, (err, plant) => {
        if (err)
            console.log(err);
        else
            res.json(plant);
    });
});
router.route('/preparatiRasadnika').post((req, res) => {
    let owner = req.body.owner;
    let garden = req.body.garden;
    magacin_1.default.find({ 'garden': garden, 'owner': owner, 'arrived': true, 'type': 'preparat' }, (err, magacin) => {
        if (err)
            console.log(err);
        else
            res.json(magacin);
    });
});
router.route('/preparatiDodaj').post((req, res) => {
    let garden = req.body.garden;
    let name = req.body.name;
    let sadnica = req.body.sadnica;
    let napredak = req.body.napredak;
    let w = req.body.w;
    let h = req.body.h;
    plant_1.default.findOneAndUpdate({ 'garden': garden, 'username': name, 'w': w, 'h': h,
        'sadnica': sadnica }, { 'napredak': napredak }, (err, plant) => {
        if (err)
            console.log(err);
        else
            res.json('ok');
    });
});
router.route('/preparatNapredak').post((req, res) => {
    let garden = req.body.garden;
    let name = req.body.name;
    let sadnica = req.body.sadnica;
    let w = req.body.w;
    let h = req.body.h;
    plant_1.default.find({ 'garden': garden, 'username': name, 'sadnica': sadnica, 'w': w, 'h': h }, (err, plant) => {
        if (err)
            console.log(err);
        else
            res.json(plant);
    });
});
router.route('/izvadiSadnicu').post((req, res) => {
    let garden = req.body.garden;
    let username = req.body.username;
    let sadnica = req.body.sadnica;
    let w = req.body.w;
    let h = req.body.h;
    plant_1.default.findOneAndUpdate({ 'garden': garden, 'username': username, 'sadnica': sadnica, 'w': w, 'h': h }, { 'spremna': true }, (err, plant) => {
        if (err)
            console.log(err);
        else {
            garden_1.default.find({ 'owner': username, 'name': garden }, (err, g) => {
                if (err)
                    console.log(err);
                else {
                    let sadnice = +(g[0].get('sadn'));
                    let ukupno = +(g[0].get('totalSadn'));
                    sadnice = sadnice - 1;
                    ukupno = ukupno + 1;
                    garden_1.default.findOneAndUpdate({ 'owner': username, 'name': garden }, { 'sadn': sadnice.toString(), 'totalSadn': ukupno.toString() }, (err, ga) => {
                        if (err)
                            console.log(err);
                        else
                            res.json('ok');
                    });
                }
            });
        }
    });
});
router.route('/sadniceRasadnika').post((req, res) => {
    let garden = req.body.garden;
    let username = req.body.username;
    magacin_1.default.find({ 'owner': username, 'garden': garden, 'type': 'sadnica', 'arrived': true }, (err, magacin) => {
        if (err)
            console.log(err);
        else
            res.json(magacin);
    });
});
router.route('/zasadi').post((req, res) => {
    let oc = new plant_1.default(req.body);
    oc.save()
        .then(oc => {
        res.status(200).json({ 'uspeh': 'ok' });
    })
        .catch(err => {
        res.status(400).json({ 'uspeh': 'nok' });
    });
});
router.route('/smanjiKolicinu').post((req, res) => {
    let garden = req.body.garden;
    let username = req.body.username;
    let kod = req.body.kod;
    let kol = req.body.kol;
    magacin_1.default.findOneAndUpdate({ 'owner': username, 'garden': garden, 'codeOfProd': kod,
        'type': 'sadnica', 'arrived': true }, { 'amount': kol }, (err, magacin) => {
        if (err)
            console.log(err);
        else
            res.json('ok');
    });
});
router.route('/porukaPrikaz').post((req, res) => {
    let username = req.body.username;
    garden_1.default.find({ 'owner': username }, (err, g) => {
        if (err)
            console.log(err);
        else
            res.json(g);
    });
});
router.route('/azurirajRasadnik').post((req, res) => {
    let username = req.body.username;
    let name = req.body.name;
    garden_1.default.find({ 'owner': username, 'name': name }, (err, g) => {
        if (err)
            console.log(err);
        else {
            let sadnice = +(g[0].get('sadn'));
            let ukupno = +(g[0].get('totalSadn'));
            sadnice = sadnice + 1;
            ukupno = ukupno - 1;
            garden_1.default.findOneAndUpdate({ 'owner': username, 'name': name }, { 'sadn': sadnice.toString(), 'totalSadn': ukupno.toString() }, (err, ga) => {
                if (err)
                    console.log(err);
                else
                    res.json('ok');
            });
        }
    });
});
router.route('/dodajUMagacin').post((req, res) => {
    let garden = req.body.garden;
    let username = req.body.username;
    let kod = req.body.kod;
    magacin_1.default.findOneAndUpdate({ 'owner': username, 'garden': garden, 'codeOfProd': kod }, { 'arrived': true }, (err, magacin) => {
        if (err)
            console.log(err);
        else
            res.json('ok');
    });
});
router.route('/umanjiKolProdukta').post((req, res) => {
    let amount = +(req.body.amount);
    let kod = req.body.kod;
    product_1.default.find({ 'codePr': kod }, (err, product) => {
        if (err)
            console.log(err);
        else {
            let trKol = +(product[0].get('amount'));
            trKol = trKol - amount;
            product_1.default.findOneAndUpdate({ 'codePr': kod }, { 'amount': trKol.toString() }, (err, product) => {
                if (err)
                    console.log(err);
                else
                    res.json('ok');
            });
        }
    });
});
router.route('/zauzmiKurira').post((req, res) => {
    let name = req.body.name;
    let datum = req.body.datum;
    courier_1.default.findOneAndUpdate({ 'name': name }, { 'notAv': datum, 'available': false }, (err, courier) => {
        if (err)
            console.log(err);
        else
            res.json('ok');
    });
});
router.route('/mozeDaZasadi').post((req, res) => {
    let w = req.body.w;
    let h = req.body.h;
    let kod = req.body.kod;
    let i = parseInt(w);
    let j = parseInt(h);
    product_1.default.find({ 'codePr': kod }, (err, product) => {
        if (err)
            console.log(err);
        else {
            let neSme = product[0].get('neSmePored');
            if (neSme == undefined) {
                res.json('ok');
            }
            else {
                plant_1.default.find({ 'name': neSme }, (err, plant) => {
                    if (err)
                        console.log(err);
                    else {
                        if (Object.keys(plant).length === 0) {
                            res.json('ok');
                        }
                        else {
                            let w = parseInt(plant[0].get('w'));
                            let h = parseInt(plant[0].get('h'));
                            if ((i - 1 == w && j == h) || (i == w && j - 1 == h) ||
                                (i + 1 == w && j == h) || (i == w && j + 1 == h)) {
                                res.json('nok');
                            }
                            else {
                                res.json('ok');
                            }
                        }
                    }
                });
            }
        }
    });
});
app.use('/', router);
app.listen(4000, () => console.log(`Express server running on port 4000`));
//# sourceMappingURL=server.js.map
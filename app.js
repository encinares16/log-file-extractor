import fs from 'fs';
import readline from 'readline';
import promptSync from 'prompt-sync';
import createDirectory from './helpers/createDirectory.js'; 
import regex from './helpers/regex.js';
import module from './helpers/module.js';

const prompt = promptSync();

let matches = [];
let sevenpay = null;

do {
    sevenpay = prompt('Enter 7connect reference: ');
    if(regex.reference.test(sevenpay)) {
        break;
    } 
    console.log(`Incorrect 7connect reference '${sevenpay}'\n`)
} while (!regex.reference.test(sevenpay) || ''); 

const file = prompt('Input file logs to extract: ');
console.log(`\n7connect reference logs to extract: ${sevenpay}\n`)

let folder = createDirectory();

async function extract(){
    const filestream = fs.createReadStream(file);
    const readlines = readline.createInterface({
        input: filestream,
        crlfDelay: Infinity
    });
    
    const start = performance.now();
    module.getTime("start");
    
    for await(const line of readlines){

        module.appendLine(matches, line);

        if(line.match(regex['log-closing-tag'])){
            if(matches.find(data => data.match(sevenpay)) == undefined){
                matches = [];
            } else {
                // array.map(data => console.log(data.match(test)))
                matches.map(data => {
                    fs.appendFileSync(`${folder}/${sevenpay}.txt`, `${data}\n`,'utf-8')
                    matches = [];
                })
            }
        }
    }

    module.deleteIso(folder, sevenpay);

    const end = performance.now();
    module.getTime("end");

    console.log(`7connect sevenpay ${sevenpay} extraction has been completed in ${Math.round(end - start)} milliseconds`)

    console.log(`\nView ${sevenpay} transaction logs?\n[1] View\n[Any] Exit`);
    const view = prompt('Choice: ');
    if(view == 1) module.print(folder, sevenpay, 1);
       
}

extract();






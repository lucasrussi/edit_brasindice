const fs = require('fs');
const path = require('path');
const readline = require('readline');
/*
 INI - Variable
*/
const inputDir = path.join(__dirname,'input_file');
const outputDir = path.join(__dirname,'output_file');

// Função para extrair a UF do nome do arquivo
const extractUF = (fileName) => {
  const parts = fileName.split('_');
  return parts[parts.length - 1].replace('.txt', '');
};

const restrict = (fileName) => {
  const parts = fileName.split('_');
  let isRestrict = false;

  for(const part of parts ){
    if(part === 'rh'){
      isRestrict = true;
    }
  }

  return isRestrict;
}

const processFile = (filePath) =>{
  const fileName = path.basename(filePath);
  const fileNameWithoutExt = path.basename(filePath, path.extname(filePath));
  const isRestrict = restrict(fileName);
  const uf = extractUF(fileName);
  const outputPath = path.join(outputDir, `${fileNameWithoutExt}.csv`);

  const readStream = fs.createReadStream(filePath);
  const writeStream = fs.createWriteStream(outputPath);

  const rl = readline.createInterface({
    input: readStream,
    output: writeStream,
    terminal: false
  });

  writeStream.write('Brasindice 1;Laboratorio; Brasindice 2; Nome Comercial; Brasindice 3; Apresentacao; PMC; PFAB;Qtde. Caixa;Tipo Preco;Preço Unit. PMC;Tipo Preco;Preço Unit. PFAB;Versao;IPI;PIS/COFINS;EAN;TISS;Generico;TUSS;GGREM;ANVISA;Hierarquia;Estado\n');

  rl.on('line',(line)=>{
   let arrayLine = line.split('",');

    if(isRestrict){
      arrayLine.splice(6, 0, '0'); // Inserindo após o índice 5 (posição 6)
      arrayLine.splice(9, 0, 'PMC'); // Inserindo após o índice 8 (posição 9)
      arrayLine.splice(10, 0, '0'); // Inserindo após o índice 9 (posição 11)
    }

    // Removendo aspas apenas de itens que são strings
    arrayLine = arrayLine.map(item => {
      if (typeof item === 'string') {
        return item.replace(/"/g, '').replace(/'/g, '');
      }
      return item;
    });

   for(let index = 0; index < arrayLine.length; index++){

    arrayLine[index] = arrayLine[index].replace(/"/g,''); // removendo aspas duplas
    arrayLine[index] = arrayLine[index].replace(/'/g,''); // removendo aspas simples
    
    //editando os campos que devem ser numéricos
    if(index == 16 || index == 17 || index == 19 || index == 20 || index == 21 || index == 22){
      
      arrayLine[index] = arrayLine[index].replace(/\D/g, '') // Deixando apenas numeros
      if(arrayLine[index].length == 0){ // se o campo estiver vazio, deixar ele como 0
        arrayLine[index] = 0;
      }
    }
   }


   
   arrayLine.push(uf)

   const csvLine = arrayLine.join(';');
   writeStream.write(`${csvLine}\n`);

  });
}





/**
 * INI - GET ALL FILES TO BE EDITED
 */
const processAllFiles = () => {
  fs.readdir(inputDir,(err,files) =>{

    files.forEach(file=>{
      const filePath = path.join(inputDir,file);
      processFile(filePath);
    })

  });
}

processAllFiles();
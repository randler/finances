var express = require('express');
var router = express.Router();
var fs = require('fs');

const options = { style: 'currency', currency: 'BRL' };
const numberFormat = new Intl.NumberFormat('pt-BR', options);

/* GET home page. */
router.get('/', function(req, res, next) {

  const finances = getJsonFinanceData();
  if(finances == null) {
    res.render('dashboard/index', { finances: [] });
    return;
  }

  const { CompNfse } = finances?.ConsultarNfseFaixaResposta?.ListaNfse;

  let countNotes = 0;
  let totalAmount = 0;
  let dataGraph = [];
  CompNfse.forEach( finance => {
    countNotes ++;
    totalAmount += parseFloat(finance.Nfse.InfNfse.ValoresNfse.ValorLiquidoNfse);
    dataGraph.push(parseFloat(finance.Nfse.InfNfse.ValoresNfse.ValorLiquidoNfse));
  });


  res.render('dashboard/index', { 
    finances: CompNfse,
    countNotes,
    dataGraph,
    lastYeardataGraph: dataGraph.slice(-12),
    totalAmount: numberFormat.format(totalAmount)
  });
});

function getJsonFinanceData() {
  
  try {
    return JSON.parse(fs.readFileSync('./static/json/finance.json', 'utf8'));
  } catch(e) {
    console.log('Error:', e.stack);
    return null;
  }
}

module.exports = router;

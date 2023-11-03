var express = require('express');
var router = express.Router();
var fs = require('fs');

const options = { style: 'currency', currency: 'BRL' };
const numberFormat = new Intl.NumberFormat('pt-BR', options);
const dateFormat = new Intl.DateTimeFormat("pt-BR",  { month: 'short'});

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
  let graph = {
    values: [],
    months: []
  };
  CompNfse.forEach( finance => {
    countNotes ++;
    totalAmount += parseFloat(finance.Nfse.InfNfse.ValoresNfse.ValorLiquidoNfse);
    graph.values.push(parseFloat(finance.Nfse.InfNfse.ValoresNfse.ValorLiquidoNfse));
    graph.months.push("" + dateFormat.format(new Date(finance.Nfse.InfNfse.DataEmissao)));
  });

  res.render('dashboard/index', { 
    finances: CompNfse,
    countNotes,
    graph,
    graphValues: graph.values.slice(-12),
    graphMonths: JSON.stringify(graph.months.slice(-12)),
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

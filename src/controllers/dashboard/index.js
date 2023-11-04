const { default: axios } = require('axios');
var fs = require('fs');
const options = { style: 'currency', currency: 'BRL' };
const numberFormat = new Intl.NumberFormat('pt-BR', options);

const getFinances = (async (req, res) => {

    const finances = getJsonFinanceData();
    //console.log('aqui', finances);
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

    //const weather = await getAPIForecastWeather();

    //console.log(weather);

    res.render('dashboard/index', { 
      finances: CompNfse,
      countNotes,
      weather: null,
      dataGraph,
      lastYeardataGraph: dataGraph.slice(-12),
      totalAmount: numberFormat.format(totalAmount),
      avgAmount: numberFormat.format(totalAmount / countNotes)
    });
})


const getJsonFinanceData = () => {
  
    try {
      return JSON.parse(fs.readFileSync('./static/json/finance.json', 'utf8'));
    } catch(e) {
      console.log('Error:', e.stack);
      return null;
    }
  }

  module.exports = {
    getFinances
}

const getAPIForecastWeather = async () => {
    const ip = await axios.get('https://api.ipify.org?format=json');
    const location = await axios.get(`https://api.ipbase.com/v1/json/${ip.data.ip}`);
    const  { latitude, longitude } = location.data;
    let weather = null; 
    try {
        const response = await axios.get(`https://forecast9.p.rapidapi.com/rapidapi/forecast/${latitude.toFixed(5)}/${longitude.toFixed(5)}/summary/`,{
            headers: {
                'X-RapidAPI-Key': '0799fe0e9dmshef5007898e3eeedp1a8a9fjsnbe2090b56082',
                'X-RapidAPI-Host': 'forecast9.p.rapidapi.com'
            }
        });
        weather = response.data;
    } catch(error) {
        console.error(error);
    }

    
    
    return {
            ip: ip.data.ip,
            location: location.data,
            weather
        }
    }